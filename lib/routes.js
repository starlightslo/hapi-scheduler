'use strict';

const job = require('./handlers/job');
const log = require('./handlers/log');

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
    }, {
        method: 'GET',
        path: basePath + '/api/logout',
        handler: function (request, h) {
            const body = `
            You are logged out now
            <script type="text/javascript">
                window.location.replace("${basePath}");
            </script>
            `;
            return h.response(body).code(401);
        }
    },

    // Jobs
    {
        method: 'GET',
        path: basePath + '/api/job-size',
        config: {
            auth: auth
        },
        handler: job.size
    }, {
        method: 'GET',
        path: basePath + '/api/job',
        config: {
            auth: auth
        },
        handler: job.list
    }, {
        method: 'POST',
        path: basePath + '/api/job',
        config: {
            auth: auth
        },
        handler: job.create
    }, {
        method: 'DELETE',
        path: basePath + '/api/job/{key}',
        config: {
            auth: auth
        },
        handler: job.remove
    },

    // Logs
    {
        method: 'GET',
        path: basePath + '/api/log-size',
        config: {
            auth: auth
        },
        handler: log.size
    }, {
        method: 'GET',
        path: basePath + '/api/log',
        config: {
            auth: auth
        },
        handler: log.list
    }];

};