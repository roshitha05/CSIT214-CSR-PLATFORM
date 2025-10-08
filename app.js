import express from 'express';
import 'dotenv/config';
import * as configs from './config.js';
import * as https from 'https';
import * as http from 'http';
import UserProfiles from './control/user-profiles.js';
import ServerError from './exception/Error.js';
import Users from './control/users.js';

export default class App {
    constructor() {
        this.app = express();
        this.http_port = process.env.PORT || 80;
        this.https_port = process.env.HTTPS_PORT || 443;
        this.host = process.env.HOST || 'localhost';
        this.env = process.env.ENV || 'development';

        const configMap = {
            development: configs.DevelopmentConfig,
            testing: configs.TestingConfig,
            production: configs.ProductionConfig,
        };
        this.config = new (configMap[this.env] || configMap.development)();

        this.init();
    }

    init() {
        // configurations
        this.app.use(
            express.json({
                limit: '10kb',
                strict: true,
                type: 'application/json',
            })
        );

        const userProfiles = new UserProfiles();
        const users = new Users();

        this.app.use('/user-profiles', userProfiles.getRouter());
        this.app.use('/users', users.getRouter());

        this.app.use((err, req, res, next) => {
            let statusCode = err.statusCode || 500;
            let message = err.message || 'Internal Server Error';

            if (
                process.env.ENV == 'production' &&
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
            http.createServer(this.app).listen(
                this.http_port,
                this.host,
                () => {
                    console.log(
                        `HTTP server is running on http://${this.host}:${this.http_port}`
                    );
                }
            );
        }
        if (this.config.useHTTPS) {
            https
                .createServer(this.app)
                .listen(this.https_port, this.host, () => {
                    console.log(
                        `HTTPS server is running on https://${this.host}:${this.https_port}`
                    );
                });
        }
    }
}
