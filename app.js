import express from 'express';
import session from 'express-session';
import cors from 'cors';
import 'dotenv/config';
import * as configs from './config.js';
import * as http from 'http';
import morgan from 'morgan';
import connectPgSimple from 'connect-pg-simple';'connect-pg-simple'
import DB from './database/db.js'

import CreateUserProfiles from './control/user-profiles/create-user-profiles.js';
import GetUserProfiles from './control/user-profiles/get-user-profiles.js';
import SearchUserProfiles from './control/user-profiles/search-user-profiles.js';
import UpdateUserProfile from './control/user-profiles/update-user-profile.js';
import SuspendUserProfile from './control/user-profiles/suspend-user-profile.js';
import ReinstateUserProfile from './control/user-profiles/reinstate-user-profile.js';

import CreateUser from './control/users/create-user.js';
import GetUsers from './control/users/get-users.js';
import SearchUsers from './control/users/search-users.js';
import UpdateUser from './control/users/update-user.js';
import SuspendUser from './control/users/suspend-user.js';
import ReinstateUser from './control/users/reinstate-user.js';

import Login from './control/login.js';
import Logout from './control/logout.js';
import CreateCategory from './control/categories/create-category.js';
import GetCategories from './control/categories/get-categories.js';
import SearchCategories from './control/categories/search-categories.js';
import UpdateCategory from './control/categories/update-category.js';
import ArchiveCategory from './control/categories/archive-category.js';
import RestoreCategory from './control/categories/restore-category.js';

import CreateServiceRequest from './control/service-requests/create-service-request.js';
import DeleteServiceRequest from './control/service-requests/delete-service-request.js';
import GetPinServiceRequests from './control/service-requests/get-pin-service-requests.js';
import GetServiceRequestViews from './control/service-requests/get-service-request-views.js';
import GetServiceRequests from './control/service-requests/get-service-requests.js';
import SearchPinServiceRequests from './control/service-requests/search-pin-service-requests.js';
import SearchServiceRequests from './control/service-requests/search-service-requests.js';
import UpdateServiceRequest from './control/service-requests/update-service-request.js';
import RestoreServiceRequest from './control/service-requests/restore-service-request.js';
import RetrieveServiceRequest from './control/service-requests/retrieve-service-request.js';
import GetServiceRequestsHistory from './control/service-requests/get-service-request-history.js';
import SearchServiceRequestsHistory from './control/service-requests/search-service-request-history.js';

import GetShortlists from './control/shortlists/get-shortlists.js';
import GetShortlistCount from './control/shortlists/get-shortlist-count.js';
import InsertShortlist from './control/shortlists/insert-shortlist.js';
import SearchShortlists from './control/shortlists/search-shortlists.js';
import GetMatches from './control/matches/get-matches.js';
import SearchMatches from './control/matches/search-matches.js';
import InsertMatch from './control/matches/insert-match.js';
import RemoveShortlist from './control/shortlists/remove-shortlist.js';
import GetDailyReport from './control/reports/get-daily-reports.js';
import GetWeeklyReport from './control/reports/get-weekly-reports.js';
import GetMonthlyReport from './control/reports/get-monthly-reports.js';
import GetPinServiceRequestsHistory from './control/service-requests/get-pin-service-requests-history.js';
import SearchPinServiceRequestsHistory from './control/service-requests/search-pin-service-requests-history.js';

export default class App {
    constructor() {
        this.app = express();

        this.httpPort = process.env.PORT ?? 80;
        this.httpsPort = process.env.HTTPS_PORT ?? 443;
        this.host = process.env.HOST ?? 'localhost';
        this.env = process.env.ENV ?? 'development';
        
        if (process.env.DATABASE_URL === undefined) throw new Error('Missing database url in .env')

        const configMap = {
            development: configs.DevelopmentConfig,
            testing: configs.TestingConfig,
            production: configs.ProductionConfig,
            devTesting: configs.DevTestingConfig,
        };
        this.config = new (configMap[this.env] ?? configMap.development)();
        this.app.locals.config = this.config;

        this.init();
    }

