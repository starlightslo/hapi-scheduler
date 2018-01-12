'use strict';

const Static = require('../static');

exports.size = function (request, h) {
    const pageSize = 20;
    return Math.ceil(request.server.app.scheduler.jobLogs.length / pageSize);
};

exports.list = function (request, h) {
    let page = request.query.page;
    const pageSize = 20;
    const maxPage = Math.ceil(request.server.app.scheduler.jobLogs.length / pageSize);
    page = (page > maxPage) ? maxPage : page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const jobLogList = [];
    request.server.app.scheduler.jobLogs.forEach((log) => {
        jobLogList.push(log);
    });
    return jobLogList.reverse().slice(start, end);
};