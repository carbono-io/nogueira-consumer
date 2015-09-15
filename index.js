'use strict';

var DockerContainer = require('carbono-docker').DockerContainer;
var DockerManager   = require('carbono-docker').DockerManager;
var sqsConsumer     = require('sqs-consumer');

var queueUrl = 
    'https://sqs.us-east-1.amazonaws.com/891008257771/homolog_carbono_paas';

var DEFAULT_API_VERSION = '2012-11-05';
var DEFAULT_REGION = 'us-east-1';

var dockerManager = new DockerManager();

var app = sqsConsumer.create({
    queueUrl: queueUrl,
    region: DEFAULT_REGION,
    messageAttributeNames: ['imageName', 'appHash'],
    handleMessage: function (message, done) {
        var container = new DockerContainer({
            image: message.MessageAttributes.imageName.StringValue,
            hostConfig: {
                "PortBindings": { 
                    "4001/tcp": [{ "HostPort": "" }] }
            }
        });

        var promise = dockerManager.createContainer(container);

        promise
            .then(function (containerId) {
                var promise = dockerManager.getPortForContainerId(containerId);

                promise
                    .then(function (port) {
                        console.log('PORT: ' + port);
                    }, function (err) {
                        console.log(err);
                    });
            }, function (err) {
                console.log(err);
            })
            .done(function () {
                done();
            });
    }
});

app.on('error', function (err) {
    console.log(err);
});

app.start();