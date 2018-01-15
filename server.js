'use strict';

const Hapi = require('hapi');
const HapiSchedule = require('./lib/index');

// Create a server with a host and port
const server = Hapi.server({ 
    host: 'localhost', 
    port: 8000 
});

// Scheduler options
const options = {
    managementPath: '/schedule',
    source: 'pg',
    config: {
        databaseURL: '127.0.0.1',
        username: 'test',
        password: '1qa2ws3',
        database: 'test'
    },
    auth: 'basic',
    username: 'admin',
    password: 'admin'
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
