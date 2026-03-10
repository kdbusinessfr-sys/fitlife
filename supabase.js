/* ═══════════════════════════════════════════════════════
   FITLIFE IA — SUPABASE
   Toutes les interactions avec la base de données.
   ⚠️  Remplacer SB_URL et SB_KEY par tes vraies valeurs.
═══════════════════════════════════════════════════════ */

const SB_URL = 'REMPLACER_PAR_TON_URL_SUPABASE';
const SB_KEY = 'REMPLACER_PAR_TA_CLÉ_SUPABASE';

/* ── Client minimaliste (pas de SDK — fetch natif) ── */
const SB = {
  headers() {
    const h = {
      'Content-Type':  'application/json',
      'apikey':        SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
    };
    if (STATE.session?.access_token) {
      h['Authorization'] = 'Bearer ' + STATE.session.access_token;
    }
    return h;
  },

  async get(table, params = '') {
    const r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
      headers: { ...this.headers(), 'Accept': 'application/json' },
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async post(table, body) {
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...this.headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async patch(table, params, body) {
    const r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
      method: 'PATCH',
      headers: { ...this.headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async delete(table, params) {
    const r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!r.ok) throw new Error(await r.text());
    return true;
  },

  /* ── Auth via API Supabase ── */
  auth: {
    async signUp(email, password, meta = {}) {
      const r = await fetch(`${SB_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
        body: JSON.stringify({ email, password, data: meta }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message || data.msg);
      return data;
    },

    async signIn(email, password) {
      const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message || data.error_description);
      return data;
    },

    async signOut() {
      if (!STATE.session?.access_token) return;
      await fetch(`${SB_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + STATE.session.access_token },
      });
    },

    async resetPassword(email) {
      const r = await fetch(`${SB_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message);
      return data;
    },

    /** Restaurer une session depuis localStorage */
    loadSession() {
      try {
        const raw = localStorage.getItem('fitlife-session');
        if (!raw) return null;
        const session = JSON.parse(raw);
        // Vérifier expiration
        if (session.expires_at && Date.now() / 1000 > session.expires_at) {
          localStorage.removeItem('fitlife-session');
          return null;
        }
        return session;
      } catch { return null; }
    },

    saveSession(session) {
      if (session) localStorage.setItem('fitlife-session', JSON.stringify(session));
      else          localStorage.removeItem('fitlife-session');
    },
  },
};

/* ══════════════════════════════════════════════════════
   PROFIL DB
══════════════════════════════════════════════════════ */
const DB = {

  /** Charger le profil depuis Supabase */
  async loadProfile(userId) {
    try {
      const rows = await SB.get('profiles', `?id=eq.${userId}&select=*`);
      if (!rows || rows.length === 0) return null;
      return rows[0];
    } catch(e) {
      console.warn('loadProfile error:', e);
      return null;
    }
  },

  /** Créer le profil à l'inscription */
  async createProfile(userId, email, firstName, lastName) {
    const referralCode = 'FIT' + userId.replace(/-/g,'').slice(0,4).toUpperCase();
    return SB.post('profiles', {
      id:           userId,
      email,
      first_name:   firstName,
      last_name:    lastName,
      demo_status:  'pending',
      total_points: 0,
      total_sessions: 0,
      streak_days:  0,
      current_week: 1,
      sessions_this_week: 0,
      referral_code: referralCode,
      referral_count: 0,
      referral_months: 0,
    });
  },

  /** Sauvegarder le profil complet */
  async saveProfile(userId) {
    const p = STATE.profile;
    return SB.patch('profiles', `?id=eq.${userId}`, {
      fitness_level:      p.level,
      goal:               p.goal,
      session_days:       p.days,
      session_time:       p.sessionTime,
      age_group:          p.ageGroup,
      target_kg:          p.targetKg,
      total_points:       STATE.points,
      total_sessions:     STATE.totalSessions,
      streak_days:        STATE.streakDays,
      current_week:       STATE.currentWeek,
      sessions_this_week: STATE.sessionsThisWeek,
    });
  },

  /** Mapper la réponse DB → STATE */
  mapProfile(row) {
    if (!row) return;
    STATE.profile.level       = row.fitness_level || '';
    STATE.profile.goal        = row.goal           || '';
    STATE.profile.days        = row.session_days   || 3;
    STATE.profile.sessionTime = row.session_time   || 30;
    STATE.profile.ageGroup    = row.age_group      || '25';
    STATE.profile.targetKg    = row.target_kg      || null;
    STATE.points              = row.total_points   || 0;
    STATE.totalSessions       = row.total_sessions || 0;
    STATE.streakDays          = row.streak_days    || 0;
    STATE.currentWeek         = row.current_week   || 1;
    STATE.sessionsThisWeek    = row.sessions_this_week || 0;
    STATE.referralCode        = row.referral_code  || '';
    STATE.referralCount       = row.referral_count || 0;
    STATE.referralMonths      = row.referral_months || 0;
  },
};
