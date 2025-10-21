jest.unstable_mockModule('connect-pg-simple', () => ({
  default: () =>
    class FakePgStore {
      set() {}
      get() {}
      destroy() {}
      touch() {}
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

function toId(prefix, n) { return `${prefix}${n}`; }

jest.unstable_mockModule('../../database/db.js', () => {
  const norm = (sql) => String(sql).toLowerCase().replace(/\s+/g, ' ');

  const pool = {
    query: async (sql, params = []) => {
      const s = norm(sql);

      if (s.includes('insert into') && s.includes('user')) {
        const body = params.find(p => p && typeof p === 'object') || {};
        const candidate = {
          username: body.username ?? params[0],
          loginId:  body.loginId  ?? params[1],
          password: body.password ?? params[2],
          email:    body.email    ?? params[3],
          role:     body.role     ?? params[4],
          phone:    body.phone    ?? params[5],
        };

        const exists = mem.users.find(u =>
          u.loginId === candidate.loginId ||
          u.username === candidate.username ||
          (candidate.email && u.email === candidate.email)
        );
        if (exists) {
          const err = new Error('duplicate key value');
          err.code = '23505'; 
          throw err; 
        }
        const id = toId('u', mem.nextUserId++);
        mem.users.push({ id, suspended: false, ...candidate });
        return { rows: [{ id }] };
      }

      if (s.includes('update users') && s.includes(' set ') && s.includes('suspend')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('u')) ?? params.at(-1);
        const user = mem.users.find(u => u.id === id);
        if (!user) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        user.suspended = Boolean(body.suspended ?? true);
        return { rows: [{ id: user.id, suspended: user.suspended }] };
      }

      if (s.includes('update users') && s.includes(' set ')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('u')) ?? params.at(-1);
        const user = mem.users.find(u => u.id === id);
        if (!user) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        Object.assign(user, body);
        return { rows: [{ id: user.id }] };
      }

      if (s.includes('from users') && s.includes('where') && (s.includes('user_id') || s.includes('id ='))) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('u')) ?? params[0];
        const user = mem.users.find(u => u.id === id);
        return { rows: user ? [user] : [] };
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

      if (s.includes('insert into') && s.includes('user_profiles')) {
        const body = params.find(p => p && typeof p === 'object') || { name: params[0], description: params[1] };
        const exists = mem.profiles.find(p => p.name === body.name);
        if (exists) {
          const err = new Error('duplicate key value');
          err.code = '23505';
          throw err;
        }
        const id = toId('p', mem.nextProfileId++);
        mem.profiles.push({ id, suspended: false, ...body });
        return { rows: [{ id }] };
      }

      if (s.includes('update user_profiles') && s.includes(' set ') && s.includes('suspend')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('p')) ?? params.at(-1);
        const prof = mem.profiles.find(p => p.id === id);
        if (!prof) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        prof.suspended = Boolean(body.suspended ?? true);
        return { rows: [{ id: prof.id, suspended: prof.suspended }] };
      }

      if (s.includes('update user_profiles') && s.includes(' set ')) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('p')) ?? params.at(-1);
        const prof = mem.profiles.find(p => p.id === id);
        if (!prof) return { rows: [] };
        const body = params.find(p => p && typeof p === 'object') || {};
        Object.assign(prof, body);
        return { rows: [{ id: prof.id }] };
      }

      if (s.includes('from user_profiles') && s.includes('where') && (s.includes('profile_id') || s.includes('id ='))) {
        const id = params.find(p => typeof p === 'string' && p.startsWith('p')) ?? params[0];
        const prof = mem.profiles.find(p => p.id === id);
        return { rows: prof ? [prof] : [] };
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
      getInstance: () => ({ getPool: () => pool })
    }
  };
});
