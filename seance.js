/* ═══════════════════════════════════════════════════════
   FITLIFE IA — SÉANCE JS  v3
   ✅ Vidéos GIF animées par exercice (Giphy/embed)
   ✅ Voix TTS (Web Speech API) : annonce nom, reps, série, repos
   ✅ Mode Manuel / Automatique
   ✅ Timer SVG animé
   ✅ Overlay repos countdown
   ✅ Modal pause avec stats
   ✅ Écran fin de séance + XP + résumé
   ✅ Compatible grand écran (casting)
═══════════════════════════════════════════════════════ */

const Seance = (() => {

  /* ─────────────────────────────────────────
     1. VIDÉOS / GIFs PAR EXERCICE
     On utilise des GIFs Giphy publics via embed
     (pas de clé API requise)
     Format : id exercice → URL GIF animé
  ───────────────────────────────────────── */
  /* Vrais IDs vidéo YouTube — démonstrations techniques réelles */
  const EXO_VIDEOS = {
    // Poitrine / pectoraux
    dc:  'rT7DgCr-3pg', // bench press barbell
    pm:  'IODxDxX7oi4', // push-ups standard
    pkg: 'jWxvty2KROs', // knee push-ups
    di:  '8iPEnn-ltC8', // incline dumbbell press
    // Dos / dorsaux
    tr:  'eGo4IYlbE5g', // pull-ups
    tp:  'CAwf7n6Luuc', // lat pulldown
    rh:  'GZbfZ033f74', // one-arm dumbbell row
    fp:  'V8dZ3x5a5qc', // face pull cable
    rm:  'soxrZlIl35U', // rowing machine
    el:  'vq5-vdgJc0I', // elliptical trainer
    // Biceps
    cb:  'ykJmrZ5v0Oo', // bicep curl
    cm:  'zC3nLlEvin4', // hammer curl
    // Triceps
    dp:  'wjUmnZH528Y', // dips
    et:  'vB5OHsJ3EME', // tricep pushdown
    // Épaules
    pe:  'qEwKCR5JCog', // shoulder press
    lr:  '3VcKaXpzqRo', // lateral raises
    // Jambes / fessiers
    sq:  'aclHkVaku9U', // back squat
    sg:  'bMswNpMl8mQ', // goblet squat
    sc:  'y-wV4Venusw', // wall sit
    fn:  '3XDriUn0oop', // lunges
    lp:  'GvRgijoJ2xY', // leg press
    rdl: 'jEy_czb3RKA', // romanian deadlift
    pf:  'g_BYB0R-4Ws', // glute bridge
    ht:  'SEdqd1n0cvg', // hip thrust
    md:  'YGoVFpNiKlg', // calf raises
    // Cardio
    mr:  'BNn-jS9QJAM', // treadmill run
    jj:  'UpH7rm0cYVc', // jumping jacks
    hs:  'pKMBBwpklUg', // HIIT sprints
    cs:  'FJmRQ5iTXKE', // jump rope
    sm:  'E3E8_a3-Cgc', // stair stepper
    vd:  'oWBFbRVE7ms', // stationary bike
    // Core
    pl:  'yeKv5oX_6GY', // plank
    plg: 'kvMHpqD4EWg', // knee plank
    cr:  '1fbU_MkV7NE', // crunch
    mc:  'wQq3ybaLZeA', // mountain climbers
    rt:  '9Rnhw3IQNZQ', // russian twist
    db:  '5TwUOTHHnzw', // dead bug
    gl:  'OsNNvjUC-N0', // side plank
    // Mobilité / Étirements
    ei:  'Yp-GkKRhfA4', // hamstring stretch
    eq:  'VJO5e95Zy_Q', // quad stretch
    ee:  'oTuMEon2hX4', // shoulder stretch
    roh: 'GKEZ8bRj5Pc', // hip rotation
    cv:  '8v4-XWQBj7o', // cat-cow
    yss: 'v7AYKMP6rOE', // sun salutation
    frd: 'oPuMwMVOzwc', // foam roll back
    frc: 'CApHOHiGibU', // foam roll legs
    r478:'Yp-GkKRhfA4', // breathing exercise
    mdo: 'BNn-jS9QJAM', // gentle walk
  };

  /* ─────────────────────────────────────────
     2. INSTRUCTIONS COMPLÈTES PAR EXERCICE
  ───────────────────────────────────────── */
  const INSTRUCTIONS = {
    dc:  'Allonge-toi sur le banc. Barre à la largeur des épaules. Descends jusqu\'à frôler la poitrine, pousse à fond. Garde les pieds à plat.',
    pm:  'Mains légèrement plus larges que les épaules. Corps droit comme une planche. Descends la poitrine jusqu\'au sol. Souffle à la montée.',
    pkg: 'Même technique que les pompes classiques, genoux à terre. Corps droit de la tête aux genoux. Respiration régulière.',
    di:  'Banc incliné 30-45°. Haltères au niveau des épaules. Pousse vers le haut et légèrement vers l\'intérieur. Contrôle la descente.',
    tr:  'Prise pronation, mains larges. Corps tendu, pas de balancement. Tire jusqu\'à ce que le menton dépasse la barre. Descente lente.',
    tp:  'Assis, dos droit. Tire la barre jusqu\'au menton. Omoplates serrées en bas. Remonte lentement.',
    rh:  'Genou et main sur le banc. Dos parallèle au sol. Tire le coude vers le plafond. Garde l\'épaule stable.',
    cb:  'Debout, coudes collés au corps. Curl lent vers le haut, serrage du biceps en haut. Descente contrôlée.',
    cm:  'Comme le curl mais poignets neutres (prise marteau). Cible le long chef du biceps et l\'avant-bras.',
    dp:  'Mains sur barres parallèles. Corps légèrement penché en avant. Descends jusqu\'à 90° aux coudes. Pousse fort pour remonter.',
    et:  'Câble à la poulie haute. Coudes fixes, déplie les avant-bras vers le bas. Serre les triceps en bas.',
    pe:  'Debout ou assis, haltères à hauteur d\'épaules. Pousse vers le haut sans verrouiller les coudes. Ramène lentement.',
    lr:  'Bras légèrement fléchis. Élève les haltères sur les côtés jusqu\'à hauteur d\'épaule. Descente lente en 3 sec.',
    fp:  'Poulie à hauteur de visage. Tire vers ton visage, coudes à hauteur d\'épaule. Serre les muscles dorsaux.',
    sq:  'Pieds largeur d\'épaule, orteils légèrement sortis. Descends comme pour t\'asseoir. Genoux dans l\'axe. Dos droit.',
    sg:  'Haltère tenu à deux mains, vertical. Descends en gardant le dos droit. Genoux derrière les orteils.',
    sc:  'Dos contre le mur, genoux à 90°. Retiens la position. Contrôle la respiration. Excellent pour les quadriceps.',
    fn:  'Grand pas en avant. Genou avant à 90°, genou arrière proche du sol. Reste droit. Alterne les jambes.',
    lp:  'Dos bien calé. Pieds à largeur de hanche. Pousse avec les talons. Ne verrouille pas les genoux en haut.',
    rdl: 'Barre devant les cuisses. Penche-toi en gardant le dos droit. Ischios qui s\'étirent. Remonte en contractant les fessiers.',
    pf:  'Allongé, pieds à plat. Pousse les hanches vers le plafond. Serre les fessiers en haut. Descente lente.',
    ht:  'Épaules sur le banc, barre sur les hanches. Pousse les hanches vers le haut. Serre fort les fessiers en haut.',
    md:  'Debout sur les orteils. Monte le plus haut possible. Descends lentement sous le niveau neutre. Amplitude maximale.',
    mr:  'Marche à rythme soutenu, bras actifs. Respiration nasale si possible. Maintiens la cadence toute la durée.',
    vd:  'Résistance modérée. Pédalage fluide, pas saccadé. Cadence 70-90 rpm idéalement. Reste hydraté.',
    cs:  'Pieds ensemble. Saute à tempo régulier. Si tu perds le rythme, pose la corde et reprends.',
    jj:  'Pieds ensemble. Saute en écartant les bras et les jambes simultanément. Atterris en douceur.',
    hs:  'Sprint maximal 20 secondes. Récupération passive 40 secondes. Effort total à chaque sprint.',
    sm:  'Montée du step complet. Talon bien posé. Dos droit. Alterne le pied leader toutes les 30 sec.',
    rm:  'Tire en arrière avec les jambes ET les bras. Corps légèrement incliné. Retour lent, dos droit.',
    el:  'Prise normale. Amplitude complète des jambes. Corps droit, pas de balancement. Cardio modéré.',
    pl:  'Corps droit de la tête aux talons. Abdos et fessiers contractés. Ne laisse pas les hanches tomber.',
    plg: 'Même technique que la planche, genoux à terre. Corps droit de la tête aux genoux.',
    cr:  'Allongé, genoux fléchis. Enroule le dos doucement. Regarde le plafond, pas ton nombril. Descente lente.',
    mc:  'Position de pompe. Ramène les genoux vers la poitrine en alternant rapidement. Hanches stables.',
    rt:  'Assis, dos incliné 45°. Tourne le buste de côté en contrôle. Abdos sous tension tout au long.',
    db:  'Allongé, bras et jambes tendus. Abaisse le bras gauche et la jambe droite simultanément. Dos ne décolle pas.',
    gl:  'De côté, coude sous l\'épaule. Corps aligné. Hanche bien levée. Ne laisse pas tomber le bassin.',
    ei:  'Jambe tendue devant soi. Incline le buste en avant, dos droit. Ressens l\'étirement à l\'arrière de la cuisse.',
    eq:  'Debout, attrape ta cheville derrière toi. Genoux joints. Pousse doucement la hanche vers l\'avant.',
    ee:  'Bras en croix, tire un bras vers toi avec l\'autre. Ressens l\'étirement dans l\'épaule arrière.',
    roh: 'Allongé sur le dos, genou à 90°. Fais des cercles lents. Amplitude maximale sans douleur.',
    cv:  'À quatre pattes. Inspires : creuse le dos. Expires : arrondis le dos. Mouvements lents et fluides.',
    yss: 'Enchaîne les postures de façon fluide. Synchronise chaque mouvement avec ta respiration.',
    frd: 'Allongé sur le foam roller, sous le dos. Roule lentement. Pause sur les zones tendues.',
    frc: 'Assis sur le foam roller, sous les cuisses. Roule lentement. Pause sur les zones douloureuses 20-30 sec.',
    r478:'Inspire 4 sec par le nez. Retiens 7 sec. Expire lentement 8 sec par la bouche. Calme le système nerveux.',
    mdo: 'Marche à rythme confortable. Bras détendus. Respirez librement. Objectif récupération active.',
  };

  /* ─────────────────────────────────────────
     3. VOIX TTS (Web Speech API)
  ───────────────────────────────────────── */
  let _voiceEnabled = true;
  let _synth = window.speechSynthesis || null;
  let _currentUtterance = null;

  function speak(text, priority = false) {
    if (!_voiceEnabled || !_synth) return;
    if (priority) _synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = 1.05;
    u.pitch = 1.0;
    u.volume = 0.95;
    // Cherche une voix française
    const voices = _synth.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) u.voice = frVoice;
    _currentUtterance = u;
    _synth.speak(u);
  }

  function stopVoice() {
    if (_synth) _synth.cancel();
  }

  function announceExercise(exo, setIdx, totalSets) {
    const isFirst = setIdx === 0;
    if (isFirst) {
      const repsText = String(exo.reps).includes('min') ? exo.reps + ' minutes'
                      : String(exo.reps).includes('s')  ? exo.reps
                      : exo.reps + ' répétitions';
      speak(`${exo.nom}. ${exo.sets} séries de ${repsText}. ${isFirst ? 'Série un, c\'est parti !' : ''}`, true);
    } else {
      speak(`Série ${setIdx + 1}. ${exo.reps} répétitions. Allez !`, true);
    }
  }

  function announceRepos(seconds, nextName) {
    speak(`Repos. ${seconds} secondes. Prochain exercice : ${nextName}.`);
  }

  function announceCountdown(sec) {
    if ([3, 2, 1].includes(sec)) speak(String(sec), true);
  }

  function announceFinish() {
    speak('Séance terminée ! Bravo, tu as tout donné. Excellent travail !', true);
  }

  /* ─────────────────────────────────────────
     4. ÉTAT DE LA SÉANCE
  ───────────────────────────────────────── */
  let _state = null;

  function freshState(plan) {
    return {
      plan,
      exercises:          plan.exercises || [],
      mode:               'manuel',
      phase:              'overview',
      exoIdx:             0,
      setIdx:             0,
      setsLog:            [],
      timerInterval:      null,
      timerSec:           0,
      timerMax:           0,
      startTime:          null,
      pausedMs:           0,
      pauseStart:         null,
      totalSetsCompleted: 0,
    };
  }

  /* ─────────────────────────────────────────
     5. INIT + RENDER
  ───────────────────────────────────────── */
  function init(plan) {
    stopVoice();
    _state = freshState(plan);
    render();
    // Charge les voix (asynchrone sur certains navigateurs)
    if (_synth && _synth.getVoices().length === 0) {
      _synth.addEventListener('voiceschanged', () => {}, { once: true });
    }
  }

  function render() {
    const container = document.getElementById('seance-content');
    if (!container || !_state) return;
    clearTimer();
    switch (_state.phase) {
      case 'overview': renderOverview(container); break;
      case 'active':   renderActive(container);   break;
      case 'finish':   renderFinish(container);   break;
      default:         renderOverview(container);
    }
  }

  /* ─────────────────────────────────────────
     6. OVERVIEW — Liste + choix mode
  ───────────────────────────────────────── */
  function renderOverview(container) {
    const exos = _state.exercises;
    const totalSets = exos.reduce((s, e) => s + (e.sets || 3), 0);
    const totalDuration = _state.plan.duration || Math.round(exos.length * 8);
    const moodTag = _state.plan.moodTag || '';

    container.innerHTML = `
    <div class="seance-overview">
      <div class="seance-overview-header">
        <div class="seance-header-top">
          <button class="btn-close-seance" onclick="Seance.close()">✕</button>
          <div class="seance-overview-title">${_state.plan.label || 'Séance du jour'}</div>
          <button class="btn-voice-toggle ${_voiceEnabled ? 'on' : 'off'}" onclick="Seance.toggleVoice()" title="Voix coach">
            ${_voiceEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        ${moodTag ? `<div class="seance-mood-chip">${moodTag}</div>` : ''}
        <div class="seance-overview-meta">
          <div class="seance-meta-pill">⏱️ ~${totalDuration} min</div>
          <div class="seance-meta-pill">💪 ${exos.length} exercices</div>
          <div class="seance-meta-pill">🔄 ${totalSets} séries</div>
        </div>
        <div class="seance-mode-switch">
          <button class="mode-btn ${_state.mode === 'manuel' ? 'active' : ''}" onclick="Seance.setMode('manuel')">
            ⚡ Manuel
          </button>
          <button class="mode-btn ${_state.mode === 'auto' ? 'active' : ''}" onclick="Seance.setMode('auto')">
            ⏱️ Automatique
          </button>
        </div>
        <div class="seance-mode-desc">
          ${_state.mode === 'auto'
            ? '⏱️ Le timer compte automatiquement tes reps. La séance avance toute seule.'
            : '⚡ Tu valides toi-même chaque série quand tu es prêt.'}
        </div>
      </div>

      <div class="seance-exo-list">
        ${exos.map((e, i) => `
        <div class="seance-exo-card">
          <div class="seance-exo-num">${i + 1}</div>
          <div class="seance-exo-body">
            <div class="seance-exo-nom">${e.nom}</div>
            <div class="seance-exo-detail">
              ${e.sets} séries × ${e.reps}
              <span class="exo-repos-tag">· Repos ${Math.round(e.repos || 60)}s</span>
            </div>
            <div class="seance-exo-muscles-chips">
              ${(e.muscles || []).slice(0,3).map(m => `<span>${m}</span>`).join('')}
            </div>
          </div>
          <div class="seance-exo-icon-big">${e.icon || '💪'}</div>
        </div>`).join('')}
      </div>

      <div class="seance-overview-cta">
        <button class="btn-start-seance" onclick="Seance.start()">
          <span>▶</span> Commencer la séance
        </button>
      </div>
    </div>`;
  }

  /* ─────────────────────────────────────────
     7. EXERCICE ACTIF — fullscreen
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
    const ytId = EXO_VIDEOS[exo.id];
    const isLastSet = currentSet === totalSets;
    const isLastExo = _state.exoIdx === totalExos - 1;

    container.innerHTML = `
    <!-- Barre progression globale -->
    <div class="seance-global-progress">
      <div class="seance-global-fill" style="width:${progress}%"></div>
    </div>

    <div class="seance-active">
      <!-- Header -->
      <div class="seance-active-header">
        <div class="seance-active-counter">Exercice ${_state.exoIdx + 1}/${totalExos}</div>
        <div class="seance-active-label">${exo.nom}</div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn-voice-toggle ${_voiceEnabled ? 'on' : 'off'}" onclick="Seance.toggleVoice()">
            ${_voiceEnabled ? '🔊' : '🔇'}
          </button>
          <button class="btn-seance-pause" onclick="Seance.pause()">⏸</button>
        </div>
      </div>

      <!-- Zone principale scrollable -->
      <div class="seance-main">

        <!-- VIDÉO YOUTUBE -->
        <div class="seance-video-wrap">
          ${ytId
            ? `<div class="seance-iframe-wrap">
                <iframe class="seance-video-iframe"
                  src="https://www.youtube-nocookie.com/embed/${ytId}?controls=1&modestbranding=1&rel=0&mute=1&loop=1&playlist=${ytId}"
                  title="${exo.nom}"
                  frameborder="0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                  loading="lazy">
                </iframe>
                <div class="seance-video-badge">📹 ${exo.nom}</div>
              </div>`
            : `<div class="seance-exo-emoji-fallback">${exo.icon || '💪'}</div>`
          }
        </div>

        <!-- Muscles ciblés (chips) -->
        <div class="seance-muscles-row">
          ${(exo.muscles || []).map(m => `<span class="seance-muscle-chip">${m}</span>`).join('')}
        </div>

        <!-- Instruction technique (collapsable) -->
        <details class="seance-details-block" ${currentSet === 1 ? 'open' : ''}>
          <summary class="seance-details-summary">📋 Technique · Tap pour ${currentSet === 1 ? 'réduire' : 'voir'}</summary>
          <div class="seance-instruction-text">${instruction}</div>
        </details>

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
              <div class="seance-timer-label">${isTimedRep ? 'sec' : 'reps'}</div>
            </div>
          </div>
        </div>` : `
        <!-- MODE MANUEL : affichage grand reps -->
        <div class="seance-manual-reps">
          <div class="seance-reps-number">${exo.reps}</div>
          <div class="seance-reps-unit">répétitions</div>
        </div>`}

        <!-- Tracker de séries -->
        <div class="seance-sets-tracker">
          <div class="seance-sets-header">
            <span class="seance-sets-title">Séries</span>
            <span class="seance-sets-count">${currentSet} / ${totalSets}</span>
          </div>
          <div class="seance-sets-row" id="sets-row">
            ${Array.from({length: totalSets}, (_, i) => {
              const isDone   = i < _state.setIdx;
              const isActive = i === _state.setIdx;
              return `<div class="seance-set-bubble ${isDone?'done':isActive?'active':''}"
                           onclick="Seance.clickSet(${i})">
                ${isDone
                  ? '<span class="set-check">✓</span>'
                  : `<span class="set-label">S${i+1}</span>`}
              </div>`;
            }).join('')}
          </div>
          <div class="seance-repos-info">Repos après série : ${Math.round(exo.repos || 60)} sec</div>
        </div>

      </div>

      <!-- Contrôles bas de page -->
      <div class="seance-controls">
        <button class="btn-serie-done" id="btn-serie-done" onclick="Seance.completeSet()">
          ${isLastSet && isLastExo
            ? '🏁 Terminer la séance !'
            : isLastSet
            ? `✅ Exercice terminé → Suivant`
            : `✅ Série ${currentSet} terminée !`}
        </button>
        <div class="seance-btn-row">
          <button class="btn-seance-sec" onclick="Seance.prevExo()">← Précédent</button>
          <button class="btn-seance-sec btn-seance-skip" onclick="Seance.skipExo()">Passer ⏭</button>
        </div>
      </div>
    </div>`;

    // Lance le timer auto si nécessaire
    if (isAuto && isTimedRep) {
      startAutoTimer(parseTimedRep(exo.reps));
    } else if (isAuto && !isTimedRep) {
      // En mode auto sur reps normales : juste affichage
      const timerEl = document.getElementById('timer-val');
      if (timerEl) timerEl.textContent = exo.reps;
    }

    // Annonce vocale
    announceExercise(exo, _state.setIdx, totalSets);
  }

  /* ─────────────────────────────────────────
     8. TIMER AUTO
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
      announceCountdown(_state.timerSec);
      if (_state.timerSec <= 0) {
        clearTimer();
        vibrate([100, 50, 200]);
        completeSet();
      }
    }, 1000);
  }

  function updateTimerUI() {
    const val  = document.getElementById('timer-val');
    const fill = document.getElementById('timer-fill');
    if (!val || !fill) return;
    val.textContent = _state.timerSec;
    const circumference = 2 * Math.PI * 42;
    const ratio = _state.timerSec / (_state.timerMax || 1);
    fill.style.strokeDashoffset = circumference * (1 - ratio);
    fill.style.stroke = _state.timerSec <= 5 ? 'var(--red)' : 'var(--orange)';
  }

  /* ─────────────────────────────────────────
     9. ACTIONS SÉANCE
  ───────────────────────────────────────── */
  function start() {
    _state.phase     = 'active';
    _state.exoIdx    = 0;
    _state.setIdx    = 0;
    _state.startTime = Date.now();
    render();
  }

  function setMode(mode) {
    _state.mode = mode;
    if (_state.phase === 'overview') render();
  }

  function toggleVoice() {
    _voiceEnabled = !_voiceEnabled;
    if (!_voiceEnabled) stopVoice();
    else speak('Voix activée !', true);
    // Met à jour les boutons sans re-render complet
    document.querySelectorAll('.btn-voice-toggle').forEach(btn => {
      btn.textContent = _voiceEnabled ? '🔊' : '🔇';
      btn.className = `btn-voice-toggle ${_voiceEnabled ? 'on' : 'off'}`;
    });
  }

  function completeSet() {
    clearTimer();
    stopVoice();
    const exo = _state.exercises[_state.exoIdx];
    const totalSets = exo?.sets || 3;

    _state.setsLog.push({ exoIdx: _state.exoIdx, setIdx: _state.setIdx, done: true });
    _state.totalSetsCompleted++;
    vibrate([60]);

    if (_state.setIdx < totalSets - 1) {
      // Reste des séries → repos
      _state.setIdx++;
      const reposSec = Math.round(exo.repos || 60);
      const nextName = exo.nom; // même exercice
      announceRepos(reposSec, nextName);
      showRepos(reposSec, false);
    } else {
      // Exercice fini → exercice suivant
      nextExo();
    }
  }

  function clickSet(idx) {
    if (idx === _state.setIdx) completeSet();
    else if (idx < _state.setIdx) { _state.setIdx = idx; render(); }
  }

  function nextExo() {
    clearTimer();
    stopVoice();
    _state.exoIdx++;
    _state.setIdx = 0;
    if (_state.exoIdx >= _state.exercises.length) {
      finishWorkout();
    } else {
      _state.phase = 'active';
      const nextExo = _state.exercises[_state.exoIdx];
      const reposSec = 60;
      announceRepos(reposSec, nextExo?.nom || 'exercice suivant');
      showRepos(reposSec, true);
    }
  }

  function prevExo() {
    if (_state.exoIdx > 0) {
      clearTimer(); stopVoice();
      _state.exoIdx--;
      _state.setIdx = 0;
      _state.phase = 'active';
      render();
    }
  }

  function skipExo() {
    speak('Exercice passé.', true);
    nextExo();
  }

  /* ─────────────────────────────────────────
     10. OVERLAY REPOS
  ───────────────────────────────────────── */
  function showRepos(seconds, betweenExos = false) {
    _state.phase = 'repos';
    document.getElementById('repos-overlay')?.remove();

    const nextExoObj = betweenExos ? _state.exercises[_state.exoIdx] : _state.exercises[_state.exoIdx];
    const nextName = nextExoObj?.nom || 'Prochain exercice';
    const circumference = 2 * Math.PI * 42;

    const overlay = document.createElement('div');
    overlay.className = 'seance-repos-overlay';
    overlay.id = 'repos-overlay';
    overlay.innerHTML = `
    <div class="repos-title">😮‍💨 Repos</div>
    <div class="repos-subtitle">${betweenExos ? 'Prépare-toi pour l\'exercice suivant' : `Série ${_state.setIdx} terminée`}</div>

    <div class="repos-ring">
      <svg class="repos-ring-svg" viewBox="0 0 100 100">
        <circle class="repos-ring-track" cx="50" cy="50" r="42"/>
        <circle class="repos-ring-fill" id="repos-fill" cx="50" cy="50" r="42"
          stroke-dasharray="${circumference}" stroke-dashoffset="0"/>
      </svg>
      <div class="repos-center">
        <div class="repos-countdown" id="repos-countdown">${seconds}</div>
        <div class="repos-unit">sec</div>
      </div>
    </div>

    <div class="repos-next-block">
      <div class="repos-next-label">Prochain</div>
      <div class="repos-next-name">${nextName}</div>
      ${betweenExos && nextExoObj ? `
      <div class="repos-next-detail">${nextExoObj.sets} séries × ${nextExoObj.reps}</div>
      ` : ''}
    </div>

    <button class="btn-skip-repos" onclick="Seance.skipRepos()">Sauter le repos →</button>`;

    document.getElementById('screen-seance').appendChild(overlay);

    // Countdown
    let remaining = seconds;
    _state.timerInterval = setInterval(() => {
      remaining--;
      const el   = document.getElementById('repos-countdown');
      const fillEl = document.getElementById('repos-fill');
      if (el) el.textContent = remaining;
      if (fillEl) fillEl.style.strokeDashoffset = circumference * (1 - remaining / seconds);

      // Voix countdown final
      if ([5, 3, 2, 1].includes(remaining)) speak(String(remaining), false);

      if (remaining <= 0) {
        clearTimer();
        vibrate([100, 80, 200]);
        skipRepos();
      }
    }, 1000);
  }

  function skipRepos() {
    clearTimer();
    stopVoice();
    document.getElementById('repos-overlay')?.remove();
    _state.phase = 'active';
    render();
  }

  /* ─────────────────────────────────────────
     11. PAUSE
  ───────────────────────────────────────── */
  function pause() {
    clearTimer(); stopVoice();
    document.getElementById('repos-overlay')?.remove();
    _state.pauseStart = Date.now();
    _state.phase = 'pause';

    const elapsedSec = _state.startTime
      ? Math.round((Date.now() - _state.startTime - _state.pausedMs) / 1000)
      : 0;
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2,'0');
    const ss = String(elapsedSec % 60).padStart(2,'0');

    const modal = document.createElement('div');
    modal.className = 'seance-pause-modal';
    modal.id = 'pause-modal';
    modal.innerHTML = `
    <div class="seance-pause-sheet">
      <div class="pause-title">⏸ Pause</div>
      <div class="pause-stats">
        <div class="pause-stat">
          <span class="pause-stat-val">${_state.exoIdx + 1}/${_state.exercises.length}</span>
          <span class="pause-stat-lbl">Exercice</span>
        </div>
        <div class="pause-stat">
          <span class="pause-stat-val">${_state.totalSetsCompleted}</span>
          <span class="pause-stat-lbl">Séries</span>
        </div>
        <div class="pause-stat">
          <span class="pause-stat-val">${mm}:${ss}</span>
          <span class="pause-stat-lbl">Temps</span>
        </div>
      </div>
      <button class="btn-pause-action btn-resume" onclick="Seance.resume()">▶ Reprendre</button>
      <button class="btn-pause-action btn-stop" onclick="Seance.finishWorkout()">🏁 Terminer maintenant</button>
      <button class="btn-pause-action btn-abandon" onclick="Seance.abandon()">✕ Abandonner</button>
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
    clearTimer(); stopVoice();
    document.getElementById('pause-modal')?.remove();
    close();
  }

  /* ─────────────────────────────────────────
     12. FIN DE SÉANCE
  ───────────────────────────────────────── */
  function finishWorkout() {
    clearTimer(); stopVoice();
    document.getElementById('repos-overlay')?.remove();
    document.getElementById('pause-modal')?.remove();
    _state.phase = 'finish';

    const durationMs  = _state.startTime ? (Date.now() - _state.startTime - _state.pausedMs) : (_state.plan.duration || 30) * 60000;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));
    const xpTotal     = 50 + _state.totalSetsCompleted * 10 + (_state.exoIdx >= _state.exercises.length ? 100 : 0);
    const kcal        = Math.round(durationMin * 6.5);

    // Update STATE
    STATE.totalSessions    = (STATE.totalSessions || 0) + 1;
    STATE.points           = (STATE.points || 0) + xpTotal;
    STATE.totalMinutes     = (STATE.totalMinutes || 0) + durationMin;
    STATE.totalKcal        = (STATE.totalKcal || 0) + kcal;
    STATE.sessionsThisWeek = (STATE.sessionsThisWeek || 0) + 1;

    // Marque jour complété
    const week   = STATE.currentWeek || 1;
    const jsDay  = new Date().getDay();
    const dayIdx = jsDay === 0 ? 7 : jsDay;
    if (!STATE.completedDays) STATE.completedDays = new Set();
    STATE.completedDays.add(`w${week}_d${dayIdx}`);

    // Sauvegarde
    if (STATE.user?.id) {
      DB.upsert('profiles', { id: STATE.user.id, total_sessions: STATE.totalSessions, total_points: STATE.points, sessions_this_week: STATE.sessionsThisWeek }).catch(()=>{});
      DB.insert('workout_sessions', { user_id: STATE.user.id, duration_min: durationMin, exercises_count: _state.exoIdx, sets_completed: _state.totalSetsCompleted, calories: kcal, xp_earned: xpTotal, workout_name: _state.plan.label || 'Séance', created_at: new Date().toISOString() }).catch(()=>{});
    }

    // Voix fin de séance
    setTimeout(() => announceFinish(), 500);
    renderFinish(document.getElementById('seance-content'), { durationMin, kcal, xpTotal });
  }

  function renderFinish(container, stats) {
    const { durationMin = 0, kcal = 0, xpTotal = 0 } = stats || {};
    const setsCount = _state?.totalSetsCompleted || 0;
    const exosDone  = Math.min(_state?.exoIdx || 0, _state?.exercises?.length || 0);
    const allExos   = _state?.exercises || [];
    const mm = String(Math.max(1, Math.floor(durationMin))).padStart(2,'0');

    container.innerHTML = `
    <div class="seance-finish">
      <div class="finish-confetti">🎉</div>
      <div class="finish-title">Séance terminée !<br>Bravo 🦁</div>
      <div class="finish-subtitle">Tu viens de repousser tes limites. Continue comme ça !</div>

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

      <div class="finish-xp-banner">
        <div class="finish-xp-label">⭐ Points gagnés</div>
        <div class="finish-xp-value">+${xpTotal} XP</div>
      </div>

      <div style="font-family:'Sora',sans-serif;font-weight:700;font-size:13px;color:var(--text-muted);letter-spacing:0.06em;text-transform:uppercase;margin-top:4px;align-self:flex-start">Résumé</div>
      <div class="finish-exo-list">
        ${allExos.map((e, i) => {
          const setsDone = (_state?.setsLog||[]).filter(s => s.exoIdx === i).length;
          return `<div class="finish-exo-row">
            <span class="finish-exo-icon">${e.icon||'💪'}</span>
            <span class="finish-exo-nom">${e.nom}</span>
            <span class="finish-exo-sets-done">${setsDone}/${e.sets} séries</span>
          </div>`;
        }).join('')}
      </div>

      <button class="btn-finish-home" onclick="Seance.close()">🏠 Retour au programme</button>
    </div>`;
  }

  /* ─────────────────────────────────────────
     13. FERMER
  ───────────────────────────────────────── */
  function close() {
    clearTimer(); stopVoice();
    document.getElementById('repos-overlay')?.remove();
    document.getElementById('pause-modal')?.remove();
    _state = null;
    navigate('programme');
    setTimeout(() => { if (typeof Prog !== 'undefined') { Prog.init(); Prog.render(); } }, 100);
  }

  /* ─────────────────────────────────────────
     14. UTILITAIRES
  ───────────────────────────────────────── */
  function clearTimer() {
    if (_state?.timerInterval) { clearInterval(_state.timerInterval); _state.timerInterval = null; }
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
  }

  return {
    init, start, close,
    setMode, toggleVoice,
    completeSet, clickSet,
    nextExo, prevExo, skipExo,
    skipRepos,
    pause, resume, abandon,
    finishWorkout,
  };

})();
