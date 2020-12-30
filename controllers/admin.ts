import I = require('../Interfaces');

export function index(req: any, res: any) {
	_update(function (dataIn: any) {
		res.render('general', { data: dataIn });
	});
};

export function indexAccountManagement(req: any, res: any) {
	_update(function (dataIn: any) {
		res.render('accountManagement', { data: dataIn });
	});
};

import fs = require('fs');
import http = require('http');
import _ = require('underscore');
import https = require('https');
import url = require('url');
import path = require('path');
import settings = require('../config/settings');
import logger = require('../logger');
import async = require('async');
import PlatformStatusService = require('../models/PlatformStatusService');
import PlatformStatusDb = require('../PlatformStatusDb');
import MongoDbConnectionManager = require('../MongoDbConnectionManager');
import request = require('request');
import Q = require('q');
import redis = require('redis');
import LobbyListing = require('../models/LobbyListings');

let mongoDbConnectionManager = new MongoDbConnectionManager();
let platformStatusDb = new PlatformStatusDb(mongoDbConnectionManager);
let platformStatusService = new PlatformStatusService(platformStatusDb);

mongoDbConnectionManager.connect().then(() => {
	platformStatusDb.init();
	platformStatusService.init();
})

let requestPaths = settings.requestPaths;
let maxUsersInTotal = 0; // move to file
let maxUsersInGame = 0; // move to file
let maxUsersInLobby = 0; // move to file
let usersTotal: number;
let uniqueUsers: number;

let prevData: any = {
    data: {},
    lastUpdated: 0,
};

// Only used for test-Admin.ts
export function setPlatformStatusService(mockPlatformStatusService: any) {
	platformStatusService = mockPlatformStatusService;
}

export function newMOTD(req: any, res: any) {
	//req contains string motd.
	//then call edit MOTD in somewhere...
	if (req.body.motd) {
        platformStatusService.motd = String(req.body.motd).trim();
		res.redirect('/admin');
	} else {
		logger.warn("Rejected new MOTD (input was null)", { codepath: "PlatformTypescript.controllers.admin", motd: req.body.motd });
		res.redirect('/admin');
	}
};

export function newFeatureToggles(req: any, res: any) {
	if (req.body.featureToggles) {
		platformStatusService.featureToggles = String(req.body.featureToggles);
		res.redirect('/admin');
	} else {
		logger.warn("Rejected new Feature Toggles (input was null)", { codepath: "PlatformTypescript.controllers.admin", motd: req.body.motd });
		res.redirect('/admin');
	}
};

//temp
export function setSurplus(req: any, res: any) {
    try {
        if (Number(req.query.surplus)) {
            settings.MinimumSurplusCapacity = Number(req.query.surplus);
        }
        res.write(settings.MinimumSurplusCapacity.toString());
    } catch (e) {
        res.write(e.toString());
    }
    res.end();
}

//initiates patch
export function initiatePatch(req: any, res: any) {
	if (req.body.patchLinePicker == "-- Select Patch Line --") {
		logger.info("This check should be moved to client-side verification but for now, since --Select Patch Line-- was selected, just refresh index.");
		res.redirect('/admin');
	} else if (req.body.patchLinePicker != null) {
		logger.info("Patching all gameServers (see config.requestPaths.gameServers for all URLs)");
		_requestPatch(requestPaths.gameServers, req.body.patchLinePicker, res); // this function is asynchronous; will redirect you to admin after it's done.
	} else {
		//have null
		logger.warn('Null patch line', { codepath: "PlatformTypescript.controllers.admin" });
		res.redirect('/admin');
	}
};

export function createAccount(req: any, res: any) {
	if (req.body.usernameField && req.body.passwordField && req.body.emailField && req.body.birthdayField ) {
		//Field Checks -> Username valid size, password valid size, email valid format

		//Call Player Accounts URL
		_createAccountCall(req).then((sessionToken: any) => {
			//Call max player stats
			if (req.body.isMaxedAccountField == "true") {
				return _maxAccountCall(req);
			}
		}).then(() => {
			res.status(200).json({ success: true }).end();
		}).catch((err) => {
			res.status(404);
			res.write("404");
			res.end();
			logger.error("Error in createAccount() in ServerManager: " + err);
		});

	} else {
		//have null
		logger.warn("Invalid form parameters in createAccount() in ServerManager.");
	}
};

