/* ═══════════════════════════════════════════════════════
   FITLIFE IA — STATE
   Source unique de vérité. Toutes les données de l'app
   passent par STATE. Jamais de variables globales
   éparpillées.
═══════════════════════════════════════════════════════ */

const STATE = {

  /* ── Auth ── */
  user: null,          // { id, email, firstName, lastName, initials, gender?, birthYear? }
  session: null,       // session Supabase

  /* ── Profil & Objectifs ── */
  profile: {
    level:       '',   // 'debutant' | 'intermediaire' | 'avance'
    goal:        '',   // 'poids' | 'muscle' | 'cardio' | 'mobilite'
    days:        3,    // nb séances/semaine
    sessionTime: 30,   // minutes par séance
    ageGroup:    '25', // tranche d'âge
    targetKg:    null, // poids cible (optionnel)
    healthConditions: new Set(), // contraintes santé
  },

  /* ── Gamification ── */
  points:        0,
  totalSessions: 0,
  streakDays:    0,
  sessionsThisWeek: 0,
  currentWeek:   1,
  totalMinutes:  0,
  totalKcal:     0,
  unlockedBadges: new Set(),
  challengesDone: new Set(),
  streakShields:  2,
  referralCode:   '',
  referralCount:  0,
  referralMonths: 0,

  /* ── Check-in ── */
  checkinDone:   false,
  checkinMood:   null,
  checkinEnergy: 5,
  checkinStreak: 0,

  /* ── Programme ── */
  currentProgram: null,  // objet programme généré par l'IA
  completedDays:  new Set(),
  historyData:    [],    // cache local des séances passées

  /* ── UI ── */
  theme: 'auto',    // 'auto' | 'light' | 'dark'
  currentScreen: 'splash',

  /* ── Helpers ── */

  /** Remet à zéro à la déconnexion */
  reset() {
    this.user           = null;
    this.session        = null;
    this.points         = 0;
    this.totalSessions  = 0;
    this.streakDays     = 0;
    this.sessionsThisWeek = 0;
    this.currentWeek    = 1;
    this.totalMinutes   = 0;
    this.totalKcal      = 0;
    this.unlockedBadges = new Set();
    this.challengesDone = new Set();
    this.streakShields  = 2;
    this.checkinDone    = false;
    this.checkinMood    = null;
    this.checkinStreak  = 0;
    this.currentProgram = null;
    this.completedDays  = new Set();
    this.historyData    = [];
    this.referralCode   = '';
    this.referralCount  = 0;
    this.referralMonths = 0;
    this.profile = {
      level: '', goal: '', days: 3, sessionTime: 30,
      ageGroup: '25', targetKg: null, healthConditions: new Set(),
    };
    if (this.user) {
      this.user.gender    = '';
      this.user.birthYear = '';
    }
  },

  /** Charge depuis localStorage (thème uniquement avant auth) */
  loadTheme() {
    this.theme = localStorage.getItem('fitlife-theme') || 'auto';
    applyTheme(this.theme);
  },

  /** Persiste le thème */
  saveTheme() {
    localStorage.setItem('fitlife-theme', this.theme);
  },

  /** Sauvegarde locale légère (check-in, badges, shields) */
  saveLocal(userId) {
    const key = 'fitlife-local-' + userId;
    const data = {
      checkinDone:    this.checkinDone,
      checkinMood:    this.checkinMood,
      checkinEnergy:  this.checkinEnergy,
      checkinStreak:  this.checkinStreak,
      checkinDate:    new Date().toISOString().split('T')[0],
      unlockedBadges: [...this.unlockedBadges],
      streakShields:  this.streakShields,
      challengesDone: [...this.challengesDone],
    };
    localStorage.setItem(key, JSON.stringify(data));
  },

  /** Charge depuis localStorage */
  loadLocal(userId) {
    try {
      const key  = 'fitlife-local-' + userId;
      const raw  = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      // Check-in valable seulement aujourd'hui
      if (data.checkinDate === today) {
        this.checkinDone   = data.checkinDone   || false;
        this.checkinMood   = data.checkinMood   || null;
        this.checkinEnergy = data.checkinEnergy || 5;
      }
      this.checkinStreak  = data.checkinStreak  || 0;
      this.unlockedBadges = new Set(data.unlockedBadges || []);
      this.streakShields  = data.streakShields  ?? 2;
      this.challengesDone = new Set(data.challengesDone || []);
    } catch(e) {
      console.warn('loadLocal error:', e);
    }
  },
};

/* ══════════════════════════════════════════════════════
   THÈME
══════════════════════════════════════════════════════ */
function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', mode);
  }
}

function cycleTheme() {
  const modes = ['auto', 'light', 'dark'];
  const idx   = modes.indexOf(STATE.theme);
  STATE.theme = modes[(idx + 1) % modes.length];
  STATE.saveTheme();
  applyTheme(STATE.theme);
  const labels = { auto: '🌗 Automatique', light: '☀️ Clair', dark: '🌙 Sombre' };
  showToast(labels[STATE.theme], 'default');
}

/* Écouter les changements système en mode auto */
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (STATE.theme === 'auto') applyTheme('auto');
  });

/* Appliquer le thème dès le chargement */
STATE.loadTheme();
