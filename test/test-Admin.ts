import admin = require('../controllers/admin');
import should = require('should');
require('should');
import sinon = require('sinon');
import PlatformStatusDb = require('../PlatformStatusDb');
import PlatformStatusService = require('../models/PlatformStatusService');
import logger = require('../logger');
import I = require('../Interfaces');
import Q = require('q');

describe("Admin", () => {
	let sandbox: any;
	let platformStatusDb: I.PlatformStatusDb;
	let platformStatusService: I.PlatformStatusService;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();

		platformStatusDb = {
			createNewPlatformStatus: sandbox.stub().returns(Q.fcall(() => { return null; })),
			getPlatformStatus: sandbox.stub().returns(Q.fcall(() => { return null; })),
			init: sandbox.stub().returns(Q.fcall(() => { return null; })),
			setFeatureTogglesString: sandbox.stub(),
			setMotd: sandbox.stub()
		}

		platformStatusService = new PlatformStatusService(platformStatusDb);
		admin.setPlatformStatusService(platformStatusService);
    });

    it("newMOTD with a motd redirects to /admin and sets platform status service motd", () => {
		let restore = platformStatusService.motd;
        let fakeMOTDString: string = 'fakeMOTD';
        let req: any = {
            body: {
                motd: fakeMOTDString
            }
        };
        let res: any = {
            redirect: () => {}
        };
        let spyRedirect = sandbox.spy(res, 'redirect').withArgs('/admin');

        admin.newMOTD(req, res);

        sinon.assert.calledOnce(spyRedirect);
		should(platformStatusService.motd).equal(fakeMOTDString);
		platformStatusService.motd = restore;
    });

    it("newMOTD without a motd redirects to /admin and logs a warning", () => {
        let spyLoggerWarn = sandbox.spy(logger, 'warn');
        let req: any = {
            body: {}
        };
        let res: any = {
            redirect: () => { }
        };
        let spyRedirect = sandbox.spy(res, 'redirect').withArgs('/admin');

        admin.newMOTD(req, res);

        sinon.assert.calledOnce(spyRedirect);
        sinon.assert.calledOnce(spyLoggerWarn);
    });

    afterEach(() => {
        sandbox.restore();
    });
});
