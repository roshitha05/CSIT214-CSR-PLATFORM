import DB from '../database/db.js';

export default class Entity {
    constructor() {
        this.db = DB.getInstance().getDatabase();
    }

    containsKeyword(obj, keyword) {
        if (!keyword) return obj;
        if (typeof obj === 'string') {
            return obj.toLowerCase().includes(keyword);
        }
        if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(value => this.containsKeyword(value, keyword));
        }
        return false;
    }
}
