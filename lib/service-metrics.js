
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
      metrics[name].min = Number.MAX_VALUE;
    }
  }
  else {
    throw new Error('Metric property already set...');
  }
}

function incrMetric (name, value) {
  if (value !== undefined) {
    if (typeof metrics[name] === 'object') {

      if (value > metrics[name].max) {
        metrics[name].max = value;
      }

      if (value < metrics[name].min) {
        metrics[name].min = value;
      }

      metrics[name].values.push(value);
    }
  }
  else {
    if (typeof metrics[name] !== 'object') {
      metrics[name] += 1;
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
    var total = metrics[name].values.reduce(function(previousValue, currentValue, index, array){
      return previousValue + currentValue;
    });

    return {
      total: total,
      count: metrics[name].values.length,
      max: metrics[name].max,
      avg: total / metrics[name].values.length,
      min: metrics[name].min
    };
  }
  else {
    return metrics[name];
  }
}

function resetMetric (name) {
  if (typeof metrics[name] === 'object') {
    metrics[name].values = [];
    metrics[name].max = 0;
    metrics[name].min = Number.MAX_VALUE;
  }
  else {
    metrics[name] = 0;
  }
}

function setMetricInterval (value) {

  if (!isNaN(value)) {
    if (1000 <= value && value <= 120000) {
      interval_time = value;

      if (interval_object) clearInterval(interval_object);

      interval_object = setInterval(executeIntervalTasks, interval_time);
    }
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

// start interval
setMetricInterval(interval_time);


module.exports = function (options) {
  default_metrics = require('./default_metrics')(options);

  return {
    setInterval: function (value) {
      setMetricInterval(value);
    },
    set: function (name, simple_counter) {
      setMetric(name, simple_counter);
    },
    incr: function (name, value) {
      return incrMetric(name, value);
    },
    addTask: function (name, task) {
      addTask(name, task);
    }
  };
};