export function _createAccountCall(req: any): Q.Promise<any> {
	let callingUrl: string = settings.requestPaths.playerAccountsLoadBalanced + '/createPlayer2';
	let promise: Q.Promise<any> = Q.Promise((resolve, reject) => {
		request.post({
			uri: callingUrl,
			timeout: settings.timeoutForRequestPost,
			strictSSL: false,
			json: true,
			form: {
				playerName: req.body.usernameField,
				password: req.body.passwordField,
				email: req.body.emailField,
				birthDate: req.body.birthdayField,
				steamUsername: req.body.usernameField
			}
		}, (error: any, response: any, body: any) => {
			if (error) {
				reject("Request.post has error " + error);
			} else if (!response) {
				reject("Empty response");
			} else if (!body) {
				reject("Empty body");
			} else if (body.error) {
				reject("Body has error: " + body.error);
			} else {
				logger.info("Account " + req.body.usernameField + " was successfully created from ServerManager.");
				resolve(req.body.sessionToken);
			}
		});
	});
	return promise;
}

export function _maxAccountCall(req: any): Q.Promise<any> {
	let callingUrl: string = settings.requestPaths.playerStatsLoadBalanced + '/v1/giveMaxPlayerStats';
	let playerNameField = {
		playerName: req.body.usernameField
	};
	let promise: Q.Promise<any> = Q.Promise((resolve, reject) => {
		request.post({
			uri: callingUrl,
			timeout: settings.timeoutForRequestPost,
			strictSSL: false,
			json: true,
			form: {
				playerStats: JSON.stringify(playerNameField)
			}
		}, (error: any, response: any, body: any) => {
			if (error) {
				reject("Request.post has error " + error);
			} else if (!response) {
				reject("Empty response");
			} else if (!body) {
				reject("Empty body");
			} else if (body.error) {
				reject("Body has error: " + body.error);
			} else {
				logger.info("Account " + req.body.usernameField + " was successfully maxed from ServerManager.");
				resolve(req.body.sessionToken);
			}
		});
	});
	return promise;
}

export function deleteAccount(req: any, res: any) {
	if (req.body.usernameField) {
		//Field Checks -> Username valid size, password valid size, email valid format

		//Call Player Accounts URL
		_deleteAccountCall(req).then((body: any) => {
			res.status(200).json(body).end();
		}).catch((err) => {
			res.status(404);
			res.write("404");
			res.end();
			logger.error("Error in deleteAccount() in ServerManager: " + err);
		});

	} else {
		//have null
		logger.warn("Invalid form parameters in deleteAccount() in ServerManager.");
	}
};

export function _deleteAccountCall(req: any): Q.Promise<any> {
	let callingUrl: string = settings.requestPaths.playerAccountsLoadBalanced + '/deletePlayer2';
	let promise: Q.Promise<any> = Q.Promise((resolve, reject) => {
		request.post({
			uri: callingUrl,
			timeout: settings.timeoutForRequestPost,
			strictSSL: false,
			json: true,
			form: {
				playerName: req.body.usernameField,
			}
		}, (error: any, response: any, body: any) => {
			if (error) {
				reject("Request.post has error " + error);
			} else if (!response) {
				reject("Empty response");
			} else if (!body) {
				reject("Empty body");
			} else if (body.error) {
				reject("Body has error: " + body.error);
			} else {
				if (body.success) {
					logger.info("Account " + req.body.usernameField + " was successfully deleted from ServerManager.");
				} else {
					logger.info("Account " + req.body.usernameField + " failed to be deleted from ServerManager.");
				}
				resolve(body);
			}
		});
	});
	return promise;
}

export function lookupAccount(req: any, res: any) {
	if (req.body.usernameField || req.body.emailField) {
		//Call Player Accounts URL
		_lookupAccountCall(req).then((body: any) => {
			res.status(200).json(body).end();
		}).catch((err) => {
			res.status(404);
			res.write("404");
			res.end();
			logger.error("Error in lookupAccount() in ServerManager with error: " + err);
		});
	} else {
		//have null
		logger.warn("Invalid form parameters in lookupAccount() in ServerManager.");
	} 
};

