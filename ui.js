/* ═══════════════════════════════════════════════════════
   FITLIFE IA — UI UTILITIES
   Toast, loaders, helpers d'interface partagés.
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════ */
const _toastQueue = [];
let _toastActive  = false;

/**
 * Afficher un toast.
 * @param {string} msg    - Message à afficher
 * @param {string} type   - 'default' | 'success' | 'error' | 'warning' | 'accent'
 * @param {number} duration - ms (défaut 2800)
 */
function showToast(msg, type = 'default', duration = 2800) {
  _toastQueue.push({ msg, type, duration });
  if (!_toastActive) _processToastQueue();
}

function _processToastQueue() {
  if (_toastQueue.length === 0) { _toastActive = false; return; }
  _toastActive = true;
  const { msg, type, duration } = _toastQueue.shift();

  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast${type !== 'default' ? ' toast-' + type : ''}`;
  el.textContent = msg;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity  = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => {
      el.remove();
      _processToastQueue();
    }, 260);
  }, duration);
}

/* ══════════════════════════════════════════════════════
   BOUTON LOADING STATE
══════════════════════════════════════════════════════ */
function btnLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  if (loading) {
    btn.dataset.origText = btn.textContent;
    btn.textContent      = '';
    btn.classList.add('btn-loading');
    btn.disabled         = true;
  } else {
    btn.textContent = btn.dataset.origText || '';
    btn.classList.remove('btn-loading');
    btn.disabled    = false;
  }
}

/* ══════════════════════════════════════════════════════
   INPUT — TOGGLE MOT DE PASSE
══════════════════════════════════════════════════════ */
function togglePassword(inputId, eyeId) {
  const input = document.getElementById(inputId);
  const eye   = document.getElementById(eyeId);
  if (!input || !eye) return;
  if (input.type === 'password') {
    input.type    = 'text';
    eye.textContent = '🙈';
  } else {
    input.type    = 'password';
    eye.textContent = '👁️';
  }
}

/* ══════════════════════════════════════════════════════
   FORCE MOT DE PASSE
══════════════════════════════════════════════════════ */
function checkPasswordStrength(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8)  score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score; // 0-4
}

function renderPasswordStrength(containerId, labelId, value) {
  const bars  = document.querySelectorAll(`#${containerId} .pwd-bar`);
  const label = document.getElementById(labelId);
  const score = checkPasswordStrength(value);

  const levels = [
    { text: '',          cls: '' },
    { text: 'Faible',    cls: 'weak' },
    { text: 'Moyen',     cls: 'medium' },
    { text: 'Bon',       cls: 'strong' },
    { text: 'Excellent', cls: 'strong' },
  ];

  bars.forEach((bar, i) => {
    bar.className = 'pwd-bar' + (i < score ? ' ' + levels[score].cls : '');
  });
  if (label) label.textContent = levels[score].text;
}

/* ══════════════════════════════════════════════════════
   TOGGLE CHECKBOX
══════════════════════════════════════════════════════ */
function toggleCheckbox(boxId, stateKey) {
  const box = document.getElementById(boxId);
  if (!box) return;
  const isChecked = box.classList.toggle('checked');
  box.textContent = isChecked ? '✓' : '';
  if (stateKey && STATE) STATE[stateKey] = isChecked;
  return isChecked;
}

/* ══════════════════════════════════════════════════════
   VALIDATION INPUTS
══════════════════════════════════════════════════════ */
const Validate = {
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  },
  password(value) {
    return value.length >= 6;
  },
  name(value) {
    return value.trim().length >= 2;
  },
  showError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('has-error');
    if (error) { error.textContent = msg; error.classList.add('show'); }
  },
  clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('has-error');
    if (error) error.classList.remove('show');
  },
  clearAll(ids) {
    ids.forEach(([inputId, errorId]) => this.clearError(inputId, errorId));
  },
};

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
/** Initiales depuis prénom + nom */
function getInitials(firstName = '', lastName = '') {
  return ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '?';
}

/** Format nombre fr-FR */
function fmtNumber(n) {
  return Number(n || 0).toLocaleString('fr-FR');
}

/** Format durée en "Xh Ymin" */
function fmtDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
