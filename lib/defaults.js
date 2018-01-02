'use strict';

const Static = require('./static');

// defaults settings for plug-in
module.exports = {
    'debug': false,
    'managementPath': '/schedule',
    'auth': false,
    'source': Static.Firebase
};