export function _lookupAccountCall(req: any): Q.Promise<any> {
	let callingUrl: string = settings.requestPaths.playerAccountsLoadBalanced + '/getPlayerAccountInfo';

	let promise: Q.Promise<any> = Q.Promise((resolve, reject) => {
		request.post({
			uri: callingUrl,
			timeout: settings.timeoutForRequestPost,
			strictSSL: false,
			json: true,
			form: {
				playerName: req.body.usernameField,
				email: req.body.emailField
			}
		}, (error: any, response: any, body: any) => {
			if (error) {
				reject("Request.post has error " + error);
			} else if (!response) {
				reject("Empty response");
			} else if (!body) {
				reject("Empty body");
			} else if (body.error) {
				reject("Body has error: " + body.error);
			} else {
				resolve(body);
			}
		});
	});
	return promise;
}

export function editAccount(req: any, res: any) {
	if (req.body.playerUniqueNameField && req.body.currentXPField && req.body.currentLevelField && req.body.winsField && req.body.lossesField) {
		//Call Player Accounts URL
		_editAccountCall(req).then((body: any) => {
			res.status(200).json(body).end();
		}).catch((err) => {
			res.status(404);
			res.write("404");
			res.end();
			logger.error("Error in editAccount() in ServerManager with error: " + err);
		});
	} else {
		//have null
		logger.warn("Invalid form parameters in editAccount() in ServerManager.");
	}
};

export function _editAccountCall(req: any): Q.Promise<any> {
	let callingUrl: string = settings.requestPaths.playerAccountsLoadBalanced + '/setPlayerAccountInfo';

	let promise: Q.Promise<any> = Q.Promise((resolve, reject) => {
		request.post({
			uri: callingUrl,
			timeout: settings.timeoutForRequestPost,
			strictSSL: false,
			json: true,
			form: {
				playerUniqueName: req.body.playerUniqueNameField,
				verified: req.body.verifiedField,
				currentXP: req.body.currentXPField,
				currentLevel: req.body.currentLevelField,
				wins: req.body.winsField,
				losses: req.body.lossesField,
				playerInventory: JSON.stringify(req.body.playerInventoryField)
			}
		}, (error: any, response: any, body: any) => {
			if (error) {
				reject("Request.post has error " + error);
			} else if (!response) {
				reject("Empty response");
			} else if (!body) {
				reject("Empty body");
			} else if (body.error) {
				reject("Body has error: " + body.error);
			} else {
				resolve(body);
			}
		});
	});
	return promise;
}


function buildServerIsRunningData() {
    let serverIsRunningData = new Array<I.Service>();
    for (let gameServerKey in requestPaths.gameServers) {
        let gameServer = requestPaths.gameServers[gameServerKey];
        let service: I.Service = { serviceType: "GameServer", url: gameServer.url, isRunning: false };
        serverIsRunningData.push(service);
    }
    for (let lobbyKey in requestPaths.lobbies) {
        let lobby = requestPaths.lobbies[lobbyKey];
        let service: I.Service = { serviceType: "Lobbies", url: lobby, isRunning: false };
        serverIsRunningData.push(service);
    }
    for (let lobbyDbKey in requestPaths.lobbiesDb) {
        let lobbyDb = requestPaths.lobbiesDb[lobbyDbKey];
        let service: I.Service = { serviceType: "LobbiesDb", url: lobbyDb, isRunning: false };
        serverIsRunningData.push(service);
    }
    for (let playerAccountKey in requestPaths.playerAccounts) {
        let playerAccount = requestPaths.playerAccounts[playerAccountKey];
        let service: I.Service = { serviceType: "PlayerAccounts", url: playerAccount, isRunning: false };
        serverIsRunningData.push(service);
    }
    for (let playerAccountDbKey in requestPaths.playerAccountsDb) {
        let playerAccountDb = requestPaths.playerAccountsDb[playerAccountDbKey];
        let service: I.Service = { serviceType: "PlayerAccountsDb", url: playerAccountDb, isRunning: false };
        serverIsRunningData.push(service);
    }
    for (let chatServerKey in requestPaths.chatServers) {
        let chatServer = requestPaths.chatServers[chatServerKey];
        let service: I.Service = { serviceType: "ChatServer", url: chatServer, isRunning: false };
        serverIsRunningData.push(service);
    }
    for (let graylogKey in requestPaths.graylog) {
        let graylog = requestPaths.graylog[graylogKey];
        let service: I.Service = { serviceType: "Graylog", url: graylog, isRunning: false };
        serverIsRunningData.push(service);
	}
	for (let elasticSearchKey in requestPaths.elasticSearch) {
		let elasticSearch = requestPaths.elasticSearch[elasticSearchKey];
		let service: I.Service = { serviceType: "ElasticSearch", url: elasticSearch, isRunning: false };
		serverIsRunningData.push(service);
	}
    for (let playerStatsKey in requestPaths.playerStats) {
        let playerStats = requestPaths.playerStats[playerStatsKey];
        let service: I.Service = { serviceType: "PlayerStats", url: playerStats, isRunning: false };
        serverIsRunningData.push(service);
	}
	for (let rabbitMqKey in requestPaths.rabbitMq) {
		let rabbitMq = requestPaths.rabbitMq[rabbitMqKey];
		let service: I.Service = { serviceType: "RabbitMq", url: rabbitMq, isRunning: false };
		serverIsRunningData.push(service);
	}
    return serverIsRunningData;
}

