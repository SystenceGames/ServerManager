import redis = require('redis');
import logger = require('./logger');
let config = require('./config/settings');

logger.info("Connecting to redis at " + config.redis_address + " port:" + config.redis_port);
let client = redis.createClient(config.redis_port, config.redis_address, { auth_pass: config.redis_password });

client.on('connect', () => {
    logger.info("Redis connected OK", { codepath: "db.connect", port: config.redis_port, address: config.redis_address });
});
client.on('error', (err: any) => {
    logger.error('redis connection error', { codepath: "db.onError", error: err, errorMsg: err.message });
});
export = client;