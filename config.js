export class BaseConfig {
    constructor() {
        this.useHTTP = true;
        this.useHTTPS = false;

        this.requireAuth = true;

        this.expressJson = {
            limit: '10kb',
            strict: true,
            type: 'application/json',
        };

        this.expressSession = {
            name: 'uow_session',
            secret: process.env.SESSION_SECRET || 'temporary_secret',
            resave: false,
            rolling: false,
            saveUninitialized: false,
            unset: 'destroy',
        };

        this.expressSession.cookie = {
            httpOnly: false,
            secure: false,
            maxAge: null,
            partitioned: false,
            sameSite: 'none',
        };

        this.morganRequest = {
            format: '--> :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :body',
            options: {
                immediate: true,
            },
        };

        this.morganResponse = {
            format: '<-- :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response',
        };
    }
}

export class DevelopmentConfig extends BaseConfig {
    constructor() {
        super();
    }
}

export class ProductionConfig extends BaseConfig {
    constructor() {
        super();

        this.expressSession.secret = process.env.SESSION_SECRET;
        this.expressSession.cookie.httpOnly = true;
        this.expressSession.cookie.secure = true;
        this.expressSession.cookie.sameSite = 'lax';
        this.expressSession.cookie.partitioned = true;
        this.expressSession.cookie.maxAge = 1000 * 60 * 60;

        this.morgan.format = 'combined';
        this.morgan.options.immediate = false;
    }
}

export class TestingConfig extends BaseConfig {
    constructor() {
        super();
    }
}

export class DevTestingConfig extends BaseConfig {
    constructor() {
        super();

        this.requireAuth = false;
    }
}