function updateIsRunning(callback: any) {
    let data: any = {
        patchLines: settings.patchlines,
        currentMotd: platformStatusService.motd,
		currentPatch: platformStatusService.patchline,
		currentFeatureToggles: platformStatusService.featureToggles,
    };
    let serverIsRunningData = buildServerIsRunningData();
    async.each(serverIsRunningData, function (service: I.Service, individualRequestCallback) {
		let sendURL: string = service.url + "/isRunning";
		let requestOptions: request.UriOptions & request.CoreOptions;
		let httpsServices: Array<string> = ["LobbiesDb", "PlayerAccountsDb", "RabbitMq", "Graylog", "ElasticSearch"];
		if (httpsServices.indexOf(service.serviceType) != -1) {
			requestOptions = {
				uri: sendURL,
				timeout: settings.timeoutInMSForIsRunningCall,
				strictSSL: false,
				auth: { username: settings.basicAuthUsername, password: settings.basicAuthPassword }
			}
		} else {
			requestOptions = {
				uri: sendURL,
				timeout: settings.timeoutInMSForIsRunningCall,
				strictSSL: false
			}
		}
		request(requestOptions,
		function (error, response, body) {
            if (!error && response.statusCode == 200) {
                service.isRunning = true;
            }
            individualRequestCallback();
        });
    },
    function (err) {
        data.isRunningData = serverIsRunningData;
        return callback(null, data);
    });
}

function updateUserCount(callback: any) {
	let requestOptions: request.UriOptions & request.CoreOptions;
	let sendURL: string = settings.requestPaths.playerAccountsLoadBalanced + "/getUserCount";
	requestOptions = {
		uri: sendURL,
		timeout: settings.timeoutInMSForIsRunningCall,
		strictSSL: false
	}

	request.post(requestOptions,
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(body);
			} else {
				callback(0);
			}
		});
}

function _update(callback: any): any {
    async.waterfall([
		updateIsRunning,
		function (data: any, callback: any) {
			updateUserCount(function (userCount: any) {
				data.uniqueUsers = userCount;
				callback(null, data); //callback(err, result);
			});
		},
        // first find status of all game servers
        function (data: any, callback: any) {
            _getStatusAllGameServers(function (serverData: any) {
                data.serverData = serverData;
                callback(null, data); //callback(err, result);
            });
        },
        // then collect lobby data
        function (data: any, callback: any) {
            _getLobbyData(function (lobbyData: any) {
                data.lobbyData = lobbyData;
                callback(null, data);
            });
        },
        // use that to find # of users in lobbies
        // then update peak # of users in lobbies if needed
        function (data: any, callback: any) {
            data.usersInLobby = _getLobbyUserCount(data.lobbyData);
            data.maxUsersInLobby = Math.max(maxUsersInLobby, data.usersInLobby);
            maxUsersInLobby = data.maxUsersInLobby;
            callback(null, data);
        },
        // then find # of users in-game
        function (data: any, callback: any) {
            _getGamesInProgressData(function (ingameData: any) {
                data.ingameData = ingameData;
                callback(null, data);
            });
        },
        // use that to find the max # of users in-game
        // use both max #s to update the max total again if needed
        function (data: any, callback: any) {
            data.usersInGame = _getInGameUserCount(data.ingameData);
            data.maxUsersInGame = Math.max(maxUsersInGame, data.usersInGame);
            data.usersOnline = data.usersInGame + data.usersInLobby;
            data.maxUsersOnline = Math.max(maxUsersInTotal, data.maxUsersInGame + data.maxUsersInLobby);
            callback(null, data);
        }
    ],
        function (err, data) {
            return callback(data); // controller.refreshStats() looks for this data object
        });
}

