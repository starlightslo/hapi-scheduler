'use strict';

const Static = require('../static');
const JobService = require('../services/job');

exports.size = async function (request, h) {
    const pageSize = 20;
    const counts = await request.server.app.scheduler.db(Static.HapiJobs).count('*');
    let maxPage = Math.ceil(counts[0].count / pageSize);
    maxPage = maxPage < 1 ? 1 : maxPage;
    return maxPage;
};

exports.list = async function (request, h) {
    let page = request.query.page;
    page = page < 1 ? 1 : page;
    const pageSize = 20;
    const counts = await request.server.app.scheduler.db(Static.HapiJobs).count('*');
    let maxPage = Math.ceil(counts[0].count / pageSize);
    maxPage = maxPage < 1 ? 1 : maxPage;
    page = (page > maxPage) ? maxPage : page;
    const offset = (page - 1) * pageSize;

    const jobs = await request.server.app.scheduler.db.select().from(Static.HapiJobs).orderBy('id', 'desc').limit(pageSize).offset(offset);
    const jobList = [];
    jobs.forEach((job) => {
        let running = false;
        if (request.server.app.scheduler.jobs[job.id]) {
            running = request.server.app.scheduler.jobs[job.id].running;
        }

        jobList.push({
            id: job.id,
            name: job.name,
            cronTime: job.cron_time,
            requestMethod: job.request_method,
            requestURL: job.request_url,
            requestHeader: job.request_header,
            requestBody: job.request_body,
            timezone: job.timezone,
            running: running
        });
    });

    return jobList;
};

exports.create = async function (request, h) {
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

    // Insert new job
    let jobId = await request.server.app.scheduler.db(Static.HapiJobs).insert({
        name: name,
        cron_time: cronTime,
        request_url: requestURL,
        request_method: requestMethod,
        request_body: requestBody,
        request_header: requestHeader,
        timezone: timezone
    }).returning('id');
    jobId = jobId[0];

    // Create a new running job
    await JobService.create(
        request.server.app.scheduler.jobs,
        request.server.app.scheduler.db,
        jobId,
        name,
        cronTime,
        requestMethod,
        requestURL,
        requestHeader,
        requestBody,
        timezone
    );

    return 'ok';
};

exports.remove = async function (request, h) {
    const key = request.params.key;
    if (!key) {
        return 'Error: Missing key';
    }

    // Stop the job and delete it
    await JobService.remove(request.server.app.scheduler.jobs, key);

    // Remove the job from the database
    await request.server.app.scheduler.db(Static.HapiJobs).where({
        id: key
    }).delete();

    return 'ok';
};
