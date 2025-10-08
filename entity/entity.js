import DB from '../database/db.js';

export default class Entity {
    constructor() {
        this.db = DB.getInstance().getDatabase();
    }
}
