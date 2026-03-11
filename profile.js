/* ═══════════════════════════════════════════════════════
   FITLIFE IA — PROFILE JS
   Hero bannière, XP bar, stats 2×2, graphe 7j,
   badges, programme résumé, historique, paramètres
═══════════════════════════════════════════════════════ */

const Profile = (() => {

  /* ══════════════════════════════════════════════════════
     1. BADGES SYSTÈME
  ══════════════════════════════════════════════════════ */
  const ALL_BADGES = [
    { id:'first_step',  icon:'👟', name:'Premier pas',    desc:'Première séance complétée',      pts:50,   condition: s => s.totalSessions >= 1   },
    { id:'week1',       icon:'🔥', name:'7 jours',        desc:'Streak de 7 jours',               pts:100,  condition: s => s.streakDays >= 7       },
    { id:'sessions5',   icon:'💪', name:'5 séances',      desc:'5 séances accomplies',            pts:75,   condition: s => s.totalSessions >= 5    },
    { id:'sessions10',  icon:'⚡', name:'10 séances',     desc:'10 séances accomplies',           pts:150,  condition: s => s.totalSessions >= 10   },
    { id:'sessions25',  icon:'🏆', name:'25 séances',     desc:'25 séances accomplies',           pts:300,  condition: s => s.totalSessions >= 25   },
    { id:'sessions50',  icon:'👑', name:'50 séances',     desc:'Légende des séances',             pts:500,  condition: s => s.totalSessions >= 50   },
    { id:'points500',   icon:'⭐', name:'500 pts',        desc:'500 points accumulés',            pts:50,   condition: s => s.points >= 500         },
    { id:'points2000',  icon:'🌟', name:'2 000 pts',      desc:'2 000 points accumulés',          pts:100,  condition: s => s.points >= 2000        },
    { id:'kcal5000',    icon:'🔥', name:'5 000 kcal',     desc:'5 000 calories brûlées',          pts:150,  condition: s => s.totalKcal >= 5000     },
    { id:'time600',     icon:'⏱️', name:'10h de sport',   desc:'600 minutes de sport',            pts:200,  condition: s => s.totalMinutes >= 600   },
    { id:'week4',       icon:'📅', name:'Mois complet',   desc:'Programme semaine 4 atteinte',    pts:200,  condition: s => s.currentWeek >= 4      },
    { id:'week12',      icon:'🦁', name:'Programme fini', desc:'12 semaines terminées !',         pts:500,  condition: s => s.currentWeek >= 12     },
    { id:'streak14',    icon:'💎', name:'14 jours',       desc:'Streak de 14 jours',              pts:200,  condition: s => s.streakDays >= 14      },
    { id:'streak30',    icon:'🌊', name:'30 jours',       desc:'Streak de 30 jours',              pts:400,  condition: s => s.streakDays >= 30      },
  ];

  /* ══════════════════════════════════════════════════════
     2. NIVEAUX XP (synchronisé avec home.js)
  ══════════════════════════════════════════════════════ */
  const XP_LEVELS = [
    { name:'Débutant',   icon:'🌱', nextName:'Apprenti',   min:0,     max:500   },
    { name:'Apprenti',   icon:'⚡', nextName:'Athlète',    min:500,   max:1500  },
    { name:'Athlète',    icon:'🏃', nextName:'Guerrier',   min:1500,  max:3500  },
    { name:'Guerrier',   icon:'⚔️', nextName:'Champion',   min:3500,  max:7000  },
    { name:'Champion',   icon:'🏆', nextName:'Élite',      min:7000,  max:12000 },
    { name:'Élite',      icon:'💎', nextName:'Légende',    min:12000, max:20000 },
    { name:'Légende',    icon:'🦁', nextName:'',           min:20000, max:20000 },
  ];

  function _getLevel(pts) {
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
      if (pts >= XP_LEVELS[i].min) return XP_LEVELS[i];
    }
    return XP_LEVELS[0];
  }

  /* ══════════════════════════════════════════════════════
     3. ENTRY POINT — render depuis le router
  ══════════════════════════════════════════════════════ */
  function init() {
    _checkBadges();
  }

  function render() {
    const screen = document.getElementById('screen-profile');
    if (!screen) return;

    // screen-profile est vide : on écrit directement dedans

    const user     = STATE.user     || {};
    const points   = STATE.points   || 0;
    const level    = _getLevel(points);
    const gaugePct = level.max === level.min ? 100
                   : Math.round(((points - level.min) / (level.max - level.min)) * 100);

    const firstName = user.firstName || 'Athlète';
    const lastName  = user.lastName  || '';
    const initials  = user.initials  || ((firstName[0]||'') + (lastName[0]||'')).toUpperCase() || '?';
    const handle    = '@' + (firstName + lastName).toLowerCase().replace(/\s/g,'').replace(/[^a-z0-9]/g,'') || '@fitlife';

    const goalLabels = {
      poids:'🔥 Perte de poids', muscle:'💪 Prise de muscle',
      cardio:'❤️ Cardio', mobilite:'🧘 Mobilité',
    };
    const goalChip = goalLabels[STATE.profile.goal] || '🎯 Objectif non défini';

    // Historique séances (depuis localStorage)
    const history = _getLocalHistory();

    // Badges
    const badges = _computeBadges();
    const unlockedCount = badges.filter(b => b.unlocked).length;

    screen.innerHTML = `
    <div class="screen-body">

      <!-- HERO BANNIÈRE -->
      <div class="prof-hero prof-fade-in">
        <div class="prof-banner">
          <button class="prof-settings-btn" onclick="Profile.openSettings()" title="Paramètres">⚙️</button>
          <div class="prof-avatar-wrap">
            <div class="prof-avatar" onclick="Profile.openEdit()" title="Modifier le profil">
              ${initials}
              <div class="prof-avatar-level-badge">${level.icon} ${level.name}</div>
            </div>
          </div>
        </div>
        <div class="prof-identity">
          <div class="prof-name">${firstName} ${lastName}</div>
          <div class="prof-handle">${handle}</div>
          <div class="prof-goal-chip">${goalChip}</div>
        </div>
      </div>

      <!-- XP BAR -->
      <div class="prof-xp-section prof-fade-in">
        <div class="prof-xp-header">
          <div class="prof-xp-level-name">
            <span class="prof-xp-level-icon">${level.icon}</span>
            ${level.name}
          </div>
          <div class="prof-xp-pts">${fmtNumber(points)} pts</div>
        </div>
        <div class="prof-xp-bar-track">
          <div class="prof-xp-bar-fill" id="xp-bar-fill" style="width:0%"></div>
        </div>
        <div class="prof-xp-footer">
          <span>${fmtNumber(level.min)} pts</span>
          ${level.nextName
            ? `<span class="prof-xp-next">→ ${level.nextName} · +${fmtNumber(level.max - points)} pts</span>`
            : `<span class="prof-xp-next">🏆 Niveau maximum !</span>`}
          <span>${fmtNumber(level.max)} pts</span>
        </div>
      </div>

      <!-- STATS 2×2 -->
      <div class="prof-stats-grid prof-fade-in">
        <div class="prof-stat-card streak">
          <div class="prof-stat-icon">🔥</div>
          <div class="prof-stat-value" id="stat-streak">0</div>
          <div class="prof-stat-label">Streak jours</div>
        </div>
        <div class="prof-stat-card sessions">
          <div class="prof-stat-icon">🏋️</div>
          <div class="prof-stat-value" id="stat-sessions">0</div>
          <div class="prof-stat-label">Séances</div>
        </div>
        <div class="prof-stat-card time">
          <div class="prof-stat-icon">⏱️</div>
          <div class="prof-stat-value" id="stat-time">0</div>
          <div class="prof-stat-label">Minutes</div>
        </div>
        <div class="prof-stat-card calories">
          <div class="prof-stat-icon">🔥</div>
          <div class="prof-stat-value" id="stat-kcal">0</div>
          <div class="prof-stat-label">Calories</div>
        </div>
      </div>

      <!-- GRAPHE 7 JOURS -->
      <div class="prof-section prof-fade-in">
        <div class="prof-section-header">
          <div class="prof-section-title">Activité 7 jours</div>
        </div>
        <div class="prof-chart">
          ${_buildWeekChart()}
        </div>
      </div>

      <!-- BADGES -->
      <div class="prof-section prof-fade-in">
        <div class="prof-section-header">
          <div class="prof-section-title">Trophées · ${unlockedCount}/${badges.length}</div>
          <button class="prof-section-action" onclick="Profile.openBadgesSheet()">Voir tout</button>
        </div>
        <div class="prof-badges-scroll">
          ${badges.slice(0, 8).map(b => _buildBadgeCard(b)).join('')}
        </div>
      </div>

      <!-- PROGRAMME -->
      <div class="prof-section prof-fade-in">
        <div class="prof-section-header">
          <div class="prof-section-title">Mon Programme</div>
        </div>
        ${_buildProgramCard()}
      </div>

      <!-- HISTORIQUE RÉCENT -->
      <div class="prof-section prof-fade-in">
        <div class="prof-section-header">
          <div class="prof-section-title">Dernières séances</div>
        </div>
        <div class="prof-history-list">
          ${history.length > 0
            ? history.slice(0, 4).map(h => _buildHistoryItem(h)).join('')
            : `<div class="prof-history-empty">Aucune séance enregistrée pour l'instant.<br>Lance ta première séance ! 🦁</div>`}
        </div>
      </div>

      <!-- PARRAINAGE -->
      <div class="prof-section prof-fade-in">
        ${_buildReferralCard()}
      </div>

      <!-- PARAMÈTRES -->
      <div class="prof-section prof-fade-in">
        <div class="prof-section-header">
          <div class="prof-section-title">Paramètres</div>
        </div>
        <div class="prof-settings-list">
          <button class="prof-setting-row" onclick="Profile.openEdit()">
            <div class="prof-setting-icon orange">👤</div>
            <div class="prof-setting-text">
              <div class="prof-setting-label">Modifier mon profil</div>
              <div class="prof-setting-sub">Prénom, nom, objectif</div>
            </div>
            <div class="prof-setting-arrow">›</div>
          </button>
          <button class="prof-setting-row" onclick="Profile.openTheme()">
            <div class="prof-setting-icon blue">🎨</div>
            <div class="prof-setting-text">
              <div class="prof-setting-label">Thème</div>
              <div class="prof-setting-sub" id="theme-sub-label">${_getThemeLabel()}</div>
            </div>
            <div class="prof-setting-arrow">›</div>
          </button>
          <button class="prof-setting-row" onclick="Profile.openBadgesSheet()">
            <div class="prof-setting-icon gold">🏅</div>
            <div class="prof-setting-text">
              <div class="prof-setting-label">Mes trophées</div>
              <div class="prof-setting-sub">${unlockedCount} débloqués sur ${badges.length}</div>
            </div>
            <div class="prof-setting-arrow">›</div>
          </button>
          <button class="prof-setting-row" onclick="Profile.openReferral()">
            <div class="prof-setting-icon green">🎁</div>
            <div class="prof-setting-text">
              <div class="prof-setting-label">Parrainer un ami</div>
              <div class="prof-setting-sub">Gagne des mois gratuits</div>
            </div>
            <div class="prof-setting-arrow">›</div>
          </button>
          <button class="prof-setting-row danger" onclick="Profile.confirmSignOut()">
            <div class="prof-setting-icon red">🚪</div>
            <div class="prof-setting-text">
              <div class="prof-setting-label">Déconnexion</div>
            </div>
            <div class="prof-setting-arrow">›</div>
          </button>
        </div>
      </div>

      <div class="prof-version">FitLife IA · v2.0 · 🦁 Powered by Claude</div>
      <div class="nav-spacer"></div>
    </div>`;

    // Animations après render
    setTimeout(() => {
      // XP bar
      document.getElementById('xp-bar-fill').style.width = gaugePct + '%';
      // Compteurs stats animés
      _animCounter('stat-streak',   0, STATE.streakDays    || 0, 800);
      _animCounter('stat-sessions', 0, STATE.totalSessions || 0, 900);
      _animCounter('stat-time',     0, STATE.totalMinutes  || 0, 950);
      _animCounter('stat-kcal',     0, STATE.totalKcal     || 0, 1000);
    }, 80);
  }

  /* ══════════════════════════════════════════════════════
     4. BUILDERS HTML
  ══════════════════════════════════════════════════════ */

  function _buildWeekChart() {
    const days     = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const today    = new Date();
    const jsDay    = today.getDay(); // 0=dim
    const todayIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=lun

    // Récupère les séances de la semaine depuis completedDays
    const week = STATE.currentWeek || 1;
    const sessData = Array(7).fill(0);

    // Simule les séances à partir des jours complétés
    (STATE.completedDays || new Set()).forEach(key => {
      const match = key.match(/^w(\d+)_d(\d+)$/);
      if (match) {
        const w = parseInt(match[1]);
        const d = parseInt(match[2]);
        if (w === week) {
          const idx = d - 1; // d est 1-7 (lun-dim)
          if (idx >= 0 && idx < 7) sessData[idx] = 1;
        }
      }
    });

    const maxVal  = 1;
    const done    = sessData.filter(Boolean).length;

    const bars = days.map((day, i) => {
      const val     = sessData[i];
      const isToday = i === todayIdx;
      const barH    = val > 0 ? 90 : 12;
      const cls     = isToday && val > 0 ? 'today' : val > 0 ? 'active' : '';
      return `
      <div class="prof-chart-bar-wrap">
        <div class="prof-chart-bar ${cls}" style="height:${barH}%"></div>
        <div class="prof-chart-day${isToday ? ' today' : ''}">${day}</div>
      </div>`;
    }).join('');

    return `
    <div class="prof-chart-bars">${bars}</div>
    <div class="prof-chart-total">
      <span>${done}</span>/${STATE.profile.days || 3} séances cette semaine
    </div>`;
  }

  function _buildBadgeCard(badge) {
    const cls = badge.unlocked ? '' : 'locked';
    return `
    <div class="prof-badge-card ${cls}" onclick="Profile.showBadgeDetail('${badge.id}')">
      <div class="prof-badge-icon">${badge.unlocked ? badge.icon : '🔒'}</div>
      <div class="prof-badge-name">${badge.name}</div>
      ${badge.unlocked ? `<div class="prof-badge-pts">+${badge.pts}</div>` : ''}
    </div>`;
  }

  function _buildProgramCard() {
    if (!STATE.currentProgram) {
      return `
      <div class="prof-no-prog">
        <div class="prof-no-prog-icon">🏋️</div>
        <div class="prof-no-prog-text">Tu n'as pas encore de programme.<br>Réponds au questionnaire IA pour en obtenir un !</div>
        <button class="prof-no-prog-btn" onclick="navigate('programme');setTimeout(()=>{Prog.init();Prog.render();},50)">
          Créer mon programme
        </button>
      </div>`;
    }

    const prog   = STATE.currentProgram;
    const goalL  = { poids:'🔥 Perte de poids', muscle:'💪 Prise de muscle', cardio:'❤️ Cardio', mobilite:'🧘 Mobilité' };
    const levelL = { debutant:'Débutant', intermediaire:'Intermédiaire', avance:'Avancé' };
    const week   = STATE.currentWeek || 1;
    const total  = prog.totalWeeks || 12;

    return `
    <div class="prof-prog-card" onclick="navigate('programme');setTimeout(()=>{Prog.init();Prog.render();},50)">
      <div class="prof-prog-icon">🦁</div>
      <div class="prof-prog-info">
        <div class="prof-prog-name">${goalL[prog.goal] || 'Mon Programme'}</div>
        <div class="prof-prog-meta">${levelL[prog.level] || ''} · ${prog.sessionDays || 3}j/sem · ${prog.sessionTime || 45} min</div>
      </div>
      <div class="prof-prog-week">
        <div class="prof-prog-week-num">S${week}</div>
        <div class="prof-prog-week-lbl">/ ${total}</div>
      </div>
    </div>`;
  }

  function _buildHistoryItem(h) {
    const d    = new Date(h.date || h.created_at || Date.now());
    const dateStr = d.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' });
    return `
    <div class="prof-history-item">
      <div class="prof-hist-icon">🏋️</div>
      <div class="prof-hist-info">
        <div class="prof-hist-name">${h.name || h.workout_name || 'Séance'}</div>
        <div class="prof-hist-meta">${dateStr} · ${h.duration || h.duration_min || 0} min · ${h.calories || 0} kcal</div>
      </div>
      <div class="prof-hist-xp">+${h.xp || h.xp_earned || 0} XP</div>
    </div>`;
  }

  function _buildReferralCard() {
    const code  = STATE.referralCode  || 'FITLIFE';
    const count = STATE.referralCount || 0;
    const free  = STATE.referralMonths|| 0;
    return `
    <div class="prof-ref-card">
      <div class="prof-ref-title">🎁 Parraine tes amis</div>
      <div class="prof-ref-sub">Pour chaque ami inscrit avec ton code, tu gagnes 1 mois gratuit.</div>
      <div class="prof-ref-code-wrap">
        <div class="prof-ref-code">${code}</div>
        <button class="prof-ref-copy-btn" onclick="Profile.copyCode('${code}')">Copier</button>
      </div>
      <div class="prof-ref-stats">
        <div class="prof-ref-stat">
          <div class="prof-ref-stat-val">${count}</div>
          <div class="prof-ref-stat-lbl">Amis parrainés</div>
        </div>
        <div class="prof-ref-stat">
          <div class="prof-ref-stat-val">${free}</div>
          <div class="prof-ref-stat-lbl">Mois gratuits</div>
        </div>
      </div>
    </div>`;
  }

  /* ══════════════════════════════════════════════════════
     5. BADGES — Calcul et déblocage
  ══════════════════════════════════════════════════════ */
  function _computeBadges() {
    return ALL_BADGES.map(b => ({
      ...b,
      unlocked: STATE.unlockedBadges.has(b.id) || b.condition(STATE),
    }));
  }

  function _checkBadges() {
    let newBadge = false;
    ALL_BADGES.forEach(b => {
      if (!STATE.unlockedBadges.has(b.id) && b.condition(STATE)) {
        STATE.unlockedBadges.add(b.id);
        STATE.points += b.pts;
        newBadge = true;
        setTimeout(() => {
          showToast(`🏅 Trophée débloqué : ${b.icon} ${b.name} (+${b.pts} pts) !`, 'success', 4000);
        }, 500);
      }
    });
    if (newBadge && STATE.user?.id) {
      STATE.saveLocal(STATE.user.id);
      DB.saveProfile(STATE.user.id).catch(() => {});
    }
  }

  /* ══════════════════════════════════════════════════════
     6. HISTORIQUE LOCAL
  ══════════════════════════════════════════════════════ */
  function _getLocalHistory() {
    try {
      const raw = localStorage.getItem('fitlife-workout-history');
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    // Fallback : reconstituer depuis STATE.historyData
    return STATE.historyData || [];
  }

  /* ══════════════════════════════════════════════════════
     7. SHEETS / MODALS
  ══════════════════════════════════════════════════════ */

  /* ── MODIFIER LE PROFIL ── */
  function openEdit() {
    const user = STATE.user || {};
    _openSheet(`
      <div class="prof-sheet-title">✏️ Modifier mon profil</div>
      <div class="prof-edit-field">
        <div class="prof-edit-label">Prénom</div>
        <input class="prof-edit-input" id="edit-firstname" type="text"
          value="${user.firstName || ''}" placeholder="Ton prénom" autocomplete="given-name">
      </div>
      <div class="prof-edit-field">
        <div class="prof-edit-label">Nom</div>
        <input class="prof-edit-input" id="edit-lastname" type="text"
          value="${user.lastName || ''}" placeholder="Ton nom" autocomplete="family-name">
      </div>
      <div class="prof-sheet-btn-row">
        <button class="prof-sheet-btn-cancel" onclick="Profile.closeSheet()">Annuler</button>
        <button class="prof-sheet-btn-save"   onclick="Profile.saveEdit()">💾 Sauvegarder</button>
      </div>
    `);
    setTimeout(() => document.getElementById('edit-firstname')?.focus(), 200);
  }

  function saveEdit() {
    const fn = document.getElementById('edit-firstname')?.value?.trim() || '';
    const ln = document.getElementById('edit-lastname')?.value?.trim()  || '';

    if (fn.length < 2) { showToast('Prénom trop court (min. 2 caractères)', 'error'); return; }

    STATE.user = STATE.user || {};
    STATE.user.firstName = fn;
    STATE.user.lastName  = ln;
    STATE.user.initials  = ((fn[0]||'') + (ln[0]||'')).toUpperCase() || '?';

    // Sauvegarder en DB
    if (STATE.user.id) {
      DB.upsert('profiles', {
        id: STATE.user.id,
        first_name: fn,
        last_name:  ln,
      }).catch(() => {});
    }

    closeSheet();
    showToast('✅ Profil mis à jour !', 'success');
    render(); // Refresh
  }

  /* ── THÈME ── */
  function openTheme() {
    const opts = [
      { val:'auto',  icon:'🌗', label:'Automatique' },
      { val:'light', icon:'☀️', label:'Clair' },
      { val:'dark',  icon:'🌙', label:'Sombre' },
    ];
    _openSheet(`
      <div class="prof-sheet-title">🎨 Thème de l'app</div>
      <div class="prof-theme-options">
        ${opts.map(o => `
        <button class="prof-theme-opt${STATE.theme===o.val?' active':''}"
                onclick="Profile.setTheme('${o.val}')">
          <span class="prof-theme-opt-icon">${o.icon}</span>
          <span class="prof-theme-opt-label">${o.label}</span>
        </button>`).join('')}
      </div>
      <button class="prof-sheet-btn-cancel" style="width:100%" onclick="Profile.closeSheet()">Fermer</button>
    `);
  }

  function setTheme(mode) {
    STATE.theme = mode;
    STATE.saveTheme();
    applyTheme(mode);
    // Met à jour le label dans les paramètres
    const sub = document.getElementById('theme-sub-label');
    if (sub) sub.textContent = _getThemeLabel();
    // Met à jour les boutons dans la sheet
    document.querySelectorAll('.prof-theme-opt').forEach(b => {
      b.classList.toggle('active', b.textContent.includes(_getThemeIcon(mode)));
    });
    showToast(`Thème : ${_getThemeLabel()}`, 'default');
  }

  function _getThemeLabel() {
    return { auto:'🌗 Automatique', light:'☀️ Clair', dark:'🌙 Sombre' }[STATE.theme] || '🌗 Automatique';
  }

  function _getThemeIcon(mode) {
    return { auto:'🌗', light:'☀️', dark:'🌙' }[mode] || '🌗';
  }

  /* ── TOUS LES BADGES ── */
  function openBadgesSheet() {
    const badges = _computeBadges();
    const unlocked = badges.filter(b => b.unlocked);
    const locked   = badges.filter(b => !b.unlocked);

    _openSheet(`
      <div class="prof-sheet-title">🏅 Trophées · ${unlocked.length}/${badges.length}</div>
      ${unlocked.length > 0 ? `
      <div class="prof-section-title" style="margin-bottom:10px">Débloqués</div>
      ${unlocked.map(b => _buildBadgeDetailRow(b, true)).join('')}` : ''}
      ${locked.length > 0 ? `
      <div class="prof-section-title" style="margin:16px 0 10px">À débloquer</div>
      ${locked.map(b => _buildBadgeDetailRow(b, false)).join('')}` : ''}
      <div style="height:16px"></div>
    `);
  }

  function _buildBadgeDetailRow(b, unlocked) {
    return `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:28px;width:40px;text-align:center;flex-shrink:0;${unlocked?'':'filter:grayscale(1);opacity:0.4'}">
        ${unlocked ? b.icon : '🔒'}
      </div>
      <div style="flex:1">
        <div style="font-family:'Sora',sans-serif;font-weight:700;font-size:13px;color:var(--text)">${b.name}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${b.desc}</div>
      </div>
      <div style="font-size:12px;font-weight:700;color:${unlocked?'var(--orange)':'var(--muted)'}">${unlocked ? '+'+b.pts+' pts' : '?'}</div>
    </div>`;
  }

  function showBadgeDetail(id) {
    const badge = ALL_BADGES.find(b => b.id === id);
    if (!badge) return;
    const unlocked = STATE.unlockedBadges.has(badge.id) || badge.condition(STATE);
    showToast(unlocked ? `${badge.icon} ${badge.name} · ${badge.desc}` : `🔒 ${badge.desc}`, 'default', 3500);
  }

  /* ── PARRAINAGE ── */
  function openReferral() {
    _openSheet(`
      <div class="prof-sheet-title">🎁 Parrainage</div>
      ${_buildReferralCard()}
      <div style="height:8px"></div>
      <button class="prof-sheet-btn-save" style="width:100%" onclick="Profile.shareCode()">
        📤 Partager mon code
      </button>
      <button class="prof-sheet-btn-cancel" style="width:100%;margin-top:10px" onclick="Profile.closeSheet()">
        Fermer
      </button>
    `);
  }

  function copyCode(code) {
    navigator.clipboard?.writeText(code).then(() => {
      showToast(`Code ${code} copié ! 🎉`, 'success');
    }).catch(() => {
      showToast(`Ton code : ${code}`, 'default');
    });
  }

  function shareCode() {
    const code = STATE.referralCode || 'FITLIFE';
    const url  = 'https://kdbusinessfr-sys.github.io/fitlife';
    const text = `🦁 Rejoins FitLife IA avec mon code ${code} et obtiens ton programme fitness IA personnalisé ! ${url}`;
    if (navigator.share) {
      navigator.share({ title:'FitLife IA', text, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      showToast('Lien copié ! Partage-le 🎁', 'accent');
    }
    closeSheet();
  }

  /* ── PARAMÈTRES GÉNÉRAUX ── */
  function openSettings() {
    _openSheet(`
      <div class="prof-sheet-title">⚙️ Paramètres</div>
      <div class="prof-settings-list" style="border-radius:var(--r-md)">
        <button class="prof-setting-row" onclick="Profile.closeSheet();Profile.openEdit()">
          <div class="prof-setting-icon orange">👤</div>
          <div class="prof-setting-text"><div class="prof-setting-label">Modifier mon profil</div></div>
          <div class="prof-setting-arrow">›</div>
        </button>
        <button class="prof-setting-row" onclick="Profile.closeSheet();Profile.openTheme()">
          <div class="prof-setting-icon blue">🎨</div>
          <div class="prof-setting-text"><div class="prof-setting-label">Thème de l'app</div><div class="prof-setting-sub">${_getThemeLabel()}</div></div>
          <div class="prof-setting-arrow">›</div>
        </button>
        <button class="prof-setting-row" onclick="Profile.closeSheet();Profile.openReferral()">
          <div class="prof-setting-icon green">🎁</div>
          <div class="prof-setting-text"><div class="prof-setting-label">Parrainage</div></div>
          <div class="prof-setting-arrow">›</div>
        </button>
        <button class="prof-setting-row danger" onclick="Profile.closeSheet();setTimeout(Profile.confirmSignOut,100)">
          <div class="prof-setting-icon red">🚪</div>
          <div class="prof-setting-text"><div class="prof-setting-label">Déconnexion</div></div>
          <div class="prof-setting-arrow">›</div>
        </button>
      </div>
      <button class="prof-sheet-btn-cancel" style="width:100%;margin-top:14px" onclick="Profile.closeSheet()">Fermer</button>
    `);
  }

  /* ── DÉCONNEXION ── */
  function confirmSignOut() {
    _openSheet(`
      <div class="prof-sheet-title">🚪 Déconnexion</div>
      <p style="font-size:14px;color:var(--text2);line-height:1.6;margin-bottom:20px">
        Tu vas être déconnecté. Tes données sont sauvegardées et tu pourras te reconnecter à tout moment.
      </p>
      <button class="prof-sheet-btn-save" style="width:100%;background:var(--red);box-shadow:none"
              onclick="Profile.closeSheet();signOut()">
        Confirmer la déconnexion
      </button>
      <button class="prof-sheet-btn-cancel" style="width:100%;margin-top:10px" onclick="Profile.closeSheet()">
        Annuler
      </button>
    `);
  }

  /* ══════════════════════════════════════════════════════
     8. SHEET ENGINE (bottom sheet générique)
  ══════════════════════════════════════════════════════ */
  function _openSheet(html) {
    closeSheet(); // ferme si déjà ouverte

    const overlay = document.createElement('div');
    overlay.className = 'prof-sheet-overlay';
    overlay.id        = 'prof-sheet-overlay';
    overlay.onclick   = (e) => { if (e.target === overlay) closeSheet(); };

    const sheet = document.createElement('div');
    sheet.className = 'prof-sheet';
    sheet.id        = 'prof-sheet';
    sheet.innerHTML = `<div class="prof-sheet-handle"></div>${html}`;

    overlay.appendChild(sheet);
    document.getElementById('app')?.appendChild(overlay) || document.body.appendChild(overlay);
  }

  function closeSheet() {
    document.getElementById('prof-sheet-overlay')?.remove();
  }

  /* ══════════════════════════════════════════════════════
     9. UTILITAIRES
  ══════════════════════════════════════════════════════ */
  function _animCounter(id, from, to, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = performance.now();
    function step(now) {
      const t   = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      el.textContent = fmtNumber(val);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return {
    init,
    render,
    openEdit,
    saveEdit,
    openTheme,
    setTheme,
    openBadgesSheet,
    showBadgeDetail,
    openReferral,
    copyCode,
    shareCode,
    openSettings,
    confirmSignOut,
    closeSheet,
  };

})();