    init() {
        // configurations
        morgan.token('body', (req, res) => {
            return JSON.stringify(req.body) || {};
        });
        morgan.token('response', (req, res) => {
            return JSON.stringify(res.responseBody) || {}
        })

        this.app.use(cors({ origin: true, credentials: true }));
        this.app.use(express.json(this.config.expressJson));
        this.app.use((req, res, next) => {
            const originalJson = res.json;
            res.json = function(body) {
                res.responseBody = body;
                return originalJson.call(this, body);
            };
            next();
        });
        this.app.use(session({
            ...this.config.expressSession,
            store: new (connectPgSimple(session))({
                pool: DB.getInstance().getPool(),
                createTableIfMissing: true
            })
        }
        ));
        this.app.use(morgan(
            this.config.morganRequest.format, 
            this.config.morganRequest.options
        ));
        this.app.use(morgan(
            this.config.morganResponse.format
        ));

        // routers
        const apiRouter = express.Router();
        const userProfilesRouter = express.Router();
        const usersRouter = express.Router();
        const categoriesRouter = express.Router();
        const serviceRequestsRouter = express.Router();
        const shortlistsRouter = express.Router();
        const matchesRouter = express.Router();
        const reportsRouter = express.Router();

        apiRouter.use('/', new Login().getRouter());
        apiRouter.use('/', new Logout().getRouter());

        userProfilesRouter.use('/', new CreateUserProfiles().getRouter());
        userProfilesRouter.use('/', new GetUserProfiles().getRouter());
        userProfilesRouter.use('/', new SearchUserProfiles().getRouter());
        userProfilesRouter.use('/', new UpdateUserProfile().getRouter());
        userProfilesRouter.use('/', new SuspendUserProfile().getRouter());
        userProfilesRouter.use('/', new ReinstateUserProfile().getRouter());

        usersRouter.use('/', new CreateUser().getRouter());
        usersRouter.use('/', new GetUsers().getRouter());
        usersRouter.use('/', new SearchUsers().getRouter());
        usersRouter.use('/', new UpdateUser().getRouter());
        usersRouter.use('/', new SuspendUser().getRouter());
        usersRouter.use('/', new ReinstateUser().getRouter());

        categoriesRouter.use('/', new CreateCategory().getRouter());
        categoriesRouter.use('/', new GetCategories().getRouter());
        categoriesRouter.use('/', new SearchCategories().getRouter());
        categoriesRouter.use('/', new UpdateCategory().getRouter());
        categoriesRouter.use('/', new ArchiveCategory().getRouter());
        categoriesRouter.use('/', new RestoreCategory().getRouter());

        serviceRequestsRouter.use('/', new GetServiceRequestsHistory().getRouter());
        serviceRequestsRouter.use('/', new GetPinServiceRequestsHistory().getRouter());
        serviceRequestsRouter.use('/', new SearchServiceRequestsHistory().getRouter());
        serviceRequestsRouter.use('/', new SearchPinServiceRequestsHistory().getRouter());
        serviceRequestsRouter.use('/', new CreateServiceRequest().getRouter());
        serviceRequestsRouter.use('/', new DeleteServiceRequest().getRouter());
        serviceRequestsRouter.use('/', new RestoreServiceRequest().getRouter());
        serviceRequestsRouter.use('/', new RetrieveServiceRequest().getRouter());
        serviceRequestsRouter.use('/', new SearchPinServiceRequests().getRouter());
        serviceRequestsRouter.use('/', new SearchServiceRequests().getRouter());
        serviceRequestsRouter.use('/', new GetPinServiceRequests().getRouter());
        serviceRequestsRouter.use('/', new GetServiceRequestViews().getRouter());
        serviceRequestsRouter.use('/', new GetServiceRequests().getRouter());
        serviceRequestsRouter.use('/', new UpdateServiceRequest().getRouter());

        shortlistsRouter.use('/', new GetShortlists().getRouter());
        shortlistsRouter.use('/', new GetShortlistCount().getRouter());
        shortlistsRouter.use('/', new InsertShortlist().getRouter());
        shortlistsRouter.use('/', new SearchShortlists().getRouter());
        shortlistsRouter.use('/', new RemoveShortlist().getRouter());

        matchesRouter.use('/', new SearchMatches().getRouter());
        matchesRouter.use('/', new GetMatches().getRouter());
        matchesRouter.use('/', new InsertMatch().getRouter());

        reportsRouter.use('/', new GetDailyReport().getRouter());
        reportsRouter.use('/', new GetWeeklyReport().getRouter());
        reportsRouter.use('/', new GetMonthlyReport().getRouter());

        apiRouter.use('/user-profiles', userProfilesRouter);
        apiRouter.use('/users', usersRouter);
        apiRouter.use('/categories', categoriesRouter);
        apiRouter.use('/service-requests', serviceRequestsRouter);
        apiRouter.use('/shortlists', shortlistsRouter);
        apiRouter.use('/matches', matchesRouter);
        apiRouter.use('/reports', reportsRouter);

        this.app.use('/api', apiRouter);
        this.app.use(express.static('boundary'));
    }

    listen() {
        http.createServer(this.app).listen(this.httpPort, this.host, () => {
            console.log(
                `HTTP server is running on http://${this.host}:${this.httpPort}`
            );
        });
    }
}
