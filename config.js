export class BaseConfig {
    constructor() {
        this.useHTTP = true;
        this.useHTTPS = false;
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
    }
}

export class TestingConfig extends BaseConfig {
    constructor() {
        super();
    }
}
