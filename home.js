/* ═══════════════════════════════════════════════════════
   FITLIFE IA — HOME SCREEN
   Jauge, stats, challenges, check-in, tips
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   TIPS DU JOUR
══════════════════════════════════════════════════════ */
const TIPS = [
  { icon: '💧', text: 'Bois 500ml d\'eau avant ta séance pour optimiser tes performances.' },
  { icon: '😴', text: '7-8h de sommeil = +30% de récupération musculaire. Ne néglige pas le repos.' },
  { icon: '🥩', text: 'Vise 1.6-2g de protéines par kg de poids corporel pour construire du muscle.' },
  { icon: '🔥', text: 'Les 5 premières minutes d\'échauffement réduisent le risque de blessure de 50%.' },
  { icon: '🧠', text: 'La régularité bat l\'intensité. 3 séances par semaine valent mieux qu\'une marathon.' },
  { icon: '🍌', text: 'Une banane 30 min avant ta séance : l\'énergie parfaite sans pic d\'insuline.' },
  { icon: '⏱️', text: 'Les pauses de 60-90s entre séries sont idéales pour l\'hypertrophie musculaire.' },
  { icon: '🧘', text: '10 min de mobilité le matin améliorent ta posture et réduisent les douleurs.' },
  { icon: '📈', text: 'Augmente la charge de 2.5-5% par semaine pour continuer à progresser.' },
  { icon: '🎯', text: 'Visualise ta séance avant de commencer. Les athlètes pro le font systématiquement.' },
];

function getTodayTip() {
  const day = new Date().getDay();
  return TIPS[day % TIPS.length];
}

