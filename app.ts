import express = require('express');
let basicAuth = require('express-basic-auth');
let http = require('http');
import amqp = require('amqplib');
import https = require('https');
import path = require('path');
import fs = require('fs');
import settings = require('./config/settings');
import admin = require('./controllers/admin');
import logger = require('./logger');
import morgan = require('morgan');
import redis = require('redis');
import LobbyListing = require('./models/LobbyListings');
import mongoose = require('mongoose');
import request = require('request');
import bodyParser = require('body-parser');
import favicon = require('serve-favicon');
import serveStatic = require('serve-static');
import methodOverride = require('method-override');
import errorHandler = require('errorhandler');

let app = express();
require('./mongodbWrapper');
let db = require('./redisWrapper');
LobbyListing.db = db;
LobbyListing.startRefreshingListings(); // start polling redis for lobby info ASAP

// all environments
app.use(bodyParser());

let basicAuthUsers: any = {};
basicAuthUsers[settings.basicAuthUsername] = settings.basicAuthPassword;

app.use(basicAuth({
	users: basicAuthUsers,
	challenge: true
}));

app.use(serveStatic(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride());

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

let rabbitMqConnected: boolean = false;
let rabbitMqTryingToConnect: boolean = false;
let rabbitMqConnection: amqp.Connection;

function rabbitMqConnect() {
	rabbitMqTryingToConnect = true;

	amqp.connect(settings.queueURL, { heartbeat: 1000 }).then((connection: amqp.Connection) => {
		rabbitMqConnection = connection;
		rabbitMqConnected = true;
		rabbitMqTryingToConnect = false;
		rabbitMqConnection.on("close", () => {
			rabbitMqConnected = false;
		});
		rabbitMqConnection.on("connect", () => {
			rabbitMqConnected = true;
			rabbitMqTryingToConnect = false;
		});
		rabbitMqConnection.on("error", (err: any) => {
			logger.error("RABBIT MQ ERROR: " + err);
		});
	}).catch((err: any) => {
		rabbitMqTryingToConnect = false;
		logger.error("rabbitmq error" + err.message);
	});
}

rabbitMqConnect();

//==============DATA PAGE ROUTES=================

// IF YOU WANT TO GO TO THE PAGE, GO TO /admin - that'll keep anyone who shouldn't be there out. Definitely. </s> 
app.get('/admin', admin.index);
app.get('/accountManagement', admin.indexAccountManagement);
app.post('/admin/newMOTD', admin.newMOTD);
app.post('/admin/newFeatureToggles', admin.newFeatureToggles);
app.post('/admin/initiatePatch', admin.initiatePatch);
app.get('/admin/getData', admin.getData);
app.post('/admin/killRunningGame', admin.killRunningGame);
app.get('/admin/setSurplus', admin.setSurplus);
app.post('/admin/createAccount', admin.createAccount);
app.post('/admin/deleteAccount', admin.deleteAccount);
app.post('/admin/lookupAccount', admin.lookupAccount);
app.post('/admin/editAccount', admin.editAccount);


app.get('/playerAccountsDb/isRunning', function (req: any, res: any) {
    if (mongoose.connection.readyState == 1) {
        res.json(200, true);
    } else {
        res.status(404);
        res.write("404");
        res.end();
    }
});
app.get('/lobbiesDb/isRunning', function (req: any, res: any) {
    db.ping((err: any) => {
        if (err) {
            res.status(404);
            res.write("404");
            res.end();
        } else {
            res.json(200, true);
        }
    });
});
//app.get('/graylog/isRunning', function (req: any, res: any) {
//    request.get({
//		uri: "http://" + settings.Graylog2.graylog.servers[0].host + ":9000",
//        timeout: settings.timeoutForRequestPost
//    }, (error: any, response: any, body: any) => {
//        if (response == null || response.statusCode != 200) {
//            res.status(404);
//            res.write("404");
//            res.end();
//        } else {
//            res.json(200, true);
//        }
//    });
//});
app.get('/graylog1/isRunning', function (req: any, res: any) {
	request.get({
		uri: settings.graylogURL1,
		timeout: settings.timeoutForRequestPost
	}, (error: any, response: any, body: any) => {
		if (response == null || response.statusCode != 200) {
			res.status(404);
			res.write("404");
			res.end();
		} else {
			res.json(200, true);
		}
	});
});
app.get('/graylog2/isRunning', function (req: any, res: any) {
	request.get({
		uri: settings.graylogURL2,
		timeout: settings.timeoutForRequestPost
	}, (error: any, response: any, body: any) => {
		if (response == null || response.statusCode != 200) {
			res.status(404);
			res.write("404");
			res.end();
		} else {
			res.json(200, true);
		}
	});
});
app.get('/elasticSearch1/isRunning', function (req: any, res: any) {
	request.get({
		uri: settings.elasticSearchURL1,
		timeout: settings.timeoutForRequestPost
	}, (error: any, response: any, body: any) => {
		if (response == null || response.statusCode != 200) {
			res.status(404);
			res.write("404");
			res.end();
		} else {
			res.json(200, true);
		}
	});
});
app.get('/elasticSearch2/isRunning', function (req: any, res: any) {
	request.get({
		uri: settings.elasticSearchURL2,
		timeout: settings.timeoutForRequestPost
	}, (error: any, response: any, body: any) => {
		if (response == null || response.statusCode != 200) {
			res.status(404);
			res.write("404");
			res.end();
		} else {
			res.json(200, true);
		}
	});
});
app.get('/rabbitMq/isRunning', function (req: any, res: any) {
	if (rabbitMqConnected) {
		res.json(200, true);
	} else if (rabbitMqTryingToConnect) {
		res.status(404);
		res.write("404");
		res.end();
	} else {
		res.status(404);
		res.write("404");
		res.end();
		rabbitMqConnect();
	}
});

//Catch all to close response for non routed routes
app.all('*', (req: any, res: any) => {
	res.status(404);
	res.write("404");
	res.end();
});

let insecureApp: express.Express = express();

insecureApp.get('*', function (req, res) {
	res.redirect("https://" + req.headers.host + ":" + settings.httpsServerPort + req.originalUrl)
})

//============END ROUTES================

if (fs.existsSync(settings.sslConfigPath)) {
	https.createServer({
        pfx: fs.readFileSync(require(settings.sslConfigPath).pfx),
        passphrase: require(settings.sslConfigPath).passphrase
    }, app).listen(settings.httpsServerPort, '0.0.0.0');
    logger.info('SECURE server running at localhost', { codepath: "index.https.createServer", port: settings.httpsServerPort });
}
else {
	logger.error("https sslconfig not found, not starting server!");
}

http.createServer(insecureApp).listen(settings.httpServerPort, '0.0.0.0');
logger.info("http Server redirecting on port " + settings.httpServerPort);

process.on('uncaughtException', function (err: any) {
    logger.error(err.stack);
    logger.info("Node NOT Exiting...");
    debugger;
});

logger.info("ServerManager has started");
let printableSettings: any = settings;
logger.info(JSON.stringify(printableSettings.__proto__, null, 2));