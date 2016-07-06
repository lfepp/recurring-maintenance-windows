'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFutureWindows = getFutureWindows;
exports.queueWindows = queueWindows;
exports.dedupeWindows = dedupeWindows;
exports.createWindow = createWindow;
exports.createWindows = createWindows;
exports.removeAllFutureWindows = removeAllFutureWindows;
exports.default = initialize;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO add an auditState function to audit whether there are already enough maintenance windows to not run this
// TODO improve efficiency with immutable.js

// Function to get future maintenance windows
function getFutureWindows(services, apiKey) {
  var output = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
  var offset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var options = {
    url: 'https://api.pagerduty.com/maintenance_windows?filter=future&service_ids%5B%5D=' + encodeURIComponent(services.toString()) + '&limit=100&offset=' + offset,
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    }
  };

  return (0, _requestPromise2.default)(options).then(function (response) {
    var res = JSON.parse(response);
    output = output.concat(res.maintenance_windows);
    if (res.more) {
      return getFutureWindows(services, apiKey, output, offset + 100);
    } else {
      return output;
    }
  }).catch(function (error) {
    throw new Error(error);
  });
}

// Function to queue 20 maintenance windows
// TODO make this a configurable number of queues or base it on the interval/duration
// TODO break into queueWindow function with recursive queueWindows function
function queueWindows(services, startTime, interval, duration, description) {
  var queue = [];
  for (var i = 0; i < 20; i++) {
    startTime = new Date(Date.parse(startTime));
    if (isNaN(startTime)) {
      throw new Error('Invalid START_TIME date format. Please use ISO 8601 format.');
    }
    var endTime = new Date(startTime.getTime() + duration * 1000);
    queue[i] = {
      maintenance_window: {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        description: description,
        services: services,
        type: 'maintenance_window'
      }
    };
    startTime = new Date(Date.parse(startTime) + interval * 1000).toISOString();
  }
  return queue;
}

// Function to de-dupe between the current windows in PagerDuty and the 20 queued windows
// TODO improve efficiency by dropping the older maintenance windows from currentWindows after each loop of queuedWindows
// TODO improve efficiency by not storing the output in another variable
// TODO add error handling for partially-overlapping windows
function dedupeWindows(currentWindows, queuedWindows) {
  for (var i = queuedWindows.length - 1; i >= 0; i--) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      innerLoop: for (var _iterator = currentWindows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cw = _step.value;

        if (new Date(Date.parse(queuedWindows[i].maintenance_window.start_time)).getTime() == new Date(Date.parse(cw.start_time)).getTime()) {
          queuedWindows.splice(i, 1);
          break innerLoop;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  return queuedWindows;
}

// Function to create a maintenance window
function createWindow(maintenanceWindow, apiKey, email) {
  var options = {
    url: 'https://api.pagerduty.com/maintenance_windows',
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey,
      'From': email
    },
    body: maintenanceWindow,
    json: true
  };

  return (0, _requestPromise2.default)(options).then(function (response) {
    console.log('Successfully created a maintenance window');
  }).catch(function (error) {
    console.log('Error creating windows: ' + error);
    throw new Error(error);
  });
}

// Function to loop through createWindow for an array of maintenance windows
function createWindows(windows, apiKey, email) {
  var counter = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  if (counter >= windows.length) {
    return 200;
  } else {
    return createWindow(windows[counter], apiKey, email).then(function (response) {
      counter++;
      return createWindows(windows, apiKey, email, counter);
    }).catch(function (error) {
      throw new Error(error);
    });
  }
}

// Function to delete one maintenance window
function deleteWindow(windowId, apiKey) {
  console.log('Deleting: ' + windowId);
  var options = {
    url: 'https://api.pagerduty.com/maintenance_windows/' + windowId,
    method: 'DELETE',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    }
  };

  return (0, _requestPromise2.default)(options).then(function (response) {
    console.log('Deleted window successfully');
  }).catch(function (error) {
    throw new Error(error);
  });
}

// Function to remove all maintenance windows in the future from given services
// TODO use recursion
// TODO handle pagination
// TODO add better error handling
function removeAllFutureWindows(services, apiKey) {
  var counter = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  return getFutureWindows(services, apiKey).then(function (response) {
    function loop(windows, apiKey, counter) {
      if (counter >= windows.length) {
        return 204;
      } else {
        return deleteWindow(windows[counter].id, apiKey).then(function (response) {
          counter++;
          return loop(windows, apiKey, counter);
        }).catch(function (error) {
          throw new Error(error);
        });
      }
    }
    return loop(response, apiKey, counter);
  }).catch(function (error) {
    throw new Error(error);
  });
}

// Default function to run everything and create the proper windows
function initialize() {
  console.log('Initializing application logic...');
  // Determine whether or not start_time.txt exists
  try {
    _fs2.default.accessSync('src/start_time.txt');
  } catch (error) {
    _fs2.default.writeFileSync('src/start_time.txt', process.env.START_TIME, { "flags": "w" });
  }
  // Determine start time from file
  console.log(_fs2.default.readFileSync('src/start_time.txt', 'utf8'));
  var startTimeStr = _fs2.default.readFileSync('src/start_time.txt', 'utf8').replace(/\s/g, '');
  var startTime = new Date(Date.parse(startTimeStr));
  console.log(startTime);
  var services = process.env.SERVICES.split(",");
  // Get future maintenance windows and format services for REST API
  return getFutureWindows(services, process.env.ACCESS_TOKEN).then(function (result) {
    for (var i = 0; i < services.length; i++) {
      services[i] = {
        "id": services[i],
        "type": "service_reference"
      };
    }
    // Queue 20 maintenance windows
    var queuedWindows = queueWindows(services, startTime, process.env.INTERVAL, process.env.DURATION, process.env.DESCRIPTION);
    // Save the new start time
    var newStartTime = queuedWindows[19].maintenance_window.start_time;
    // De-duplicate queued windows and current windows
    var windows = dedupeWindows(result, queuedWindows);
    // Check to ensure there are windows to create
    if (windows.length === 0) {
      // If no windows to create, update start time
      _fs2.default.writeFileSync('src/start_time.txt', newStartTime, { "flags": "w" });
      return 200;
    } else {
      // If there are windows to create, create the windows and set new start time
      return createWindows(windows, process.env.ACCESS_TOKEN, process.env.EMAIL).then(function (result) {
        _fs2.default.writeFileSync('src/start_time.txt', newStartTime, { "flags": "w" });
        return 200;
      }).catch(function (error) {
        throw new Error(error);
      });
    }
  }).catch(function (error) {
    throw new Error(error);
  });
}
