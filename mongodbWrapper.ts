import mongoose = require('mongoose');
import Settings = require('./config/Settings');
let logger = require('./logger');
let db = mongoose.connection;

db.on('error', (err: any) => {
    logger.error('db not opened; mongoose failed to connect', { codepath: "db.onError", error: err, errorMsg: err.message });
});
db.once('open', function () {
    logger.info("Mongoose opened", { codepath: "mongodb.ts" });
});

mongoose.connect(Settings.MongoDBConnectionString, { server: { socketOptions: { keepAlive: 1 } } });