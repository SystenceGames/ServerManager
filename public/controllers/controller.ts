var $: any = $;
var TimeSeries: any = TimeSeries;
var SmoothieChart: any = SmoothieChart;
import _ = require('underscore');
import x = require('../../node_modules/iconv-lite/lib/index');

let line1: any;
let line2: any;
let smoothie: any;
let uniqueUsers = 0;
let prevData: any;
let prevIsRunningData: any;
let prevIsRunningTable: any;
let refreshStatsIntervalInMS = 1000;  // refresh the data every 3 seconds

let incommingMessageSound = document.createElement('audio');
incommingMessageSound.setAttribute('src', '/audio/IncomingMessage.wav');
let mailSound = document.createElement('audio');
mailSound.setAttribute('src', '/audio/mail.wav');

window.setInterval(function(){
    refreshStats();
}, refreshStatsIntervalInMS); 

function showHide(shID: any) {
   if (document.getElementById(shID)) {
      if (document.getElementById(shID+'-show').style.display != 'none') {
         document.getElementById(shID+'-show').style.display = 'none';
         document.getElementById(shID).style.display = 'block';
      }
      else {
         document.getElementById(shID+'-show').style.display = 'inline';
         document.getElementById(shID).style.display = 'none';
      }
   }
}

function drawNewest(usersInLobby:number, usersInGame:number){
    line1.append(new Date().getTime(), usersInLobby);
    line2.append(new Date().getTime(), usersInGame);
};
 
