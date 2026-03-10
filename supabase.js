/* ═══════════════════════════════════════════════════════
   FITLIFE IA — SUPABASE  (version robuste)
   ⚠️  Remplacer SB_URL et SB_KEY par tes vraies valeurs
       dans le fichier GitHub (pas ici — placeholder local)
═══════════════════════════════════════════════════════ */

const SB_URL = 'https://jjrqduyoqilfbilfqegy.supabase.co';   // ← ta vraie URL
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqcnFkdXlvcWlsZmJpbGZxZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjIxNTksImV4cCI6MjA4ODUzODE1OX0.RMstrgHal09iKiPA5QwSSsgqhRVqU094zzv1cFejxzw'; // ← ta vraie clé

/* ──────────────────────────────────────────
   HELPER : parse la réponse sans crash JSON
   Si le serveur retourne du HTML (erreur réseau,
   URL incorrecte, etc.) on lève une erreur propre
   au lieu de "Unexpected token '<'"
────────────────────────────────────────── */
async function _safeJson(response) {
  const text = await response.text();
  if (!text || text.trim() === '') return {};
  // Si la réponse commence par '<' c'est du HTML → erreur réseau/config
  if (text.trim().startsWith('<')) {
    throw new Error('Impossible de contacter le serveur. Vérifie ta connexion internet.');
  }
  try {
    return JSON.parse(text);
  } catch(e) {
    throw new Error('Réponse inattendue du serveur. Réessaie dans un instant.');
  }
}

/* ──────────────────────────────────────────
   CLIENT SUPABASE (fetch natif, sans SDK)
────────────────────────────────────────── */
const SB = {

  headers(withAuth = true) {
    const h = {
      'Content-Type': 'application/json',
      'apikey':       SB_KEY,
    };
    if (withAuth && STATE.session?.access_token) {
      h['Authorization'] = 'Bearer ' + STATE.session.access_token;
    } else {
      h['Authorization'] = 'Bearer ' + SB_KEY;
    }
    return h;
  },

  async get(table, params = '') {
    let r;
    try {
      r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
        headers: { ...this.headers(), 'Accept': 'application/json' },
      });
    } catch(e) {
      throw new Error('Pas de connexion internet');
    }
    const data = await _safeJson(r);
    if (!r.ok) throw new Error(data.message || data.msg || `Erreur ${r.status}`);
    return data;
  },

  async post(table, body) {
    let r;
    try {
      r = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method:  'POST',
        headers: { ...this.headers(), 'Prefer': 'return=representation' },
        body:    JSON.stringify(body),
      });
    } catch(e) {
      throw new Error('Pas de connexion internet');
    }
    const data = await _safeJson(r);
    if (!r.ok) throw new Error(data.message || data.msg || `Erreur ${r.status}`);
    return data;
  },

  async patch(table, params, body) {
    let r;
    try {
      r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
        method:  'PATCH',
        headers: { ...this.headers(), 'Prefer': 'return=representation' },
        body:    JSON.stringify(body),
      });
    } catch(e) {
      throw new Error('Pas de connexion internet');
    }
    const data = await _safeJson(r);
    if (!r.ok) throw new Error(data.message || data.msg || `Erreur ${r.status}`);
    return data;
  },

  async delete(table, params) {
    let r;
    try {
      r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
        method:  'DELETE',
        headers: this.headers(),
      });
    } catch(e) {
      throw new Error('Pas de connexion internet');
    }
    if (!r.ok) {
      const data = await _safeJson(r).catch(() => ({}));
      throw new Error(data.message || `Erreur ${r.status}`);
    }
    return true;
  },

  /* ════════════════════════════════════════
     AUTH — signup / signin / reset / logout
  ════════════════════════════════════════ */
  auth: {

    async signUp(email, password, meta = {}) {
      let r;
      try {
        r = await fetch(`${SB_URL}/auth/v1/signup`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
          body:    JSON.stringify({ email, password, data: meta }),
        });
      } catch(e) {
        throw new Error('Pas de connexion internet');
      }
      const data = await _safeJson(r);
      if (data.error)              throw new Error(data.error.message || data.msg || data.error);
      if (data.error_description)  throw new Error(data.error_description);
      if (!r.ok)                   throw new Error(`Erreur ${r.status}`);
      return data;
    },

    async signIn(email, password) {
      let r;
      try {
        r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
          body:    JSON.stringify({ email, password }),
        });
      } catch(e) {
        throw new Error('Pas de connexion internet');
      }
      const data = await _safeJson(r);
      if (data.error)              throw new Error(data.error.message || data.error_description || data.msg);
      if (data.error_description)  throw new Error(data.error_description);
      if (!r.ok)                   throw new Error(`Erreur d'authentification (${r.status})`);
      return data;
    },

    async signOut() {
      if (!STATE.session?.access_token) return;
      try {
        await fetch(`${SB_URL}/auth/v1/logout`, {
          method:  'POST',
          headers: {
            'apikey':        SB_KEY,
            'Authorization': 'Bearer ' + STATE.session.access_token,
          },
        });
      } catch(e) { /* silencieux — on déconnecte localement quoi qu'il arrive */ }
    },

    async resetPassword(email) {
      let r;
      try {
        r = await fetch(`${SB_URL}/auth/v1/recover`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
          body:    JSON.stringify({ email }),
        });
      } catch(e) {
        throw new Error('Pas de connexion internet');
      }
      const data = await _safeJson(r);
      if (data.error) throw new Error(data.error.message || data.msg);
      return data;
    },

    /** Restaurer une session depuis localStorage */
    loadSession() {
      try {
        const raw = localStorage.getItem('fitlife-session');
        if (!raw) return null;
        const session = JSON.parse(raw);
        // Vérifie expiration
        if (session.expires_at && Date.now() / 1000 > session.expires_at) {
          localStorage.removeItem('fitlife-session');
          return null;
        }
        return session;
      } catch { return null; }
    },

    saveSession(session) {
      if (session) localStorage.setItem('fitlife-session', JSON.stringify(session));
      else         localStorage.removeItem('fitlife-session');
    },
  },
};

