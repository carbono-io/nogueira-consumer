'use strict';

var execFile    = require('child_process').execFile;
var sqsConsumer = require('sqs-consumer');
var Marathon    = require('./lib/carbono-mesos').Marathon;

var queueUrl = 
    'https://sqs.us-east-1.amazonaws.com/891008257771/homolog_carbono_paas';

var DEFAULT_API_VERSION = '2012-11-05';
var DEFAULT_REGION = 'us-east-1';
var MARATHON_URL = process.env.MARATHON_URL;

var marathon = new Marathon(MARATHON_URL);

var app = sqsConsumer.create({
    queueUrl: queueUrl,
    region: DEFAULT_REGION,
    messageAttributeNames: ['imageName', 'appHash'],
    handleMessage: function (message, done) {
        console.log("message received");

        var app = {
            id: message.MessageAttributes.imageName.StringValue,
            cpus: 1,
            mem: 64,
            instances: 1,
            container: {
                type: "DOCKER",
                docker: {
                    "image": message.MessageAttributes.imageName.StringValue
                },
                volumes: [
                    {
                        containerPath: "/data",
                        hostPath: "/data",
                        mode: "RW"
                    }
                ]
            },
            args: [
                "mongod", "--smallfiles"
            ]
        };

        var promise = marathon.createApp(app);

        promise
            .then(function (result) {
                var id = result.id.split("/")[1];
                var script = 'script/ansible.sh';
                var args = [MARATHON_URL, id];
                
                execFile(script, args, function(err, stdout, stderr) {
                    console.log(err);
                    console.log(stdout);
                    console.log(stderr);
                });
            }, function (err) {
                console.log(err);
            })
            .done(function () {
                // done();
            });
    }
});

app.on('error', function (err) {
    console.log(err);
});

app.start();