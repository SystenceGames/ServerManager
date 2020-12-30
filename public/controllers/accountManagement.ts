//Get list of unlockables from playerStats or settings
let unlockableIdsList: [string] = ["RoboMeister", "Rosie", "TinkerMeister", "RamBamQueen", "HiveLord", "Salvator"];

function confirmAccountCreation() {
	let username: string = (<HTMLInputElement>document.getElementById("accountCreationUsername")).value;
	let password: string = (<HTMLInputElement>document.getElementById("accountCreationPassword")).value;
	let email: string = (<HTMLInputElement>document.getElementById("accountCreationEmail")).value;
	let birthday: string = (<HTMLInputElement>document.getElementById("accountCreationBirthday")).value;
	let isMaxedAccount: boolean = (<HTMLInputElement>document.getElementById("accountCreationIsMaxAccount")).checked;
	
	event.preventDefault();
	$.ajax({
		url: 'admin/createAccount/',
		type: "POST",
		timeout: 60000,
		data: {
			usernameField: username,
			passwordField: password,
			emailField: email,
			birthdayField: birthday,
			isMaxedAccountField: isMaxedAccount
		},
		success: function (response: any) {
			if (response.success) {
				alert("Successfully created account " + username + "!");
			} else {
				alert("Failed to create account " + username + "!");
			}
		},
		error: function (jqxhr: any, textStatus: string, errorThrown: string) {
			alert("Error creating: " + errorThrown + " ts: " + textStatus + " j: " + JSON.stringify(jqxhr));
		}
	});
}

function confirmAccountDeletion() {
	let username: string = (<HTMLInputElement>document.getElementById("accountDeletionUsername")).value;
	let input: string = prompt('Are you sure you want to delete "' + username + '" account?');
	if (input != username) {
		alert("Input did not match username!");
	} else {
		event.preventDefault();
		$.ajax({
			url: 'admin/deleteAccount/',
			type: "POST",
			timeout: 60000,
			data: { usernameField: username },
			success: function (response: any) {
				if (response.success) {
					alert("Successfully deleted account " + username + "!");
				} else {
					alert("Failed to delete account " + username + "!");
				}
			},
			error: function (jqxhr: any, textStatus: string, errorThrown: string) {
				alert("Error deleting: " + errorThrown + " ts: " + textStatus + " j: " + JSON.stringify(jqxhr));
			}
		}); 
	}
}

function accountLookup() {
	let username: string = (<HTMLInputElement>document.getElementById("accountLookupUsername")).value;
	let email: string = (<HTMLInputElement>document.getElementById("accountLookupEmail")).value;	
	event.preventDefault();
	$.ajax({
		url: 'admin/lookupAccount/',
		type: "POST",
		timeout: 60000,
		data: { usernameField: username, emailField: email },
		success: function (response: any) {
			response = JSON.parse(response);
			document.getElementById("accountLookupTable").innerHTML = generateAccountLookupTable(response);
            document.getElementById("accountEditButton").setAttribute("type", "submit");
            document.getElementById("accountEditConfirmButton").setAttribute("type", "hidden");
            document.getElementById("accountEditCancelButton").setAttribute("type", "hidden");
		},
		error: function (jqxhr: any, textStatus: string, errorThrown: string) {
			alert("Something went wrong with lookupAccount() with error: " + errorThrown);
		}
	});
}

function accountEdit() {
	makeAccountLookupTableEditable();
	return false;
}

function accountEditConfirm() {
	let playerUniqueName: string = document.getElementById("accountTablePlayerUniqueName").innerText;
	let verified: boolean = (<HTMLInputElement>document.getElementById("verifiedCheckbox")).checked;
	let currentXP: number = (<HTMLInputElement>document.getElementById("accountEditCurrentXP")).valueAsNumber;
	let currentLevel: number = (<HTMLInputElement>document.getElementById("accountEditCurrentLevel")).valueAsNumber;
	let wins: number = (<HTMLInputElement>document.getElementById("accountEditWins")).valueAsNumber;
	let losses: number = (<HTMLInputElement>document.getElementById("accountEditLosses")).valueAsNumber;
	//Do inventory jazz here
	let playerInventory: Array<string> = [];
	for (let i: number = 0; i < unlockableIdsList.length; i++) {
		if ((<HTMLInputElement>document.getElementById(unlockableIdsList[i] + "Checkbox")).checked) {
			playerInventory.push(unlockableIdsList[i]);
		}
	}

	event.preventDefault();
	$.ajax({
		url: 'admin/editAccount/',
		type: "POST",
		timeout: 60000,
		data: {
			playerUniqueNameField: playerUniqueName,
			verifiedField: verified,
			currentXPField: currentXP,
			currentLevelField: currentLevel,
			winsField: wins,
			lossesField: losses,
			playerInventoryField: playerInventory
		},
		success: function (response: any) {
            closeAccountLookupTable()
		},
		error: function (jqxhr: any, textStatus: string, errorThrown: string) {
			alert("Something went wrong with editAccount() with error: " + errorThrown);
		}
	});
}

function accountEditCancel() {
    closeAccountLookupTable();
}

function closeAccountLookupTable() {
    document.getElementById("accountLookupTable").innerHTML = "";
    document.getElementById("accountEditButton").setAttribute("type", "hidden");
    document.getElementById("accountEditConfirmButton").setAttribute("type", "hidden");
    document.getElementById("accountEditCancelButton").setAttribute("type", "hidden");
}

