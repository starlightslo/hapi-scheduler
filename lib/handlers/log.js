'use strict';

const Static = require('../static');

exports.size = async function (request, h) {
    const pageSize = 20;
    const counts = await request.server.app.scheduler.db(Static.HapiLogs).count('*');
    let maxPage = Math.ceil(counts[0].count / pageSize);
    maxPage = maxPage < 1 ? 1 : maxPage;
    return maxPage;
};

exports.list = async function (request, h) {
    let page = request.query.page;
    page = page < 1 ? 1 : page;
    const pageSize = 20;
    const counts = await request.server.app.scheduler.db(Static.HapiLogs).count('*');
    let maxPage = Math.ceil(counts[0].count / pageSize);
    maxPage = maxPage < 1 ? 1 : maxPage;
    page = (page > maxPage) ? maxPage : page;
    const offset = (page - 1) * pageSize;

    const logs = await request.server.app.scheduler.db.select([Static.HapiLogs + '.*', Static.HapiJobs + '.name as name']).from(Static.HapiLogs).innerJoin(Static.HapiJobs, Static.HapiLogs + '.job_id', Static.HapiJobs + '.id').orderBy(Static.HapiLogs + '.id', 'desc').limit(pageSize).offset(offset);
    const jobLogList = [];
    logs.forEach((log) => {
        console.log(log);
        jobLogList.push({
            name: log.name,
            success: log.success,
            result: log.result,
            timestamp: log.timestamp
        });
    });

    return jobLogList;
};