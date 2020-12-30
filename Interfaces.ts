import net = require('net');
import Player = require('./Player');
import enums = require('./enums');
import redis = require('redis');

export interface Settings {
	httpServerPort: number;
	httpsServerPort: number;
	basicAuthUsername: string;
	basicAuthPassword: string;
    redis_port: number;
    redis_address: string;
    redis_password: string;
	sslConfigPath: string;
	motdFileLocation: string;
	requestPaths: RequestPaths;
	currentPatchlineFileLocation: string;
	fallbackPatchline: string;
	patchlines: string[];
	MinimumSurplusCapacity: number;
	SurplusRatio: number;
	Graylog2: any;
	redisLobbyInactiveTimeout: number;
	LobbyListingsUpdateFrequency: number;
    timeoutInMSForIsRunningCall: number;
    refreshStatsIntervalInMS: number;
    millisPerPixelForSmoothieChart: number;
    MongoDBConnectionString: string;
    timeoutForRequestPost: number;
    redisRetryMaxDelay: number;
	redisConnectTimeout: number;
	queueURL: string;
	elasticSearchURL1: string;
	elasticSearchURL2: string;
	graylogURL1: string;
	graylogURL2: string;
	mongoDbUsername: string;
	mongoDbPassword: string;
	mongoDbUris: Array<string>;
	mongoDbReplicaSet: string;
	mongoDbName: string;
	mongoDbKeepAlive: number;
	mongoDbReconnectTries: number;
	mongoDbReconnectIntervalMillis: number;
    save: ()=> Q.Promise<{}>;
}

export interface LobbyListing {
    gameName: string;
    mapName: string;
    gameType: string;
    numOfPlayers: number;
    maxPlayers: number;
    hostName: string;
    gameGUID: string;
    port: string;
}

export interface ProcessInfo {
    settings: { mapName: string; gameType: string };
    activePlayerCount: number;
    gameGUID: string;
}

export interface Endpoint {
    publicPort: number;
    privatePort: number;
}

export interface PlatformStatusService {
    motd: string;
	patchline: string;
	featureToggles: any;
}

export interface PlayerConnectedMessage {
    player: Player;
    gameGUID: string;
    socket: net.Socket;
}

export interface MessagePlayers {
    command: string;
    players: Player[];
    body: string;
    next: Function;
}

export interface CommandLineAttributes {
    privatePort: number;
    mapName: string;
    gameType: string;
    gameGUID: string;
    numOfPlayers: number;
    processId: number;
}

export interface GameSettings {
    mapName: string;
    gameType: string;
}

export interface Job {
    processInfo: ProcessInfo;
    jobID: string;
    endpoint?: Endpoint;
    status: enums.JobState;
}

export interface AzureMachineData {
    DeploymentName?: string;
    ServiceName: string;
    HostName: string;
    AzureAccountName: string;
    isStarting?: boolean;
    isStabilized?: boolean;
}

export interface AzureServiceStatusData extends AzureMachineData {
    instanceStatus: string;
    powerState: string;
}

export interface Service {
    serviceType: string;
    url: string;
    isRunning: boolean;
}

export interface RequestPaths {
	gameServers: any;
	lobbies: Array<string>;
	lobbiesDb: Array<string>;
	playerAccounts: Array<string>;
	playerAccountsLoadBalanced: string;
	playerAccountsDb: Array<string>;
	chatServers: Array<string>;
	playerStats: Array<string>;
	playerStatsLoadBalanced: string;
	rabbitMq: Array<string>;
	graylog: Array<string>;
	graylogLoadBalanced: string;
	elasticSearch: Array<string>;
}

export interface PlatformStatus {
	motd: string;
	featureTogglesString: string;
}

export interface PlatformStatusDb {
	init(): void;
	createNewPlatformStatus(motd: string, featureTogglesString: string): Q.Promise<PlatformStatus>;
	getPlatformStatus(): Q.Promise<PlatformStatus>;
	setMotd(motd: string): Q.Promise<void>;
	setFeatureTogglesString(featureTogglesString: string): Q.Promise<void>;
}