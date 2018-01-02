'use strict';

const schedule = require('./handlers/schedule');
const job = require('./handlers/job');

module.exports = (basePath, auth) => {

    return [{
        method: 'GET',
        path: basePath + '/api',
        config: {
            auth: auth
        },
        handler: function (request, h) {
            return 'Schedule Management API';
        }
    },

    // Schedule
    {
        method: 'GET',
        path: basePath + '/api/schedule',
        config: {
            auth: auth
        },
        handler: schedule.list
    }, {
        method: 'POST',
        path: basePath + '/api/schedule',
        config: {
            auth: auth
        },
        handler: schedule.create
    }, {
        method: 'DELETE',
        path: basePath + '/api/schedule/{key}',
        config: {
            auth: auth
        },
        handler: schedule.remove
    },

    // Jobs
    {
        method: 'GET',
        path: basePath + '/api/job',
        config: {
            auth: auth
        },
        handler: job.list
    }];

};