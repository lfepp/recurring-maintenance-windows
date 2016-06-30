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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO add an auditState function to audit whether there are already enough maintenance windows to not run this

// Function to get future maintenance windows
// TODO handle pagination
function getFutureWindows(services, apiKey) {
  var options = {
    url: 'https://api.pagerduty.com/maintenance_windows?filter=future&service_ids%5B%5D=' + encodeURIComponent(services.toString()),
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    }
  };

  return (0, _requestPromise2.default)(options).then(function (response) {
    return JSON.parse(response).maintenance_windows;
  }).catch(function (error) {
    console.log('Error getting future windows: ' + error);
    throw new Error(error);
  });
}

// Function to queue 20 maintenance windows
// TODO make this a configurable number of queues or base it on the interval/duration
// FIXME the final window is coming in 1 hour behind
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
  console.log(JSON.stringify(queue));
  return queue;
}

// Function to de-dupe between the current windows in PagerDuty and the 20 queued windows
// TODO improve efficiency by dropping the older maintenance windows from currentWindows after each loop of queuedWindows
// TODO add error handling for partially-overlapping windows
function dedupeWindows(currentWindows, queuedWindows) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = queuedWindows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var qw = _step.value;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = currentWindows[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var cw = _step2.value;

          if (Date.parse(qw.maintenance_window.start_time) == Date.parse(cw.start_time) && Date.parse(qw.maintenance_window.end_time) == Date.parse(cw.end_time)) {
            queuedWindows.splice(queuedWindows.indexOf(qw), 1);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
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
  var options = {
    url: 'https://api.pagerduty.com/maintenance_windows/' + windowId,
    method: 'DELETE',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    }
  };

  return (0, _requestPromise2.default)(options).then(function (response) {
    return response;
  }).catch(function (error) {
    throw new Error(error);
  });
}

// Function to remove all maintenance windows in the future from given services
// TODO use recursion
// TODO handle pagination
// TODO add better error handling
function removeAllFutureWindows(services, apiKey) {
  var counter = 0;
  return getFutureWindows(services, apiKey).then(function (result) {
    function loop(services, apiKey, counter) {
      if (counter >= services.length) {
        return 204;
      } else {
        return deleteWindow(services[counter].id, apiKey).then(function (response) {
          counter++;
          return loop(services, apiKey, counter);
        }).catch(function (error) {
          throw new Error(error);
        });
      }
    }
    return loop(result, apiKey, counter);
  }).catch(function (error) {
    throw new Error(error);
  });
}

// Default function to run everything and create the proper windows
function initialize() {
  console.log('Initializing application...');
  var services = process.env.SERVICES.split(",");
  return getFutureWindows(services, process.env.ACCESS_TOKEN).then(function (result) {
    for (var i = 0; i < services.length; i++) {
      services[i] = {
        "id": services[i],
        "type": "service_reference"
      };
    }
    var queuedWindows = queueWindows(services, process.env.START_TIME, process.env.INTERVAL, process.env.DURATION, process.env.DESCRIPTION);
    var windows = dedupeWindows(result, queuedWindows);
    return createWindows(windows, process.env.ACCESS_TOKEN, process.env.EMAIL).then(function (result) {
      process.env.START_TIME = windows[windows.length - 1].maintenance_window.start_time;
      return 200;
    }).catch(function (error) {
      throw new Error(error);
    });
  }).catch(function (error) {
    throw new Error(error);
  });
}
