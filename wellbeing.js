/* ═══════════════════════════════════════════════════════
   FITLIFE IA — WELLBEING PAGE 🌟
   Page Bien-être alimentée par l'API Claude.
   Génère en temps réel 5 sections personnalisées :
   - Conseil du jour (IA)
   - Message d'encouragement selon l'humeur
   - Astuce mentale / confiance en soi
   - Conseil nutrition simple
   - Article bien-être court
   + 2 vidéos YouTube motivation/technique

   Cache localStorage 24h pour éviter les appels redondants.
═══════════════════════════════════════════════════════ */

const Wellbeing = (() => {

  /* ── État interne ── */
  let _loaded   = false;
  let _loading  = false;
  let _content  = null; // { date, sections, videos }

  /* ── Vidéos motivation/technique par objectif et condition ── */
  const VIDEO_BANK = {
    poids: [
      { id: 'ml6cT4AZdqI', title: 'Perte de poids sans salle', sub: 'Entraînement maison complet' },
      { id: 'UItWltVZgDQ', title: 'Cardio doux débutant', sub: '20 min sans sauter' },
      { id: '2pLT-olgUJs', title: 'Marche pour maigrir', sub: 'La méthode simple' },
    ],
    muscle: [
      { id: 'IODxDxX7oi4', title: 'Musculation au poids du corps', sub: 'Débutant → intermédiaire' },
      { id: 'vc1E5CfRfos', title: 'Programme Push Pull', sub: 'Sans équipement' },
      { id: 'DHO05J82s_Y', title: 'Pompes : toutes les variantes', sub: 'De 0 à expert' },
    ],
    cardio: [
      { id: 'ml6cT4AZdqI', title: 'Cardio HIIT maison', sub: '15 min brûle-graisses' },
      { id: 'gC_L9ij_g5k', title: 'Endurance pour débutant', sub: 'Sans se blesser' },
      { id: 'UItWltVZgDQ', title: 'Cardio low impact', sub: 'Genoux et dos préservés' },
    ],
    mobilite: [
      { id: 'g_tea8ZNk5A', title: 'Yoga pour débutant', sub: 'Flexibilité et sérénité' },
      { id: 'v7AYKMP6rOE', title: 'Stretching quotidien', sub: '10 min chaque matin' },
      { id: '4pKly2JojMw', title: 'Yoga doux mal de dos', sub: 'Soulager la douleur' },
    ],
    // Par condition de santé
    mal_de_dos: [
      { id: '4pKly2JojMw', title: 'Yoga doux — mal de dos', sub: 'Exercices adaptés' },
      { id: 'g_tea8ZNk5A', title: 'Étirements bas du dos', sub: 'Soulagement immédiat' },
    ],
    obesite: [
      { id: 'UItWltVZgDQ', title: 'Sport sans se blesser', sub: 'Programme doux efficace' },
      { id: '2pLT-olgUJs', title: 'Commencer quand on est en surpoids', sub: 'Les premiers pas' },
    ],
    confiance: [
      { id: 'XXjpRnvMTOE', title: 'Confiance en soi & sport', sub: 'Le lien corps-esprit' },
      { id: 'V80-gPkpH6M', title: 'Comment rester motivé', sub: 'Psychologie de la discipline' },
    ],
  };

  /* ── Construire le prompt IA ── */
  function _buildPrompt() {
    const u = STATE.user   || {};
    const p = STATE.profile || {};
    const conditions = [...(p.healthConditions || [])].join(', ') || 'aucune';

    const goalLabels = {
      poids:    'perte de poids',
      muscle:   'prise de muscle',
      cardio:   'amélioration cardio',
      mobilite: 'mobilité et souplesse',
    };
    const levelLabels = {
      debutant:      'débutant complet',
      intermediaire: 'intermédiaire',
      avance:        'avancé',
    };
    const moodLabels = {
      top:     'très bien, plein d\'énergie',
      bien:    'bien, motivé',
      moyen:   'moyen, un peu fatigué',
      fatigue: 'fatigué, peu d\'énergie',
      nul:     'pas bien du tout, découragé',
    };

    const goal    = goalLabels[p.goal]    || 'remise en forme';
    const level   = levelLabels[p.level]  || 'débutant';
    const mood    = moodLabels[STATE.checkinMood] || 'inconnu';
    const streak  = STATE.streakDays   || 0;
    const sessions= STATE.totalSessions || 0;
    const age     = p.ageGroup ? `autour de ${p.ageGroup} ans` : 'non précisé';
    const gender  = u.gender || 'non précisé';
    const firstName = u.firstName || 'l\'utilisateur';

    return `Tu es le coach bienveillant de l'application FitLife IA, conçue pour des personnes qui s'entraînent à la maison et n'ont pas les moyens d'aller en salle. Beaucoup souffrent de manque de confiance en soi, d'obésité, de douleurs chroniques (dos, genoux), ou d'isolement.

Profil de ${firstName} :
- Objectif : ${goal}
- Niveau : ${level}
- Âge : ${age}
- Genre : ${gender}
- Conditions de santé : ${conditions}
- Humeur aujourd'hui : ${mood}
- Streak actuel : ${streak} jour(s) consécutifs
- Séances totales accomplies : ${sessions}
- Semaine du programme : semaine ${STATE.currentWeek || 1}

Génère exactement ce JSON (sans markdown, sans backticks, juste le JSON brut) :
{
  "conseil": {
    "titre": "titre accrocheur du conseil du jour (max 8 mots)",
    "texte": "conseil personnalisé de 2-3 phrases, chaleureux et motivant, adapté aux difficultés de cette personne spécifiquement"
  },
  "encouragement": {
    "emoji": "un emoji qui correspond à l'humeur",
    "message": "message d'encouragement court (1-2 phrases), très personnel, qui reconnaît l'effort et l'humeur du jour"
  },
  "mental": {
    "titre": "titre de l'astuce mentale (max 7 mots)",
    "texte": "astuce pratique sur la confiance en soi, la motivation, ou la résilience. 2-3 phrases concrètes et actionnables."
  },
  "nutrition": {
    "titre": "titre du conseil nutrition (max 7 mots)",
    "texte": "conseil nutrition simple, réaliste pour quelqu'un avec budget modeste. 2-3 phrases. Aliments accessibles en supermarché."
  },
  "article": {
    "titre": "titre d'un mini-article bien-être (max 8 mots)",
    "chapeau": "intro courte de 1 phrase",
    "contenu": "mini-article de 4-5 phrases sur un sujet bien-être lié au profil (sommeil, récupération, stress, douleurs, etc.)"
  }
}`;
  }

  /* ── Appel API Claude ── */
  async function _fetchAIContent() {
    const prompt = _buildPrompt();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    const raw = data.content?.map(b => b.text || '').join('') || '';
    // Nettoyer le JSON
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  /* ── Choisir les vidéos selon le profil ── */
  function _pickVideos() {
    const p = STATE.profile || {};
    const conditions = [...(p.healthConditions || [])];
    const goal = p.goal || 'poids';

    let pool = [...(VIDEO_BANK[goal] || VIDEO_BANK.poids)];

    // Ajouter des vidéos spécifiques aux conditions
    if (conditions.includes('dos'))      pool = [...VIDEO_BANK.mal_de_dos, ...pool];
    if (conditions.includes('obesite'))  pool = [...VIDEO_BANK.obesite,   ...pool];
    if (conditions.includes('confiance'))pool = [...VIDEO_BANK.confiance, ...pool];

    // Dédupliquer et prendre 2
    const seen = new Set();
    const unique = pool.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });
    return unique.slice(0, 2);
  }

  /* ── Cache localStorage 24h ── */
  function _loadCache() {
    try {
      const uid   = STATE.user?.id;
      if (!uid) return null;
      const raw   = localStorage.getItem(`fitlife-wellbeing-${uid}`);
      if (!raw)  return null;
      const cache = JSON.parse(raw);
      const today = new Date().toLocaleDateString('fr-CA');
      if (cache.date !== today) return null; // expiré
      return cache;
    } catch { return null; }
  }

  function _saveCache(sections) {
    try {
      const uid = STATE.user?.id;
      if (!uid) return;
      const today = new Date().toLocaleDateString('fr-CA');
      localStorage.setItem(`fitlife-wellbeing-${uid}`, JSON.stringify({
        date: today,
        sections,
        videos: _pickVideos(),
      }));
    } catch {}
  }

  /* ── Rendu skeleton (chargement) ── */
  function _renderSkeleton(container) {
    container.innerHTML = `
    <div class="wb-screen">
      <div class="wb-header">
        <div class="wb-header-title">🌟 Bien-être</div>
        <div class="wb-header-sub">Contenu personnalisé par l'IA</div>
      </div>
      <div class="wb-body">
        <div class="wb-ai-loading">
          <div class="wb-ai-spinner"></div>
          <div class="wb-ai-loading-text">L'IA prépare ton contenu personnalisé…</div>
          <div class="wb-ai-loading-sub">Analyse de ton profil en cours 🧠</div>
        </div>
        ${[1,2,3].map(() => `
          <div class="wb-skeleton-card">
            <div class="wb-skeleton-line wb-sk-title"></div>
            <div class="wb-skeleton-line wb-sk-body"></div>
            <div class="wb-skeleton-line wb-sk-body wb-sk-short"></div>
          </div>
        `).join('')}
        <div class="nav-spacer"></div>
      </div>
    </div>`;
  }

  /* ── Rendu principal ── */
  function _renderContent(container, sections, videos) {
    const u = STATE.user || {};
    const firstName = u.firstName || '';
    const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
    const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

    container.innerHTML = `
    <div class="wb-screen">

      <!-- Header -->
      <div class="wb-header">
        <div>
          <div class="wb-header-title">🌟 Bien-être</div>
          <div class="wb-header-sub">${todayCap}</div>
        </div>
        <button class="wb-refresh-btn" onclick="Wellbeing.refresh()" title="Actualiser">
          <span id="wb-refresh-icon">↻</span>
        </button>
      </div>

      <div class="wb-body">

        <!-- Message d'encouragement — banner en haut -->
        <div class="wb-encourage-banner">
          <div class="wb-encourage-emoji">${sections.encouragement.emoji}</div>
          <div class="wb-encourage-text">${sections.encouragement.message}</div>
        </div>

        <!-- Conseil du jour — card principale IA -->
        <div class="wb-section-label">💡 Conseil du jour</div>
        <div class="wb-card wb-card-conseil">
          <div class="wb-card-accent"></div>
          <div class="wb-card-inner">
            <div class="wb-card-title">${sections.conseil.titre}</div>
            <div class="wb-card-text">${sections.conseil.texte}</div>
            <div class="wb-ia-badge">✦ Généré par l'IA pour toi</div>
          </div>
        </div>

        <!-- Vidéos motivation -->
        <div class="wb-section-label">🎥 Vidéos pour toi</div>
        <div class="wb-videos-row">
          ${videos.map(v => `
          <div class="wb-video-card" onclick="Wellbeing.openVideo('${v.id}')">
            <div class="wb-video-thumb" style="background-image:url('https://img.youtube.com/vi/${v.id}/mqdefault.jpg')">
              <div class="wb-video-play">▶</div>
            </div>
            <div class="wb-video-info">
              <div class="wb-video-title">${v.title}</div>
              <div class="wb-video-sub">${v.sub}</div>
            </div>
          </div>
          `).join('')}
        </div>

        <!-- Astuce mentale -->
        <div class="wb-section-label">🧠 Mindset</div>
        <div class="wb-card wb-card-mental">
          <div class="wb-card-inner">
            <div class="wb-card-icon-row">🧠</div>
            <div class="wb-card-title">${sections.mental.titre}</div>
            <div class="wb-card-text">${sections.mental.texte}</div>
          </div>
        </div>

        <!-- Nutrition -->
        <div class="wb-section-label">🍎 Nutrition</div>
        <div class="wb-card wb-card-nutrition">
          <div class="wb-card-inner">
            <div class="wb-card-icon-row">🍎</div>
            <div class="wb-card-title">${sections.nutrition.titre}</div>
            <div class="wb-card-text">${sections.nutrition.texte}</div>
          </div>
        </div>

        <!-- Mini-article bien-être -->
        <div class="wb-section-label">📖 Article bien-être</div>
        <div class="wb-article-card">
          <div class="wb-article-chapeau">${sections.article.chapeau}</div>
          <div class="wb-article-title">${sections.article.titre}</div>
          <div class="wb-article-body" id="wb-article-body" style="display:none">
            ${sections.article.contenu}
          </div>
          <button class="wb-article-toggle" id="wb-article-toggle" onclick="Wellbeing.toggleArticle()">
            Lire la suite ↓
          </button>
        </div>

        <!-- Footer IA -->
        <div class="wb-footer">
          <div class="wb-footer-text">Contenu généré par Claude (Anthropic) · Mis à jour chaque jour</div>
          <button class="wb-footer-refresh" onclick="Wellbeing.refresh()">Actualiser le contenu</button>
        </div>

        <div class="nav-spacer"></div>
      </div>
    </div>`;
  }

  /* ── Rendu erreur ── */
  function _renderError(container, msg) {
    container.innerHTML = `
    <div class="wb-screen">
      <div class="wb-header">
        <div class="wb-header-title">🌟 Bien-être</div>
        <div class="wb-header-sub">Contenu personnalisé</div>
      </div>
      <div class="wb-body">
        <div class="wb-error-card">
          <div class="wb-error-icon">😔</div>
          <div class="wb-error-title">Contenu indisponible</div>
          <div class="wb-error-text">${msg || 'Vérifie ta connexion internet et réessaie.'}</div>
          <button class="wb-retry-btn" onclick="Wellbeing.refresh()">🔄 Réessayer</button>
        </div>
        ${_renderFallback()}
        <div class="nav-spacer"></div>
      </div>
    </div>`;
  }

  /* ── Contenu de secours si l'IA échoue ── */
  function _renderFallback() {
    const p = STATE.profile || {};
    const tips = {
      poids:    { conseil:'Commence par 10 minutes de marche rapide. C\'est plus efficace qu\'une heure de sport que tu ne feras pas.', nutrition:'Remplace les boissons sucrées par de l\'eau. Ce seul changement peut réduire ton apport calorique de 200-300 kcal/jour.' },
      muscle:   { conseil:'La régularité bat l\'intensité. 3 séances courtes par semaine valent mieux qu\'une séance marathon tous les 15 jours.', nutrition:'Les œufs sont la meilleure source de protéines accessible. 2 œufs le matin t\'apportent 12g de protéines pour moins de 50 centimes.' },
      cardio:   { conseil:'Le cardio ne doit pas être douloureux. Si tu peux tenir une conversation en faisant du sport, tu es dans la bonne zone.', nutrition:'L\'hydratation est essentielle pour les performances cardio. Bois 500ml d\'eau avant chaque séance.' },
      mobilite: { conseil:'5 minutes d\'étirements chaque matin changent ta journée. Le corps souple est un corps qui souffre moins.', nutrition:'Les aliments anti-inflammatoires (curcuma, gingembre, poisson gras) aident à réduire les douleurs articulaires.' },
    };
    const tip = tips[p.goal] || tips.poids;
    return `
    <div class="wb-section-label">💡 Conseil du jour</div>
    <div class="wb-card wb-card-conseil">
      <div class="wb-card-accent"></div>
      <div class="wb-card-inner">
        <div class="wb-card-title">Ton conseil de récupération</div>
        <div class="wb-card-text">${tip.conseil}</div>
      </div>
    </div>
    <div class="wb-section-label">🍎 Nutrition</div>
    <div class="wb-card wb-card-nutrition">
      <div class="wb-card-inner">
        <div class="wb-card-icon-row">🍎</div>
        <div class="wb-card-title">Astuce nutrition du jour</div>
        <div class="wb-card-text">${tip.nutrition}</div>
      </div>
    </div>`;
  }

  /* ══════════════════════════════════════════════════════
     API PUBLIQUE
  ══════════════════════════════════════════════════════ */

  function init() {
    _loaded  = false;
    // On ne recharge pas si déjà en cache aujourd'hui
  }

  async function render() {
    const container = document.getElementById('screen-wellbeing');
    if (!container) return;

    // 1. Vérifier le cache
    const cached = _loadCache();
    if (cached && cached.sections) {
      _content = cached;
      _renderContent(container, cached.sections, cached.videos || _pickVideos());
      _loaded = true;
      return;
    }

    // 2. Afficher skeleton pendant le chargement
    _renderSkeleton(container);
    _loading = true;

    try {
      const sections = await _fetchAIContent();
      const videos   = _pickVideos();
      _content = { sections, videos };
      _saveCache(sections);
      _renderContent(container, sections, videos);
      _loaded = true;
    } catch (err) {
      console.warn('[Wellbeing] API error:', err);
      _renderError(container, 'L\'IA n\'a pas pu générer ton contenu aujourd\'hui.');
    } finally {
      _loading = false;
    }
  }

  async function refresh() {
    // Forcer rechargement en supprimant le cache
    try {
      const uid = STATE.user?.id;
      if (uid) localStorage.removeItem(`fitlife-wellbeing-${uid}`);
    } catch {}
    _loaded = false;
    _content = null;

    // Animer le bouton
    const icon = document.getElementById('wb-refresh-icon');
    if (icon) { icon.style.animation = 'wbSpin 0.8s linear infinite'; }

    await render();
  }

  function openVideo(ytId) {
    // Ouvrir dans une sheet modale
    document.getElementById('wb-video-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'wb-video-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.85);
      z-index:600;display:flex;align-items:center;justify-content:center;
      padding:20px;
    `;
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
    <div style="width:100%;max-width:480px;border-radius:20px;overflow:hidden;background:#000;box-shadow:0 20px 60px rgba(0,0,0,0.8);">
      <div style="display:flex;justify-content:flex-end;padding:10px 14px;background:#111;">
        <button onclick="document.getElementById('wb-video-overlay').remove()"
          style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;">✕</button>
      </div>
      <div style="position:relative;padding-bottom:56.25%;height:0;">
        <iframe style="position:absolute;top:0;left:0;width:100%;height:100%;"
          src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0"
          frameborder="0" allow="autoplay;encrypted-media" allowfullscreen>
        </iframe>
      </div>
    </div>`;

    document.getElementById('app')?.appendChild(overlay);
  }

  function toggleArticle() {
    const body   = document.getElementById('wb-article-body');
    const toggle = document.getElementById('wb-article-toggle');
    if (!body || !toggle) return;
    const isHidden = body.style.display === 'none';
    body.style.display    = isHidden ? 'block' : 'none';
    toggle.textContent    = isHidden ? 'Réduire ↑' : 'Lire la suite ↓';
  }

  return { init, render, refresh, openVideo, toggleArticle };

})();
