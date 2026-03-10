/* ═══════════════════════════════════════════════════════
   FITLIFE IA — MOTEUR IA PROGRAMME
   Génère un programme adaptatif complet selon :
   • Âge (6 groupes avec profils physiologiques)
   • Conditions de santé / contre-indications
   • Objectif principal
   • Niveau de forme
   • Humeur + énergie du jour (check-in)
   ═══════════════════════════════════════════════════════ */

const AI = (() => {

  /* ─────────────────────────────────────────
     1. PROFILS PAR ÂGE
  ───────────────────────────────────────── */
  const AGE_PROFILES = {
    jeune:   { max: 24,  volMul: 1.15, restMul: 0.80, maxExo: 7, maxDays: 5, recupDays: 1 },
    adulte:  { max: 39,  volMul: 1.00, restMul: 1.00, maxExo: 6, maxDays: 5, recupDays: 1 },
    quadra:  { max: 49,  volMul: 0.90, restMul: 1.20, maxExo: 5, maxDays: 4, recupDays: 2 },
    quinqua: { max: 54,  volMul: 0.85, restMul: 1.30, maxExo: 5, maxDays: 3, recupDays: 2 },
    senior:  { max: 64,  volMul: 0.75, restMul: 1.45, maxExo: 4, maxDays: 3, recupDays: 2 },
    seniorPlus: { max: 999, volMul: 0.65, restMul: 1.65, maxExo: 4, maxDays: 3, recupDays: 3 },
  };

  function getAgeProfile(age) {
    age = parseInt(age) || 30;
    for (const [key, p] of Object.entries(AGE_PROFILES)) {
      if (age <= p.max) return { name: key, ...p };
    }
    return { name: 'seniorPlus', ...AGE_PROFILES.seniorPlus };
  }

  /* ─────────────────────────────────────────
     2. BIBLIOTHÈQUE D'EXERCICES
     Chaque exercice : { id, nom, muscles, équipement,
       catégorie, niveaux, contrIndic, séries, reps,
       repos, desc, icon }
  ───────────────────────────────────────── */
  const EXERCISES = {

    /* ── FORCE HAUT DU CORPS ── */
    developpe_couche:     { id:'dc',  nom:'Développé couché',      muscles:['pectoraux','triceps','épaules'], equip:'barre', cat:'force', niveaux:['inter','avance'], contrIndic:['epaule','poignet'], sets:4, reps:'8-10', repos:90, icon:'🏋️' },
    developpe_incline:    { id:'di',  nom:'Développé incliné haltères', muscles:['pectoraux_haut','épaules'], equip:'halteres', cat:'force', niveaux:['inter','avance'], contrIndic:['epaule'], sets:3, reps:'10-12', repos:75, icon:'💪' },
    pompes:               { id:'pm',  nom:'Pompes',                 muscles:['pectoraux','triceps'], equip:'aucun', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:['poignet'], sets:3, reps:'10-15', repos:60, icon:'💪' },
    pompes_genoux:        { id:'pkg', nom:'Pompes sur genoux',      muscles:['pectoraux','triceps'], equip:'aucun', cat:'force', niveaux:['debutant'], contrIndic:['genou_severe'], sets:3, reps:'12-15', repos:60, icon:'💪' },
    tractions:            { id:'tr',  nom:'Tractions',              muscles:['dos','biceps'], equip:'barre_traction', cat:'force', niveaux:['inter','avance'], contrIndic:['epaule','coude'], sets:4, reps:'6-10', repos:90, icon:'🔝' },
    tirage_poulie:        { id:'tp',  nom:'Tirage poulie haute',    muscles:['dos','biceps'], equip:'machine', cat:'force', niveaux:['debutant','inter'], contrIndic:['epaule'], sets:3, reps:'12', repos:75, icon:'💪' },
    rowing_haltere:       { id:'rh',  nom:'Rowing 1 bras haltère', muscles:['dos','biceps'], equip:'haltere', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:['dos_lombaire'], sets:3, reps:'12', repos:60, icon:'💪' },
    curl_biceps:          { id:'cb',  nom:'Curl biceps haltères',   muscles:['biceps'], equip:'halteres', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:['coude'], sets:3, reps:'12-15', repos:60, icon:'💪' },
    curl_marteau:         { id:'cm',  nom:'Curl marteau',           muscles:['biceps','avant_bras'], equip:'halteres', cat:'force', niveaux:['debutant','inter'], contrIndic:['coude'], sets:3, reps:'12', repos:60, icon:'💪' },
    dips:                 { id:'dp',  nom:'Dips triceps',           muscles:['triceps','épaules'], equip:'barres_paralleles', cat:'force', niveaux:['inter','avance'], contrIndic:['epaule','coude'], sets:3, reps:'10-12', repos:75, icon:'💪' },
    extension_triceps:    { id:'et',  nom:'Extension triceps câble', muscles:['triceps'], equip:'machine', cat:'force', niveaux:['debutant','inter'], contrIndic:['coude'], sets:3, reps:'15', repos:60, icon:'💪' },
    presse_epaules:       { id:'pe',  nom:'Presse militaire haltères', muscles:['épaules','triceps'], equip:'halteres', cat:'force', niveaux:['inter','avance'], contrIndic:['epaule','cervical'], sets:4, reps:'10', repos:90, icon:'🏋️' },
    lateral_raises:       { id:'lr',  nom:'Élévations latérales',  muscles:['épaules'], equip:'halteres', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:['epaule_severe'], sets:3, reps:'15', repos:60, icon:'💪' },
    face_pull:            { id:'fp',  nom:'Face pull',             muscles:['épaules_post','trapèzes'], equip:'machine', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:[], sets:3, reps:'15', repos:60, icon:'💪' },

    /* ── FORCE BAS DU CORPS ── */
    squat_barre:          { id:'sq',  nom:'Squat barre',           muscles:['quadriceps','fessiers','lombaires'], equip:'barre', cat:'force', niveaux:['inter','avance'], contrIndic:['genou','dos_lombaire'], sets:4, reps:'8-10', repos:120, icon:'🏋️' },
    squat_gobelet:        { id:'sg',  nom:'Squat gobelet haltère', muscles:['quadriceps','fessiers'], equip:'haltere', cat:'force', niveaux:['debutant','inter'], contrIndic:['genou_severe'], sets:3, reps:'12-15', repos:75, icon:'💪' },
    squat_chaise:         { id:'sc',  nom:'Squat chaise (mur)',    muscles:['quadriceps','fessiers'], equip:'aucun', cat:'force', niveaux:['debutant'], contrIndic:['genou_severe'], sets:3, reps:'45s', repos:60, icon:'🪑' },
    fentes:               { id:'fn',  nom:'Fentes marchées',       muscles:['quadriceps','fessiers','ischios'], equip:'halteres', cat:'force', niveaux:['debutant','inter'], contrIndic:['genou','hanche'], sets:3, reps:'10/jambe', repos:75, icon:'🦵' },
    leg_press:            { id:'lp',  nom:'Leg press machine',     muscles:['quadriceps','fessiers'], equip:'machine', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:['genou_severe','dos_lombaire_severe'], sets:4, reps:'12', repos:90, icon:'🏋️' },
    romanian_deadlift:    { id:'rdl', nom:'Soulevé de terre roumain', muscles:['ischios','fessiers','lombaires'], equip:'barre', cat:'force', niveaux:['inter','avance'], contrIndic:['dos_lombaire'], sets:3, reps:'10', repos:90, icon:'🏋️' },
    pont_fessier:         { id:'pf',  nom:'Pont fessier',          muscles:['fessiers','ischios'], equip:'aucun', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:[], sets:3, reps:'15-20', repos:60, icon:'🌉' },
    hip_thrust:           { id:'ht',  nom:'Hip thrust barre',      muscles:['fessiers'], equip:'barre', cat:'force', niveaux:['inter','avance'], contrIndic:[], sets:4, reps:'12', repos:90, icon:'🏋️' },
    mollets_debout:       { id:'md',  nom:'Mollets debout',        muscles:['mollets'], equip:'aucun', cat:'force', niveaux:['debutant','inter','avance'], contrIndic:['cheville_severe'], sets:4, reps:'20', repos:45, icon:'🦵' },

    /* ── CARDIO ── */
    marche_rapide:        { id:'mr',  nom:'Marche rapide',          muscles:['global'], equip:'aucun', cat:'cardio', niveaux:['debutant','inter','avance'], contrIndic:[], sets:1, reps:'20-30min', repos:0, icon:'🚶' },
    velo_doux:            { id:'vd',  nom:'Vélo doux',             muscles:['global'], equip:'velo', cat:'cardio', niveaux:['debutant','inter','avance'], contrIndic:['genou_severe'], sets:1, reps:'20min', repos:0, icon:'🚴' },
    corde_sauter:         { id:'cs',  nom:'Corde à sauter',        muscles:['global'], equip:'corde', cat:'cardio', niveaux:['inter','avance'], contrIndic:['genou','cheville','cardiaque'], sets:5, reps:'1min', repos:30, icon:'🪢' },
    jumping_jacks:        { id:'jj',  nom:'Jumping Jacks',         muscles:['global'], equip:'aucun', cat:'cardio', niveaux:['debutant','inter'], contrIndic:['genou','cheville'], sets:3, reps:'30s', repos:30, icon:'⭐' },
    hiit_sprint:          { id:'hs',  nom:'Sprint HIIT',           muscles:['global'], equip:'aucun', cat:'cardio', niveaux:['inter','avance'], contrIndic:['genou_severe','cardiaque','hypertension'], sets:8, reps:'20s', repos:40, icon:'💨' },
    step_montee:          { id:'sm',  nom:'Step montée',           muscles:['fessiers','quadriceps'], equip:'step', cat:'cardio', niveaux:['debutant','inter'], contrIndic:['genou_severe'], sets:3, reps:'1min', repos:45, icon:'👟' },
    rameur:               { id:'rm',  nom:'Rameur',                muscles:['dos','bras','global'], equip:'machine', cat:'cardio', niveaux:['debutant','inter','avance'], contrIndic:['dos_lombaire_severe'], sets:1, reps:'15-20min', repos:0, icon:'🚣' },
    elliptique:           { id:'el',  nom:'Elliptique',            muscles:['global'], equip:'machine', cat:'cardio', niveaux:['debutant','inter','avance'], contrIndic:[], sets:1, reps:'20min', repos:0, icon:'♾️' },

    /* ── GAINAGE & CORE ── */
    planche:              { id:'pl',  nom:'Planche',               muscles:['core','épaules'], equip:'aucun', cat:'core', niveaux:['debutant','inter','avance'], contrIndic:['poignet_severe','dos_lombaire_severe'], sets:3, reps:'30-60s', repos:45, icon:'🧱' },
    planche_genou:        { id:'plg', nom:'Planche sur genoux',    muscles:['core'], equip:'aucun', cat:'core', niveaux:['debutant'], contrIndic:['genou_severe'], sets:3, reps:'30s', repos:45, icon:'🧱' },
    crunch:               { id:'cr',  nom:'Crunch',                muscles:['abdominaux'], equip:'aucun', cat:'core', niveaux:['debutant','inter'], contrIndic:['cervical'], sets:3, reps:'20', repos:45, icon:'🌀' },
    mountain_climbers:    { id:'mc',  nom:'Mountain climbers',     muscles:['core','cardio'], equip:'aucun', cat:'core', niveaux:['inter','avance'], contrIndic:['poignet','epaule'], sets:3, reps:'30s', repos:30, icon:'🧗' },
    russian_twist:        { id:'rt',  nom:'Russian twist',         muscles:['obliques'], equip:'aucun', cat:'core', niveaux:['inter'], contrIndic:['dos_lombaire'], sets:3, reps:'20', repos:45, icon:'🌀' },
    dead_bug:             { id:'db',  nom:'Dead bug',              muscles:['core','lombaires'], equip:'aucun', cat:'core', niveaux:['debutant','inter','avance'], contrIndic:[], sets:3, reps:'10/côté', repos:45, icon:'🐛' },
    gainage_lateral:      { id:'gl',  nom:'Gainage latéral',      muscles:['obliques','core'], equip:'aucun', cat:'core', niveaux:['debutant','inter'], contrIndic:['epaule'], sets:3, reps:'30s/côté', repos:45, icon:'↔️' },

    /* ── MOBILITÉ & RÉCUPÉRATION ── */
    etirement_ischios:    { id:'ei',  nom:'Étirement ischios',     muscles:['ischios'], equip:'aucun', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:2, reps:'45s/côté', repos:0, icon:'🧘' },
    etirement_quadriceps: { id:'eq',  nom:'Étirement quadriceps',  muscles:['quadriceps'], equip:'aucun', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:2, reps:'45s/côté', repos:0, icon:'🧘' },
    etirement_epaules:    { id:'ee',  nom:'Étirement épaules',     muscles:['épaules'], equip:'aucun', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:2, reps:'30s/côté', repos:0, icon:'🧘' },
    rotation_hanches:     { id:'roh', nom:'Rotation hanches',      muscles:['hanche','fessiers'], equip:'aucun', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:['hanche_severe'], sets:2, reps:'10/côté', repos:0, icon:'🔄' },
    chat_vache:           { id:'cv',  nom:'Chat-vache',            muscles:['dos','core'], equip:'aucun', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:2, reps:'10 cycles', repos:0, icon:'🐱' },
    yoga_salut_soleil:    { id:'yss', nom:'Salut au soleil',       muscles:['global'], equip:'tapis', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:3, reps:'séquence', repos:0, icon:'🌅' },
    foam_roller_dos:      { id:'frd', nom:'Foam roller dos',       muscles:['dos'], equip:'foam_roller', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:1, reps:'2min', repos:0, icon:'🫧' },
    foam_roller_cuisse:   { id:'frc', nom:'Foam roller cuisses',   muscles:['quadriceps','ischios'], equip:'foam_roller', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:1, reps:'2min', repos:0, icon:'🫧' },
    respiration_4_7_8:    { id:'r478',nom:'Respiration 4-7-8',     muscles:['mental'], equip:'aucun', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:4, reps:'cycles', repos:0, icon:'🌬️' },
    marche_douce:         { id:'mdo', nom:'Marche douce 15min',    muscles:['global'], equip:'aucun', cat:'mobilite', niveaux:['debutant','inter','avance'], contrIndic:[], sets:1, reps:'15min', repos:0, icon:'🚶' },
  };

  /* ─────────────────────────────────────────
     3. GROUPES MUSCULAIRES PAR JOUR
     Selon l'objectif et le nb de jours/semaine
  ───────────────────────────────────────── */
  const SPLIT_TEMPLATES = {
    // 3 jours
    '3': {
      muscle: [
        { nom:'Poitrine & Triceps', exo:['developpe_couche','developpe_incline','pompes','dips','extension_triceps'] },
        { nom:'Dos & Biceps',       exo:['tractions','tirage_poulie','rowing_haltere','curl_biceps','curl_marteau'] },
        { nom:'Jambes & Core',      exo:['squat_gobelet','fentes','pont_fessier','planche','crunch','mollets_debout'] },
      ],
      poids: [
        { nom:'Full Body Circuit',  exo:['jumping_jacks','squat_gobelet','pompes','fentes','planche','mountain_climbers'] },
        { nom:'HIIT Cardio',        exo:['hiit_sprint','jumping_jacks','mountain_climbers','planche'] },
        { nom:'Renfo + Cardio',     exo:['squat_gobelet','pont_fessier','pompes','rameur','crunch'] },
      ],
      cardio: [
        { nom:'Cardio Endurance',   exo:['velo_doux','elliptique','etirement_ischios','etirement_quadriceps'] },
        { nom:'HIIT + Core',        exo:['hiit_sprint','jumping_jacks','planche','mountain_climbers','crunch'] },
        { nom:'Cardio Récup',       exo:['marche_rapide','foam_roller_dos','etirement_ischios','chat_vache'] },
      ],
      mobilite: [
        { nom:'Yoga & Mobilité',    exo:['yoga_salut_soleil','rotation_hanches','chat_vache','etirement_epaules','respiration_4_7_8'] },
        { nom:'Force Douce',        exo:['squat_chaise','pont_fessier','planche_genou','dead_bug','etirement_ischios'] },
        { nom:'Stretching Global',  exo:['foam_roller_dos','foam_roller_cuisse','etirement_ischios','etirement_quadriceps','etirement_epaules'] },
      ],
    },
    // 4 jours
    '4': {
      muscle: [
        { nom:'Poitrine & Triceps', exo:['developpe_couche','developpe_incline','pompes','dips','extension_triceps','lateral_raises'] },
        { nom:'Dos & Biceps',       exo:['tractions','tirage_poulie','rowing_haltere','curl_biceps','curl_marteau','face_pull'] },
        { nom:'Jambes',             exo:['squat_barre','fentes','romanian_deadlift','leg_press','mollets_debout'] },
        { nom:'Épaules & Core',     exo:['presse_epaules','lateral_raises','face_pull','planche','crunch','gainage_lateral'] },
      ],
      poids: [
        { nom:'Circuit Haut',       exo:['pompes','tirage_poulie','presse_epaules','extension_triceps','curl_biceps'] },
        { nom:'HIIT Cardio',        exo:['hiit_sprint','corde_sauter','jumping_jacks','mountain_climbers'] },
        { nom:'Circuit Bas',        exo:['squat_gobelet','fentes','pont_fessier','step_montee','mollets_debout'] },
        { nom:'Full Body + Core',   exo:['planche','crunch','russian_twist','dead_bug','mountain_climbers'] },
      ],
      cardio: [
        { nom:'Endurance Longue',   exo:['velo_doux','elliptique','etirement_ischios'] },
        { nom:'HIIT Intense',       exo:['hiit_sprint','corde_sauter','jumping_jacks','planche'] },
        { nom:'Cardio + Renfo',     exo:['rameur','squat_gobelet','pompes','pont_fessier'] },
        { nom:'Récup Active',       exo:['marche_rapide','yoga_salut_soleil','foam_roller_dos','respiration_4_7_8'] },
      ],
      mobilite: [
        { nom:'Yoga Flow',          exo:['yoga_salut_soleil','chat_vache','rotation_hanches','etirement_epaules'] },
        { nom:'Force + Équilibre',  exo:['squat_chaise','pont_fessier','dead_bug','planche_genou'] },
        { nom:'Stretching Profond', exo:['foam_roller_dos','foam_roller_cuisse','etirement_ischios','etirement_quadriceps','etirement_epaules'] },
        { nom:'Pilates Doux',       exo:['dead_bug','chat_vache','gainage_lateral','rotation_hanches','respiration_4_7_8'] },
      ],
    },
    // 5 jours
    '5': {
      muscle: [
        { nom:'Poitrine',           exo:['developpe_couche','developpe_incline','pompes','dips','lateral_raises'] },
        { nom:'Dos',                exo:['tractions','tirage_poulie','rowing_haltere','face_pull'] },
        { nom:'Jambes',             exo:['squat_barre','romanian_deadlift','leg_press','fentes','mollets_debout'] },
        { nom:'Épaules & Bras',     exo:['presse_epaules','lateral_raises','curl_biceps','curl_marteau','extension_triceps'] },
        { nom:'Core & Cardio',      exo:['planche','crunch','russian_twist','mountain_climbers','jumping_jacks'] },
      ],
      poids: [
        { nom:'HIIT Total',         exo:['hiit_sprint','jumping_jacks','mountain_climbers','pompes','planche'] },
        { nom:'Circuit Haut Corps', exo:['pompes','tirage_poulie','presse_epaules','curl_biceps','extension_triceps'] },
        { nom:'HIIT Bas Corps',     exo:['squat_gobelet','fentes','hiit_sprint','step_montee','corde_sauter'] },
        { nom:'Circuit Complet',    exo:['squat_gobelet','pompes','pont_fessier','crunch','jumping_jacks'] },
        { nom:'Récup Active',       exo:['marche_rapide','yoga_salut_soleil','foam_roller_dos','etirement_ischios'] },
      ],
      cardio: [
        { nom:'Cardio Longue Durée',exo:['velo_doux','elliptique'] },
        { nom:'HIIT Intense',       exo:['hiit_sprint','corde_sauter','jumping_jacks','mountain_climbers'] },
        { nom:'Renfo Cardio',       exo:['rameur','squat_gobelet','pompes','planche'] },
        { nom:'Cardio Modéré',      exo:['velo_doux','step_montee','jumping_jacks'] },
        { nom:'Récup & Mobilité',   exo:['marche_douce','foam_roller_dos','etirement_ischios','respiration_4_7_8'] },
      ],
      mobilite: [
        { nom:'Yoga Matin',         exo:['yoga_salut_soleil','chat_vache','respiration_4_7_8'] },
        { nom:'Force Douce',        exo:['squat_chaise','pont_fessier','dead_bug','planche_genou'] },
        { nom:'Étirements Actifs',  exo:['rotation_hanches','etirement_epaules','etirement_ischios','etirement_quadriceps'] },
        { nom:'Pilates Core',       exo:['dead_bug','gainage_lateral','chat_vache','planche_genou'] },
        { nom:'Foam Roller & Relax',exo:['foam_roller_dos','foam_roller_cuisse','respiration_4_7_8','marche_douce'] },
      ],
    },
  };

  /* ─────────────────────────────────────────
     4. CONDITIONS DE SANTÉ → CONTRE-INDICATIONS
  ───────────────────────────────────────── */
  const HEALTH_MAP = {
    mal_de_dos:     ['dos_lombaire', 'squat_barre', 'romanian_deadlift'],
    mal_de_dos_severe: ['dos_lombaire','dos_lombaire_severe','squat_barre','romanian_deadlift','russian_twist'],
    genou:          ['genou'],
    genou_severe:   ['genou','genou_severe'],
    epaule:         ['epaule'],
    epaule_severe:  ['epaule','epaule_severe'],
    cardiaque:      ['cardiaque','hiit_sprint','corde_sauter','hiit_intense'],
    hypertension:   ['hypertension','hiit_sprint'],
    diabete:        [],   // pas de contre-indic directe, juste adapter intensité
    asthme:         ['hiit_sprint','corde_sauter'],
    arthrose:       ['genou','epaule','dos_lombaire'],
    hernie_discale: ['dos_lombaire','dos_lombaire_severe','squat_barre'],
    grossesse:      ['dos_lombaire','russian_twist','crunch','planche_genou'],
    postpartum:     ['hiit_sprint','russian_twist'],
    fibromyalgie:   ['hiit_sprint','hiit_intense'],
    hypermobilite:  ['hiit_sprint'],
  };

  /* ─────────────────────────────────────────
     5. ADAPTATION MOOD / ÉNERGIE DU JOUR
  ───────────────────────────────────────── */
  /**
   * mood : 'great' | 'good' | 'neutral' | 'tired' | 'bad'
   * energy : 1-10
   * Retourne un facteur d'adaptation { intensityMul, label, suggestion }
   */
  function getMoodAdaptation(mood, energy) {
    const e = parseInt(energy) || 5;
    const moodScore = { great:5, good:4, neutral:3, tired:2, bad:1 }[mood] || 3;
    const combined = (moodScore + e / 2) / 2;  // 0–5

    if (combined >= 4.5) return { mul:1.15, tag:'🔥 Journée Max',   suggestion:'Tu es au top ! Programme intensifié.', skipRest:true };
    if (combined >= 3.5) return { mul:1.00, tag:'💪 Journée Pleine', suggestion:'Grande forme. Programme complet.', skipRest:false };
    if (combined >= 2.5) return { mul:0.85, tag:'😐 Journée Normale', suggestion:'Bonne énergie. Légère adaptation.', skipRest:false };
    if (combined >= 1.5) return { mul:0.70, tag:'😴 Journée Légère', suggestion:'Énergie basse. Séance allégée recommandée.', skipRest:false };
    return { mul:0.50, tag:'🌿 Récupération Active', suggestion:'Corps fatigué. Mobilité & récupération aujourd\'hui.', skipRest:false };
  }

  /* ─────────────────────────────────────────
     6. FILTRAGE DES EXERCICES PAR PROFIL
  ───────────────────────────────────────── */
  function filterExercises(exoIds, level, healthConditions, ageProfile) {
    // Construit un Set de toutes les contre-indications actives
    const blocked = new Set();
    for (const cond of healthConditions) {
      const tags = HEALTH_MAP[cond] || [];
      tags.forEach(t => blocked.add(t));
    }

    return exoIds.map(id => {
      const e = EXERCISES[id];
      if (!e) return null;

      // Vérif contre-indications
      const hasContrIndic = e.contrIndic.some(ci => blocked.has(ci)) || blocked.has(id);
      if (hasContrIndic) {
        // Cherche un substitut de même catégorie
        const sub = findSubstitute(e.cat, e.muscles, level, blocked, id);
        return sub || null;
      }

      // Vérif niveau
      if (!e.niveaux.includes(level)) {
        const adapted = adaptToLevel(e, level);
        return adapted;
      }

      return { ...e };
    }).filter(Boolean).slice(0, ageProfile.maxExo);
  }

  function findSubstitute(cat, muscles, level, blocked, excludeId) {
    for (const [id, e] of Object.entries(EXERCISES)) {
      if (id === excludeId) continue;
      if (e.cat !== cat) continue;
      if (!e.niveaux.includes(level) && level !== 'inter') continue;
      const hasContrIndic = e.contrIndic.some(ci => blocked.has(ci)) || blocked.has(id);
      if (!hasContrIndic) return { ...e };
    }
    return null;
  }

  function adaptToLevel(e, level) {
    // Si exercice trop difficile → on garde mais on réduit les séries/reps
    const adapted = { ...e };
    if (level === 'debutant') {
      adapted.sets = Math.max(2, adapted.sets - 1);
      adapted.reps = '8-10';
    }
    return adapted;
  }

  /* ─────────────────────────────────────────
     7. CALCUL DURÉE ESTIMÉE
  ───────────────────────────────────────── */
  function estimateDuration(exercises, ageProfile) {
    let total = 0;
    for (const e of exercises) {
      const sets = e.sets || 3;
      const tempo = 45; // secondes par série
      const rest = (e.repos || 60) * ageProfile.restMul;
      total += sets * (tempo + rest);
    }
    total += 600; // 10min échauffement
    return Math.round(total / 60);
  }

  /* ─────────────────────────────────────────
     8. GÉNÉRATION DU PROGRAMME COMPLET
     Retourne un objet programme de 12 semaines
  ───────────────────────────────────────── */
  function generateProgram(profile) {
    const {
      level = 'debutant',
      goal = 'muscle',
      days = 3,
      sessionTime = 45,
      ageGroup = '30',
      healthConditions = [],
      targetKg = null,
    } = profile;

    const ageProfile = getAgeProfile(ageGroup);
    const sessionDays = Math.min(parseInt(days), ageProfile.maxDays);
    const splitKey = String(Math.min(sessionDays, 5));
    const goalKey = goal in SPLIT_TEMPLATES[splitKey] ? goal : 'muscle';

    const templates = SPLIT_TEMPLATES[splitKey][goalKey];
    const healthSet = Array.isArray(healthConditions) ? healthConditions : [...healthConditions];

    // Distribution des jours de la semaine
    const WEEK_DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    const trainingDays = selectTrainingDays(sessionDays);

    // Génère 12 semaines
    const weeks = [];
    for (let w = 1; w <= 12; w++) {
      const weekDays = [];

      // Progression: volume augmente chaque mois, puis décharge sem 4/8/12
      const decharge = (w % 4 === 0);
      const volumeMod = decharge ? 0.7 : (1 + (Math.floor((w-1)/4)) * 0.08);
      const intensity = decharge ? '😌 Décharge' : w <= 4 ? '🟢 Adaptation' : w <= 8 ? '🟡 Progression' : '🔴 Intensification';

      WEEK_DAYS.forEach((dayName, idx) => {
        const trainingIdx = trainingDays.indexOf(idx);
        const isTraining = trainingIdx !== -1;
        const isRest = !isTraining;

        if (isRest) {
          weekDays.push({
            day: idx + 1,
            name: dayName,
            type: 'repos',
            label: '😴 Repos',
            exercises: [],
            duration: 0,
          });
          return;
        }

        const tpl = templates[trainingIdx % templates.length];
        const rawExos = filterExercises(tpl.exo, level, healthSet, ageProfile);

        // Applique volume modification
        const exos = rawExos.map(e => ({
          ...e,
          sets: Math.max(1, Math.round((e.sets || 3) * ageProfile.volMul * volumeMod)),
          repos: Math.round((e.repos || 60) * ageProfile.restMul),
        }));

        const duration = Math.min(sessionTime + 10, estimateDuration(exos, ageProfile));

        weekDays.push({
          day: idx + 1,
          name: dayName,
          type: 'training',
          label: tpl.nom,
          intensity,
          exercises: exos,
          duration: Math.round(duration),
        });
      });

      weeks.push({
        week: w,
        label: intensity,
        decharge,
        days: weekDays,
      });
    }

    return {
      id: `prog_${Date.now()}`,
      createdAt: new Date().toISOString(),
      goal,
      level,
      sessionDays,
      ageGroup,
      totalWeeks: 12,
      weeks,
      meta: {
        ageProfile: ageProfile.name,
        healthConditions: healthSet,
        sessionTime,
      },
    };
  }

  /* ─────────────────────────────────────────
     9. SÉLECTION INTELLIGENTE DES JOURS
  ───────────────────────────────────────── */
  function selectTrainingDays(n) {
    // Distribue les séances de façon optimale dans la semaine (0=Lundi)
    const patterns = {
      1: [0],
      2: [0, 3],
      3: [0, 2, 4],
      4: [0, 1, 3, 4],
      5: [0, 1, 2, 4, 5],
    };
    return patterns[Math.min(n, 5)] || patterns[3];
  }

  /* ─────────────────────────────────────────
     10. ADAPTATION TEMPS RÉEL (MOOD DU JOUR)
     Prend le jour du programme et l'adapte selon mood
  ───────────────────────────────────────── */
  function adaptDayToMood(dayPlan, mood, energy) {
    const adaptation = getMoodAdaptation(mood, energy);

    if (dayPlan.type === 'repos') return { ...dayPlan, moodTag: adaptation.tag, moodSuggestion: adaptation.suggestion };

    // Énergie très basse → switch en récup active
    if (adaptation.mul <= 0.55) {
      const recupExos = [
        EXERCISES.marche_douce,
        EXERCISES.chat_vache,
        EXERCISES.etirement_ischios,
        EXERCISES.etirement_quadriceps,
        EXERCISES.respiration_4_7_8,
      ].filter(Boolean);

      return {
        ...dayPlan,
        label: '🌿 Récupération Active',
        exercises: recupExos,
        duration: 20,
        moodTag: adaptation.tag,
        moodSuggestion: adaptation.suggestion,
        moodAdapted: true,
      };
    }

    // Sinon : ajuster sets selon le multiplicateur
    const adaptedExos = dayPlan.exercises.map(e => ({
      ...e,
      sets: Math.max(1, Math.round(e.sets * adaptation.mul)),
    }));

    return {
      ...dayPlan,
      exercises: adaptedExos,
      moodTag: adaptation.tag,
      moodSuggestion: adaptation.suggestion,
      moodAdapted: adaptation.mul !== 1.0,
    };
  }

  /* ─────────────────────────────────────────
     11. RÉCUPÈRE LE JOUR ACTUEL DU PROGRAMME
  ───────────────────────────────────────── */
  function getTodayPlan(program, mood, energy) {
    if (!program) return null;
    const currentWeek = STATE.currentWeek || 1;
    const weekIdx = Math.min(currentWeek - 1, program.weeks.length - 1);
    const week = program.weeks[weekIdx];
    if (!week) return null;

    // Jour de la semaine JS : 0=dimanche → adapte à 0=lundi
    const jsDay = new Date().getDay(); // 0=dim, 1=lun...6=sam
    const dayIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=lun...6=dim
    const todayPlan = week.days[dayIdx];
    if (!todayPlan) return null;

    return adaptDayToMood(todayPlan, mood, energy);
  }

  /* ─────────────────────────────────────────
     12. RÉSUMÉ SEMAINE EN COURS
  ───────────────────────────────────────── */
  function getWeekSummary(program) {
    if (!program) return null;
    const currentWeek = STATE.currentWeek || 1;
    const weekIdx = Math.min(currentWeek - 1, program.weeks.length - 1);
    const week = program.weeks[weekIdx];
    if (!week) return null;

    const trainingDays = week.days.filter(d => d.type === 'training');
    const totalDuration = trainingDays.reduce((sum, d) => sum + (d.duration || 0), 0);
    const completedToday = STATE.completedDays || new Set();

    return {
      weekNumber: currentWeek,
      totalWeeks: 12,
      label: week.label,
      decharge: week.decharge,
      trainingCount: trainingDays.length,
      totalDuration,
      days: week.days,
      completedDays: completedToday,
    };
  }

  /* ─────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────── */
  return {
    generateProgram,
    getTodayPlan,
    getWeekSummary,
    getMoodAdaptation,
    getAgeProfile,
    EXERCISES,
  };

})();
