/* ═══════════════════════════════════════════════════════
   FITLIFE IA — PROGRAMME JS  (v2 — avec questionnaire)
   Flow : questionnaire → génération IA → affichage
   Possibilité de modifier le profil et régénérer
═══════════════════════════════════════════════════════ */

const Prog = (() => {

  let _openDayCard   = null;
  let _currentWeekView = null;
  let _phase = 'idle';

  let _draft = {
    age:              '',
    level:            '',
    goal:             '',
    days:             '',
    sessionTime:      '',
    healthConditions: new Set(),
    equipment:        new Set(),
  };

  const STEPS = ['age','goal','level','days','time','health','equipment','confirm'];
  let _stepIdx = 0;

  /* ═══ ENTRY POINT ═══ */
  function init() {
    if (!STATE.currentProgram) loadProgramFromStorage();
    _currentWeekView = STATE.currentWeek || 1;
  }

  function render() {
    const container = document.getElementById('prog-content');
    if (!container) return;
    if (STATE.currentProgram) { _phase='program'; renderProgram(container); }
    else if (_phase==='questionnaire') renderQuestionnaire(container);
    else { _phase='idle'; renderWelcome(container); }
  }

  /* ═══ PHASE 0 — WELCOME ═══ */
  function renderWelcome(container) {
    container.innerHTML = `
    <div class="prog-welcome">
      <div class="prog-welcome-lion">🦁</div>
      <h2 class="prog-welcome-title">Ton programme IA personnalisé</h2>
      <p class="prog-welcome-text">Réponds à quelques questions et ton coach génère un programme <strong>sur mesure</strong> adapté à ton âge, ta santé et tes objectifs.</p>
      <div class="prog-welcome-features">
        <div class="prog-welcome-feat"><span>🎯</span><span>Adapté à ton âge</span></div>
        <div class="prog-welcome-feat"><span>🩺</span><span>Respecte ta santé</span></div>
        <div class="prog-welcome-feat"><span>😊</span><span>Ajusté à ton humeur</span></div>
        <div class="prog-welcome-feat"><span>📅</span><span>12 semaines progressives</span></div>
      </div>
      <button class="btn-start-quiz" onclick="Prog.startQuestionnaire()">Commencer →</button>
    </div>`;
  }

  /* ═══ PHASE 1 — QUESTIONNAIRE ═══ */
  function startQuestionnaire() {
    if (STATE.profile?.ageGroup)     _draft.age = STATE.profile.ageGroup;
    if (STATE.profile?.goal)         _draft.goal = STATE.profile.goal;
    if (STATE.profile?.level)        _draft.level = STATE.profile.level;
    if (STATE.profile?.days)         _draft.days = String(STATE.profile.days);
    if (STATE.profile?.sessionTime)  _draft.sessionTime = String(STATE.profile.sessionTime);
    if (STATE.profile?.healthConditions) _draft.healthConditions = new Set(STATE.profile.healthConditions);
    _phase='questionnaire'; _stepIdx=0;
    renderQuestionnaire(document.getElementById('prog-content'));
  }

  function renderQuestionnaire(container) {
    const step = STEPS[_stepIdx];
    const progress = Math.round((_stepIdx / (STEPS.length - 1)) * 100);
    const stepHTML = { age:renderStepAge(), goal:renderStepGoal(), level:renderStepLevel(), days:renderStepDays(), time:renderStepTime(), health:renderStepHealth(), equipment:renderStepEquipment(), confirm:renderStepConfirm() }[step] || '';
    container.innerHTML = `
    <div class="quiz-shell">
      <div class="quiz-header">
        ${_stepIdx > 0 ? `<button class="quiz-back" onclick="Prog.prevStep()">←</button>` : `<div></div>`}
        <div class="quiz-step-label">Étape ${_stepIdx+1} / ${STEPS.length}</div>
        <div></div>
      </div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
      <div class="quiz-body">${stepHTML}</div>
    </div>`;
  }

  function renderStepAge() {
    const ages = [
      {val:'18',lbl:'18–24 ans',icon:'🧑',desc:'Jeune adulte'},
      {val:'30',lbl:'25–39 ans',icon:'💼',desc:'Adulte actif'},
      {val:'45',lbl:'40–49 ans',icon:'🏃',desc:'Quadragénaire'},
      {val:'52',lbl:'50–54 ans',icon:'🧘',desc:'Quinquagénaire'},
      {val:'60',lbl:'55–64 ans',icon:'🌿',desc:'Senior actif'},
      {val:'70',lbl:'65 ans +', icon:'🌟',desc:'Senior confirmé'},
    ];
    return `<div class="quiz-step-title">🎂 Ton groupe d'âge ?</div>
    <p class="quiz-step-sub">Le programme adapte le volume et les temps de repos à ton âge.</p>
    <div class="quiz-grid-2">${ages.map(a=>`
      <button class="quiz-card${_draft.age===a.val?' selected':''}" onclick="Prog.selectAndNext('age','${a.val}')">
        <span class="quiz-card-icon">${a.icon}</span>
        <span class="quiz-card-lbl">${a.lbl}</span>
        <span class="quiz-card-desc">${a.desc}</span>
      </button>`).join('')}</div>`;
  }

  function renderStepGoal() {
    const goals = [
      {val:'poids',   lbl:'Perdre du poids',    icon:'🔥',desc:'Brûler des calories, affiner'},
      {val:'muscle',  lbl:'Prendre du muscle',   icon:'💪',desc:'Gain de masse, renforcement'},
      {val:'cardio',  lbl:'Cardio-endurance',    icon:'❤️',desc:'Souffle, résistance, forme'},
      {val:'mobilite',lbl:'Mobilité & bien-être',icon:'🧘',desc:'Souplesse, posture, détente'},
    ];
    return `<div class="quiz-step-title">🎯 Ton objectif principal ?</div>
    <p class="quiz-step-sub">L'IA sélectionne les exercices selon ton but.</p>
    <div class="quiz-grid-1">${goals.map(g=>`
      <button class="quiz-card-row${_draft.goal===g.val?' selected':''}" onclick="Prog.selectAndNext('goal','${g.val}')">
        <span class="quiz-row-icon">${g.icon}</span>
        <div><div class="quiz-row-lbl">${g.lbl}</div><div class="quiz-row-desc">${g.desc}</div></div>
        <span class="quiz-row-check">${_draft.goal===g.val?'✓':''}</span>
      </button>`).join('')}</div>`;
  }

  function renderStepLevel() {
    const levels = [
      {val:'debutant',     lbl:'Débutant',      icon:'🌱',desc:'Moins de 6 mois d\'activité'},
      {val:'intermediaire',lbl:'Intermédiaire', icon:'⚡',desc:'Actif depuis + de 6 mois'},
      {val:'avance',       lbl:'Avancé',         icon:'🔥',desc:'Pratique régulière intense'},
    ];
    return `<div class="quiz-step-title">📊 Ton niveau actuel ?</div>
    <p class="quiz-step-sub">Sois honnête — le programme sera plus efficace.</p>
    <div class="quiz-grid-1">${levels.map(l=>`
      <button class="quiz-card-row${_draft.level===l.val?' selected':''}" onclick="Prog.selectAndNext('level','${l.val}')">
        <span class="quiz-row-icon">${l.icon}</span>
        <div><div class="quiz-row-lbl">${l.lbl}</div><div class="quiz-row-desc">${l.desc}</div></div>
        <span class="quiz-row-check">${_draft.level===l.val?'✓':''}</span>
      </button>`).join('')}</div>`;
  }

  function renderStepDays() {
    const opts = [
      {val:'2',lbl:'2 jours',icon:'📅',desc:'Weekend uniquement'},
      {val:'3',lbl:'3 jours',icon:'📅',desc:'Lun · Mer · Ven'},
      {val:'4',lbl:'4 jours',icon:'📅',desc:'4 séances réparties'},
      {val:'5',lbl:'5 jours',icon:'📅',desc:'5 jours/semaine'},
    ];
    return `<div class="quiz-step-title">📅 Jours par semaine ?</div>
    <p class="quiz-step-sub">Le programme respecte les jours de repos selon ton âge.</p>
    <div class="quiz-grid-2">${opts.map(o=>`
      <button class="quiz-card${_draft.days===o.val?' selected':''}" onclick="Prog.selectAndNext('days','${o.val}')">
        <span class="quiz-card-icon">${o.icon}</span>
        <span class="quiz-card-lbl">${o.lbl}</span>
        <span class="quiz-card-desc">${o.desc}</span>
      </button>`).join('')}</div>`;
  }

  function renderStepTime() {
    const times = [
      {val:'20',lbl:'20 min',icon:'⚡',desc:'Ultra court'},
      {val:'30',lbl:'30 min',icon:'🕐',desc:'Express'},
      {val:'45',lbl:'45 min',icon:'🕐',desc:'Standard'},
      {val:'60',lbl:'60 min',icon:'🕐',desc:'Complet'},
    ];
    return `<div class="quiz-step-title">⏱️ Durée par séance ?</div>
    <p class="quiz-step-sub">L'IA ajuste le nombre d'exercices à ton temps.</p>
    <div class="quiz-grid-2">${times.map(t=>`
      <button class="quiz-card${_draft.sessionTime===t.val?' selected':''}" onclick="Prog.selectAndNext('sessionTime','${t.val}')">
        <span class="quiz-card-icon">${t.icon}</span>
        <span class="quiz-card-lbl">${t.lbl}</span>
        <span class="quiz-card-desc">${t.desc}</span>
      </button>`).join('')}</div>`;
  }

  function renderStepHealth() {
    const conds = [
      {val:'aucun',          lbl:'Aucun problème',    icon:'✅'},
      {val:'mal_de_dos',     lbl:'Mal de dos',         icon:'🦴'},
      {val:'mal_de_dos_severe',lbl:'Dos sévère',       icon:'⚠️'},
      {val:'genou',          lbl:'Douleur genou',      icon:'🦵'},
      {val:'genou_severe',   lbl:'Genou sévère',       icon:'⚠️'},
      {val:'epaule',         lbl:'Douleur épaule',     icon:'💪'},
      {val:'cardiaque',      lbl:'Problème cardiaque', icon:'❤️'},
      {val:'hypertension',   lbl:'Hypertension',       icon:'🩺'},
      {val:'diabete',        lbl:'Diabète',             icon:'🩸'},
      {val:'asthme',         lbl:'Asthme',              icon:'🌬️'},
      {val:'arthrose',       lbl:'Arthrose',            icon:'🦴'},
      {val:'hernie_discale', lbl:'Hernie discale',      icon:'⚠️'},
      {val:'fibromyalgie',   lbl:'Fibromyalgie',        icon:'🌿'},
    ];
    return `<div class="quiz-step-title">🩺 Conditions de santé ?</div>
    <p class="quiz-step-sub">Les exercices contre-indiqués seront automatiquement exclus ou remplacés.</p>
    <div class="quiz-health-grid">${conds.map(c=>{
      const sel = c.val==='aucun' ? _draft.healthConditions.size===0 : _draft.healthConditions.has(c.val);
      return `<button class="quiz-health-chip${sel?' selected':''}" onclick="Prog.toggleHealth('${c.val}')">${c.icon} ${c.lbl}</button>`;
    }).join('')}</div>
    <button class="quiz-next-btn" onclick="Prog.nextStep()">Continuer →</button>`;
  }

  function renderStepEquipment() {
    const equips = [
      {val:'aucun',     lbl:'Aucun (maison)',  icon:'🏠'},
      {val:'halteres',  lbl:'Haltères',         icon:'🏋️'},
      {val:'barre',     lbl:'Barre / rack',     icon:'🔩'},
      {val:'machine',   lbl:'Machines salle',   icon:'⚙️'},
      {val:'elastiques',lbl:'Élastiques',       icon:'🎗️'},
      {val:'tapis',     lbl:'Tapis de yoga',    icon:'🧘'},
    ];
    return `<div class="quiz-step-title">🏋️ Équipement disponible ?</div>
    <p class="quiz-step-sub">Sélectionne tout ce que tu as à disposition.</p>
    <div class="quiz-health-grid">${equips.map(e=>{
      const sel = _draft.equipment.has(e.val);
      return `<button class="quiz-health-chip${sel?' selected':''}" onclick="Prog.toggleEquip('${e.val}')">${e.icon} ${e.lbl}</button>`;
    }).join('')}</div>
    <button class="quiz-next-btn" onclick="Prog.nextStep()">Continuer →</button>`;
  }

  function renderStepConfirm() {
    const gL = {poids:'🔥 Perte de poids',muscle:'💪 Prise de muscle',cardio:'❤️ Cardio',mobilite:'🧘 Mobilité'};
    const lL = {debutant:'🌱 Débutant',intermediaire:'⚡ Intermédiaire',avance:'🔥 Avancé'};
    const aL = {'18':'18–24 ans','30':'25–39 ans','45':'40–49 ans','52':'50–54 ans','60':'55–64 ans','70':'65+ ans'};
    const hL = {mal_de_dos:'Mal de dos',mal_de_dos_severe:'Dos sévère',genou:'Genou',genou_severe:'Genou sévère',epaule:'Épaule',cardiaque:'Cardiaque',hypertension:'Hypertension',diabete:'Diabète',asthme:'Asthme',arthrose:'Arthrose',hernie_discale:'Hernie discale',fibromyalgie:'Fibromyalgie'};
    const healthList = [..._draft.healthConditions].map(h=>hL[h]||h).join(', ') || 'Aucune';
    const canGen = _draft.age && _draft.goal && _draft.level && _draft.days && _draft.sessionTime;
    return `<div class="quiz-step-title">✅ Récapitulatif</div>
    <p class="quiz-step-sub">Vérifie avant que le coach génère ton programme sur mesure.</p>
    <div class="quiz-recap-card">
      <div class="quiz-recap-row"><span class="quiz-recap-lbl">🎂 Âge</span><span class="quiz-recap-val">${aL[_draft.age]||'—'}</span></div>
      <div class="quiz-recap-row"><span class="quiz-recap-lbl">🎯 Objectif</span><span class="quiz-recap-val">${gL[_draft.goal]||'—'}</span></div>
      <div class="quiz-recap-row"><span class="quiz-recap-lbl">📊 Niveau</span><span class="quiz-recap-val">${lL[_draft.level]||'—'}</span></div>
      <div class="quiz-recap-row"><span class="quiz-recap-lbl">📅 Fréquence</span><span class="quiz-recap-val">${_draft.days?_draft.days+' j/sem':'—'}</span></div>
      <div class="quiz-recap-row"><span class="quiz-recap-lbl">⏱️ Durée</span><span class="quiz-recap-val">${_draft.sessionTime?_draft.sessionTime+' min':'—'}</span></div>
      <div class="quiz-recap-row"><span class="quiz-recap-lbl">🩺 Santé</span><span class="quiz-recap-val">${healthList}</span></div>
    </div>
    ${!canGen?`<p class="quiz-warn">⚠️ Certaines réponses manquent.</p>`:''}
    <button class="btn-generate${canGen?'':' disabled'}" ${canGen?'onclick="Prog.generateProgram()"':''}>⚡ Générer mon programme IA</button>`;
  }

  /* ═══ NAVIGATION QUIZ ═══ */
  function selectAndNext(field, value) {
    _draft[field] = value;
    nextStep();
  }

  function nextStep() {
    if (_stepIdx < STEPS.length - 1) { _stepIdx++; renderQuestionnaire(document.getElementById('prog-content')); }
  }

  function prevStep() {
    if (_stepIdx > 0) { _stepIdx--; renderQuestionnaire(document.getElementById('prog-content')); }
  }

  function selectDraft(field, value) { _draft[field] = value; }

  function toggleHealth(val) {
    if (val==='aucun') { _draft.healthConditions.clear(); }
    else { _draft.healthConditions.delete('aucun'); if(_draft.healthConditions.has(val)) _draft.healthConditions.delete(val); else _draft.healthConditions.add(val); }
    renderQuestionnaire(document.getElementById('prog-content'));
  }

  function toggleEquip(val) {
    if(_draft.equipment.has(val)) _draft.equipment.delete(val); else _draft.equipment.add(val);
    renderQuestionnaire(document.getElementById('prog-content'));
  }

  /* ═══ GÉNÉRATION ═══ */
  async function generateProgram() {
    const container = document.getElementById('prog-content');
    _phase = 'loading';
    renderLoader(container);
    await new Promise(r => setTimeout(r, 1400));
    try {
      STATE.profile.ageGroup         = _draft.age;
      STATE.profile.goal             = _draft.goal;
      STATE.profile.level            = _draft.level;
      STATE.profile.days             = parseInt(_draft.days) || 3;
      STATE.profile.sessionTime      = parseInt(_draft.sessionTime) || 45;
      STATE.profile.healthConditions = new Set(_draft.healthConditions);

      const program = AI.generateProgram({
        level:            STATE.profile.level,
        goal:             STATE.profile.goal,
        days:             STATE.profile.days,
        sessionTime:      STATE.profile.sessionTime,
        ageGroup:         STATE.profile.ageGroup,
        healthConditions: [...STATE.profile.healthConditions],
      });

      STATE.currentProgram = program;
      STATE.currentWeek = 1;
      STATE.completedDays = new Set();
      _currentWeekView = 1;

      saveProgramToStorage(program);
      saveProfileToStorage();

      if (STATE.user?.id) {
        DB.upsert('profiles', { id:STATE.user.id, program_data:JSON.stringify(program), fitness_level:STATE.profile.level, goal:STATE.profile.goal, session_days:STATE.profile.days, session_time:STATE.profile.sessionTime, age_group:STATE.profile.ageGroup }).catch(()=>{});
      }

      _phase = 'program';
      showToast('🦁 Programme prêt !', 'success');
      renderProgram(container);
    } catch(err) {
      console.error('[Prog]', err);
      showToast('Erreur lors de la génération. Réessaie !', 'error');
      _phase = 'questionnaire';
      renderQuestionnaire(document.getElementById('prog-content'));
    }
  }

  /* ═══ MODIFIER ═══ */
  function modifyProgram() {
    _draft.age           = STATE.profile.ageGroup || '';
    _draft.goal          = STATE.profile.goal || '';
    _draft.level         = STATE.profile.level || '';
    _draft.days          = String(STATE.profile.days || '');
    _draft.sessionTime   = String(STATE.profile.sessionTime || '');
    _draft.healthConditions = new Set(STATE.profile.healthConditions || []);
    STATE.currentProgram = null;
    localStorage.removeItem('fitlife_program');
    _openDayCard = null; _stepIdx = 0; _phase = 'questionnaire';
    renderQuestionnaire(document.getElementById('prog-content'));
  }

  /* ═══ RENDER PROGRAMME ═══ */
  function renderProgram(container) {
    const program = STATE.currentProgram;
    if (!program) { render(); return; }
    _currentWeekView = _currentWeekView || STATE.currentWeek || 1;
    const summary   = AI.getWeekSummary(program);
    const todayPlan = AI.getTodayPlan(program, STATE.checkinMood, STATE.checkinEnergy);
    container.innerHTML = `
      ${renderHero(program, summary)}
      ${renderMoodBanner(todayPlan)}
      ${renderWeekNav(program)}
      <p class="prog-section-title">CETTE SEMAINE</p>
      <div class="prog-days-list">${renderDays(summary, todayPlan)}</div>
      <div class="prog-modify-wrap">
        <button class="btn-modify-prog" onclick="Prog.modifyProgram()">✏️ Modifier mon programme</button>
      </div>`;
    attachWeekNavEvents();
    autoOpenToday();
  }

  function renderHero(program, summary) {
    const pct = Math.round(((summary.weekNumber-1)/program.totalWeeks)*100);
    const gL = {muscle:'💪 Prise de muscle',poids:'🔥 Perte de poids',cardio:'❤️ Cardio',mobilite:'🧘 Mobilité'};
    const lL = {debutant:'Débutant',intermediaire:'Intermédiaire',avance:'Avancé'};
    return `<div class="prog-hero">
      <div class="prog-hero-top">
        <div class="prog-hero-icon">🦁</div>
        <div class="prog-hero-info">
          <div class="prog-hero-title">${gL[program.goal]||'Mon Programme'}</div>
          <div class="prog-hero-subtitle">${lL[program.level]||''} · ${program.sessionDays}j/sem</div>
        </div>
        <div class="prog-hero-week-badge">S${summary.weekNumber}/${program.totalWeeks}</div>
      </div>
      <div class="prog-progress-label"><span>Progression globale</span><strong>${pct}%</strong></div>
      <div class="prog-progress-bar"><div class="prog-progress-fill" style="width:${pct}%"></div></div>
      <div class="prog-hero-stats">
        <div class="prog-stat"><span class="prog-stat-val">${STATE.totalSessions||0}</span><span class="prog-stat-lbl">Séances</span></div>
        <div class="prog-stat"><span class="prog-stat-val">${(STATE.completedDays||new Set()).size}</span><span class="prog-stat-lbl">Jours faits</span></div>
        <div class="prog-stat"><span class="prog-stat-val">${summary.trainingCount}</span><span class="prog-stat-lbl">Jours/sem</span></div>
      </div>
    </div>`;
  }

  function renderMoodBanner(todayPlan) {
    if (!todayPlan?.moodTag) return '';
    const cls = todayPlan.exercises?.length<=3 ? 'mood-low' : todayPlan.moodAdapted ? 'mood-great' : '';
    return `<div class="prog-mood-banner ${cls}"><div class="prog-mood-tag">${todayPlan.moodTag}</div><div class="prog-mood-text">${todayPlan.moodSuggestion||''}</div></div>`;
  }

  function renderWeekNav(program) {
    return `<div class="prog-week-nav" id="prog-week-nav">${program.weeks.map(w=>`
      <button class="prog-week-pill${w.week===_currentWeekView?' active':''}${w.decharge?' decharge':''}" data-week="${w.week}">S${w.week}${w.week===(STATE.currentWeek||1)?'●':''}</button>`).join('')}</div>`;
  }

  function renderDays(summary, todayPlan) {
    const jsDay = new Date().getDay();
    const todayIdx = jsDay===0?6:jsDay-1;
    const isCurWeek = _currentWeekView===(STATE.currentWeek||1);
    return summary.days.map((day, idx) => {
      const isToday = isCurWeek && idx===todayIdx;
      const isDone  = isCompleted(day, summary.weekNumber);
      const isRest  = day.type==='repos';
      const isPast  = !isRest && (idx<todayIdx || _currentWeekView<(STATE.currentWeek||1));
      let status = isDone?'done':isToday?'today':isRest?'rest':isPast?'unlocked':'locked';
      const icons = {done:'✅',today:'🔥',rest:'😴',locked:'🔒',unlocked:'🎯'};
      const cardId = `day-card-${idx}`;
      const exercises = (isToday&&todayPlan?.exercises)?todayPlan.exercises:(day.exercises||[]);
      const label     = (isToday&&todayPlan?.moodAdapted)?todayPlan.label:day.label;
      const duration  = (isToday&&todayPlan?.duration)?todayPlan.duration:day.duration;
      const canOpen   = !isRest && exercises.length>0;
      const isOpen    = _openDayCard===cardId;
      const muscles   = getMainMuscles(exercises);
      return `<div class="prog-day-card status-${status}${isOpen?' open':''}" id="${cardId}" data-can-open="${canOpen}">
        <div class="prog-day-header" onclick="Prog.toggleDay('${cardId}',${canOpen})">
          <div class="prog-day-status-icon">${icons[status]||'🔒'}</div>
          <div class="prog-day-info">
            <div class="prog-day-name">${day.name}${!isRest?` · ${label}`:''}</div>
            <div class="prog-day-meta">${isRest?'Récupération':`${exercises.length} exercice${exercises.length>1?'s':''} · ~${duration} min`}</div>
          </div>
          ${canOpen?`<span class="prog-day-chevron">›</span>`:''}
        </div>
        ${canOpen?`<div class="prog-day-body">
          ${muscles.length?`<div class="prog-muscles-chips">${muscles.map(m=>`<span class="prog-muscle-chip">${m}</span>`).join('')}</div>`:''}
          <div class="prog-exercises-list">${exercises.map(e=>renderExercise(e)).join('')}</div>
          ${isToday?`<div class="prog-day-cta"><button class="btn-lancer-seance" onclick="Prog.launchWorkout()"><span>▶</span> Lancer la séance</button></div>`:''}
        </div>`:''}
      </div>`;
    }).join('');
  }

  function renderExercise(e) {
    return `<div class="prog-exercise-item">
      <div class="prog-exo-icon">${e.icon||'💪'}</div>
      <div class="prog-exo-info">
        <div class="prog-exo-name">${e.nom}</div>
        <div class="prog-exo-detail">${(e.muscles||[]).slice(0,2).join(' · ')}${e.repos?` · Repos ${Math.round(e.repos)}s`:''}</div>
      </div>
      <div class="prog-exo-sets">${e.sets}×${e.reps}</div>
    </div>`;
  }

  function renderLoader(container) {
    container.innerHTML = `<div class="prog-loader">
      <div class="prog-loader-spinner"></div>
      <div class="prog-loader-title">🦁 Génération en cours…</div>
      <div class="prog-loader-steps">
        <div class="loader-step active">Analyse de ton profil</div>
        <div class="loader-step">Sélection des exercices</div>
        <div class="loader-step">Construction des 12 semaines</div>
        <div class="loader-step">Ajustement santé & âge</div>
      </div>
    </div>`;
    let i=1; const steps=container.querySelectorAll('.loader-step');
    const t=setInterval(()=>{ if(i<steps.length){steps[i].classList.add('active');i++;}else clearInterval(t); },350);
  }

  /* ═══ INTERACTIONS ═══ */
  function toggleDay(cardId, canOpen) {
    if (!canOpen) return;
    if (_openDayCard&&_openDayCard!==cardId) { const p=document.getElementById(_openDayCard); if(p) p.classList.remove('open'); }
    const card=document.getElementById(cardId); if(!card) return;
    const willOpen=_openDayCard!==cardId;
    card.classList.toggle('open',willOpen);
    _openDayCard=willOpen?cardId:null;
    if(willOpen) setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
  }

  function autoOpenToday() {
    const t=document.querySelector('.prog-day-card.status-today');
    if(t?.dataset.canOpen==='true') setTimeout(()=>toggleDay(t.id,true),250);
  }

  function attachWeekNavEvents() {
    document.getElementById('prog-week-nav')?.querySelectorAll('.prog-week-pill').forEach(pill=>{
      pill.addEventListener('click',()=>{ _currentWeekView=parseInt(pill.dataset.week); _openDayCard=null; renderProgram(document.getElementById('prog-content')); });
    });
  }

  function launchWorkout() {
    const plan = AI.getTodayPlan(STATE.currentProgram, STATE.checkinMood, STATE.checkinEnergy);
    if (!plan || !plan.exercises || plan.exercises.length === 0) {
      showToast('Pas d\'exercices pour aujourd\'hui.', 'info');
      return;
    }
    STATE.activeWorkout = plan;
    navigate('seance');
    // Initialise le moteur de séance après la navigation
    setTimeout(() => Seance.init(plan), 50);
  }

  /* ═══ HELPERS ═══ */
  function getMainMuscles(exercises) {
    const all=[];
    (exercises||[]).forEach(e=>(e.muscles||[]).forEach(m=>{if(!all.includes(m)&&all.length<4)all.push(m);}));
    return all;
  }
  function isCompleted(day,weekNum) { return (STATE.completedDays||new Set()).has(`w${weekNum}_d${day.day}`); }
  function saveProgramToStorage(p) { try{localStorage.setItem('fitlife_program',JSON.stringify(p));}catch(e){} }
  function saveProfileToStorage() {
    try{const p=STATE.profile; localStorage.setItem('fitlife_profile',JSON.stringify({ageGroup:p.ageGroup,goal:p.goal,level:p.level,days:p.days,sessionTime:p.sessionTime,healthConditions:[...(p.healthConditions||[])]}));}catch(e){}
  }
  function loadProgramFromStorage() {
    try{const r=localStorage.getItem('fitlife_program'); if(r) STATE.currentProgram=JSON.parse(r); const rP=localStorage.getItem('fitlife_profile'); if(rP){const p=JSON.parse(rP); STATE.profile={...STATE.profile,...p,healthConditions:new Set(p.healthConditions||[])};}}catch(e){}
  }

  return { init, render, startQuestionnaire, nextStep, prevStep, selectDraft, selectAndNext, toggleHealth, toggleEquip, generateProgram, modifyProgram, toggleDay, launchWorkout };

})();
