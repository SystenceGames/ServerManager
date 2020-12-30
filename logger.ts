import os = require("os");
let winston = require('winston');
let settings = require('./config/settings');
let graylog2 = require('winston-graylog2');

let logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            handleExceptions: true,
            json: false,
            padLevels: true,
            colorize: true,
            level: 'info'
        })
    ],
    exitOnError: false
});
//For use in Before section of testing
logger.TestingMode = function () {
    //let oldTransports = logger.transports;
    //logger.transports = [];
    //logger.transports["console"] = oldTransports["console"];
    //logger.transports["console"].handleExceptions = false;
    for (let x in logger.transports) {
        logger.remove(logger.transports[x]);
    }
}

logger.add(graylog2, settings.Graylog2);

winston.handleExceptions(new winston.transports.Console({ colorize: true, json: true }));
winston.exitOnError = false;

logger.info("initialized winston");

export = logger;