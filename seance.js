/* ═══════════════════════════════════════════════════════
   FITLIFE IA — SÉANCE JS
   Moteur de séance fullscreen :
   • Vue overview (liste des exercices + mode auto/manuel)
   • Vue exercice actif (séries, reps, timer)
   • Overlay repos avec countdown SVG
   • Modal pause
   • Écran fin de séance + XP + résumé
═══════════════════════════════════════════════════════ */

const Seance = (() => {

  /* ─────────────────────────────────────────
     ÉTAT DE LA SÉANCE
  ───────────────────────────────────────── */
  let _state = null;

  function freshState(plan) {
    return {
      plan,                         // plan du jour (de AI.getTodayPlan)
      exercises: plan.exercises || [],
      mode:      'manuel',          // 'manuel' | 'auto'
      phase:     'overview',        // 'overview' | 'active' | 'repos' | 'pause' | 'finish'

      exoIdx:    0,                 // index exercice courant
      setIdx:    0,                 // index série courante (0-based)
      setsLog:   [],                // [{exoIdx, setIdx, done: true, reps}]

      timerInterval: null,
      timerSec:  0,                 // secondes restantes (repos ou reps auto)
      timerMax:  0,

      startTime: null,              // Date.now() au démarrage
      pausedMs:  0,                 // ms totaux en pause
      pauseStart: null,

      totalSetsCompleted: 0,
    };
  }

  /* ─────────────────────────────────────────
     INSTRUCTIONS DÉTAILLÉES PAR EXERCICE
     (affiché dans la zone conseil)
  ───────────────────────────────────────── */
  const INSTRUCTIONS = {
    dc:  'Allonge-toi sur le banc. Barre à la largeur des épaules. Descends jusqu\'à frôler la poitrine, pousse à fond. Garde les pieds à plat.',
    pm:  'Mains légèrement plus larges que les épaules. Corps droit comme une planche. Descends la poitrine jusqu\'au sol. Souffle à la montée.',
    pkg: 'Même technique que les pompes classiques, genoux à terre. Idéal pour débuter. Corps droit de la tête aux genoux.',
    di:  'Banc incliné à 30-45°. Haltères au niveau des épaules. Pousse vers le haut et légèrement vers l\'intérieur. Contrôle la descente.',
    tr:  'Prise pronation, mains larges. Corps tendu, pas de balancement. Tire jusqu\'à ce que le menton dépasse la barre. Descente lente.',
    tp:  'Assis, dos droit. Tire la barre jusqu\'au menton. Omoplate serrées en bas. Remonte lentement.',
    rh:  'Genou et main sur le banc. Dos parallèle au sol. Tire le coude vers le plafond. Garde l\'épaule stable.',
    cb:  'Debout, coudes collés au corps. Curl lent vers le haut, serrage du biceps en haut. Descente contrôlée.',
    cm:  'Comme le curl mais poignets neutres (prise marteau). Cible le long chef du biceps et l\'avant-bras.',
    dp:  'Mains sur barres parallèles. Corps légèrement penché en avant. Descends jusqu\'à 90° aux coudes. Pousse fort pour remonter.',
    et:  'Câble à la poulie haute. Coudes fixes, déplie les avant-bras vers le bas. Serre les triceps en bas.',
    pe:  'Debout ou assis, haltères à hauteur d\'épaules. Pousse vers le haut sans verrouiller les coudes. Ramène lentement.',
    lr:  'Bras légèrement fléchis. Élève les haltères sur les côtés jusqu\'à hauteur d\'épaule. Descente lente en 3 sec.',
    fp:  'Poulie à hauteur de visage. Tire vers ton visage, coudes à hauteur d\'épaule. Serre les muscles dorsaux de l\'épaule.',
    sq:  'Pieds largeur d\'épaule, orteils légèrement sortis. Descends comme pour t\'asseoir. Genoux dans l\'axe des pieds. Dos droit.',
    sg:  'Haltère tenu à deux mains, vertical. Descends en gardant le dos droit et la poitrine haute. Genoux derrière les orteils.',
    sc:  'Dos contre le mur, genoux à 90°. Retiens la position. Contrôle la respiration. Excellent pour les quadriceps.',
    fn:  'Grand pas en avant. Genou avant à 90°, genou arrière proche du sol. Reste droit. Alterne les jambes.',
    lp:  'Dos bien calé. Pieds à largeur de hanche. Pousse avec les talons. Ne verrouille pas les genoux en haut.',
    rdl: 'Barre devant les cuisses. Penche-toi en gardant le dos droit. Ischios qui s\'étirent. Remonte en contractant les fessiers.',
    pf:  'Allongé, pieds à plat. Pousse les hanches vers le plafond. Serre les fessiers en haut. Descente lente.',
    ht:  'Épaules sur le banc, barre sur les hanches. Pousse les hanches vers le haut. Serre fort les fessiers en haut.',
    md:  'Debout sur les orteils. Monte le plus haut possible. Descends lentement sous le niveau neutre. Amplitude maximale.',
    mr:  'Marche à rythme soutenu, bras actifs. Respiration nasale si possible. Maintiens la cadence pendant toute la durée.',
    vd:  'Résistance modérée. Pédalage fluide, pas saccadé. Cadence 70-90 rpm idéalement. Reste hydraté.',
    cs:  'Pieds ensemble. Saute à tempo régulier. Si tu perds le rythme, pose la corde et reprends. Qualité > vitesse.',
    jj:  'Pieds ensemble. Saute en écartant les bras et les jambes simultanément. Atterris en douceur sur l\'avant-pied.',
    hs:  'Sprint maximal 20 secondes. Récupération passive 40 secondes. Effort total à chaque sprint. Bras actifs.',
    sm:  'Montée du step complet. Talon bien posé. Dos droit. Alterne le pied leader toutes les 30 sec.',
    rm:  'Tire en arrière avec les jambes ET les bras. Corps en légère inclinaison arrière. Retour lent, dos droit.',
    el:  'Prise normale. Amplitude complète des jambes. Corps droit, pas de balancement. Cardio modéré et continu.',
    pl:  'Corps droit de la tête aux talons. Abdos et fessiers contractés. Ne laisse pas les hanches tomber ni monter.',
    plg: 'Même technique que la planche classique, genoux à terre. Corps droit de la tête aux genoux. Respiration régulière.',
    cr:  'Allongé, genoux fléchis. Enroule le dos doucement. Regarde vers le plafond, pas ton nombril. Descente lente.',
    mc:  'Position de pompe. Ramène les genoux vers la poitrine en alternant rapidement. Hanches stables.',
    rt:  'Assis, dos incliné à 45°. Tourne le buste de côté en contrôle. Garde les abdos sous tension tout au long.',
    db:  'Allongé, bras et jambes tendus. Abaisse le bras gauche et la jambe droite simultanément. Dos ne doit pas décoller.',
    gl:  'De côté, coude sous l\'épaule. Corps aligné. Hanche bien levée. Ne laisse pas tomber le bassin.',
    ei:  'Jambe tendue devant soi. Incline le buste en avant, dos droit. Ressens l\'étirement à l\'arrière de la cuisse.',
    eq:  'Debout, attrape ta cheville derrière toi. Genoux joints. Pousse doucement la hanche vers l\'avant.',
    ee:  'Bras en croix, tire un bras vers toi avec l\'autre. Ressens l\'étirement dans l\'épaule arrière.',
    roh: 'Allongé sur le dos, genou à 90°. Fais des cercles lents avec le genou. Amplitude maximale sans douleur.',
    cv:  'À quatre pattes. Inspires : creuse le dos (vache). Expires : arrondis le dos (chat). Mouvements lents et fluides.',
    yss: 'Enchaîne les postures de façon fluide. Synchronise chaque mouvement avec ta respiration. Sans précipitation.',
    frd: 'Allongé sur le foam roller, sous le dos. Roule lentement du bas jusqu\'aux omoplates. Pause sur les zones tendues.',
    frc: 'Assis sur le foam roller, sous les cuisses. Roule lentement. Pause sur les zones douloureuses 20-30 sec.',
    r478:'Inspire 4 sec par le nez. Retiens 7 sec. Expire lentement 8 sec par la bouche. Calme le système nerveux.',
    mdo: 'Marche à rythme confortable. Bras détendus. Respirez librement. Objectif : récupération active, pas performance.',
  };

  /* ─────────────────────────────────────────
     INIT + RENDER PRINCIPAL
  ───────────────────────────────────────── */
  function init(plan) {
    _state = freshState(plan);
    render();
  }

  function render() {
    const container = document.getElementById('seance-content');
    if (!container || !_state) return;

    clearTimer();

    switch (_state.phase) {
      case 'overview': renderOverview(container); break;
      case 'active':   renderActive(container);   break;
      case 'repos':    renderActive(container); showRepos(); break;
      case 'finish':   renderFinish(container);   break;
      default:         renderOverview(container);
    }
  }

  /* ─────────────────────────────────────────
     PHASE 0 : OVERVIEW
  ───────────────────────────────────────── */
  function renderOverview(container) {
    const exos = _state.exercises;
    const totalSets = exos.reduce((s, e) => s + (e.sets || 3), 0);
    const totalDuration = _state.plan.duration || Math.round(exos.length * 8);

    container.innerHTML = `
    <div class="seance-overview">
      <div class="seance-overview-header">
        <div class="seance-header-top">
          <button class="btn-close-seance" onclick="Seance.close()">✕</button>
          <div class="seance-overview-title">${_state.plan.label || 'Séance du jour'}</div>
        </div>
        <div class="seance-overview-meta">
          <div class="seance-meta-pill">⏱️ ~${totalDuration} min</div>
          <div class="seance-meta-pill">💪 ${exos.length} exercices</div>
          <div class="seance-meta-pill">🔄 ${totalSets} séries</div>
        </div>
        <div class="seance-mode-switch">
          <button class="mode-btn ${_state.mode === 'manuel' ? 'active' : ''}"
                  onclick="Seance.setMode('manuel')">⚡ Manuel</button>
          <button class="mode-btn ${_state.mode === 'auto' ? 'active' : ''}"
                  onclick="Seance.setMode('auto')">⏱️ Automatique</button>
        </div>
      </div>

      <div class="seance-exo-list">
        ${exos.map((e, i) => `
        <div class="seance-exo-card">
          <div class="seance-exo-num">${i + 1}</div>
          <div class="seance-exo-body">
            <div class="seance-exo-nom">${e.nom}</div>
            <div class="seance-exo-detail">${e.sets} séries × ${e.reps} · Repos ${Math.round(e.repos || 60)}s · ${(e.muscles || []).slice(0,2).join(', ')}</div>
          </div>
          <div class="seance-exo-icon-big">${e.icon || '💪'}</div>
        </div>`).join('')}
      </div>

      <div class="seance-overview-cta">
        <button class="btn-start-seance" onclick="Seance.start()">
          <span>▶</span>
          Commencer la séance
        </button>
      </div>
    </div>`;
  }

  /* ─────────────────────────────────────────
     PHASE 1 : EXERCICE ACTIF
  ───────────────────────────────────────── */
  function renderActive(container) {
    const exos = _state.exercises;
    const exo = exos[_state.exoIdx];
    if (!exo) { finishWorkout(); return; }

    const totalExos = exos.length;
    const progress = Math.round((_state.exoIdx / totalExos) * 100);
    const totalSets = exo.sets || 3;
    const currentSet = _state.setIdx + 1;
    const instruction = INSTRUCTIONS[exo.id] || `Effectue ${exo.reps} répétitions avec une technique propre. Respiration régulière.`;
    const isAuto = _state.mode === 'auto';
    const isTimedRep = String(exo.reps).includes('min') || String(exo.reps).includes('s');

    container.innerHTML = `
    <!-- Barre progression globale -->
    <div class="seance-global-progress">
      <div class="seance-global-fill" id="global-fill" style="width:${progress}%"></div>
    </div>

    <div class="seance-active">
      <!-- Header -->
      <div class="seance-active-header">
        <div class="seance-active-counter">Exercice ${_state.exoIdx + 1}/${totalExos}</div>
        <div class="seance-active-label">${exo.nom.split(' ').slice(0,3).join(' ')}</div>
        <button class="btn-seance-pause" onclick="Seance.pause()">⏸ Pause</button>
      </div>

      <!-- Zone principale (scrollable) -->
      <div class="seance-main">

        <!-- Illustration animée -->
        <div class="seance-exo-visual animating">
          <div class="seance-exo-emoji">${exo.icon || '💪'}</div>
        </div>

        <!-- Nom + muscles -->
        <div class="seance-exo-name">${exo.nom}</div>
        <div class="seance-exo-muscles">${(exo.muscles || []).join(' · ')}</div>

        <!-- Instruction -->
        <div class="seance-exo-instruction">
          <div class="seance-instruction-title">📋 Technique</div>
          <div class="seance-instruction-text">${instruction}</div>
        </div>

        <!-- MODE AUTO : timer circulaire -->
        ${isAuto ? `
        <div class="seance-auto-timer" id="auto-timer">
          <div class="seance-timer-ring">
            <svg class="seance-timer-svg" viewBox="0 0 100 100">
              <circle class="seance-timer-track" cx="50" cy="50" r="42"/>
              <circle class="seance-timer-fill" id="timer-fill" cx="50" cy="50" r="42"
                stroke-dasharray="${2 * Math.PI * 42}"
                stroke-dashoffset="0"/>
            </svg>
            <div class="seance-timer-center">
              <div class="seance-timer-value" id="timer-val">—</div>
              <div class="seance-timer-label">${isTimedRep ? 'sec restantes' : 'rép restantes'}</div>
            </div>
          </div>
        </div>` : `
        <!-- MODE MANUEL : grand affichage reps -->
        <div class="seance-auto-timer">
          <div class="seance-reps-display">${exo.reps}</div>
          <div class="seance-reps-unit">répétitions</div>
        </div>`}

        <!-- Tracker de séries -->
        <div class="seance-sets-tracker">
          <div class="seance-sets-title">Séries — ${currentSet} / ${totalSets}</div>
          <div class="seance-sets-row" id="sets-row">
            ${Array.from({length: totalSets}, (_, i) => {
              const isDone = i < _state.setIdx;
              const isActive = i === _state.setIdx;
              return `<div class="seance-set-bubble ${isDone?'done':isActive?'active':''}" 
                           id="set-bubble-${i}" onclick="Seance.clickSet(${i})">
                ${isDone ? '<span class="set-check">✓</span>' : `<span class="set-num">Série ${i+1}</span>`}
              </div>`;
            }).join('')}
          </div>
          <div class="seance-set-repos">Repos après chaque série : ${Math.round(exo.repos || 60)} sec</div>
        </div>

      </div>

      <!-- Contrôles bas -->
      <div class="seance-controls">
        <button class="btn-serie-done" id="btn-serie-done" onclick="Seance.completeSet()">
          ${currentSet < totalSets ? `✅ Série ${currentSet} terminée !` : '🏁 Dernier effort — Finir !'}
        </button>
        <div class="seance-btn-row">
          <button class="btn-seance-sec btn-seance-skip" onclick="Seance.skipExo()">⏭ Passer l'exercice</button>
          <button class="btn-seance-sec" onclick="Seance.prevExo()">← Précédent</button>
        </div>
      </div>
    </div>`;

    // Démarre le timer auto si mode auto et exercice temporel
    if (isAuto && isTimedRep) {
      const sec = parseTimedRep(exo.reps);
      startAutoTimer(sec);
    }
  }

  /* ─────────────────────────────────────────
     TIMER AUTO (mode auto, reps temporelles)
  ───────────────────────────────────────── */
  function parseTimedRep(reps) {
    const str = String(reps);
    if (str.includes('min')) return parseInt(str) * 60;
    if (str.includes('s'))   return parseInt(str);
    return 30;
  }

  function startAutoTimer(seconds) {
    _state.timerSec = seconds;
    _state.timerMax = seconds;
    updateTimerUI();

    _state.timerInterval = setInterval(() => {
      _state.timerSec--;
      updateTimerUI();
      if (_state.timerSec <= 0) {
        clearTimer();
        vibrate([100, 50, 200]);
        completeSet();
      }
    }, 1000);
  }

  function updateTimerUI() {
    const val = document.getElementById('timer-val');
    const fill = document.getElementById('timer-fill');
    if (!val || !fill) return;

    val.textContent = _state.timerSec;
    const circumference = 2 * Math.PI * 42;
    const ratio = _state.timerSec / _state.timerMax;
    fill.style.strokeDashoffset = circumference * (1 - ratio);

    // Couleur rouge si < 5 sec
    fill.style.stroke = _state.timerSec <= 5 ? 'var(--red)' : 'var(--orange)';
  }

  /* ─────────────────────────────────────────
     ACTIONS SÉANCE
  ───────────────────────────────────────── */
  function start() {
    _state.phase = 'active';
    _state.exoIdx = 0;
    _state.setIdx = 0;
    _state.startTime = Date.now();
    render();
  }

  function setMode(mode) {
    _state.mode = mode;
    // Re-render overview si on est encore en overview
    if (_state.phase === 'overview') render();
  }

  function completeSet() {
    clearTimer();
    const exo = _state.exercises[_state.exoIdx];
    const totalSets = exo?.sets || 3;

    // Log la série
    _state.setsLog.push({ exoIdx: _state.exoIdx, setIdx: _state.setIdx, done: true });
    _state.totalSetsCompleted++;

    vibrate([60]);

    if (_state.setIdx < totalSets - 1) {
      // Il reste des séries → lancer le repos
      _state.setIdx++;
      const reposTime = Math.round(exo.repos || 60);
      showRepos(reposTime);
    } else {
      // Toutes les séries terminées → exercice suivant
      nextExo();
    }
  }

  function clickSet(idx) {
    // Mode manuel : permet de cliquer directement sur une série pour la cocher
    if (idx === _state.setIdx) {
      completeSet();
    } else if (idx < _state.setIdx) {
      // Revenir en arrière
      _state.setIdx = idx;
      render();
    }
  }

  function nextExo() {
    clearTimer();
    _state.exoIdx++;
    _state.setIdx = 0;
    if (_state.exoIdx >= _state.exercises.length) {
      finishWorkout();
    } else {
      _state.phase = 'active';
      // Repos entre exercices (60s fixe)
      showRepos(60, true);
    }
  }

  function prevExo() {
    if (_state.exoIdx > 0) {
      clearTimer();
      _state.exoIdx--;
      _state.setIdx = 0;
      _state.phase = 'active';
      render();
    }
  }

  function skipExo() {
    nextExo();
  }

  /* ─────────────────────────────────────────
     OVERLAY REPOS
  ───────────────────────────────────────── */
  function showRepos(seconds, betweenExos = false) {
    _state.phase = 'repos';
    const exo = _state.exercises[_state.exoIdx];
    const reposSec = seconds || Math.round(exo?.repos || 60);
    const nextExoName = betweenExos
      ? (_state.exercises[_state.exoIdx]?.nom || 'Prochain exercice')
      : exo?.nom || '';

    // Supprime overlay existant
    document.getElementById('repos-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'seance-repos-overlay';
    overlay.id = 'repos-overlay';
    overlay.innerHTML = `
    <div class="repos-title">😮‍💨 Repos</div>
    <div class="repos-subtitle">${betweenExos ? 'Prépare-toi pour l\'exercice suivant' : `Série ${_state.setIdx} terminée ! Récupère.`}</div>

    <div class="repos-ring">
      <svg class="repos-ring-svg" viewBox="0 0 100 100">
        <circle class="repos-ring-track" cx="50" cy="50" r="42"/>
        <circle class="repos-ring-fill" id="repos-fill" cx="50" cy="50" r="42"
          stroke-dasharray="${2 * Math.PI * 42}"
          stroke-dashoffset="0"/>
      </svg>
      <div class="repos-center">
        <div class="repos-countdown" id="repos-countdown">${reposSec}</div>
        <div class="repos-unit">sec</div>
      </div>
    </div>

    <div class="repos-next-label">Prochain :</div>
    <div class="repos-next-name">${nextExoName}</div>

    <button class="btn-skip-repos" onclick="Seance.skipRepos()">Passer le repos →</button>`;

    document.getElementById('screen-seance').appendChild(overlay);

    // Countdown
    let remaining = reposSec;
    const circumference = 2 * Math.PI * 42;

    _state.timerInterval = setInterval(() => {
      remaining--;
      const el = document.getElementById('repos-countdown');
      const fillEl = document.getElementById('repos-fill');
      if (el) el.textContent = remaining;
      if (fillEl) fillEl.style.strokeDashoffset = circumference * (1 - remaining / reposSec);

      if (remaining <= 3) vibrate([30]);

      if (remaining <= 0) {
        clearTimer();
        vibrate([100, 80, 200]);
        skipRepos();
      }
    }, 1000);
  }

  function skipRepos() {
    clearTimer();
    document.getElementById('repos-overlay')?.remove();
    _state.phase = 'active';
    render();
  }

  /* ─────────────────────────────────────────
     PAUSE
  ───────────────────────────────────────── */
  function pause() {
    clearTimer();
    document.getElementById('repos-overlay')?.remove();
    _state.pauseStart = Date.now();
    _state.phase = 'pause';

    const elapsed = _state.startTime ? Math.round((Date.now() - _state.startTime - _state.pausedMs) / 1000) : 0;
    const mm = String(Math.floor(elapsed / 60)).padStart(2,'0');
    const ss = String(elapsed % 60).padStart(2,'0');

    const modal = document.createElement('div');
    modal.className = 'seance-pause-modal';
    modal.id = 'pause-modal';
    modal.innerHTML = `
    <div class="seance-pause-sheet">
      <div class="pause-title">⏸ Séance en pause</div>
      <div class="pause-stats">
        <div class="pause-stat">
          <span class="pause-stat-val">${_state.exoIdx + 1}/${_state.exercises.length}</span>
          <span class="pause-stat-lbl">Exercice</span>
        </div>
        <div class="pause-stat">
          <span class="pause-stat-val">${_state.totalSetsCompleted}</span>
          <span class="pause-stat-lbl">Séries faites</span>
        </div>
        <div class="pause-stat">
          <span class="pause-stat-val">${mm}:${ss}</span>
          <span class="pause-stat-lbl">Temps écoulé</span>
        </div>
      </div>
      <button class="btn-pause-action btn-resume" onclick="Seance.resume()">▶ Reprendre la séance</button>
      <button class="btn-pause-action btn-stop" onclick="Seance.finishWorkout()">🏁 Terminer maintenant</button>
      <button class="btn-pause-action btn-abandon" onclick="Seance.abandon()">✕ Abandonner la séance</button>
    </div>`;

    document.getElementById('screen-seance').appendChild(modal);
  }

  function resume() {
    document.getElementById('pause-modal')?.remove();
    if (_state.pauseStart) {
      _state.pausedMs += Date.now() - _state.pauseStart;
      _state.pauseStart = null;
    }
    _state.phase = 'active';
    render();
  }

  function abandon() {
    clearTimer();
    document.getElementById('pause-modal')?.remove();
    close();
  }

  /* ─────────────────────────────────────────
     FIN DE SÉANCE
  ───────────────────────────────────────── */
  function finishWorkout() {
    clearTimer();
    document.getElementById('repos-overlay')?.remove();
    document.getElementById('pause-modal')?.remove();
    _state.phase = 'finish';

    // Calcul durée réelle
    const durationMs = _state.startTime
      ? (Date.now() - _state.startTime - _state.pausedMs)
      : (_state.plan.duration || 30) * 60000;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));

    // XP gagnés
    const xpBase = 50;
    const xpSets = _state.totalSetsCompleted * 10;
    const xpBonus = _state.exoIdx >= _state.exercises.length ? 100 : 0; // bonus séance complète
    const xpTotal = xpBase + xpSets + xpBonus;

    // Calories estimées (formule simplifiée)
    const kcal = Math.round(durationMin * 6.5);

    // Sauvegarde STATE
    STATE.totalSessions = (STATE.totalSessions || 0) + 1;
    STATE.points        = (STATE.points || 0) + xpTotal;
    STATE.totalMinutes  = (STATE.totalMinutes || 0) + durationMin;
    STATE.totalKcal     = (STATE.totalKcal || 0) + kcal;
    STATE.sessionsThisWeek = (STATE.sessionsThisWeek || 0) + 1;

    // Marque le jour comme complété
    const week = STATE.currentWeek || 1;
    const jsDay = new Date().getDay();
    const dayIdx = jsDay === 0 ? 7 : jsDay;
    if (!STATE.completedDays) STATE.completedDays = new Set();
    STATE.completedDays.add(`w${week}_d${dayIdx}`);

    // Sauvegarde Supabase (best effort)
    if (STATE.user?.id) {
      DB.upsert('profiles', {
        id: STATE.user.id,
        total_sessions: STATE.totalSessions,
        total_points: STATE.points,
        sessions_this_week: STATE.sessionsThisWeek,
      }).catch(() => {});
      DB.insert('workout_sessions', {
        user_id: STATE.user.id,
        duration_min: durationMin,
        exercises_count: _state.exoIdx,
        sets_completed: _state.totalSetsCompleted,
        calories: kcal,
        xp_earned: xpTotal,
        workout_name: _state.plan.label || 'Séance',
        created_at: new Date().toISOString(),
      }).catch(() => {});
    }

    renderFinish(document.getElementById('seance-content'), { durationMin, kcal, xpTotal });
  }

  function renderFinish(container, stats) {
    const s = stats || {};
    const durationMin = s.durationMin || 0;
    const kcal = s.kcal || 0;
    const xpTotal = s.xpTotal || 0;
    const setsCount = _state?.totalSetsCompleted || 0;
    const exosDone = _state?.exoIdx || 0;

    const allExos = _state?.exercises || [];
    const mm = String(Math.floor(durationMin)).padStart(2, '0');

    container.innerHTML = `
    <div class="seance-finish">
      <div class="finish-confetti">🎉</div>
      <div class="finish-title">Séance terminée !<br>Bravo 🦁</div>
      <div class="finish-subtitle">Tu viens de repousser tes limites.<br>Continue comme ça !</div>

      <!-- Stats -->
      <div class="finish-stats">
        <div class="finish-stat-card">
          <span class="finish-stat-icon">⏱️</span>
          <span class="finish-stat-val">${mm} min</span>
          <span class="finish-stat-lbl">Durée</span>
        </div>
        <div class="finish-stat-card">
          <span class="finish-stat-icon">🔥</span>
          <span class="finish-stat-val">${kcal}</span>
          <span class="finish-stat-lbl">Calories</span>
        </div>
        <div class="finish-stat-card">
          <span class="finish-stat-icon">💪</span>
          <span class="finish-stat-val">${setsCount}</span>
          <span class="finish-stat-lbl">Séries</span>
        </div>
        <div class="finish-stat-card">
          <span class="finish-stat-icon">🏋️</span>
          <span class="finish-stat-val">${exosDone}</span>
          <span class="finish-stat-lbl">Exercices</span>
        </div>
      </div>

      <!-- XP banner -->
      <div class="finish-xp-banner">
        <div class="finish-xp-label">⭐ Points gagnés</div>
        <div class="finish-xp-value">+${xpTotal} XP</div>
      </div>

      <!-- Résumé exercices -->
      <div class="finish-exo-list">
        ${allExos.map((e, i) => {
          const setsLog = (_state?.setsLog || []).filter(s => s.exoIdx === i);
          const setsDone = setsLog.length;
          return `<div class="finish-exo-row">
            <span class="finish-exo-icon">${e.icon || '💪'}</span>
            <span class="finish-exo-nom">${e.nom}</span>
            <span class="finish-exo-sets-done">${setsDone}/${e.sets} séries</span>
          </div>`;
        }).join('')}
      </div>

      <button class="btn-finish-home" onclick="Seance.close()">
        🏠 Retour au programme
      </button>
    </div>`;
  }

  /* ─────────────────────────────────────────
     FERMER LA SÉANCE
  ───────────────────────────────────────── */
  function close() {
    clearTimer();
    document.getElementById('repos-overlay')?.remove();
    document.getElementById('pause-modal')?.remove();
    _state = null;
    navigate('programme');
    // Refresh le programme pour mettre à jour les jours complétés
    setTimeout(() => { Prog.init(); Prog.render(); }, 100);
  }

  /* ─────────────────────────────────────────
     UTILITAIRES
  ───────────────────────────────────────── */
  function clearTimer() {
    if (_state?.timerInterval) {
      clearInterval(_state.timerInterval);
      _state.timerInterval = null;
    }
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
  }

  /* ── PUBLIC ── */
  return {
    init, start, close,
    setMode,
    completeSet, clickSet,
    nextExo, prevExo, skipExo,
    skipRepos,
    pause, resume, abandon,
    finishWorkout,
  };

})();
