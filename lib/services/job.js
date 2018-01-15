const CronJob = require('cron').CronJob;
const request = require('request-promise');

const Static = require('../static');

exports.addLog = async function(db, key, success, result) {
    await db(Static.HapiLogs).insert({
        job_id: key,
        success: success,
        result: result
    });
}

exports.create = async function(jobs, db, key, name, cronTime, requestMethod, requestURL, requestHeader, requestBody, timezone) {
    if(!jobs[key]) {
        jobs[key] = new CronJob({
            cronTime: cronTime,
            onTick: async () => {
                try {
                    let response = null;
                    switch (requestMethod.toLowerCase()) {
                        case 'get':
                            response = await request.get({
                                headers: requestHeader,
                                url: requestURL
                            });
                            break;
                        case 'post':
                            response = await request.post({
                                headers: requestHeader,
                                url: requestURL,
                                body: requestBody
                            });
                            break;
                    }

                    // Writing into db
                    await this.addLog(db, key, true, response);
                } catch (err) {
                    await this.addLog(db, key, false, err.toString());
                }
            },
            start: false,
            timezone: timezone
        });
        jobs[key].start();
    }
}

exports.remove = async function(jobs, key) {
    jobs[key].stop();
    jobs[key].delete();
}