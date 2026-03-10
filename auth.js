/* ═══════════════════════════════════════════════════════
   FITLIFE IA — AUTH LOGIC
   Splash, Login, Signup, Mot de passe oublié.
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   SPLASH — Vérification session au démarrage
══════════════════════════════════════════════════════ */
async function initApp() {
  // Thème immédiat (déjà appliqué par state.js)

  // Afficher le splash
  navigate('splash');

  // Durée minimale splash (branding)
  const splashDelay = new Promise(r => setTimeout(r, 1800));

  // Vérifier session existante
  const sessionCheck = (async () => {
    const saved = SB.auth.loadSession();
    if (saved) {
      STATE.session = saved;
      STATE.user    = _buildUser(saved.user);
      return true;
    }
    return false;
  })();

  const [, hasSession] = await Promise.all([splashDelay, sessionCheck]);

  if (hasSession) {
    await _enterApp();
  } else {
    navigate('login');
  }
}

/** Construire l'objet user depuis la réponse Supabase */
function _buildUser(sbUser) {
  if (!sbUser) return null;
  const meta      = sbUser.user_metadata || {};
  const firstName = meta.first_name || meta.firstName || '';
  const lastName  = meta.last_name  || meta.lastName  || '';
  return {
    id:        sbUser.id,
    email:     sbUser.email,
    firstName,
    lastName,
    initials:  getInitials(firstName, lastName),
  };
}

/** Entrer dans l'app après auth réussie */
async function _enterApp() {
  // Charger profil DB
  const row = await DB.loadProfile(STATE.user.id);
  DB.mapProfile(row);

  // Charger données locales (badges, check-in)
  STATE.loadLocal(STATE.user.id);

  // Aller à l'accueil
  navigate('home');
}

/* ══════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════ */
async function submitLogin() {
  const email    = document.getElementById('login-email')?.value?.trim() || '';
  const password = document.getElementById('login-password')?.value || '';
  const remember = document.getElementById('login-remember')?.classList.contains('checked');

  // Reset erreurs
  Validate.clearAll([
    ['login-email',    'login-email-error'],
    ['login-password', 'login-password-error'],
  ]);

  // Validation
  let valid = true;
  if (!Validate.email(email)) {
    Validate.showError('login-email', 'login-email-error', 'Adresse email invalide');
    valid = false;
  }
  if (!Validate.password(password)) {
    Validate.showError('login-password', 'login-password-error', 'Mot de passe trop court');
    valid = false;
  }
  if (!valid) return;

  // Envoi
  btnLoading('login-submit', true);
  try {
    const data   = await SB.auth.signIn(email, password);
    STATE.session = data;
    STATE.user    = _buildUser(data.user);

    if (remember) SB.auth.saveSession(data);
    else          SB.auth.saveSession(null);

    await _enterApp();
  } catch(e) {
    btnLoading('login-submit', false);
    const msg = _authErrorMessage(e.message);
    Validate.showError('login-password', 'login-password-error', msg);
  }
}

/* ══════════════════════════════════════════════════════
   SIGNUP
══════════════════════════════════════════════════════ */
async function submitSignup() {
  const firstName = document.getElementById('signup-firstname')?.value?.trim() || '';
  const lastName  = document.getElementById('signup-lastname')?.value?.trim()  || '';
  const email     = document.getElementById('signup-email')?.value?.trim()     || '';
  const password  = document.getElementById('signup-password')?.value          || '';

  // Reset erreurs
  Validate.clearAll([
    ['signup-firstname', 'signup-firstname-error'],
    ['signup-lastname',  'signup-lastname-error'],
    ['signup-email',     'signup-email-error'],
    ['signup-password',  'signup-password-error'],
  ]);

  // Validation
  let valid = true;
  if (!Validate.name(firstName)) {
    Validate.showError('signup-firstname', 'signup-firstname-error', 'Prénom requis (min. 2 caractères)');
    valid = false;
  }
  if (!Validate.name(lastName)) {
    Validate.showError('signup-lastname', 'signup-lastname-error', 'Nom requis (min. 2 caractères)');
    valid = false;
  }
  if (!Validate.email(email)) {
    Validate.showError('signup-email', 'signup-email-error', 'Adresse email invalide');
    valid = false;
  }
  if (!Validate.password(password)) {
    Validate.showError('signup-password', 'signup-password-error', 'Minimum 6 caractères');
    valid = false;
  }
  if (!valid) return;

  btnLoading('signup-submit', true);
  try {
    // Créer le compte
    const data = await SB.auth.signUp(email, password, {
      first_name: firstName,
      last_name:  lastName,
    });

    STATE.session = data.session || data;
    STATE.user    = _buildUser(data.user || data);

    // Créer le profil en DB
    if (STATE.user?.id) {
      await DB.createProfile(STATE.user.id, email, firstName, lastName);
    }

    SB.auth.saveSession(STATE.session);
    showToast('🦁 Bienvenue ' + firstName + ' !', 'success');

    await _enterApp();
  } catch(e) {
    btnLoading('signup-submit', false);
    const msg = _authErrorMessage(e.message);
    if (msg.toLowerCase().includes('email')) {
      Validate.showError('signup-email', 'signup-email-error', msg);
    } else {
      showToast(msg, 'error');
    }
  }
}

/* ══════════════════════════════════════════════════════
   MOT DE PASSE OUBLIÉ
══════════════════════════════════════════════════════ */
async function submitForgotPassword() {
  const email = document.getElementById('forgot-email')?.value?.trim() || '';

  Validate.clearAll([['forgot-email', 'forgot-email-error']]);

  if (!Validate.email(email)) {
    Validate.showError('forgot-email', 'forgot-email-error', 'Adresse email invalide');
    return;
  }

  btnLoading('forgot-submit', true);
  try {
    await SB.auth.resetPassword(email);
    // Afficher confirmation
    document.getElementById('forgot-form').style.display    = 'none';
    document.getElementById('forgot-success').style.display = 'block';
  } catch(e) {
    btnLoading('forgot-submit', false);
    showToast('Erreur : ' + e.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════
   DÉCONNEXION
══════════════════════════════════════════════════════ */
async function signOut() {
  try { await SB.auth.signOut(); } catch(e) { /* silencieux */ }
  SB.auth.saveSession(null);
  STATE.reset();
  navigate('login');
  showToast('À bientôt ! 👋', 'default');
}

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function _authErrorMessage(raw = '') {
  const r = raw.toLowerCase();
  if (r.includes('invalid login') || r.includes('invalid credentials'))
    return 'Email ou mot de passe incorrect';
  if (r.includes('email not confirmed'))
    return 'Confirme ton email avant de te connecter';
  if (r.includes('already registered') || r.includes('already exists'))
    return 'Cet email est déjà utilisé';
  if (r.includes('network') || r.includes('fetch'))
    return 'Pas de connexion internet';
  return raw || 'Une erreur est survenue';
}

/* ══════════════════════════════════════════════════════
   GESTION REMEMBER ME & TOGGLE PASSWORD
   (appelé depuis le HTML inline)
══════════════════════════════════════════════════════ */
let _rememberMe = true;

function toggleRemember() {
  _rememberMe = !_rememberMe;
  const box = document.getElementById('login-remember');
  if (!box) return;
  box.classList.toggle('checked', _rememberMe);
  box.textContent = _rememberMe ? '✓' : '';
}
