var request = require('request');
var q       = require('q');

var MARATHON_VERSION = '/v2'
var ENDPOINT_APPS = '/apps';

/**
 * Creates an object that will be used to make
 * a request. The object contains basic properties
 * like the url and content type.
 *
 * @param {string} Endpoint that is to be concatenated
 *                 to the base url to form the complete uri.
 *
 * @returns {Object} Request object.
 */
function createBaseRequest(baseUrl, endpoint) {
    console.log('http://' + baseUrl + MARATHON_VERSION + (endpoint || ''));

    return {
        url: 'http://' + baseUrl + MARATHON_VERSION + (endpoint || ''),
        headers: {
            'Content-Type': 'application/json',
        },
    };
}

var Marathon = function (baseUrl) {
    this.baseUrl = baseUrl;
}

/**
 * Makes a request to Marathon to create a new app.
 *
 * @param {Object} Object containing info about the app
 *
 * @returns {Promise} Promise that resolves in case the app
 *                    can be created. Rejects otherwise.
 */
Marathon.prototype.createApp = function (app) {
    var deffered = q.defer();

    var options = createBaseRequest(this.baseUrl, ENDPOINT_APPS);

    options.json = app;

    request.post(options, function (err, res, body) {
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        var success = (typeof res !== 'undefined') &&
            (res.statusCode >= 200) &&
            (res.statusCode < 300);

        if (success) {
            deffered.resolve(body);
        } else {
            deffered.reject(body);
        }
    });

    return deffered.promise;
}

module.exports = Marathon;