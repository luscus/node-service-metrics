
var q = require('q'),
    metrics = {},
    tasks = {},
    default_metrics,
    interval_time = 5000,
    interval_object = null;

function setMetric (name, simple_counter) {
  simple_counter = (typeof simple_counter === 'boolean') ? simple_counter : true;

  if (! metrics[name]) {
    if (simple_counter) {
      metrics[name] = 0;
    }
    else {
      metrics[name] = {};
      metrics[name].values = [];
      metrics[name].max = 0;
      metrics[name].total = 0;
      metrics[name].count = 0;
      metrics[name].min = Number.MAX_VALUE;
    }
  }
}

function incrMetric (name, value) {
  if (metrics[name] === undefined) {
    throwError('custom metric "'+name+'" as not been set');
  }
  else {
    if (typeof metrics[name] === 'object') {
      if (value !== undefined) {
        if (!isNaN(value)) {

          if (value > metrics[name].max) {
            metrics[name].max = value;
          }

          if (value < metrics[name].min) {
            metrics[name].min = value;
          }

          metrics[name].values.push(value);
        }
        else {
          throwError('Value Collection "'+name+'" awaits a Number to be incremented. Provided value: ' + value);
        }
      }
      else {
        throwError('Value Collection "'+name+'" awaits a value to be incremented');
      }
    }
    else {
      if (value !== undefined) {
        throwError('Simple Counter "'+name+'" awaits NO value to be incremented. Provided value: ' + value);
      }
      else {
        metrics[name] += 1;
      }
    }
  }
}

function getMetrics () {
  var defered = q.defer();

  default_metrics.getDefaultValues()
  .then(function (actual_metrics) {

    // Resolve all the dynamic metrics:
    //   - read their value
    //   - reset them for the next cycle
    for (var metric in metrics) {
      actual_metrics[metric] = readMetric(metric);
      resetMetric(metric);
    }

    defered.resolve(actual_metrics);
  })
  .catch(function (error) {
    defered.reject(error);
  });

  return defered.promise;
}

function readMetric (name) {
  if (typeof metrics[name] === 'object') {
    var total = 0,
        result = {};

    if (metrics[name].values.length > 0) {

      // reduce only works on an non empty array
      total = metrics[name].values.reduce(function(previousValue, currentValue, index, array){
        return previousValue + currentValue;
      });
    }

    // increment stored total and count (for persistent metrics)
    metrics[name].total += total;
    metrics[name].count += metrics[name].values.length;

    result.total = metrics[name].total;
    result.count = metrics[name].values.length;

    if (metrics[name].total > 0) {
      result.max = metrics[name].max;
      result.avg = metrics[name].total / metrics[name].count;
      result.min = metrics[name].min;
    }

    return result;
  }
  else {
    return metrics[name];
  }
}

function resetMetric (name) {
  if (/^persistent-/.test(name)) {
    // Metrics with "persistent-" prefix are not reseted
    // their value are preserved through the cycles

    if (typeof metrics[name] === 'object') {
      // reset only array for performance
      metrics[name].values = [];
    }
  }
  else {

    if (typeof metrics[name] === 'object') {
      metrics[name].values = [];
      metrics[name].max = 0;
      metrics[name].total = 0;
      metrics[name].count = 0;
      metrics[name].min = Number.MAX_VALUE;
    }
    else {
      metrics[name] = 0;
    }
  }
}

function metricExists (name) {
  if (metrics[name] === undefined) {
    return false;
  }

  return true;
}

function setMetricInterval (value) {

  if (!isNaN(value)) {

    // only values in the range of 1 second to 2 minutes are supported
    if (1000 <= value && value <= 120000) {
      interval_time = value;

      if (interval_object) clearInterval(interval_object);

      interval_object = setInterval(executeIntervalTasks, interval_time);
    }
  }
  else {
    throw new Error('setMetricInterval awaits a number. Provided value: "'+value+'"');
  }
}

function executeIntervalTasks () {
  getMetrics()
  .then(function (actual_metrics) {

    // execute all interval tasks
    for (var task_name in tasks) {
      tasks[task_name].task(actual_metrics);
    }
  })
  .catch(function (error) {
    throw error;
  });
}

function addTask (name, task) {
  if (typeof task === 'function') {
    if (! tasks[name]) {
      tasks[name] = {};
      tasks[name].task = task;
    }
    else {
      throw new Error('Task "'+name+'" already defined...');
    }
  }
  else {
    throw new Error('You have to provide a function as argument...');
  }
}

function throwError(message, name) {
  name = name || 'ServiceMetricsException';

  var error = new Error(message);
  error.name = name;

  throw error;
}

// start interval
setMetricInterval(interval_time);


module.exports = function (options) {
  options = options || {};

  if (options.interval) {
    setMetricInterval(options.interval);
  }

  default_metrics = require('./default_metrics')(options);

  return {
    getMetricNames: function () {
      return Object.keys(metrics);
    },
    setInterval: function (value) {
      setMetricInterval(value);
    },
    set: function (name, simple_counter) {
      setMetric(name, simple_counter);
    },
    incr: function (name, value) {
      return incrMetric(name, value);
    },
    exists: function (name) {
      return metricExists(name);
    },
    addTask: function (name, task) {
      addTask(name, task);
    }
  };
};
