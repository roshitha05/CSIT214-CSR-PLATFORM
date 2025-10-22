import { jest } from '@jest/globals';
jest.unstable_mockModule('connect-pg-simple', () => ({
  default: (session) =>
    class FakePgStore extends session.Store {
      constructor() {
        super();
        this.sessions = new Map();
      }
      get(sid, cb) {
        cb && cb(null, this.sessions.get(sid) ?? null);
      }
      set(sid, sess, cb) {
        this.sessions.set(sid, sess);
        cb && cb(null);
      }
      destroy(sid, cb) {
        this.sessions.delete(sid);
        cb && cb(null);
      }
      touch(sid, sess, cb) {
        this.sessions.set(sid, sess);
        cb && cb(null);
      }
      all(cb) { cb && cb(null, Array.from(this.sessions.values())); }
      clear(cb) { this.sessions.clear(); cb && cb(null); }
      length(cb) { cb && cb(null, this.sessions.size); }
    }
}));

const mem = {
  users: [
    { id: 'u1', loginId: 'LiamCarter', username: 'LiamCarter', password: 'LiamCarter', role: 'Admin', email: 'liam@example.com', phone: '90000000', suspended: false }
  ],
  profiles: [
    { id: 'p1', name: 'CSR Representative', description: 'CSR role', suspended: false }
  ],
  nextUserId: 2,
  nextProfileId: 2
};

function norm(sql) { return String(sql).toLowerCase().replace(/\s+/g, ' '); }

jest.unstable_mockModule('../../database/db.js', () => {
  const pool = {
    query: async (sql, params = []) => {
      const s = norm(sql);

      // USERS
      if (s.includes('insert into') && s.includes('user')) {
        const body = params.find(p => p && typeof p === 'object') || {};
        const exists = mem.users.find(u =>
          u.loginId === body.loginId || u.username === body.username || (body.email && u.email === body.email)
        );
        if (exists) { const e = new Error('duplicate'); e.code = '23505'; throw e; }
        const id = `u${mem.nextUserId++}`;
        mem.users.push({ id, suspended: false, ...body });
        return { rows: [{ id }] };
      }
      if (s.includes('update users') && s.includes(' set ') && s.includes('suspend')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('u')) ?? params.at(-1);
        const u = mem.users.find(x => x.id === id);
        if (!u) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        u.suspended = Boolean(body.suspended ?? true);
        return { rows: [{ id: u.id, suspended: u.suspended }] };
      }
      if (s.includes('update users') && s.includes(' set ')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('u')) ?? params.at(-1);
        const u = mem.users.find(x => x.id === id);
        if (!u) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        Object.assign(u, body);
        return { rows: [{ id: u.id }] };
      }
      if (s.includes('from users') && s.includes('where') && (s.includes('user_id') || s.includes('id ='))) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('u')) ?? params[0];
        const u = mem.users.find(x => x.id === id);
        return { rows: u ? [u] : [] };
      }
      if (s.includes('from users') && s.includes('where') &&
          (s.includes('loginid') || s.includes('username') || s.includes('email'))) {
        const needle = String(params[0] ?? params[1] ?? '').toLowerCase();
        const rows = mem.users.filter(u =>
          [u.loginId, u.username, u.email].some(v => (v || '').toLowerCase().includes(needle))
        );
        return { rows };
      }
      if (s.includes('from users')) return { rows: mem.users.slice() };
      // PROFILES
      if (s.includes('insert into') && (s.includes('user_profiles') || s.includes('profile'))) {
        const body = params.find(p => p && typeof p === 'object') || { name: params[0], description: params[1] };
        const exists = mem.profiles.find(p => p.name === body.name);
        if (exists) { const e = new Error('duplicate'); e.code = '23505'; throw e; }
        const id = `p${mem.nextProfileId++}`;
        mem.profiles.push({ id, suspended: false, ...body });
        return { rows: [{ id }] };
      }
      if (s.includes('update user_profiles') && s.includes(' set ') && s.includes('suspend')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('p')) ?? params.at(-1);
        const p = mem.profiles.find(x => x.id === id);
        if (!p) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        p.suspended = Boolean(body.suspended ?? true);
        return { rows: [{ id: p.id, suspended: p.suspended }] };
      }
      if (s.includes('update user_profiles') && s.includes(' set ')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('p')) ?? params.at(-1);
        const p = mem.profiles.find(x => x.id === id);
        if (!p) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        Object.assign(p, body);
        return { rows: [{ id: p.id }] };
      }
      if (s.includes('from user_profiles') && s.includes('where') && (s.includes('profile_id') || s.includes('id ='))) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('p')) ?? params[0];
        const p = mem.profiles.find(x => x.id === id);
        return { rows: p ? [p] : [] };
      }
      if (s.includes('from user_profiles') && s.includes('where') &&
          (s.includes('name') || s.includes('description'))) {
        const needle = String(params[0] ?? params[1] ?? '').toLowerCase();
        const rows = mem.profiles.filter(p =>
          [p.name, p.description].some(v => (v || '').toLowerCase().includes(needle))
        );
        return { rows };
      }
      if (s.includes('from user_profiles')) return { rows: mem.profiles.slice() };
      return { rows: [] };
    }
  };

  return {
    default: {
      getInstance: () => ({
        getDatabase: () => pool,
        getPool: () => pool
      })
    }
  };
});