function refreshStats() {
	let forServer = "";
    $.get("/admin/getData", function (data: any) {
        if (!prevData) prevData = data;
		document.getElementById("realTimeStatsTable").innerHTML = _updateRealTimetable(data);
        

        drawNewest(data.usersInLobby, data.usersInGame); // update graph
        
		if (data.serverData) {
			let ugly = JSON.stringify(data.serverData, null, 2);
			document.getElementById("uglyServerJSON").innerHTML="<pre>"+ugly+"</pre>";
            //update # of servers online count
            if (data.serverData) {
				let countOnline = 0;
				for (let z = 0; z < data.serverData.length; z++) {
					if (!data.serverData[z].error) {
						countOnline++;
					}
                }
            } else
            //show what's running on each server (lobbies and games)			            
            document.getElementById("servs").innerHTML = forServer; 
        }else{
            document.getElementById("servs").innerHTML='<p class="showRed">Servers Online:<b> 0</b></p>'; 
        }

        //Check if for each server that all TM Services are running
        if (JSON.stringify(prevIsRunningData) != JSON.stringify(data.isRunningData)) {
            prevIsRunningData = data.isRunningData;
            document.getElementById("realTimeServiceTable").innerHTML = _updateRealTimeServiceTable(data);
            document.getElementById("serviceTitle").style.color = _updateServiceTitle(data);
        }
        

		let serverTable = "";
		serverTable += _wrapHTML(_wrapHTML("Address", "h5"), "th");
		serverTable += _wrapHTML(_wrapHTML("NeedsPatching?", "h5"), "th");
		serverTable += _wrapHTML(_wrapHTML("IsPatching?", "h5"), "th");
		serverTable += _wrapHTML(_wrapHTML("Enabled?", "h5"), "th");
		serverTable += _wrapHTML(_wrapHTML("Error?", "h5"), "th");
		serverTable += _wrapHTML(_wrapHTML("To Admin", "h5"), "th");
		serverTable = _wrapHTML(serverTable, "tr");

		let ongoingGames = "";
		ongoingGames += _wrapHTML(_wrapHTML("Server", "h5"), "th");
		ongoingGames += _wrapHTML(_wrapHTML("GameGUID", "h5"), "th");
		ongoingGames += _wrapHTML(_wrapHTML("#Players", "h5"), "th");
		ongoingGames += _wrapHTML(_wrapHTML("GameType", "h5"), "th");
		ongoingGames += _wrapHTML(_wrapHTML("MapName", "h5"), "th");
		ongoingGames += _wrapHTML(_wrapHTML("JobID", "h5"), "th");
		ongoingGames += _wrapHTML(_wrapHTML("Port", "h5"), "th");
        ongoingGames += _wrapHTML(_wrapHTML("ProcessID", "h5"), "th");
        ongoingGames += _wrapHTML(_wrapHTML("#HumanPlayers", "h5"), "th");
		ongoingGames = _wrapHTML(ongoingGames, "tr");

		let toServ = "";

		if (data.ingameData) {
			//for ongoingGames listing (games in progress)
			data.ingameData.forEach((game: any) => {
				ongoingGames += _wrapHTML(game.server, "th");
				if (game.gameGUID) {
					ongoingGames += _wrapHTML(game.gameGUID, "th");
					ongoingGames += _wrapHTML(game.numOfPlayers, "th");
					ongoingGames += _wrapHTML(game.gameType, "th");
					ongoingGames += _wrapHTML(game.mapName, "th");
					ongoingGames += _wrapHTML(game.jobID, "th");
					ongoingGames += _wrapHTML(game.port, "th");
                    ongoingGames += _wrapHTML(game.processId, "th");
                    ongoingGames += _wrapHTML(game.activeHumanPlayerCount, "th");
				}

				//ongoingGames += "<th><button type = 'button'; onclick = goToLog(thisServKey, keyGame);>Log</button></th>"
				ongoingGames = _wrapHTML(ongoingGames, "tr");
			});
			
		}
		if (data.serverData) {
			if (data.serverData.length >= 1)
				data.serverData.forEach((serv: any) => {
					//for server listing
					let path: string = 'http://' + serv.serverAddress + '/admin';
					toServ += _wrapHTML(serv.serverAddress, "th");
					if (serv.needsPatching !== undefined) {
						toServ += _wrapHTML(serv.needsPatching, "th");
						toServ += _wrapHTML(serv.isPatching, "th");
						toServ += _wrapHTML(serv.isEnabled, "th");
						toServ += _wrapHTML(" ", "th");
					} else {
						toServ += _wrapHTML(" ", "th");
						toServ += _wrapHTML(" ", "th");
						toServ += _wrapHTML(" ", "th");
						toServ += _wrapHTML(serv.error, "th");
					}
					toServ += _wrapHTML("<a href='" + path + "'>Admin</a>", "th");
					toServ = _wrapHTML(toServ, "tr");
				});
			serverTable += toServ;
			serverTable = _wrapHTML(serverTable, "table");
			ongoingGames = _wrapHTML(ongoingGames, "table");
		}
		document.getElementById("serverListP").innerHTML = serverTable; //table of all servers
		document.getElementById("gamesListTab").innerHTML = ongoingGames; // table of ongoing games

		//for lobby (pre-game) listing
		if (data.lobbyData) {
			let innerHTML = "";
			innerHTML += _wrapHTML(_wrapHTML("Game Name", "h5"), "th");			
			innerHTML += _wrapHTML(_wrapHTML("GameGUID", "h5"), "th");
			innerHTML += _wrapHTML(_wrapHTML("Map", "h5"), "th");
			innerHTML += _wrapHTML(_wrapHTML("#Players", "h5"), "th");
			innerHTML += _wrapHTML(_wrapHTML("Max#Players", "h5"), "th");
			innerHTML += _wrapHTML(_wrapHTML("Hostname", "h5"), "th");
			innerHTML += _wrapHTML(_wrapHTML("Port", "h5"), "th");
			innerHTML = _wrapHTML(innerHTML, "tr");
			data.lobbyData.forEach((templobby: any) => {
				let innerHTMLdata = "";
				innerHTMLdata += _wrapHTML(templobby.gameName, "th");
				innerHTMLdata += _wrapHTML(templobby.gameGUID, "th");
				innerHTMLdata += _wrapHTML(templobby.mapName, "th");
				innerHTMLdata += _wrapHTML(templobby.numOfPlayers, "th");
				innerHTMLdata += _wrapHTML(templobby.maxPlayers, "th");
				innerHTMLdata += _wrapHTML(templobby.hostName, "th");
				innerHTMLdata += _wrapHTML(templobby.port, "th");
				let tempplayers = "";
				let count = 0;
				innerHTMLdata = _wrapHTML(innerHTMLdata, "tr");
				innerHTML += innerHTMLdata; // add the new row.
			});

			innerHTML = _wrapHTML(innerHTML, "table");
            document.getElementById("lobbies").innerHTML=innerHTML;
        }
        //Play sound when lobby count changes
        if (data.usersInLobby > prevData.usersInLobby) {
            mailSound.play();
            //incommingMessageSound.play();
        }

        prevData = data;		
	});
};

