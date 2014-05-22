var options = {dada:true},
    metrics = require('../lib/service-metrics')(options);

var test = 0;

metrics.addTask('output', function (report) {
  console.log('####################################');
  console.log(report);
  console.log('-- check exists --------------------');
  console.log('metrics.exists("testCounter"):', metrics.exists('testCounter'));
  console.log('metrics.exists("doesNotExist"):', metrics.exists('doesNotExist'));
});

metrics.set('testCounter');
metrics.set('persistent-testCounter');
metrics.set('testCollection', false);

setInterval(function () {
  test++;
  metrics.incr('testCounter');
  metrics.incr('persistent-testCounter');
  metrics.incr('testCollection', test);

  if (test === 5) test = 0;
}, 1000);
