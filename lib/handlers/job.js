'use strict';

const Static = require('../static');


exports.size = function (request, h) {
    const pageSize = 20;
    return Math.ceil(Object.keys(request.server.app.scheduler.jobs).length / pageSize);
};

exports.list = function (request, h) {
    let page = request.query.page;
    const pageSize = 20;
    const maxPage = Math.ceil(request.server.app.scheduler.jobs.length / pageSize);
    page = (page > maxPage) ? maxPage : page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const jobs = request.server.app.scheduler.jobs;
    const jobList = [];
    Object.keys(jobs).forEach((key) => {
        let running = false;
        if (request.server.app.scheduler.runningJobs[key]) {
            running = request.server.app.scheduler.runningJobs[key].running;
        }

        jobList.push({
            name: jobs[key].name,
            cronTime: jobs[key].cronTime,
            requestMethod: jobs[key].requestMethod,
            requestURL: jobs[key].requestURL,
            requestHeader: jobs[key].requestHeader,
            requestBody: jobs[key].requestBody,
            timezone: jobs[key].timezone,
            running: running
        });
    });

    return jobList.slice(start, end);
};

exports.create = function (request, h) {
    const payload = request.payload;
    if (!payload || !payload.name || !payload.cronTime || !payload.requestURL) {
        return 'Error: Missing data';
    }

    // Retrieve data from payload
    const { name, cronTime, requestURL, requestMethod, requestBody, requestHeader, timezone } = payload;

    /**
     * Have to check the cronTime format
     */
    // ----- TODO -----


    const jobsRef = request.server.app.scheduler.db.ref(Static.HapiJobs);
    jobsRef.push({
        name: name,
        cronTime: cronTime,
        requestURL: requestURL,
        requestMethod: requestMethod,
        requestBody: requestBody,
        requestHeader: requestHeader,
        timezone: timezone
    });
    return 'ok';
};

exports.remove = function (request, h) {
    const key = request.params.key;
    if (!key) {
        return 'Error: Missing key';
    }

    // Stop the job and delete it
    request.server.app.scheduler.runningJobs[key].stop();
    request.server.app.scheduler.runningJobs[key].delete();

    // Remove the job from the database
    const jobsRef = request.server.app.scheduler.db.ref(Static.HapiJobs);
    jobsRef.child(key).remove();

    return 'ok';
};
