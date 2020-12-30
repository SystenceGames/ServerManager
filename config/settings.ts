﻿import nconf = require('nconf');
import Q = require('q');
import I = require('../Interfaces');

class Settings implements I.Settings {

    get httpServerPort(): number {
        return nconf.get('httpServerPort');
    }

	get httpsServerPort(): number {
		return nconf.get('httpsServerPort');
	}

    set httpServerPort(newValue: number) {
        nconf.set('httpServerPort', newValue);
	}

	get basicAuthUsername() {
		return nconf.get('basicAuthUsername');
	}

	get basicAuthPassword() {
		return nconf.get('basicAuthPassword');
	}

    get redis_port(): number {
        return nconf.get('redis_port');
    }

    set redis_port(newValue: number) {
        nconf.set('redis_port', newValue);
    }

    get redis_address(): string {
        return nconf.get('redis_address');
    }

    set redis_address(newValue: string) {
        nconf.set('redis_address', newValue);
    }

    get redis_password(): string {
        return nconf.get('redis_password');
    }

    set redis_password(newValue: string) {
        nconf.set('redis_password', newValue);
    }

    get sslConfigPath(): string {
        return nconf.get('sslConfigPath');
    }

    set sslConfigPath(newValue: string) {
        nconf.set('sslConfigPath', newValue);
    }

    get motdFileLocation(): string {
        return nconf.get('motdFileLocation');
    }

    set motdFileLocation(newValue: string) {
        nconf.set('motdFileLocation', newValue);
    }

    get requestPaths(): any {
        return nconf.get('requestPaths');
    }

    set requestPaths(newValue: any) {
        nconf.set('requestPaths', newValue);
    }

    get currentPatchlineFileLocation(): string {
        return nconf.get('currentPatchlineFileLocation');
    }

    set currentPatchlineFileLocation(newValue: string) {
        nconf.set('currentPatchlineFileLocation', newValue);
    }

    get fallbackPatchline(): string {
        return nconf.get('fallbackPatchline');
    }

    set fallbackPatchline(newValue: string) {
        nconf.set('fallbackPatchline', newValue);
    }

    get patchlines(): string[] {
        return nconf.get('patchlines');
    }

    set patchlines(newValue: string[]) {
        nconf.set('patchlines', newValue);
    }

    get MinimumSurplusCapacity(): number {
        return nconf.get('MinimumSurplusCapacity');
    }

    set MinimumSurplusCapacity(newValue: number) {
        nconf.set('MinimumSurplusCapacity', newValue);
    }

    get SurplusRatio(): number {
        return nconf.get('SurplusRatio');
    }

    set SurplusRatio(newValue: number) {
        nconf.set('SurplusRatio', newValue);
    }

    get Graylog2(): any {
        return nconf.get('Graylog2');
    }

    set Graylog2(newValue: any) {
        nconf.set('Graylog2', newValue);
    }

    get redisLobbyInactiveTimeout(): number {
        return nconf.get('redisLobbyInactiveTimeout');
    }

    set redisLobbyInactiveTimeout(newValue: number) {
        nconf.set('redisLobbyInactiveTimeout', newValue);
    }

    get LobbyListingsUpdateFrequency(): number {
        return nconf.get('LobbyListingsUpdateFrequency');
    }

    set LobbyListingsUpdateFrequency(newValue: number) {
        nconf.set('LobbyListingsUpdateFrequency', newValue);
    }

    get timeoutInMSForIsRunningCall(): number {
        return nconf.get('timeoutInMSForIsRunningCall');   
    }

    set timeoutInMSForIsRunningCall(newValue: number) {
        nconf.set('timeoutInMSForIsRunningCall', newValue);
    }

    get refreshStatsIntervalInMS(): number {
        return nconf.get('refreshStatsIntervalInMS');
    }

    set refreshStatsIntervalInMS(newValue: number) {
        nconf.set('refreshStatsIntervalInMS', newValue);
    }

    get millisPerPixelForSmoothieChart(): number {
        return nconf.get('millisPerPixelForSmoothieChart');
    }

    set millisPerPixelForSmoothieChart(newValue: number) {
        nconf.set('millisPerPixelForSmoothieChart', newValue);
    }

    get MongoDBConnectionString(): string {
        return nconf.get('MongoDBConnectionString');
    }

    set MongoDBConnectionString(newValue: string) {
        nconf.set('MongoDBConnectionString', newValue);
    }

    get timeoutForRequestPost(): number {
        return nconf.get('timeoutForRequestPost');
    }

    set timeoutForRequestPost(newValue: number) {
        nconf.set('timeoutForRequestPost', newValue);
    }
    get redisRetryMaxDelay(): number {
        return nconf.get('redisRetryMaxDelay');
    }

    set redisRetryMaxDelay(newValue: number) {
        nconf.set('redisRetryMaxDelay', newValue);
    }

    get redisConnectTimeout(): number {
        return nconf.get('redisConnectTimeout');
    }

    set redisConnectTimeout(newValue: number) {
        nconf.set('redisConnectTimeout', newValue);
	}

