'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
const Vision = require('vision');
const Path = require('path');
const Bcrypt = require('bcryptjs');
const knex = require('knex');

const Routes = require('./routes');
const Static = require('./static');
const JobService = require('./services/job');

const Pack = require('../package.json');
const Defaults = require('../lib/defaults');

// schema for plug-in properties
const schema = Joi.object({
    debug: Joi.boolean().default(false),
    managementPath: Joi.string().default('/schedule'),
    auth: Joi.string().default(Static.Basic).valid(Static.Basic, false),
    source: Joi.string().valid(Static.SQLite3, Static.PostgreSQL).required(),
    config: Joi.object({
        databaseURL: Joi.string().required(),
        username: Joi.string().allow(''),
        password: Joi.string().allow(''),
        database: Joi.string().allow('')
    }),
    username: Joi.string().allow(''),
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
    server.app.scheduler.source = settings.source;

    // Store the settings into server if password exists
    if (settings.password) {
        settings.password = Bcrypt.hashSync(settings.password, Bcrypt.genSaltSync(10));
    } else {
        settings.auth = false;
    }

    // Reading the schedules from the different source.
    let knexConfig = {};
    switch (settings.source) {
        // Init DB & store firebase db into server
        case Static.SQLite3:
            knexConfig = {
                client: settings.source,
                connection: {
                    filename: settings.config.databaseURL
                },
                useNullAsDefault: true,
                migrations: {
                    tableName: Static.HapiSchedulerMigrations,
                    directory: __dirname + '/migrations'
                }
            };
            break;
        case Static.PostgreSQL:
            knexConfig = {
                client: settings.source,
                connection: {
                    host: settings.config.databaseURL,
                    user: settings.config.username,
                    password: settings.config.password,
                    database: settings.config.database
                },
                migrations: {
                    tableName: Static.HapiSchedulerMigrations,
                    directory: __dirname + '/migrations'
                }
            };
            break;
        default:
            return;
            break;
    }

    // Loading knex db
    server.app.scheduler.db = knex(knexConfig);

    // Migration
    await server.app.scheduler.db.migrate.latest();

    // Get all existing jobs
    const jobs = await server.app.scheduler.db.select().from(Static.HapiJobs);
    jobs.forEach(async (job) => {
        await JobService.create(
            server.app.scheduler.jobs,
            server.app.scheduler.db,
            job.id,
            job.name,
            job.cron_time,
            job.request_method,
            job.request_url,
            job.request_header,
            job.request_body,
            job.timezone
        );
    });

    // Register required library
    await server.register([require('inert'), require('vision'), require('hapi-auth-basic')]);

    // Set up the auth strategy
    if (settings.auth) {
        server.auth.strategy(settings.auth, 'basic', {
            validate: async (request, username, password, h) => {
                let isValid = false;
                if (username !== settings.username) {
                    return { isValid };
                }

                isValid = Bcrypt.hashSync(password, Bcrypt.genSaltSync(10)) !== settings.password;
                return { isValid, credentials: {} };
            }
        });
    }

    // Set up view engine
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
                    managementPath: settings.managementPath,
                    isAuth: (settings.auth) ? true : false
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
