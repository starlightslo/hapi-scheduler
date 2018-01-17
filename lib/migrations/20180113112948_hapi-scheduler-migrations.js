const Static = require('../static');

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable(Static.HapiJobs, function (table) {
            table.increments('id').primary();
            table.string('name');
            table.string('cron_time');
            table.string('request_method');
            table.string('request_url');
            table.text('request_header');
            table.text('request_body');
            table.integer('timezone');
            table.timestamp('timestamp').defaultTo(knex.fn.now());
        }),

        knex.schema.createTable(Static.HapiLogs, function (table) {
            table.increments('id').primary();
            table.integer('job_id').unsigned();
            table.boolean('success');
            table.text('result');
            table.timestamp('timestamp').defaultTo(knex.fn.now());
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists(Static.HapiJobs),
        knex.schema.dropTableIfExists(Static.HapiLogs)
    ]);
};
