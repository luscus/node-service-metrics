var os = require('os'),
    q = require('q'),
    metricOptions,
    usage,
    usageOptions = {
      keepHistory: true
    },
    pid = process.pid,
    uid = (typeof process.getuid === 'function') ? process.getuid() : undefined,
    gid = (typeof process.getgid === 'function') ? process.getgid() : undefined,
    host = os.hostname(),
    root = require('root-probe'),
    metrics = {};

if (! /^win/.test(os.platform())) {
  usage = require('usage');
}

metrics.service = root.name;
metrics.host = host;
metrics.pid = pid;

if(uid) {
  metrics.uid = uid;
}
if(gid) {
  metrics.gid = gid;
}


function getDefaultValues () {
  var defered = q.defer();

  if (usage && !metricOptions.disable_cpu_metrics) {
    usage.lookup(pid, usageOptions, function(error, result) {
      if (error) {
        defered.reject(error);
      }

      addChangingValues();

      metrics.memory_usage = result.memory;
      metrics.cpu_usage =parseFloat(result.cpu.toFixed(3));

      defered.resolve(metrics);
    });
  }
  else {
    addChangingValues();

    if (!metricOptions.disable_memory_metrics) {
      metrics.memory_usage = process.memoryUsage().rss;
    }

    defered.resolve(metrics);
  }

  return defered.promise;
}


function addChangingValues () {
  metrics.timestamp = new Date();
  metrics.uptime = Math.round(process.uptime());
}


module.exports = function (options) {
  metricOptions = {};

  metricOptions.disable_cpu_metrics = (typeof options.disable_cpu_metrics === 'boolean') ? options.disable_cpu_metrics : false;
  metricOptions.disable_cpu_metrics = (typeof options.disable_memory_metrics === 'boolean') ? options.disable_memory_metrics : false;

  return {
    getDefaultValues: function () {
      return q.when(getDefaultValues());
    }
  };
};
