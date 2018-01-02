'use strict';

const Static = require('../static');

exports.list = function (request, h) {
    const schedules = request.server.app.scheduler.schedules;
    const jobList = [];
    Object.keys(schedules).forEach((key) => {
        let running = false;
        if (request.server.app.scheduler.jobs[key]) {
            running = request.server.app.scheduler.jobs[key].running;
        }

        jobList.push({
            name: schedules[key].name,
            cronTime: schedules[key].cronTime,
            request: schedules[key].request,
            timeZone: schedules[key].timeZone,
            running: running
        });
    });

    return jobList;
};

exports.create = function (request, h) {
    const payload = request.payload;
    if (!payload || !payload.name || !payload.cronTime || !payload.requestURL) {
        return 'Error: Missing data';
    }

    // Retrieve data from payload
    const { name, cronTime, requestURL, requestMethod, requestBody, requestHeader, timeZone } = payload;

    const schedulesRef = request.server.app.scheduler.db.ref(Static.HapiSchedules);
    schedulesRef.push({
        name: name,
        cronTime: cronTime,
        requestURL: requestURL,
        requestMethod: requestMethod,
        requestBody: requestBody,
        requestHeader: requestHeader,
        timeZone: timeZone
    });
    return 'ok';
};

exports.remove = function (request, h) {
    const key = request.params.key;
    if (!key) {
        return 'Error: Missing key';
    }

    // Stop the job and delete it
    request.server.app.scheduler.jobs[key].stop();
    request.server.app.scheduler.jobs[key].delete();

    // Remove the job from the database
    const schedulesRef = request.server.app.scheduler.db.ref(Static.HapiSchedules);
    schedulesRef.child(key).remove();

    return 'ok';
};
