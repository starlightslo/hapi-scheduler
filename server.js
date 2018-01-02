'use strict';

const Hapi = require('hapi');
const FirebaseAdmin = require('firebase-admin');
const HapiSchedule = require('./lib/index');
const serviceAccount = require('./firebase.json');

// Create a server with a host and port
const server = Hapi.server({ 
    host: 'localhost', 
    port: 8000 
});

// Scheduler options
const options = {
    managementPath: '/schedule',
    source: 'Firebase',
    config: {
        databaseURL: 'https://schedule.firebaseio.com/',
        credential: FirebaseAdmin.credential.cert(serviceAccount)
    }
};

// Add the route
server.route({
    method: 'GET',
    path:'/', 
    handler: function (request, h) {
        console.log(request.info.id + ': hello world');
        return 'hello world';
    }
});

// Start register plugins
async function pluginRegister() {
    try {
        await server.register({
            plugin: HapiSchedule,
            options: options
        });
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
    
    console.log('Plugins register success.');
}

// Start the server
async function start() {
    await pluginRegister();

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();