/* ══════════════════════════════════════════════════════
   CHALLENGES IA (déterministe par date + userId)
══════════════════════════════════════════════════════ */
const ALL_CHALLENGES = [
  // Cardio
  { id:'c1', cat:'cardio',    icon:'🏃', name:'Sprint 10x30s',   sub:'Cardio fractionné',  pts:80  },
  { id:'c2', cat:'cardio',    icon:'🚴', name:'Vélo 20 min',      sub:'Endurance légère',   pts:60  },
  { id:'c3', cat:'cardio',    icon:'⛹️', name:'Saut à la corde',  sub:'500 sauts',          pts:70  },
  { id:'c4', cat:'cardio',    icon:'🏊', name:'Natation 30 min',  sub:'Cardio doux',        pts:90  },
  { id:'c5', cat:'cardio',    icon:'🥊', name:'Shadow boxing',    sub:'3 rounds de 3 min',  pts:75  },
  { id:'c6', cat:'cardio',    icon:'🚶', name:'Marche rapide',    sub:'30 min au grand air',pts:50  },
  { id:'c7', cat:'cardio',    icon:'🏃', name:'Fartlek 25 min',   sub:'Allure variable',    pts:85  },
  { id:'c8', cat:'cardio',    icon:'🎽', name:'Burpees 50 reps',  sub:'Sans pause',         pts:100 },
  // Force
  { id:'f1', cat:'force',     icon:'💪', name:'100 pompes',       sub:'Au total aujourd\'hui',pts:90 },
  { id:'f2', cat:'force',     icon:'🏋️', name:'Squat 5x10',      sub:'Avec tempo 3-1-3',   pts:80  },
  { id:'f3', cat:'force',     icon:'🔱', name:'Tractions max',    sub:'3 séries max reps',  pts:95  },
  { id:'f4', cat:'force',     icon:'💪', name:'Gainage 5 min',    sub:'Total cumulé',       pts:65  },
  { id:'f5', cat:'force',     icon:'🏋️', name:'Soulevé de terre', sub:'3x5 charges lourdes',pts:110 },
  { id:'f6', cat:'force',     icon:'🔱', name:'Dips 3x15',        sub:'Poids de corps',     pts:75  },
  { id:'f7', cat:'force',     icon:'💪', name:'Curl biceps 4x12', sub:'Isolation complète', pts:60  },
  { id:'f8', cat:'force',     icon:'🏋️', name:'Développé couché', sub:'5x5 lourd',          pts:100 },
  // Nutrition
  { id:'n1', cat:'nutrition', icon:'🥗', name:'Pas de sucre',     sub:'Toute la journée',   pts:70  },
  { id:'n2', cat:'nutrition', icon:'💧', name:'3L d\'eau',         sub:'Hydratation max',    pts:50  },
  { id:'n3', cat:'nutrition', icon:'🥦', name:'5 légumes',        sub:'Dans la journée',    pts:60  },
  { id:'n4', cat:'nutrition', icon:'🍳', name:'Petit-déj protéiné',sub:'30g+ de protéines', pts:55  },
  { id:'n5', cat:'nutrition', icon:'🥩', name:'Repas équilibré',  sub:'Protéines + fibres', pts:65  },
  { id:'n6', cat:'nutrition', icon:'🍎', name:'Zéro ultra-transformé',sub:'Clean eating',   pts:80  },
  { id:'n7', cat:'nutrition', icon:'🥑', name:'Bons lipides',     sub:'Avocat, noix, huile olive',pts:55},
  { id:'n8', cat:'nutrition', icon:'🍓', name:'Smoothie post-séance',sub:'Récupération',    pts:60  },
  // Mental
  { id:'m1', cat:'mental',    icon:'🧘', name:'Méditation 10 min',sub:'Pleine conscience',  pts:70  },
  { id:'m2', cat:'mental',    icon:'📔', name:'Journal de bord',  sub:'Écris tes progrès',  pts:55  },
  { id:'m3', cat:'mental',    icon:'😴', name:'8h de sommeil',    sub:'Couche-toi tôt',     pts:75  },
  { id:'m4', cat:'mental',    icon:'📵', name:'No scroll 1h',     sub:'Avant de dormir',    pts:65  },
  { id:'m5', cat:'mental',    icon:'🙏', name:'3 gratitudes',     sub:'Pensées positives',  pts:50  },
  { id:'m6', cat:'mental',    icon:'🎯', name:'Visualisation',    sub:'Avant ta séance',    pts:60  },
  { id:'m7', cat:'mental',    icon:'🧠', name:'Lecture 20 min',   sub:'Développement perso',pts:55  },
  { id:'m8', cat:'mental',    icon:'🌅', name:'Lever tôt',        sub:'Avant 7h du matin',  pts:80  },
  // Mobilité
  { id:'mo1',cat:'mobilite',  icon:'🧘', name:'Yoga 20 min',      sub:'Flexibilité',        pts:65  },
  { id:'mo2',cat:'mobilite',  icon:'🦵', name:'Étirements 15 min',sub:'Jambes complètes',   pts:50  },
  { id:'mo3',cat:'mobilite',  icon:'🔄', name:'Foam roller',      sub:'Récupération active',pts:55  },
  { id:'mo4',cat:'mobilite',  icon:'🤸', name:'Mobilité hanches', sub:'10 exercices',       pts:60  },
  { id:'mo5',cat:'mobilite',  icon:'🦾', name:'Mobilité épaules', sub:'Prévention blessure',pts:60  },
  { id:'mo6',cat:'mobilite',  icon:'🧘', name:'Yin yoga 30 min',  sub:'Relâchement profond',pts:75  },
  { id:'mo7',cat:'mobilite',  icon:'🌊', name:'Respiration Wim Hof',sub:'3 cycles',         pts:70  },
  { id:'mo8',cat:'mobilite',  icon:'🤸', name:'Animal flow',      sub:'15 min de fluidité', pts:80  },
];

