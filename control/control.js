import express from 'express';

export default class Control {
    constructor() {
        this.router = express.Router({
            caseSensitive: true,
            strict: true,
        });
    }
}
