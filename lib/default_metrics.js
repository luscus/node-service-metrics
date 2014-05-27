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
    root = require('service-probe'),
    metrics = {};

if (! /^win/.test(os.platform())) {
  // usage package only works well
  usage = require('usage');
}

metrics.type = 'metrics';
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
  metrics.id = metrics.type + ':' + metrics.service + ':' + formatTimestamp(metrics.timestamp);
  metrics.uptime = Math.round(process.uptime());
}


function formatTimestamp (date) {
   var yyyy = date.getFullYear().toString(),
       mm   = (date.getMonth() + 1).toString(), // zero-based
       dd   = date.getDate().toString(),
       hh   = (date.getHours() + 1).toString(), // zero-based
       mi   = date.getMinutes().toString(),
       ss   = date.getSeconds().toString(),
       mil  = date.getMilliseconds().toString();

   return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]) + (hh[1]?hh:"0"+hh[0]) + (mi[1]?mi:"0"+mi[0]) + (ss[1]?ss:"0"+ss[0]) + (mil[1]?(mil[2]?mil:"0"+mil[0]):"00"+mil[0]); // padding
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
