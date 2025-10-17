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
        const apiRouter = express.Router({
            caseSensitive: true,
            strict: true,
        });
        const userProfilesRouter = express.Router({
            caseSensitive: true,
            strict: true
        });
        const usersRouter = express.Router({
            caseSensitive: true,
            strict: true
        });

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

        apiRouter.use('/user-profiles', userProfilesRouter);
        apiRouter.use('/users', usersRouter);

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
