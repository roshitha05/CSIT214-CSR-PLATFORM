import express from 'express';
import session from 'express-session';
import cors from 'cors';
import 'dotenv/config';
import * as configs from './config.js';
import * as https from 'https';
import * as http from 'http';

import { CreateUserProfiles } from './control/user-profiles.js';
import ServerError from './exception/Error.js';
import { CreateUser } from './control/users.js';
import { Login, Logout } from './control/auth.js';

export default class App {
    constructor() {
        this.app = express();

        this.httpPort = process.env.PORT ?? 80;
        this.httpsPort = process.env.HTTPS_PORT ?? 443;
        this.host = process.env.HOST ?? 'localhost';
        this.env = process.env.ENV ?? 'development';

        const configMap = {
            development: configs.DevelopmentConfig,
            testing: configs.TestingConfig,
            production: configs.ProductionConfig,
        };
        this.config = new (configMap[this.env] ?? configMap.development)();

        this.init();
    }

    init() {
        // configurations
        if (process.env.ENV !== 'production') {
            this.app.use(cors());
        }

        this.app.use(express.json(this.config.expressJson));
        this.app.use(session(this.config.expressSession));

        this.app.use('/', new Login().getRouter());
        this.app.use('/', new Logout().getRouter());
        this.app.use('/user-profiles', new CreateUserProfiles().getRouter());
        this.app.use('/users', new CreateUser().getRouter());

        this.app.use((err, req, res, next) => {
            let statusCode = err.statusCode ?? 500;
            let message = err.message ?? 'Internal Server Error';

            if (
                process.env.ENV === 'production' &&
                !(err instanceof ServerError)
            ) {
                statusCode = 500;
                message = 'Internal Server Error';
            }

            res.status(statusCode).json({
                error: {
                    statusCode,
                    message,
                },
            });
        });
    }

    listen() {
        if (this.config.useHTTP) {
            http.createServer(this.app).listen(this.httpPort, this.host, () => {
                console.log(
                    `HTTP server is running on http://${this.host}:${this.httpPort}`
                );
            });
        }
        if (this.config.useHTTPS) {
            https
                .createServer(this.app)
                .listen(this.httpsPort, this.host, () => {
                    console.log(
                        `HTTPS server is running on https://${this.host}:${this.httpsPort}`
                    );
                });
        }
    }
}
