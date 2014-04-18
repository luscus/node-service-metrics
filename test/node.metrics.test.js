var options = {dada:true},
    metrics = require('../lib/service-metrics')(options);

var test = 0;

metrics.addTask('output', console.log);

metrics.set('fackeCounter');
metrics.set('fackeValues', false);

setInterval(function () {
  test++;
  metrics.incr('fackeCounter');
  metrics.incr('fackeValues', test);

  if (test === 5) test = 0;
}, 1000);
