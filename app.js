import express from 'express';
import 'dotenv/config';
import * as configs from './config.js';
import * as https from 'https';
import * as http from 'http';

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