function _wrapHTML(content: string, tag: string) {
	let out = "<" + tag + ">";	// <tag>
	out += content;				// <tag>content
	out += "</" + tag + ">";	// <tag>content</tag>
	return out;
};

function _updateRealTimetable(data: any) {
	let realTimeTable: string = "<table>";
	realTimeTable += "<tr><th>In Lobby</th><th>In Game</th><th>Online</th><th>Peak Online</th><th>Peak In Game</th></tr>";
	realTimeTable += "<tr>";
	realTimeTable += "<th><b>" + data.usersInLobby + "</b></th>";
	realTimeTable += "<th><b>" + data.usersInGame + "</b></th>";
	realTimeTable += "<th><b>" + data.usersOnline + "</b></th>";
	realTimeTable += "<th><b>" + data.maxUsersInLobby + "</b></th>";
	realTimeTable += "<th><b>" + data.maxUsersInGame + "</b></th>";
	realTimeTable += "</tr>";
	realTimeTable += "</table>";
	realTimeTable += "<p><b>" + data.uniqueUsers + "</b> Registered Users</p>"; // can use _wrapHTML.

	return realTimeTable;
};

function _updateRealTimeServiceTable(data: any) {
    let innerHTML = "";
    let innerHTMLdata = "";
    innerHTMLdata += _wrapHTML(_wrapHTML("Service Type", "h5"), "th");
    innerHTMLdata += _wrapHTML(_wrapHTML("URL", "h5"), "th");
    innerHTMLdata += _wrapHTML(_wrapHTML("isRunning", "h5"), "th");
    innerHTMLdata = _wrapHTML(innerHTMLdata, "tr");
    innerHTML += innerHTMLdata;
    innerHTMLdata = "";
    for (let serviceKey in data.isRunningData) {
        let service = data.isRunningData[serviceKey];
        innerHTMLdata += _wrapHTML(service.serviceType, "th");
        innerHTMLdata += _wrapHTML(service.url, "th");
        if (service.isRunning) {
            innerHTMLdata += _wrapHTML('<font color = "green">' + service.isRunning + '</font>', "th");
        } else {
            innerHTMLdata += _wrapHTML('<font color = "red">' + service.isRunning + '</font>', "th");
        }
        innerHTMLdata = _wrapHTML(innerHTMLdata, "tr");
        innerHTML += innerHTMLdata;
        innerHTMLdata = "";
    }
    innerHTML = _wrapHTML(innerHTML, "table");
    prevIsRunningTable = innerHTML;
    return innerHTML;
}

function _updateServiceTitle(data: any) {
    for (let serviceKey in data.isRunningData) {
        let service = data.isRunningData[serviceKey];
        if (!service.isRunning) {
            return "red";
        }
    }
    return "green";
}

function _goToLog(key: string, jobKey: string) { // broken; fixing the path below (let url) fixes the bug. Commented out field and button in ongoingGames
		let thisServ = prevData.serverManager.serverInstances[key];
		let url = "http://" + thisServ.address + "/displayLog?port=" + prevData.serverManager.serverInstances[key].jobs[jobKey].endpoint.privatePort;
		let windowopen = window.open(url, '_blank');
}

$(document).ready(function() {
    line1 = new TimeSeries();
	line2 = new TimeSeries();
    smoothie = new SmoothieChart({ millisPerPixel: 1000,maxValueScale:1,interpolation:'linear',minValue:-0});
	smoothie.addTimeSeries(line1, { strokeStyle: 'rgb(0, 255, 0)'/*, fillStyle: 'rgba(0, 255, 0, 0.4)'*/, lineWidth: 3 });
	smoothie.addTimeSeries(line2, { strokeStyle: 'rgb(255, 0, 255)'/*, fillStyle: 'rgba(255, 0, 255, 0.3)'*/, lineWidth: 3 });
	smoothie.streamTo(document.getElementById("mycanvas"), 2400);
    refreshStats();
});