	get queueURL(): string {
		return nconf.get('queueURL');
	}

	get elasticSearchURL1(): string {
		return nconf.get('elasticSearchURL1');
	}

	get elasticSearchURL2(): string {
		return nconf.get('elasticSearchURL2');
	}

	get graylogURL1(): string {
		return nconf.get('graylogURL1');
	}

	get graylogURL2(): string {
		return nconf.get('graylogURL2');
	}

	get mongoDbUsername(): string {
		return nconf.get('mongoDbUsername');
	}

	get mongoDbPassword(): string {
		return nconf.get('mongoDbPassword');
	}

	get mongoDbUris(): Array<string> {
		return nconf.get('mongoDbUris');
	}

	get mongoDbReplicaSet(): string {
		return nconf.get('mongoDbReplicaSet');
	}

	get mongoDbName(): string {
		return nconf.get('mongoDbName');
	}

	get mongoDbKeepAlive(): number {
		return nconf.get('mongoDbKeepAlive');
	}

	get mongoDbReconnectTries(): number {
		return nconf.get('mongoDbReconnectTries');
	}

	get mongoDbReconnectIntervalMillis(): number {
		return nconf.get('mongoDbReconnectIntervalMillis');
	}

    public save(): Q.Promise<{}> {
        return Q.ninvoke(nconf, 'save');
    }
}

let rabbitMQUsername: string = "guest";
let rabbitMQPassword: string = "guest";
let rabbitMQHost: string = "127.0.0.1";
let rabbitMQPort: number = 5672;
let defaultSettings = {
	httpsServerPort: 10800,
	httpServerPort: 80,
    sslConfigPath: "./config/ssl.json",
	motdFileLocation: "./config/MOTD.txt",
	basicAuthUsername: "admin",
	basicAuthPassword: "admin",
    requestPaths: {
        gameServers: [
            {
                url: "http://127.0.0.1:11000",
            }
        ],
        lobbies: ["http://127.0.0.1:10200"],
        lobbiesDb: ["https://127.0.0.1:10800/lobbiesDb"],
		playerAccounts: ["https://127.0.0.1"],
		playerAccountsLoadBalanced: "https://127.0.0.1",
        playerAccountsDb: ["https://127.0.0.1:10800/playerAccountsDb"],
        chatServers: ["http://127.0.0.1:10400"],
		playerStats: ["http://127.0.0.1:10500"],
		playerStatsLoadBalanced: "http://127.0.0.1:10500",
		rabbitMq: ["https://127.0.0.1:10800/rabbitMq"],
		graylog: ["https://127.0.0.1:10800/graylog1", "https://127.0.0.1:10800/graylog2"],
		elasticSearch: ["https://127.0.0.1:10800/elasticSearch1", "https://127.0.0.1:10800/elasticSearch2"]
    },
    currentPatchlineFileLocation: "./config/CurrentPatchline.txt",
    fallbackPatchline: "weekly",
    patchlines: ["release", "dev", "internal", "weekly", "yolo", "alpha"],
    MinimumSurplusCapacity: 3,
    SurplusRatio: 0.5,
    Graylog2: {
        name: "Graylog",
        level: "debug",
        graylog: {
            servers: [{
                host: "analytics.beta.maestrosgame.com",
                port: 12201
			}],
            facility: "ServerManager",
        },
        staticMeta: { shard: 'local' }
    },
    redis_address: "127.0.0.1",
    redis_port: 6379,
    redis_password: "",
    redisLobbyInactiveTimeout: 7200,
    LobbyListingsUpdateFrequency: 2000,
    timeoutInMSForIsRunningCall: 10000,
    refreshStatsIntervalInMS: 3000,
	millisPerPixelForSmoothieChart: 100,
	mongoDbUsername: "",
	mongoDbPassword: "",
	mongoDbUris: ["127.0.0.1:27017"],
	mongoDbReplicaSet: "",
	mongoDbName: "PlatformStatus",
	mongoDbKeepAlive: 1,
	mongoDbReconnectTries: 600,
	mongoDbReconnectIntervalMillis: 1000,
    MongoDBConnectionString: "mongodb://127.0.0.1/test",
    timeoutForRequestPost: 10000,
    redisRetryMaxDelay: 60000,
	redisConnectTimeout: 10 * 365 * 24 * 60 * 60 * 1000, //10 Years-ish ;)
	queueURL: "amqp://" + rabbitMQUsername + ":" + rabbitMQPassword + "@" + rabbitMQHost + ":" + rabbitMQPort,
	elasticSearchURL1: "http://tmeslinuxvm1.westus2.cloudapp.azure.com:9200/",
	elasticSearchURL2: "http://tmeslinuxvm2.westus2.cloudapp.azure.com:9200/",
	graylogURL1: "http://tmgrayloglinuxvm1.westus2.cloudapp.azure.com:9000/",
	graylogURL2: "http://tmgrayloglinuxvm2.westus2.cloudapp.azure.com:9000/"
};

nconf.file('./config/settings.json')
     .defaults(defaultSettings);

let settings: I.Settings = new Settings();
export = settings;