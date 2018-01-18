# hapi-scheduler
🕰️  Cron jobs plug-in for [HAPI](http://hapijs.com/), which provides a fantastic web interface to let you manage schedule easily.

[![npm downloads](https://img.shields.io/npm/dm/hapi-scheduler.svg?style=flat-square)](https://www.npmjs.com/package/hapi-scheduler)


# Install

You can add the module to your HAPI using npm:

    $ npm install hapi-scheduler --save


This plug-in is base on the [Knex.js](http://knexjs.org/) to developed, you also need to install the appropriate database library: [pg](https://www.npmjs.com/package/pg) for PostgreSQL, [sqlite3](https://www.npmjs.com/package/sqlite3) for SQLite3.


# Quick start

In your HAPI apps main JavaScript file add the following code to created a HAPI `server` object.

```Javascript
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
    source: 'sqlite3',
    config: {
        databaseURL: 'scheduler-db'
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
```

After you start your app, you can visit scheduler management website on: http://localhost:8000/schedule


# Plugin Options

* `managementPath`: (string) The route path for scheduler management web. - default: `/schedule`
* `source`: (string) Client adapter. [`sqlite3`, `pg`]
* `config`:
  * `databaseURL`: (string) Your database host (PostgreSQL) or path (SQLite3).
  * `username`: (string) Your database user, reference [Knex](http://knexjs.org/#Installation-client).
  * `password`: (string) Your database password, reference [Knex](http://knexjs.org/#Installation-client).
  * `database`: (string) Your database.
* `auth`: (boolean or string) This defines which authentication will be used. - default: `false`. [false, `basic`]
* `username`: (string) This option only available when auth is **basic**.
* `password`: (string) This option only available when auth is **basic**.
* `debug`: (boolean) Not supported yet.
