'use strict';

var execFile    = require('child_process').execFile;
var sqsConsumer = require('sqs-consumer');
var Marathon    = require('./lib/carbono-mesos').Marathon;

var DEFAULT_CONTAINER_PORT = 8080;
var DEFAULT_API_VERSION    = '2012-11-05';
var DEFAULT_REGION         = 'us-east-1';
var STAGING_QUEUE          = process.env.STAGING_QUEUE;
var MARATHON_URL           = process.env.MARATHON_URL;
var SLAVE_URL              = process.env.SLAVE_URL;

if (typeof MARATHON_URL === 'undefined') {
    console.log("Environment variable MARATHON_URL cannot be empty!");
    console.log("Define it before proceeding.");

    process.exit(1);
}

if (typeof SLAVE_URL === 'undefined') {
    console.log("Environment variable SLAVE_URL cannot be empty!");
    console.log("Define it before proceeding.");

    process.exit(1);
}

if (typeof STAGING_QUEUE === 'undefined') {
    console.log("Environment variable STAGING_QUEUE cannot be empty!");
    console.log("Define it before proceeding.");

    process.exit(1);
}

var marathon = new Marathon(MARATHON_URL);

var app = sqsConsumer.create({
    queueUrl: STAGING_QUEUE,
    region: DEFAULT_REGION,
    messageAttributeNames: ['appHash', 'imageName', 'route'],
    handleMessage: function (message, done) {
        console.log("message received");

        var route = message.MessageAttributes.route.StringValue;
        var marathonAppId = route.replace(/\//g, "");

        var app = {
            id: marathonAppId,
            cpus: 1,
            mem: 64,
            instances: 1,
            container: {
                type: "DOCKER",
                docker: {
                    "image": message.MessageAttributes.imageName.StringValue,
                    "network": "BRIDGE", 
                    "portMappings": [{
                        "containerPort": DEFAULT_CONTAINER_PORT, 
                        "hostPort": 31100, 
                        "protocol": "tcp" 
                    }]
                },
                volumes: [
                    {
                        containerPath: "/data",
                        hostPath: "/code",
                        mode: "RW"
                    }
                ]
            }
        };

        var promise = marathon.createApp(app);

        promise
            .then(function (result) {
                var script = 'script/ansible.sh';

                var args = [
                    MARATHON_URL, 
                    marathonAppId, 
                    route, 
                    SLAVE_URL, 
                    31100
                ];
                
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