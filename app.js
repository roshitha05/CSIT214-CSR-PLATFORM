import express from 'express';
import session from 'express-session';
import cors from 'cors';
import 'dotenv/config';
import * as configs from './config.js';
import * as https from 'https';
import * as http from 'http';

import {
    CreateUserProfiles,
    GetUserProfiles,
} from './control/user-profiles.js';
import ServerError from './exception/Error.js';
import { CreateUser } from './control/users.js';
import { Login, Logout } from './control/auth.js';
import morgan from 'morgan';
import z from 'zod';

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
            devTesting: configs.DevTestingConfig,
        };
        this.config = new (configMap[this.env] ?? configMap.development)();

        this.init();
    }

    init() {
        // configurations
        z.config({
            customError: (iss, ctx) => {
                if (iss.code === 'invalid_type') {
                    if (iss.input === undefined) {
                        const field = iss.path.join('.');
                        const uField =
                            field.charAt(0).toUpperCase() + field.slice(1);
                        return { message: `${uField} is required` };
                    }
                    return {
                        message: `${iss.path.join('.')} must be a ${
                            iss.expected
                        }`,
                    };
                }
                return { message: ctx.defaultError };
            },
        });
        morgan.token('body', (req, res) => {
            return JSON.stringify(req.body) || {};
        });

        if (process.env.ENV !== 'production') {
            this.app.use(cors());
        }

        this.app.use(express.json(this.config.expressJson));
        this.app.use(session(this.config.expressSession));
        this.app.use(
            morgan(this.config.morgan.format, this.config.morgan.options)
        );

        this.app.use('/', new Login().getRouter());
        this.app.use('/', new Logout().getRouter());
        this.app.use('/user-profiles', new CreateUserProfiles().getRouter());
        this.app.use('/user-profiles', new GetUserProfiles().getRouter());
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
