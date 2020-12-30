import fs = require('fs');
import settings = require('../config/settings');
import I = require('../Interfaces');
import logger = require('../logger');

class PlatformStatusService implements I.PlatformStatusService {
	private static defaultMOTD = "There is no MOTD today";
	private static defaultFeatureToggles: string = '{ "isOnline": false, "multiplayerEnabled": false}';
	private _motd: string = PlatformStatusService.defaultMOTD;
	private _featureToggles: string = PlatformStatusService.defaultFeatureToggles;
	private _patchline: string = "";
	private platformStatusDb: I.PlatformStatusDb;

	constructor(platformStatusDb: I.PlatformStatusDb) {
		logger.info("PlatformStatusService initted");
		try {
			this._patchline = fs.readFileSync(settings.currentPatchlineFileLocation).toString().trim();
			if (!(this._patchline.length > 0)) {
				throw new Error("patchline is not real string");
			}
		} catch (e) {
			this._patchline = settings.fallbackPatchline;
			logger.warn("Error reading patchline from file", { codepath: "PlatformStatusService.constructor", errorMessage: e.message, error: e });
		}

		this.platformStatusDb = platformStatusDb;
	}

	public init(): void {
		this.platformStatusDb.getPlatformStatus().then((platformStatus: I.PlatformStatus) => {
			if (platformStatus == null) {
				this.platformStatusDb.createNewPlatformStatus(PlatformStatusService.defaultMOTD, PlatformStatusService.defaultFeatureToggles);
				return;
			}
			this.motd = platformStatus.motd;
			this.featureToggles = platformStatus.featureTogglesString;
		}).catch((err: any) => {
			logger.warn("Error getting platform status from mongodb", { codepath: "PlatformStatusService.constructor", errorMessage: err.message, error: err });
		});
	}

	get motd(): string {
		return this._motd;
	}

	set motd(newValue: string) {
		if (this._motd == newValue) return;
		this._motd = newValue;

		this.platformStatusDb.setMotd(newValue);
	}

	get patchline(): string {
		return this._patchline;
	}
	set patchline(newValue: string) {
		if (this._patchline == newValue) return;
		this._patchline = newValue;
		fs.writeFile(settings.currentPatchlineFileLocation, newValue, { encoding: "utf8" }, (err) => {
			if (err) logger.error("File stream error writing the patchline", { codepath: "PlatformStatusService.setpatchline", errorMessage: err.message, error: err });
		});
	}

	get featureToggles(): string {
		return this._featureToggles;
	}

	set featureToggles(newValue: string) {
		if (this._featureToggles == newValue) return;
		this._featureToggles = newValue;

		this.platformStatusDb.setFeatureTogglesString(newValue);
	}

}

export = PlatformStatusService;