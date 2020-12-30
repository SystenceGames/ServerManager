import Q = require('q');
import mongoose = require('mongoose');

import I = require('./Interfaces');
import settings = require('./config/settings');

let logger = require('./logger');
import MongoDbConnectionManager = require('./MongoDbConnectionManager');

interface IMongoDbPlatformStatus extends mongoose.Document {
	motd: string;
	featureTogglesString: string;
}

class PlatformStatusDb implements I.PlatformStatusDb {
	private static PLATFORM_STATUS_COLLECTION_NAME: string = 'platformstatus';
	private static PLATFORM_STATUS_MODEL_NAME: string = 'PlatformStatus';
	private static FIND_AND_UPDATE_OPTIONS: mongoose.ModelFindOneAndUpdateOptions = { new: true };

	private PlatformStatusModel: mongoose.Model<IMongoDbPlatformStatus>;
	private mongoDbConnectionManager: MongoDbConnectionManager;

	private platformStatusSchema = new mongoose.Schema({
		motd: { type: String },
		featureTogglesString: { type: String }
	});

	constructor(mongoDbConnectionManager: MongoDbConnectionManager) {
		this.mongoDbConnectionManager = mongoDbConnectionManager;
	}

	public init(): void {
		this.PlatformStatusModel = this.mongoDbConnectionManager.model<IMongoDbPlatformStatus>(PlatformStatusDb.PLATFORM_STATUS_MODEL_NAME, this.platformStatusSchema, PlatformStatusDb.PLATFORM_STATUS_COLLECTION_NAME);
	}

	public createNewPlatformStatus(motd: string, featureTogglesString: string): Q.Promise<I.PlatformStatus> {
		let deferred = Q.defer<any>();

		let newPlatformStatus = new this.PlatformStatusModel({
			motd: motd,
			featureTogglesString: featureTogglesString
		});

		newPlatformStatus.save((err, mongoDbPlatformStatus) => {
			if (err) {
				return deferred.reject(err);
			}

			return deferred.resolve({
				motd: mongoDbPlatformStatus.motd,
				featureTogglesString: mongoDbPlatformStatus.featureTogglesString
			});
		});

		return deferred.promise;
	}


	public getPlatformStatus(): Q.Promise<I.PlatformStatus> {
		let deferred = Q.defer<any>();
		this.PlatformStatusModel.findOne(
			{},
			(err, mongoDbPlatformStatus) => {
				if (err) {
					logger.error(err);
					return deferred.reject(err);
				}
				if (mongoDbPlatformStatus == null) {
					logger.warn("mongoDbPlatformStatus is null");
					return deferred.resolve(null);
				}

				return deferred.resolve({
					motd: mongoDbPlatformStatus.motd,
					featureTogglesString: mongoDbPlatformStatus.featureTogglesString
				});
			});

		return deferred.promise;
	}

	public setMotd(motd: string): Q.Promise<void> {
		let deferred = Q.defer<any>();

		this.PlatformStatusModel.findOneAndUpdate(
			{},
			{
				$set: { "motd": motd }
			},
			PlatformStatusDb.FIND_AND_UPDATE_OPTIONS,
			(err, mongoDbPlatformStatus) => {
				if (err) {
					logger.error(err);
					return deferred.reject(err);
				}

				return deferred.resolve(null);
			});

		return deferred.promise;
	}

	public setFeatureTogglesString(featureTogglesString: string): Q.Promise<void> {
		let deferred = Q.defer<any>();

		this.PlatformStatusModel.findOneAndUpdate(
			{},
			{
				$set: { "featureTogglesString": featureTogglesString }
			},
			PlatformStatusDb.FIND_AND_UPDATE_OPTIONS,
			(err, mongoDbPlatformStatus) => {
				if (err) {
					logger.error(err);
					return deferred.reject(err);
				}

				return deferred.resolve(null);
			});

		return deferred.promise;
	}
}

export = PlatformStatusDb;