/* ════════════════════════════════════════════
   DB — Opérations profil & séances
════════════════════════════════════════════ */
const DB = {

  /** Charger le profil */
  async loadProfile(userId) {
    try {
      const rows = await SB.get('profiles', `?id=eq.${userId}&select=*`);
      return (rows && rows.length) ? rows[0] : null;
    } catch(e) {
      console.warn('[DB] loadProfile:', e.message);
      return null;
    }
  },

  /** Créer le profil à l'inscription */
  async createProfile(userId, email, firstName, lastName) {
    const referralCode = 'FIT' + userId.replace(/-/g,'').slice(0,4).toUpperCase();
    try {
      return await SB.post('profiles', {
        id:                userId,
        email,
        first_name:        firstName,
        last_name:         lastName,
        demo_status:       'pending',
        total_points:      0,
        total_sessions:    0,
        streak_days:       0,
        current_week:      1,
        sessions_this_week:0,
        referral_code:     referralCode,
        referral_count:    0,
        referral_months:   0,
      });
    } catch(e) {
      console.warn('[DB] createProfile:', e.message);
      return null;
    }
  },

  /** Sauvegarder le profil complet (avec programme + santé + jours complétés) */
  async saveProfile(userId) {
    const p = STATE.profile;
    try {
      const body = {
        fitness_level:       p.level,
        goal:                p.goal,
        session_days:        p.days,
        session_time:        p.sessionTime,
        age_group:           p.ageGroup,
        target_kg:           p.targetKg,
        total_points:        STATE.points,
        total_sessions:      STATE.totalSessions,
        streak_days:         STATE.streakDays,
        current_week:        STATE.currentWeek,
        sessions_this_week:  STATE.sessionsThisWeek,
      };
      // Sauvegarder le programme IA
      if (STATE.currentProgram) {
        body.program_data = JSON.stringify(STATE.currentProgram);
      }
      // Sauvegarder les jours complétés (Set → Array → JSON)
      if (STATE.completedDays && STATE.completedDays.size > 0) {
        body.completed_days = JSON.stringify([...STATE.completedDays]);
      }
      // Sauvegarder les conditions de santé
      if (p.healthConditions && p.healthConditions.size > 0) {
        body.health_conditions = JSON.stringify([...p.healthConditions]);
      }
      return await SB.patch('profiles', `?id=eq.${userId}`, body);
    } catch(e) {
      console.warn('[DB] saveProfile:', e.message);
      return null;
    }
  },

  /** Upsert générique (insert puis patch si conflit) */
  async upsert(table, body) {
    try {
      return await SB.post(table, body);
    } catch(e) {
      try {
        const id = body.id || body.user_id;
        if (id) return await SB.patch(table, `?id=eq.${id}`, body);
      } catch(e2) {
        console.warn('[DB] upsert fallback:', e2.message);
      }
    }
  },

  /** Insert générique */
  async insert(table, body) {
    try {
      return await SB.post(table, body);
    } catch(e) {
      console.warn(`[DB] insert ${table}:`, e.message);
    }
  },

  /** Mapper la réponse DB → STATE */
  mapProfile(row) {
    if (!row) return;
    STATE.profile.level        = row.fitness_level      || '';
    STATE.profile.goal         = row.goal                || '';
    STATE.profile.days         = row.session_days        || 3;
    STATE.profile.sessionTime  = row.session_time        || 30;
    STATE.profile.ageGroup     = row.age_group           || '25';
    STATE.profile.targetKg     = row.target_kg           || null;
    STATE.points               = row.total_points        || 0;
    STATE.totalSessions        = row.total_sessions      || 0;
    STATE.streakDays           = row.streak_days         || 0;
    STATE.currentWeek          = row.current_week        || 1;
    STATE.sessionsThisWeek     = row.sessions_this_week  || 0;
    STATE.referralCode         = row.referral_code       || '';
    STATE.referralCount        = row.referral_count      || 0;
    STATE.referralMonths       = row.referral_months     || 0;
    // Programme IA
    if (row.program_data && !STATE.currentProgram) {
      try { STATE.currentProgram = JSON.parse(row.program_data); } catch(e) {}
    }
    // Jours complétés (restaurés depuis DB si pas déjà en mémoire)
    if (row.completed_days && (!STATE.completedDays || STATE.completedDays.size === 0)) {
      try { STATE.completedDays = new Set(JSON.parse(row.completed_days)); } catch(e) {}
    }
    // Conditions de santé
    if (row.health_conditions && (!STATE.profile.healthConditions || STATE.profile.healthConditions.size === 0)) {
      try { STATE.profile.healthConditions = new Set(JSON.parse(row.health_conditions)); } catch(e) {}
    }
    // Prénom / nom (utilisés pour le profil)
    STATE.user = STATE.user || {};
    if (row.first_name) STATE.user.firstName = row.first_name;
    if (row.last_name)  STATE.user.lastName  = row.last_name;
    if (row.first_name || row.last_name) {
      STATE.user.initials = ((row.first_name||'')[0]||('')).toUpperCase() +
                            ((row.last_name||'')[0]||('')).toUpperCase() || '?';
    }
  },
};
