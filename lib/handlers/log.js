'use strict';

const Static = require('../static');

exports.list = function (request, h) {
    return request.server.app.scheduler.jobLogs;
};