function generateAccountLookupTable(response: any): string {
	let accountLookupTable: string = "<div class='accountLookupTableContainer'>";
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupCell'>Username</div>";
	accountLookupTable += "<div class='accountLookupCell'><input type='hidden' id='accountEditPlayerUniqueName'><div id='accountTablePlayerUniqueName'>" + response.playerUniqueName + "</div></div>";
	accountLookupTable += "</div>";
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupCell'>Email</div>";
	accountLookupTable += "<div class='accountLookupCell'><input type='hidden' id='accountEditEmail'><div id='accountTableEmail'>" + response.email + "</div></div>";
	accountLookupTable += "</div>";
	accountLookupTable += "<div class='accountLookupRow'>";
	let lastLogin = response.lastLogin;
	if (lastLogin != null) {
		lastLogin = new Date(parseInt(lastLogin, 10))
		accountLookupTable += "<div class='accountLookupCell'>LastLogin</div>";
		accountLookupTable += "<div class='accountLookupCell'><input type='hidden'>" + lastLogin.toLocaleString() + "</div>";
		accountLookupTable += "</div>";
		accountLookupTable += "<div class='accountLookupRow'>";
	}
	let createdAt = response.createdAt;
	if (createdAt != null) {
		createdAt = new Date(parseInt(createdAt, 10))
		accountLookupTable += "<div class='accountLookupCell'>CreatedAt</div>";
		accountLookupTable += "<div class='accountLookupCell'><input type='hidden'>" + createdAt.toLocaleString() + "</div>";
		accountLookupTable += "</div>";
		accountLookupTable += "<div class='accountLookupRow'>";
	}
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupCell'>Verified</div>";
	accountLookupTable += "<div class='accountLookupCell'>";

	if (response.verified) {
		accountLookupTable += "<input type='checkbox' id='verifiedCheckbox' disabled checked>";
	} else {
		accountLookupTable += "<input type='checkbox' id='verifiedCheckbox' disabled>";
	}
	accountLookupTable += "</div>";
	accountLookupTable += "</div>";
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupCell'>Current XP</div>";
	accountLookupTable += "<div class='accountLookupCell'><input type='hidden' id='accountEditCurrentXP'><div id='accountTableCurrentXP'>" + response.currentXP + "</div></div>";
	accountLookupTable += "</div>";
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupCell'>Current Level</div>";
	accountLookupTable += "<div class='accountLookupCell'><input type='hidden' id='accountEditCurrentLevel'><div id='accountTableCurrentLevel'>" + response.currentLevel + "</div></div>";
	accountLookupTable += "</div>";
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupCell'>Wins</div>";
	accountLookupTable += "<div class='accountLookupCell'><input type='hidden' id='accountEditWins'><div id='accountTableWins'>" + response.wins + "</div></div>";
	accountLookupTable += "</div>";
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupCell'>Losses</div>";
	accountLookupTable += "<div class='accountLookupCell'><input type='hidden' id='accountEditLosses'><div id='accountTableLosses'>" + response.losses + "</div></div>";
	accountLookupTable += "</div>";
	accountLookupTable += "<div class='accountLookupRow'>";
	accountLookupTable += "<div class='accountLookupInventory'>Inventory</div>";
	accountLookupTable += "<div class='accountLookupInventory'>";

	for (let i: number = 0; i < unlockableIdsList.length; i++) {
		if (response.inventoryIds.indexOf(unlockableIdsList[i]) != -1) {
            accountLookupTable += "<input type='checkbox' id='" + unlockableIdsList[i] + "Checkbox' disabled checked>" + unlockableIdsList[i] + "<br>";
		} else {
            accountLookupTable += "<input type='checkbox' id='" + unlockableIdsList[i] + "Checkbox' disabled>" + unlockableIdsList[i] + "<br>";
		}
	}
	accountLookupTable += "</div>";
	accountLookupTable += "</div>";
	accountLookupTable += "</div>";

	return accountLookupTable;
}

function makeAccountLookupTableEditable(): void {
	document.getElementById("accountEditButton").setAttribute("type", "hidden");
	document.getElementById("accountEditConfirmButton").setAttribute("type", "submit");
	document.getElementById("accountEditCancelButton").setAttribute("type", "submit");

	(<HTMLInputElement>document.getElementById("verifiedCheckbox")).disabled = false;

	document.getElementById("accountEditCurrentXP").setAttribute("type", "number");
	(<HTMLInputElement>document.getElementById("accountEditCurrentXP")).valueAsNumber = parseInt(document.getElementById("accountTableCurrentXP").innerText);
	document.getElementById("accountTableCurrentXP").classList.add('noneDisplay');

	document.getElementById("accountEditCurrentLevel").setAttribute("type", "number");
	(<HTMLInputElement>document.getElementById("accountEditCurrentLevel")).valueAsNumber = parseInt(document.getElementById("accountTableCurrentLevel").innerText);
	document.getElementById("accountTableCurrentLevel").classList.add('noneDisplay');

	document.getElementById("accountEditWins").setAttribute("type", "number");
	(<HTMLInputElement>document.getElementById("accountEditWins")).valueAsNumber = parseInt(document.getElementById("accountTableWins").innerText);
	document.getElementById("accountTableWins").classList.add('noneDisplay');

	document.getElementById("accountEditLosses").setAttribute("type", "number");
	(<HTMLInputElement>document.getElementById("accountEditLosses")).valueAsNumber = parseInt(document.getElementById("accountTableLosses").innerText);
    document.getElementById("accountTableLosses").classList.add('noneDisplay');
    
    for (let i: number = 0; i < unlockableIdsList.length; i++) {
        (<HTMLInputElement>document.getElementById(unlockableIdsList[i] + "Checkbox")).disabled = false;
    }
}