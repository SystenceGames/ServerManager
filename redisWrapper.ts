import redis = require('redis');
import logger = require('./logger');
import I = require('./Interfaces');
import settings = require('./config/settings');

logger.info("Connecting to redis at " + settings.redis_address + " port:" + settings.redis_port);
let clientOpts: redis.ClientOpts = {
    auth_pass: settings.redis_password,
    retry_max_delay: settings.redisRetryMaxDelay,
    connect_timeout: settings.redisConnectTimeout
};
let client = redis.createClient(settings.redis_port, settings.redis_address, clientOpts);

client.on('ready', () => {
    logger.info("Redis is ready", { port: settings.redis_port, address: settings.redis_address });
});
client.on('connect', () => {
    logger.info("Redis connected OK", { port: settings.redis_port, address: settings.redis_address });
});
client.on('reconnecting', (obj: any) => {
    logger.info("Redis is reconnecting", { port: settings.redis_port, address: settings.redis_address, delay: obj.delay, attempt: obj.attempt });
});
client.on('error', (err: any) => {
    logger.error('Redis connection error', { error: err, errorMsg: err.message });
});
client.on('end', () => {
    logger.info("Redis end - connection closed", { port: settings.redis_port, address: settings.redis_address });
});
client.on('warning', (war: any) => {
    logger.info("Redis warning", { port: settings.redis_port, address: settings.redis_address, warning: war });
});

export = client;