export function getData(req: any, res: any) {
    let currentTime = new Date().getTime();
    if (prevData.lastUpdated + 2900 < currentTime) {
        prevData.lastUpdated = currentTime;
        _update(function (data: any) {
            prevData.data = data;
            return res.send(data);
        });
    }
    else {
        return res.send(prevData.data);
    }
}

export function killRunningGame(req: any, res: any) {
	let gametoKill = req.body.gameToKill;
	//kill the game with gameName gameToKill
	res.send(200); // be sure to call updateData upon getting "OK" from the 200.
}

function _requestPatch(gameServers: any[], patchline: string, res: any) {
	async.each(gameServers, function (gameServer: any, callback: any) {
		//gameServers[i] each contains .url, with .queueURL, .port, .serverAddress (should include all of them with patchline) (make sure publicPorts is an array that's a string
		request.post({ uri: gameServer.url + '/enableAndConfigure', json: true, form: { patchLine: patchline, queueURL: gameServer.queueURL, publicPorts: "[" + gameServer.port + "]", serverAddress: gameServer.serverAddress } },
			function (err, httpResponse, body) {
				if (err) {
					logger.error("Patch FAILED on: " + gameServer.url + " trying to patch to: " + patchline);
					return callback(err);
				}
				if (httpResponse) {
					logger.info("Successfully patched!");
					return callback();
				}
				return callback();
			});
	}, function (err) {
			// if any of the file processing produced an error, err would equal that error
			if (err) {
				// One of the iterations produced an error.
				// All processing will now stop.
				logger.error("ServerManager.admin._requestPatch() failed: " + err);
			} else {
			}
		});
	return res.redirect('/admin');
}

/**
	_getStatusAllGameServers() queries all the servers for their current statuses.
	Output format: A dictionary (key-value store). 
	The key is the URL of the game server
	The value is a JSON
	Asynchronous
*/
function _getStatusAllGameServers(callback: any) {
	let allGameServers = requestPaths.gameServers;
	let out: any = []; // this will be an array of of GameServer status JSONs.
	async.each(allGameServers, function (gameServer: any, callback: any) {
		//gameServers[i] each contains .url, with .queueURL, .port, .serverAddress (should include all of them with patchline) (make sure publicPorts is an array of ints, generally of length=1)
		let sendURL: string = gameServer.url + "/status";

		request({
			uri: sendURL,
			timeout: 10000
		}, function (error, response, body) {
				if (error) {

					logger.warn("ServerManager.admin._getStatusAllGameServers() HTTP request failed on server URL " + gameServer.serverAddress + "/status : " + error);
					out.push({ serverAddress: gameServer.serverAddress, error: error.message }); // 0 means server is not responding to requests (i.e not online)
					return callback();

				} else {

					let resp = JSON.parse(body);
					let jsonOut =
						{
							serverAddress: gameServer.serverAddress,
							isEnabled: resp.isEnabled, // True: server is available
							needsPatching: resp.needsPatching, // looks like: true
							isPatching: resp.isPatching, // looks like: true
							slots: resp.slots, // looks like: [{publicPort:25000, privatePort:25000, status:1, tagged:false}]
							settings: resp.settings // looks like: {}
						};

					out.push(jsonOut);
					return callback(out);
				}
			});

	}, function (err) {
			// if any of the file processing produced an error, err would equal that error
			if (err) {
				// One of the iterations produced an error. All processing will now stop.
				return callback(out);
			} else {
				return callback(out);
			}
		});
}

