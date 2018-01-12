'use strict';

const CronJob = require('cron').CronJob;
const Hoek = require('hoek');
const Joi = require('joi');
const Vision = require('vision');
const Path = require('path');
const Bcrypt = require('bcryptjs');
const moment = require('moment');
const FirebaseAdmin = require('firebase-admin');

const request = require('request-promise');
const Routes = require('./routes');
const Static = require('./static');

const Pack = require('../package.json');
const Defaults = require('../lib/defaults');

const runningJobs = {};

// schema for plug-in properties
const schema = Joi.object({
    debug: Joi.boolean().default(false),
    managementPath: Joi.string().default('/schedule'),
    auth: Joi.string().default(Static.LOCAL_PASSWORD).valid(Static.LOCAL_PASSWORD, false),
    source: Joi.string().valid(Static.Firebase).required(),
    config: Joi.object({
        databaseURL: Joi.string().required(),
        credential: Joi.any()
    }),
    password: Joi.string().allow('')
}).unknown();


/**
 * register the plug-in with the Hapi framework
 *
 * @param  {Object} server
 * @param  {Object} options
 * @param  {Function} next
 */
exports.register = async function (server, options) {

    const settings = Hoek.applyToDefaults(Defaults, options, true);
    const publicDirPath = Path.resolve(__dirname, '..', 'public');
    const managementDirPath = Path.join(publicDirPath, 'management-ui');

    // Validate settings
    Joi.assert(settings, schema);

    // Link runningJobs with server
    server.app.scheduler = {};
    server.app.scheduler.jobs = {};
    server.app.scheduler.jobLogs = [];
    server.app.scheduler.runningJobs = runningJobs;
    server.app.scheduler.source = settings.source;

    // Store the settings into server if password exists
    if (settings.password) {
        settings.password = Bcrypt.hashSync(settings.password, Bcrypt.genSaltSync(10));
    } else {
        settings.auth = false;
    }

    // Reading the schedules from the different source.
    if (settings.source === Static.Firebase) {

        // Init Firebase
        FirebaseAdmin.initializeApp({
            credential: settings.config.credential,
            databaseURL: settings.config.databaseURL
        });

        // Store firebase db into server
        server.app.scheduler.db = FirebaseAdmin.database();

        // Get schedule ref
        const jobsRef = server.app.scheduler.db.ref(Static.HapiJobs);
        const logsRef = server.app.scheduler.db.ref(Static.HapiLogs);

        /**
         * Read schedule data from db
         */
        jobsRef.on('value', (snapshot) => {
            const jobs = snapshot.val();
            if (jobs) {
                Object.keys(jobs).forEach((key) => {
                    server.app.scheduler.jobs[key] = {
                        name: jobs[key].name,
                        cronTime: jobs[key].cronTime,
                        requestMethod: jobs[key].requestMethod,
                        requestURL: jobs[key].requestURL,
                        requestHeader: jobs[key].requestHeader,
                        requestBody: jobs[key].requestBody,
                        timezone: jobs[key].timezone,
                    };
                    createJob(key, snapshot.val()[key]);
                });
            }
        });

        /**
         * Read job log from db
         */
        logsRef.on('value', (snapshot) => {
            const jobLogs = snapshot.val();
            server.app.scheduler.jobLogs = [];
            if (jobLogs) {
                Object.keys(jobLogs).forEach((key) => {
                    server.app.scheduler.jobLogs.push({
                        name: jobLogs[key].name,
                        result: jobLogs[key].result,
                        scheduleId: jobLogs[key].scheduleId,
                        success: jobLogs[key].success,
                        timestamp: jobLogs[key].timestamp
                    });
                });
            }
        });

    }

    await server.register([require('inert'), require('vision')]);
    server.views({
        engines: {
            html: require('ejs')
        },
        relativeTo: __dirname,
        path: managementDirPath
    });


    // Management routes
    server.route({
        method: 'GET',
        path: settings.managementPath + '/{param*}',
        config: {
            auth: settings.auth
        },
        handler: {
            directory: {
                path: managementDirPath + Path.sep,
                index: false
            }
        }
    });
    server.route({
        method: 'GET',
        path: settings.managementPath,
        config: {
            auth: settings.auth
        },
        handler: {
            view: {
                template: 'index',
                context: {
                    title: Pack.name,
                    version: Pack.version,
                    description: Pack.description,
                    author: Pack.author,
                    managementPath: settings.managementPath
                }
            }
        }
    });

    // Management API routes
    server.route(Routes(settings.managementPath, settings.auth));

};

/**
 * attributes for plug-in uses 'name' and 'version' from package.json files
 */
exports.name = Pack.name;
exports.version = Pack.version;
exports.once = true;
exports.multiple = false;

// Private functions
function createJob(key, value) {
    // Jobs
    if (!runningJobs[key]) {
        runningJobs[key] = new CronJob({
            cronTime: value.cronTime,
            onTick: async function () {
                const logsRef = FirebaseAdmin.database().ref(Static.HapiLogs);

                try {
                    let response = null;
                    switch (value.requestMethod.toLowerCase()) {
                        case 'get':
                            response = await request.get({
                                headers: value.requestHeader,
                                url: value.requestURL
                            });
                            break;
                        case 'post':
                            response = await request.post({
                                headers: value.requestHeader,
                                url: value.requestURL,
                                body: value.requestBody
                            });
                            break;
                    }

                    // Writing into db
                    logsRef.push({
                        scheduleId: key,
                        name: value.name,
                        result: response,
                        success: true,
                        timestamp: moment().unix()
                    });
                } catch (err) {
                    logsRef.push({
                        scheduleId: key,
                        name: value.name,
                        result: err.toString(),
                        success: false,
                        timestamp: moment().unix()
                    });
                }
            },
            start: false,
            timezone: value.timezone
        });
        runningJobs[key].start();
    }
}