/* ═══════════════════════════════════════════════════════
   FITLIFE IA — PROGRAMME JS
   Écran programme : rendu UI, accordion, intégration IA
   Dépend de : ai.js, state.js, ui.js, router.js
═══════════════════════════════════════════════════════ */

/* ── Namespace ── */
const Prog = (() => {

  /* ─── État local de l'écran ─── */
  let _openDayCard = null;      // id du card accordion ouvert
  let _currentWeekView = null;  // semaine affichée (pas forcément la courante)

  /* ─────────────────────────────────────────
     RENDER PRINCIPAL
  ───────────────────────────────────────── */
  function render() {
    const container = document.getElementById('prog-content');
    if (!container) return;

    const program = STATE.currentProgram;

    // Pas encore de programme → affiche générateur
    if (!program) {
      renderEmpty(container);
      return;
    }

    _currentWeekView = _currentWeekView || STATE.currentWeek || 1;

    const summary = AI.getWeekSummary(program);
    const todayPlan = AI.getTodayPlan(program, STATE.checkinMood, STATE.checkinEnergy);

    container.innerHTML = `
      ${renderHero(program, summary)}
      ${renderMoodBanner(todayPlan)}
      ${renderWeekNav(program)}
      <p class="prog-section-title">CETTE SEMAINE</p>
      <div class="prog-days-list" id="prog-days-list">
        ${renderDays(summary, todayPlan)}
      </div>
    `;

    // Ré-attache les events
    attachEvents();

    // Auto-ouvre le jour actuel
    autoOpenToday();
  }

  /* ─────────────────────────────────────────
     HERO CARD
  ───────────────────────────────────────── */
  function renderHero(program, summary) {
    const pct = Math.round(((summary.weekNumber - 1) / program.totalWeeks) * 100);
    const goalLabels = { muscle:'💪 Prise de muscle', poids:'🔥 Perte de poids', cardio:'❤️ Cardio-endurance', mobilite:'🧘 Mobilité & bien-être' };
    const levelLabels = { debutant:'Débutant', intermediaire:'Intermédiaire', avance:'Avancé' };
    const completedCount = (STATE.completedDays || new Set()).size;

    return `
    <div class="prog-hero">
      <div class="prog-hero-top">
        <div class="prog-hero-icon">🦁</div>
        <div class="prog-hero-info">
          <div class="prog-hero-title">${goalLabels[program.goal] || 'Mon Programme'}</div>
          <div class="prog-hero-subtitle">${levelLabels[program.level] || ''} · ${program.sessionDays}j/sem</div>
        </div>
        <div class="prog-hero-week-badge">Sem. ${summary.weekNumber}/${program.totalWeeks}</div>
      </div>

      <div class="prog-progress-label">
        <span>Progression</span>
        <strong>${pct}%</strong>
      </div>
      <div class="prog-progress-bar">
        <div class="prog-progress-fill" style="width:${pct}%"></div>
      </div>

      <div class="prog-hero-stats">
        <div class="prog-stat">
          <span class="prog-stat-val">${STATE.totalSessions || 0}</span>
          <span class="prog-stat-lbl">Séances</span>
        </div>
        <div class="prog-stat">
          <span class="prog-stat-val">${completedCount}</span>
          <span class="prog-stat-lbl">Jours complétés</span>
        </div>
        <div class="prog-stat">
          <span class="prog-stat-val">${summary.trainingCount}</span>
          <span class="prog-stat-lbl">Jours/semaine</span>
        </div>
      </div>
    </div>`;
  }

  /* ─────────────────────────────────────────
     BANNIÈRE MOOD
  ───────────────────────────────────────── */
  function renderMoodBanner(todayPlan) {
    if (!todayPlan || !todayPlan.moodTag) return '';
    const mul = todayPlan.moodAdapted;
    const cls = todayPlan.type === 'repos' ? '' : (todayPlan.exercises?.length <= 3 ? 'mood-low' : 'mood-great');

    return `
    <div class="prog-mood-banner ${cls}">
      <div>
        <div class="prog-mood-tag">${todayPlan.moodTag}</div>
        <div class="prog-mood-text">${todayPlan.moodSuggestion || ''}</div>
      </div>
    </div>`;
  }

  /* ─────────────────────────────────────────
     NAVIGATION SEMAINES (mini pills)
  ───────────────────────────────────────── */
  function renderWeekNav(program) {
    const pills = program.weeks.map(w => {
      const isActive = w.week === _currentWeekView;
      const isCurrent = w.week === (STATE.currentWeek || 1);
      const cls = [
        isActive ? 'active' : '',
        w.decharge ? 'decharge' : '',
      ].filter(Boolean).join(' ');

      return `<button class="prog-week-pill ${cls}" data-week="${w.week}">
        S${w.week}${isCurrent ? ' ●' : ''}
      </button>`;
    }).join('');

    return `<div class="prog-week-nav" id="prog-week-nav">${pills}</div>`;
  }

  /* ─────────────────────────────────────────
     RENDU DES JOURS DE LA SEMAINE
  ───────────────────────────────────────── */
  function renderDays(summary, todayPlan) {
    const jsDay = new Date().getDay();
    const todayIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=lun

    return summary.days.map((day, idx) => {
      const isToday = (idx === todayIdx) && (_currentWeekView === (STATE.currentWeek || 1));
      const isDone = isCompleted(day, summary.weekNumber);
      const isRest = day.type === 'repos';
      const isFuture = idx > todayIdx && !isDone && !isRest && (_currentWeekView === (STATE.currentWeek || 1));

      let status = 'locked';
      if (isDone) status = 'done';
      else if (isToday) status = 'today';
      else if (isRest) status = 'rest';
      else if (idx < todayIdx || _currentWeekView < (STATE.currentWeek || 1)) status = 'unlocked';

      const statusIcon = {
        done: '✅', today: '🔥', rest: '😴', locked: '🔒', unlocked: '🎯',
      }[status] || '🔒';

      const cardId = `day-card-${idx}`;
      const canOpen = !isRest && day.exercises?.length > 0;
      const isOpen = _openDayCard === cardId;

      // Exercices sélectionnés selon le plan du jour adapté au mood (si aujourd'hui)
      const exercises = (isToday && todayPlan && todayPlan.exercises) ? todayPlan.exercises : (day.exercises || []);
      const label = (isToday && todayPlan?.moodAdapted) ? todayPlan.label : day.label;
      const duration = (isToday && todayPlan) ? todayPlan.duration : day.duration;

      const muscles = getMainMuscles(exercises);

      return `
      <div class="prog-day-card status-${status} ${isOpen ? 'open' : ''}" id="${cardId}" data-idx="${idx}" data-can-open="${canOpen}">
        <div class="prog-day-header" onclick="Prog.toggleDay('${cardId}', ${canOpen})">
          <div class="prog-day-status-icon">${statusIcon}</div>
          <div class="prog-day-info">
            <div class="prog-day-name">${day.name} · ${isRest ? 'Repos' : label}</div>
            <div class="prog-day-meta">${isRest ? 'Récupération' : `${exercises.length} exercice${exercises.length > 1 ? 's' : ''} · ${duration} min`}</div>
          </div>
          <div class="prog-day-right">
            ${!isRest ? `<span class="prog-day-duration"></span>` : ''}
            ${canOpen ? `<span class="prog-day-chevron">›</span>` : ''}
          </div>
        </div>

        ${canOpen ? `
        <div class="prog-day-body">
          ${muscles.length ? `
          <div class="prog-muscles-chips">
            ${muscles.map(m => `<span class="prog-muscle-chip">${m}</span>`).join('')}
          </div>` : ''}

          <div class="prog-exercises-list">
            ${exercises.map(e => renderExercise(e)).join('')}
          </div>

          ${isToday ? `
          <div class="prog-day-cta">
            <button class="btn-lancer-seance" onclick="Prog.launchWorkout()">
              <span class="btn-icon">▶</span>
              Lancer la séance
            </button>
          </div>` : ''}
        </div>` : ''}
      </div>`;
    }).join('');
  }

  /* ─────────────────────────────────────────
     RENDU D'UN EXERCICE
  ───────────────────────────────────────── */
  function renderExercise(e) {
    const setsReps = `${e.sets}×${e.reps}`;
    const repos = e.repos ? ` · Repos ${e.repos}s` : '';

    return `
    <div class="prog-exercise-item">
      <div class="prog-exo-icon">${e.icon || '💪'}</div>
      <div class="prog-exo-info">
        <div class="prog-exo-name">${e.nom}</div>
        <div class="prog-exo-detail">${(e.muscles || []).slice(0,2).join(' · ')}${repos}</div>
      </div>
      <div class="prog-exo-sets">${setsReps}</div>
    </div>`;
  }

  /* ─────────────────────────────────────────
     ÉTAT VIDE — Pas encore de programme
  ───────────────────────────────────────── */
  function renderEmpty(container) {
    container.innerHTML = `
    <div class="prog-empty">
      <div class="prog-empty-icon">🦁</div>
      <div class="prog-empty-title">Ton programme IA t'attend !</div>
      <div class="prog-empty-text">
        En quelques secondes, ton coach 🦁 va créer un programme sur mesure adapté à ton âge, tes objectifs et ton niveau.
      </div>
      <button class="btn-gen-program" onclick="Prog.generateProgram()">
        ⚡ Générer mon programme
      </button>
    </div>`;
  }

  /* ─────────────────────────────────────────
     LOADER
  ───────────────────────────────────────── */
  function renderLoader(container) {
    container.innerHTML = `
    <div class="prog-loader">
      <div class="prog-loader-spinner"></div>
      <div class="prog-loader-text">🦁 Ton coach analyse ton profil et prépare<br>ton programme personnalisé…</div>
    </div>`;
  }

  /* ─────────────────────────────────────────
     ACCORDION — toggle
  ───────────────────────────────────────── */
  function toggleDay(cardId, canOpen) {
    if (!canOpen) return;

    // Ferme le précédent
    if (_openDayCard && _openDayCard !== cardId) {
      const prev = document.getElementById(_openDayCard);
      if (prev) prev.classList.remove('open');
    }

    const card = document.getElementById(cardId);
    if (!card) return;

    if (_openDayCard === cardId) {
      card.classList.remove('open');
      _openDayCard = null;
    } else {
      card.classList.add('open');
      _openDayCard = cardId;

      // Scroll doux vers la card
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }

  /* ─────────────────────────────────────────
     AUTO-OUVRE AUJOURD'HUI
  ───────────────────────────────────────── */
  function autoOpenToday() {
    const todayCard = document.querySelector('.prog-day-card.status-today');
    if (todayCard) {
      const id = todayCard.id;
      const canOpen = todayCard.dataset.canOpen === 'true';
      if (canOpen) {
        setTimeout(() => toggleDay(id, true), 200);
      }
    }
  }

  /* ─────────────────────────────────────────
     EVENTS — Navigation semaines
  ───────────────────────────────────────── */
  function attachEvents() {
    const nav = document.getElementById('prog-week-nav');
    if (!nav) return;

    nav.querySelectorAll('.prog-week-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const week = parseInt(pill.dataset.week);
        _currentWeekView = week;
        _openDayCard = null;
        render();
      });
    });
  }

  /* ─────────────────────────────────────────
     GÉNÉRATION DU PROGRAMME
  ───────────────────────────────────────── */
  async function generateProgram() {
    const container = document.getElementById('prog-content');
    renderLoader(container);

    // Petite pause UX pour que le loader soit visible
    await new Promise(r => setTimeout(r, 1200));

    try {
      const profile = buildProfileFromState();
      const program = AI.generateProgram(profile);

      STATE.currentProgram = program;
      _currentWeekView = STATE.currentWeek || 1;

      // Sauvegarde locale
      saveProgramToStorage(program);

      // Sauvegarde Supabase si disponible
      if (STATE.user?.id) {
        DB.upsert('profiles', { id: STATE.user.id, program_data: JSON.stringify(program) }).catch(() => {});
      }

      showToast('🦁 Ton programme est prêt !', 'success');
      render();
    } catch (err) {
      console.error('[Prog] Erreur génération:', err);
      showToast('Erreur lors de la génération. Réessaie !', 'error');
      renderEmpty(container);
    }
  }

  /* ─────────────────────────────────────────
     LANCER LA SÉANCE
  ───────────────────────────────────────── */
  function launchWorkout() {
    const todayPlan = AI.getTodayPlan(STATE.currentProgram, STATE.checkinMood, STATE.checkinEnergy);
    if (!todayPlan) return;

    STATE.activeWorkout = todayPlan;
    navigate('seance');
    showToast('🔥 C\'est parti !', 'success');
  }

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function buildProfileFromState() {
    return {
      level:            STATE.profile?.level || 'debutant',
      goal:             STATE.profile?.goal || 'muscle',
      days:             STATE.profile?.days || 3,
      sessionTime:      STATE.profile?.sessionTime || 45,
      ageGroup:         STATE.profile?.ageGroup || '30',
      healthConditions: [...(STATE.profile?.healthConditions || [])],
      targetKg:         STATE.profile?.targetKg || null,
    };
  }

  function getMainMuscles(exercises) {
    const all = [];
    (exercises || []).forEach(e => {
      (e.muscles || []).forEach(m => {
        if (!all.includes(m) && all.length < 4) all.push(m);
      });
    });
    return all;
  }

  function isCompleted(day, weekNum) {
    const key = `w${weekNum}_d${day.day}`;
    return (STATE.completedDays || new Set()).has(key);
  }

  function saveProgramToStorage(program) {
    try {
      localStorage.setItem('fitlife_program', JSON.stringify(program));
    } catch (e) {}
  }

  function loadProgramFromStorage() {
    try {
      const raw = localStorage.getItem('fitlife_program');
      if (raw) {
        STATE.currentProgram = JSON.parse(raw);
      }
    } catch (e) {}
  }

  /* ─────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────── */
  function init() {
    // Charge le programme depuis le stockage local si pas encore en STATE
    if (!STATE.currentProgram) {
      loadProgramFromStorage();
    }
    _currentWeekView = STATE.currentWeek || 1;
  }

  /* ── PUBLIC ── */
  return { render, init, toggleDay, generateProgram, launchWorkout };

})();