/**
	Gets the status of in-progress games.
	Asynchronous
*/
function _getGamesInProgressData(callback: any) {
	// Go through every game in progress and retrieve their statuses.
	// Result should be a dict: {gameID:statusJSON}
	// Poll from the gameServers themselves
	let allGameServers = requestPaths.gameServers;
	let out: any = []; // this will be an array of of GameServer status JSONs.
	async.each(allGameServers, function (gameServer: any, callback: any) {
		//gameServers[i] each contains .url, with .queueURL, .port, .serverAddress (should include all of them with patchline) (make sure publicPorts is an array of ints, generally of length=1)
		let sendURL: string = gameServer.url + "/getGameServerData";

		request({
			uri: sendURL,
			timeout: 10000
		}, function (error, response, body) {
				if (error) {

					logger.warn("ServerManager.admin._getGamesInProgressData() HTTP request failed on server URL " + gameServer.serverAddress + "/getGameServerData : " + error);
					out.push({ server: gameServer.serverAddress, error: error.message, numOfPlayers: 0 }); // 0 means server is not responding to requests (i.e not online)
					return callback();

				} else {
					let result = JSON.parse(body);
					let jsonOut = {};
					for (let i = 0; i < result.length; i++) {
						// I need to see if the format of the incoming JSON fits this
						jsonOut =
						{
							server: gameServer.serverAddress,
							mapName: result[i].mapName,
							gameType: result[i].gameType,
							numOfPlayers: result[i].numOfPlayers,
							gameGUID: result[i].gameGUID,
							jobID: result[i].jobID,
							port: result[i].port,
                            processId: result[i].processId,
                            activeHumanPlayerCount: result[i].activeHumanPlayerCount
						};
						out.push(jsonOut);
					}
					return callback();
				}
			});

	}, function (err) {
			// if any of the file processing produced an error, err would equal that error
			if (err) {
				// One of the iterations produced an error. All processing will now stop.
				return callback(out);
			} else {
				return callback(out);
			}
		});
}

/**
	Gets the number of users playing a game (in-game).
	Synchronous
*/
function _getInGameUserCount(ingameData: any) {
	// Go through all games in progress.
	// For each server: Sum the total number of users in each game.
	// Sum results from all servers.

	let count = 0;
	for (let i = 0; i < ingameData.length; i++) {
		//One element of ingameData is actually a list of process JSONs.
        if (!ingameData[i].error) {
            if (ingameData[i].activeHumanPlayerCount) {
                count += parseInt(ingameData[i].activeHumanPlayerCount);
            }
		}
    }
    if (count > 0) {
        logger.info("Users in game: " + count);
    }

	return count;
}

/**
	Gets the number of users in a lobby (pre-game).
	Asynchronous
*/
function _getLobbyData(callback: any) {
	// output: [{gameGUID, gameName, mapName, gameType, numOfPlayers, maxPlayers, hostName, port}, ...]
	let lobbyDetails: any = [];
	let allListingsPromise: any = LobbyListing.getAllListings();
	allListingsPromise.then(
		function (allListings: any) { // success
			for (let i = 0; i < allListings.length; i++) {
				lobbyDetails.push(allListings[i]);
			}
			return callback(lobbyDetails);
		},
		function (err: any) { // failure
			logger.warn("ServerManager.admin._getLobbyData(): Failed to get number of users in a lobby: " + err);
			return callback(null);
		}
		);
}

/**
	Gets the number of users in lobbies from _getLobbyData() data.
	Synchronous
*/
function _getLobbyUserCount(lobbyInfo: any) {
	let count = 0;
	if (lobbyInfo) {
		for (let i = 0; i < lobbyInfo.length; i++) { 
			// [{v1}, {v2}, ...]
			if (lobbyInfo[i].numOfPlayers >= 0)
				count += lobbyInfo[i].numOfPlayers;
			else
				logger.error("ServerManager.admin._getLobbyUserCount: Lobby has <0 users in it! GameGUID = " + lobbyInfo[i].gameGUID);
		}
	} else {
		return 0;
    }
    if (count > 0) {
        logger.info("Users in lobbies: " + count);
    }

	return count;
}


/**
	Gets the number of registered accounts (TOTAL).
	Asynchronous
*/
function _getNumberOfRegistrations() {
	//Find the number of registered accounts

}

/**
	Checks whether or not the platform is online.
	True: Platform is online.
	False: Platform is offline.
	Asynchronous
*/
function _isPlatformOnline() {
	// Check if there is at least one server online?
	// This stub will be filled when Platform gets the API call to check for this.
}