function seededRandom(seed) {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getTodayChallenges(userId = '', count = 5) {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const seed  = parseInt(today) + userId.charCodeAt(0) || 0;

  // Sélection déterministe
  const shuffled = [...ALL_CHALLENGES].sort((a, b) => {
    const sa = seededRandom(seed + a.id.charCodeAt(0));
    const sb = seededRandom(seed + b.id.charCodeAt(0));
    return sa - sb;
  });

  // S'assurer d'avoir au moins 1 cardio et 1 force
  const result   = [];
  const cats     = ['cardio', 'force', 'nutrition', 'mental', 'mobilite'];
  const goal     = STATE.profile.goal;

  // Priorité selon objectif
  const priority = {
    poids:    ['cardio','nutrition','mobilite','force','mental'],
    muscle:   ['force','nutrition','cardio','mental','mobilite'],
    cardio:   ['cardio','mobilite','force','nutrition','mental'],
    mobilite: ['mobilite','mental','cardio','force','nutrition'],
  }[goal] || cats;

  for (const cat of priority) {
    const pick = shuffled.find(c => c.cat === cat && !result.includes(c));
    if (pick) result.push(pick);
    if (result.length >= count) break;
  }

  return result;
}

/* ══════════════════════════════════════════════════════
   RENDU HOME
══════════════════════════════════════════════════════ */
const Render = {
  home() {
    const screen = document.getElementById('screen-home');
    if (!screen) return;

    const user       = STATE.user || {};
    const firstName  = user.firstName || 'Toi';
    const initials   = user.initials  || '?';
    const points     = STATE.points   || 0;
    const streak     = STATE.streakDays || 0;
    const sessions   = STATE.totalSessions || 0;
    const weekSess   = STATE.sessionsThisWeek || 0;
    const weekGoal   = STATE.profile.days || 3;
    const weekPct    = Math.min(100, Math.round((weekSess / weekGoal) * 100));

    // Niveau XP
    const xpLevel    = _getXpLevel(points);
    const gaugePct   = Math.min(100, Math.round(((points - xpLevel.min) / (xpLevel.max - xpLevel.min)) * 100));
    const nextPts    = xpLevel.max - points;

    // Tip du jour
    const tip        = getTodayTip();

    // Challenges
    const challenges = getTodayChallenges(user.id);

    // Salutation
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    screen.innerHTML = `
      <!-- Top bar -->
      <div class="home-topbar">
        <div class="home-topbar-left">
          <div class="home-topbar-avatar" onclick="navigate('profile')">${initials}</div>
          <div class="home-topbar-greet">${greet}, <span>${firstName}</span> 👋</div>
        </div>
        <div class="home-topbar-right">
          <div class="home-notif-btn" onclick="showToast('Notifications — bientôt disponible','default')">
            🔔
            <div class="home-notif-dot"></div>
          </div>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="screen-body">

        <!-- Pills stats -->
        <div class="home-pills">
          <div class="pill pill-gold">🔥 ${streak} jour${streak > 1 ? 's' : ''}</div>
          <div class="pill pill-orange">⭐ ${fmtNumber(points)} pts</div>
          <div class="pill pill-dark">🏋️ ${sessions} séance${sessions > 1 ? 's' : ''}</div>
        </div>

        <!-- Jauge circulaire -->
        <div class="home-gauge-wrap">
          <div class="home-gauge-svg-wrap">
            ${_buildGaugeSVG(gaugePct)}
            <div class="home-gauge-center">
              <div class="home-gauge-val" id="gauge-val">0</div>
              <div class="home-gauge-label">${xpLevel.name}</div>
              ${nextPts > 0 ? `<div class="home-gauge-next">+${fmtNumber(nextPts)} pts → ${xpLevel.nextName}</div>` : `<div class="home-gauge-next">🏆 Niveau max !</div>`}
            </div>
          </div>
        </div>

        <!-- CTA principal -->
        <div class="home-cta-wrap">
          <button class="home-cta-main" onclick="navigate('program')">
            🏋️ Lancer ma séance
          </button>
          <div class="home-cta-share" onclick="_shareApp()" title="Parrainer un ami">🎁</div>
        </div>

        <!-- Stats mini -->
        <div class="home-stats-scroll">
          ${_buildStatCard('🗓️', weekSess + '/' + weekGoal, 'Cette semaine', weekPct)}
          ${_buildStatCard('⏱️', fmtDuration(STATE.totalMinutes || 0), 'Total sport', Math.min(100, (STATE.totalMinutes||0)/1200*100))}
          ${_buildStatCard('🔥', (STATE.totalKcal || 0) + ' kcal', 'Brûlées', Math.min(100, (STATE.totalKcal||0)/10000*100))}
          ${_buildStatCard('📅', 'Semaine ' + (STATE.currentWeek || 1), 'Programme', Math.min(100, ((STATE.currentWeek||1)/12)*100))}
        </div>

        <!-- Tip du jour -->
        <div class="home-tip">
          <div class="home-tip-icon">${tip.icon}</div>
          <div class="home-tip-text"><strong>Le sais-tu ?</strong> ${tip.text}</div>
        </div>

        <!-- Check-in -->
        ${_buildCheckin()}

        <!-- Challenges du jour -->
        <div class="home-section">
          <div class="home-section-title">Challenges du jour</div>
          <button class="home-section-action" onclick="showToast('Tous les challenges — bientôt','default')">Voir tout</button>
        </div>
        <div class="home-challenges-scroll">
          ${challenges.map(c => _buildChallengeCard(c)).join('')}
        </div>

        <!-- Padding bas nav -->
        <div style="height:16px"></div>
      </div>
    `;

    // Animer le compteur points
    _animateCounter('gauge-val', 0, points, 1000);
    // Animer la jauge
    setTimeout(() => _animateGauge(gaugePct), 100);
  },

  program() {
    const screen = document.getElementById('screen-program');
    if (!screen) return;
    screen.innerHTML = `
      <div class="screen-body" style="display:flex;align-items:center;justify-content:center;padding:40px">
        <div style="text-align:center;color:var(--muted)">
          <div style="font-size:48px;margin-bottom:12px">🏋️</div>
          <div style="font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:var(--text)">Programme — étape 3</div>
        </div>
      </div>
    `;
  },

  profile() {
    const screen = document.getElementById('screen-profile');
    if (!screen) return;
    screen.innerHTML = `
      <div class="screen-body" style="display:flex;align-items:center;justify-content:center;padding:40px">
        <div style="text-align:center;color:var(--muted)">
          <div style="font-size:48px;margin-bottom:12px">👤</div>
          <div style="font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:var(--text)">Profil — étape 4</div>
        </div>
      </div>
    `;
  },
};

/* ══════════════════════════════════════════════════════
   BUILDERS HTML
══════════════════════════════════════════════════════ */
function _buildGaugeSVG(pct) {
  const r   = 95;
  const cx  = 110;
  const cy  = 110;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return `
    <svg class="home-gauge-svg" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
      <circle class="gauge-track" cx="${cx}" cy="${cy}" r="${r}"
        stroke-dasharray="${circ}" stroke-dashoffset="0"/>
      <circle class="gauge-fill" id="gauge-circle" cx="${cx}" cy="${cy}" r="${r}"
        stroke-dasharray="${circ}" stroke-dashoffset="${circ}"/>
    </svg>
  `;
}

function _animateGauge(pct) {
  const circle = document.getElementById('gauge-circle');
  if (!circle) return;
  const r      = 95;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  circle.style.strokeDashoffset = offset;
}

function _buildStatCard(icon, val, label, pct) {
  return `
    <div class="home-stat-card">
      <div class="home-stat-icon">${icon}</div>
      <div class="home-stat-info">
        <div class="home-stat-val">${val}</div>
        <div class="home-stat-lbl">${label}</div>
        <div class="home-stat-bar">
          <div class="home-stat-bar-fill" style="width:${Math.round(pct)}%"></div>
        </div>
      </div>
    </div>
  `;
}

function _buildChallengeCard(ch) {
  const done    = STATE.challengesDone.has(ch.id);
  const catCls  = `ch-${ch.cat}`;
  return `
    <div class="challenge-card" onclick="_doChallenge('${ch.id}')">
      <div class="challenge-card-img ${catCls}">
        <span class="challenge-pts-pill">+${ch.pts} pts</span>
        ${done ? `<span class="challenge-done-badge">✓</span>` : ''}
        ${ch.icon}
      </div>
      <div class="challenge-card-body">
        <div class="challenge-card-name">${ch.name}</div>
        <div class="challenge-card-sub">${ch.sub}</div>
      </div>
    </div>
  `;
}

function _buildCheckin() {
  if (STATE.checkinDone) {
    const moods = { top:'😁', bien:'😊', moyen:'😐', fatigue:'😴', nul:'😓' };
    const emoji = moods[STATE.checkinMood] || '✅';
    return `
      <div class="home-checkin">
        <div class="home-checkin-title">Check-in quotidien ✅</div>
        <div class="home-checkin-done">${emoji} Check-in effectué aujourd'hui — continues comme ça !</div>
      </div>
    `;
  }
  return `
    <div class="home-checkin">
      <div class="home-checkin-title">💬 Comment tu te sens aujourd'hui ?</div>
      <div class="home-moods">
        ${[
          { key:'top',    emoji:'😁', label:'Top forme' },
          { key:'bien',   emoji:'😊', label:'Bien'      },
          { key:'moyen',  emoji:'😐', label:'Moyen'     },
          { key:'fatigue',emoji:'😴', label:'Fatigué'   },
          { key:'nul',    emoji:'😓', label:'Pas top'   },
        ].map(m => `
          <div class="mood-btn" onclick="_doCheckin('${m.key}')">
            <div class="mood-emoji">${m.emoji}</div>
            <div class="mood-label">${m.label}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════════════════
   ACTIONS
══════════════════════════════════════════════════════ */
function _doCheckin(mood) {
  STATE.checkinDone   = true;
  STATE.checkinMood   = mood;
  STATE.checkinStreak = (STATE.checkinStreak || 0) + 1;
  STATE.points       += 20;
  if (STATE.user?.id) STATE.saveLocal(STATE.user.id);

  const msgs = {
    top:     '🔥 Tu es en feu aujourd\'hui !',
    bien:    '😊 Belle énergie, profite-en !',
    moyen:   '💪 Une séance et tu te sentiras mieux !',
    fatigue: '😴 Écoute ton corps, reste actif doucement.',
    nul:     '🦁 Le lion se lève quand même. Tu peux le faire !',
  };
  showToast(msgs[mood] || 'Check-in enregistré ! +20 pts', 'accent');
  Render.home();
}

function _doChallenge(id) {
  if (STATE.challengesDone.has(id)) {
    showToast('Challenge déjà complété aujourd\'hui ✅', 'default');
    return;
  }
  const ch = ALL_CHALLENGES.find(c => c.id === id);
  if (!ch) return;

  STATE.challengesDone.add(id);
  STATE.points += ch.pts;
  if (STATE.user?.id) STATE.saveLocal(STATE.user.id);

  showToast(`+${ch.pts} pts — ${ch.name} complété ! 🎯`, 'success');
  Render.home();
}

function _shareApp() {
  const code = STATE.referralCode || 'FITLIFE';
  const url  = `https://kdbusinessfr-sys.github.io/fitlife`;
  const text = `🦁 Rejoins FitLife IA avec mon code ${code} et commence ton programme fitness IA ! ${url}`;

  if (navigator.share) {
    navigator.share({ title: 'FitLife IA', text, url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(text);
    showToast('Lien copié ! Partage-le 🎁', 'accent');
  }
}

/* ══════════════════════════════════════════════════════
   NIVEAUX XP
══════════════════════════════════════════════════════ */
const XP_LEVELS = [
  { name: 'Débutant',      nextName: 'Apprenti',      min: 0,    max: 500   },
  { name: 'Apprenti',      nextName: 'Athlète',       min: 500,  max: 1500  },
  { name: 'Athlète',       nextName: 'Guerrier',      min: 1500, max: 3500  },
  { name: 'Guerrier',      nextName: 'Champion',      min: 3500, max: 7000  },
  { name: 'Champion',      nextName: 'Élite',         min: 7000, max: 12000 },
  { name: 'Élite',         nextName: 'Légende',       min: 12000,max: 20000 },
  { name: 'Légende 🦁',    nextName: '',              min: 20000,max: 20000 },
];

function _getXpLevel(points) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (points >= XP_LEVELS[i].min) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

/* ══════════════════════════════════════════════════════
   ANIMATION COMPTEUR
══════════════════════════════════════════════════════ */
function _animateCounter(id, from, to, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const t   = Math.min(1, (now - start) / duration);
    const val = Math.round(from + (to - from) * _easeOut(t));
    el.textContent = fmtNumber(val);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function _easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}
