# [node-service-metrics](https://github.com/luscus/node-service-metrics)

The 'service-metrics' gather metric information about the running process.

**Features**
- gather interval can be configured
- gathered metrics are customisable through an easy API
- Tasks can be set to be executed at the end of each interval


Take a look to the [TODO](https://github.com/luscus/node-service-metrics/blob/master/TODO.md) if you want to help towards the next steps.

## Usage

### Node Dependencies

Add following line to your project dependencies

    "service-metrics": "0.0.x",

then hit

    npm install

### Require module

    var metrics = require('service-metrics');

### configure

You can pass an options object as you require the library:

    var metrics = require('service-metrics')(options);

**Available Options**

- *disable_cpu_metrics*: library will not return any information about cpu usage.
- *disable_memory_metrics*: library will not return any information about memory usage.


## API

### set(*name* [, *simple_counter*])

Sets a custom metric. Two types of custom metrics are avalaible: the "*simple counter*" an integer value which gets incremented by one and the "*value collection*" which gets incremented by custom values and returns an object with the total value, the count of provided values in the cycle, the max, average and min value.

**Parameters**
- *name* (string): the name of the metric
- *simple_counter* (boolean): the type of the metric (default is *true*)

**Example**

    // simple counter
    metrics.set('counter');

    // value collection
    metrics.set('collection', false);


### incr(*name* [, *value*])

Increments a custom metric.

**Parameters**
- *name* (string): the name of the metric
- *value* (number): the numeric value to be added (only for collection type)

**Example**

    // simple counter gets incremented by +1
    metrics.incr('counter');

    // value collection gets new element: 23
    metrics.incr('collection', 23);


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
