/* ═══════════════════════════════════════════════════════
   FITLIFE IA — ROUTER
   Gestion de la navigation entre écrans.
   Règle : on ne manipule JAMAIS display: directement
   ailleurs — tout passe par navigate().
═══════════════════════════════════════════════════════ */

/** Toutes les configurations d'écrans */
const SCREENS = {
  splash:   { id: 'screen-splash',   nav: false, onEnter: null },
  login:    { id: 'screen-login',    nav: false, onEnter: null },
  signup:   { id: 'screen-signup',   nav: false, onEnter: null },
  forgot:   { id: 'screen-forgot',   nav: false, onEnter: null },
  home:      { id: 'screen-home',      nav: true,  tab: 'home',      onEnter: () => Render.home() },
  programme: { id: 'screen-programme', nav: true,  tab: 'programme', onEnter: () => { Prog.init(); Prog.render(); } },
  wellbeing: { id: 'screen-wellbeing', nav: true,  tab: 'wellbeing', onEnter: () => { Wellbeing.init(); Wellbeing.render(); } },
  seance:    { id: 'screen-seance',     nav: false, onEnter: null },
  results:   { id: 'screen-results',   nav: false, onEnter: null },
};

let _currentScreen = null;
let _previousScreen = null;

/**
 * Naviguer vers un écran.
 * @param {string} name - clé dans SCREENS
 */
function navigate(name) {
  const screen = SCREENS[name];
  if (!screen) { console.error('Screen inconnue:', name); return; }

  // Cacher tous les écrans
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));

  // Afficher le bon
  const el = document.getElementById(screen.id);
  if (!el) { console.error('Element manquant:', screen.id); return; }
  el.classList.add('active');

  // Scroll to top
  const body = el.querySelector('.screen-body');
  if (body) body.scrollTop = 0;

  // Nav bar
  if (screen.nav) {
    showNav();
    setActiveTab(screen.tab);
  } else {
    hideNav();
  }

  // Callback de rendu (dans setTimeout pour laisser le DOM s'afficher)
  if (screen.onEnter) {
    setTimeout(() => screen.onEnter(), 0);
  }

  _previousScreen = _currentScreen;
  _currentScreen  = name;
  STATE.currentScreen = name;
}

/** Retour à l'écran précédent */
function goBack() {
  if (_previousScreen) navigate(_previousScreen);
}

/** Afficher / cacher la nav bar */
function showNav() {
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.style.display = '';
}
function hideNav() {
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.style.display = 'none';
}

/** Activer l'onglet de nav */
function setActiveTab(tab) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
}
