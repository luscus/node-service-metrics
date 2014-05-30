# [node-service-metrics](https://github.com/luscus/node-service-metrics)

The 'service-metrics' gather metric information about the running process.

BEWARE, because of [usage](https://github.com/arunoda/node-usage) this module does not work well on Windows: your `node-gyp` needs to properly installed ([see here](https://github.com/TooTallNate/node-gyp#installation)).


**Features**
- gather interval can be configured
- gathered metrics are customisable through an easy API
- Tasks can be set to be executed at the end of each interval


Take a look to the [TODO](https://github.com/luscus/node-service-metrics/blob/master/TODO.md) if you want to help towards the next steps.

## Usage

### Node Dependencies

Add following line to your project dependencies

    "service-metrics": "0.1.x",

then hit

    npm install

### Require module

    var metrics = require('service-metrics');

### configure

You can pass an options object as you require the library:

    var metrics = require('service-metrics')(options);

**Available Options**

- *disable_cpu_metrics* (boolean): library will not return any information about cpu usage (default: false).
- *disable_memory_metrics* (boolean): library will not return any information about memory usage (default: false).
- *interval* (number): metrics report interval time in milliseconds (default: 5000)


## API

### set(*[persistent-]name* [, *simple_counter*])

Sets a custom metric. Two types of custom metrics are avalaible: the "*simple counter*" an integer value which gets incremented by one and the "*value collection*" which gets incremented by custom values and returns an object with the total value, the count of provided values in the cycle, the max, average and min value.



**Parameters**
- *[persistent-]name* (string): the name of the metric. If prefix "persistent-" is used, the metric will not be reset at the end of the cycle
- *simple_counter* (boolean): the type of the metric (default is *true*)

**Example**

    // simple counter
    metrics.set('counter');

    // simple counter that will not be reset
    metrics.set('persistent-counter');

    // value collection
    metrics.set('collection', false);

    // value collection that will not be reset
    metrics.set('persistent-collection', false);


### incr(*[persistent-]name* [, *value*])

Increments a custom metric.

**Parameters**
- *[persistent-]name* (string): the name of the metric
- *value* (number): the numeric value to be added (only for collection type)

**Example**

    // simple counter gets incremented by +1
    metrics.incr('counter');

    // value collection gets new element: 23
    metrics.incr('collection', 23);


### exists(*name*)

Checks if the specified metric exists and return a boolean.

**Parameters**
- *name* (string): the name of the metric

**Example**

    // returns true
    metrics.exists('counter');

    // returns false
    metrics.exists('doesNotExist');


### addTask(*name*, *task*)

Defines a task to be executed at the end of each cycle.
The task gets the actual metric object as argument.

**Parameters**
- *name* (string): the name of the task
- *task* (function): a custom function taking metrics as argument

**Example**

    // show the metrics
    metrics.addTask('log', console.log);

    // custom task
    metrics.addTask('custom', function (metrics) {
      console.log('Show actual metrics:');
      console.log(metrics);

      /* do something */
    });


### setInterval(*milliseconds*)

Defines the cycle interval within the range of one second to two minutes.

**Parameter**
- *milliseconds* (number): value in the range 1000 to 120000

**Example**

    // set the cycle interval to 3 seconds
    metrics.setInterval(3000);
