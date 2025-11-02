import bcrypt from "bcrypt"
import Entity from "./entity.js";

export default class HasherEntity extends Entity {
    constructor() {
        super();

        this.saltRounds = 10;
    }

    async hash(password) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async verify(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}