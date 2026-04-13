/**
 * CVCraft — Application JavaScript
 * Architecture: Singleton App object, reactive state, declarative rendering
 */

"use strict";

const App = (() => {

  /* ════════════════════════════════════════════
     STATE
  ════════════════════════════════════════════ */
  const STATE = {
    theme: 'savane',
    accent: '#e8a048',
    font: 'nunito',
    name: '', title: '', email: '',
    phone: '', location: '', web: '', summary: '',
    photo: null, logo: null,
    showPhoto: true, showLogo: false,
    exp: [], edu: [], skills: [], lang: [],
    zoom: 1,
    _id: 0,
  };

  const fontMap = {
    nunito: "'Cabinet Grotesk', 'Nunito', sans-serif",
    cormorant: "'Cormorant Garamond', Georgia, serif",
    mono: "'DM Mono', 'Courier New', monospace",
  };

  const STORAGE_KEY = 'cvcraft_v3';

  /* ════════════════════════════════════════════
     UTILITIES
  ════════════════════════════════════════════ */
  const h = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const lgt = (hex, n) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const c = v => Math.min(255, Math.max(0, v + n)).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
  };

  const uid = () => `id-${++STATE._id}`;

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  /* ════════════════════════════════════════════
     CURSOR
  ════════════════════════════════════════════ */
  const initCursor = () => {
    const cursor = $('cursor');
    const dot = $('cursorDot');
    if (!cursor || window.matchMedia('(max-width:768px)').matches) return;

    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      cx = lerp(cx, mx, 0.1);
      cy = lerp(cy, my, 0.1);
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('a,button,label,[role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
  };

  /* ════════════════════════════════════════════
     NAV SCROLL
  ════════════════════════════════════════════ */
  const initNav = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = $('navToggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => links.classList.toggle('open'));
    }
  };

  /* ════════════════════════════════════════════
     LANDING ↔ BUILDER
  ════════════════════════════════════════════ */
  const openBuilder = () => {
    $('landing').style.display = 'none';
    const builder = $('builder');
    builder.hidden = false;
    builder.style.display = 'flex';
    update();
  };

  const closeBuilder = () => {
    $('builder').hidden = true;
    $('builder').style.display = 'none';
    $('landing').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBuilderWithTheme = theme => {
    openBuilder();
    const btn = document.querySelector(`[data-theme="${theme}"].ts-btn`);
    setTheme(theme, btn);
  };

  /* ════════════════════════════════════════════
     EXAMPLE DATA
  ════════════════════════════════════════════ */
  const loadExample = who => {
    openBuilder();
    STATE.exp = []; STATE.edu = []; STATE.skills = []; STATE.lang = [];

    if (who === 'gertrude') {
      Object.assign(STATE, {
        theme: 'savane', accent: '#e8a048', font: 'nunito',
        name: 'AZIAKO Gertrude Vasti',
        title: 'Directrice Marketing Digital',
        email: 'g.aziako@email.tg',
        phone: '+228 90 45 67 89',
        location: 'Lomé, Togo',
        web: 'linkedin.com/in/aziako-gertrude',
        summary: 'Professionnelle du marketing digital avec 8 ans d\'expérience en Afrique de l\'Ouest. Spécialisée en stratégie de contenu, gestion de marque et acquisition client numérique. Passionnée par la croissance des entreprises africaines à l\'ère du digital.',
        exp: [
          { id: uid(), title: 'Directrice Marketing Digital', company: 'Ecobank Togo', period: 'Jan 2021 — Présent', desc: 'Pilotage de la stratégie digitale pour 3 pays. Augmentation de l\'engagement en ligne de 240%. Gestion d\'une équipe de 12 personnes et d\'un budget annuel de 150M FCFA.', open: false },
          { id: uid(), title: 'Responsable Communication', company: 'UTB — Union Togolaise de Banque', period: 'Mars 2018 — Déc 2020', desc: 'Refonte complète de l\'identité visuelle. Lancement de 4 campagnes nationales primées. Coordination avec les agences créatives partenaires.', open: false },
          { id: uid(), title: 'Chargée Marketing Digital', company: 'Jumia Togo', period: '2016 — 2018', desc: 'Gestion des campagnes d\'emailing et réseaux sociaux. Suivi KPIs et reporting mensuel. Croissance de la base client de 35%.', open: false },
        ],
        edu: [
          { id: uid(), degree: 'Master Marketing & Communication Digitale', school: 'Université de Lomé', period: '2014 — 2016', desc: 'Mention Très Bien. Mémoire sur le marketing mobile en Afrique subsaharienne.', open: false },
          { id: uid(), degree: 'Licence Économie & Gestion', school: 'UCAO — Lomé', period: '2011 — 2014', desc: '', open: false },
        ],
        skills: ['Marketing Digital', 'Google Analytics', 'Meta Ads', 'Brand Management', 'CRM Salesforce', 'Content Strategy', 'Adobe Creative Suite', 'Excel avancé', 'SEO/SEM'],
        lang: [
          { id: uid(), lang: 'Français', level: 'Langue maternelle', open: false },
          { id: uid(), lang: 'Anglais', level: 'Courant', open: false },
          { id: uid(), lang: 'Ewe', level: 'Langue maternelle', open: false },
        ],
      });
      setThemeBtn('savane');
      setColorBtn('#e8a048');

    } else if (who === 'bilal') {
      Object.assign(STATE, {
        theme: 'neon', accent: '#00ffb4', font: 'mono',
        name: 'ABDOULAYE Bilal',
        title: 'Développeur Full-Stack Senior',
        email: 'bilal.abdoulaye@dev.sn',
        phone: '+221 77 321 45 67',
        location: 'Dakar, Sénégal',
        web: 'github.com/bilal-abdoulaye',
        summary: 'Développeur Full-Stack passionné avec 6 ans d\'expérience dans la fintech et les startups africaines. Expert React, Node.js et architecture cloud AWS. Contributeur open-source actif et mentor de la communauté tech dakaroise.',
        exp: [
          { id: uid(), title: 'Lead Développeur Full-Stack', company: 'Wave Mobile Money', period: 'Juin 2022 — Présent', desc: 'Architecture et développement de l\'API de paiement mobile. 2M+ utilisateurs actifs. Stack: Node.js, React, PostgreSQL, AWS Lambda, Kafka.', open: false },
          { id: uid(), title: 'Développeur Backend Senior', company: 'Orange Sénégal — Digital Lab', period: '2019 — 2022', desc: 'Développement de micro-services pour la plateforme Orange Money. Amélioration des performances serveur de 60%. Mentoring d\'une équipe de 5 juniors.', open: false },
          { id: uid(), title: 'Développeur Full-Stack Junior', company: 'Expresso Telecom', period: '2017 — 2019', desc: 'Applications web et mobiles. Technologies: Python, Django, Vue.js, MySQL.', open: false },
        ],
        edu: [
          { id: uid(), degree: 'Master Génie Logiciel & Systèmes Distribués', school: 'École Polytechnique de Thiès (EPT)', period: '2015 — 2017', desc: 'Major de promotion. Projet de fin d\'études: Système de paiement mobile P2P sécurisé.', open: false },
          { id: uid(), degree: 'Licence Informatique', school: 'UCAD — Université Cheikh Anta Diop', period: '2012 — 2015', desc: '', open: false },
        ],
        skills: ['React', 'Node.js', 'TypeScript', 'Python', 'Django', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'Kafka', 'Redis'],
        lang: [
          { id: uid(), lang: 'Français', level: 'Langue maternelle', open: false },
          { id: uid(), lang: 'Wolof', level: 'Langue maternelle', open: false },
          { id: uid(), lang: 'Anglais', level: 'Avancé', open: false },
        ],
      });
      setThemeBtn('neon');
      setColorBtn('#00ffb4');
      setFontBtn('mono');
    }

    syncToUI();
    renderEntries();
    renderSkills();
    update();
  };

  /* ════════════════════════════════════════════
     THEME / COLOR / FONT
  ════════════════════════════════════════════ */
  const setTheme = (theme, btn) => {
    STATE.theme = theme;
    $$('.ts-btn').forEach(b => b.classList.toggle('active', b === btn));
    update();
  };

  const setThemeBtn = theme => {
    const btn = document.querySelector(`.ts-btn[data-theme="${theme}"]`);
    if (btn) setTheme(theme, btn);
  };

  const setColor = el => {
    STATE.accent = el.dataset.color;
    $$('.color-swatch').forEach(s => s.classList.toggle('active', s === el));
    update();
  };

  const setColorValue = val => {
    STATE.accent = val;
    $$('.color-swatch').forEach(s => s.classList.remove('active'));
    update();
  };

  const setColorBtn = color => {
    const btn = document.querySelector(`.color-swatch[data-color="${color}"]`);
    if (btn) {
      $$('.color-swatch').forEach(s => s.classList.toggle('active', s === btn));
      STATE.accent = color;
    }
  };

  const setFont = (font, el) => {
    STATE.font = font;
    $$('.font-opt').forEach(o => o.classList.toggle('active', o === el));
    update();
  };

  const setFontBtn = font => {
    const btn = document.querySelector(`.font-opt[data-font="${font}"]`);
    if (btn) {
      $$('.font-opt').forEach(o => o.classList.toggle('active', o === btn));
      STATE.font = font;
    }
  };

  /* ════════════════════════════════════════════
     ACCORDION
  ════════════════════════════════════════════ */
  const toggleAccordion = headerBtn => {
    headerBtn.closest('.accordion').classList.toggle('open');
  };

  /* ════════════════════════════════════════════
     PHOTO & LOGO
  ════════════════════════════════════════════ */
  const handlePhoto = input => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      STATE.photo = e.target.result;
      $('photoImg').src = e.target.result;
      $('photoImg').hidden = false;
      $('photoPlaceholder').style.display = 'none';
      update();
    };
    reader.readAsDataURL(file);
  };

  const handleLogo = input => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      STATE.logo = e.target.result;
      $('logoPreview').src = e.target.result;
      $('logoPreview').hidden = false;
      $('logoPlaceholder').style.display = 'none';
      update();
    };
    reader.readAsDataURL(file);
  };

  /* ════════════════════════════════════════════
     ENTRIES (Exp / Edu / Lang)
  ════════════════════════════════════════════ */
  const addEntry = type => {
    const id = uid();
    if (type === 'exp') STATE.exp.push({ id, title: '', company: '', period: '', desc: '', open: true });
    else if (type === 'edu') STATE.edu.push({ id, degree: '', school: '', period: '', desc: '', open: true });
    else if (type === 'lang') STATE.lang.push({ id, lang: '', level: 'Courant', open: true });
    renderEntries();
  };

  const removeEntry = (type, id) => {
    const arr = type === 'exp' ? STATE.exp : type === 'edu' ? STATE.edu : STATE.lang;
    const idx = arr.findIndex(e => e.id === id);
    if (idx > -1) arr.splice(idx, 1);
    renderEntries();
    update();
  };

  const toggleEntry = (type, id) => {
    const arr = type === 'exp' ? STATE.exp : type === 'edu' ? STATE.edu : STATE.lang;
    const entry = arr.find(e => e.id === id);
    if (entry) entry.open = !entry.open;
    renderEntries();
  };

  const updateEntry = (type, id, field, val) => {
    const arr = type === 'exp' ? STATE.exp : type === 'edu' ? STATE.edu : STATE.lang;
    const entry = arr.find(e => e.id === id);
    if (entry) entry[field] = val;
    // update card title without re-rendering all
    const titleEl = document.querySelector(`#entry-title-${id}`);
    if (titleEl) titleEl.textContent = getEntryLabel(entry, type);
    update();
  };

  const getEntryLabel = (entry, type) => {
    if (type === 'exp') return entry.title || entry.company || 'Nouvelle expérience';
    if (type === 'edu') return entry.degree || entry.school || 'Nouvelle formation';
    if (type === 'lang') return (entry.lang || 'Langue') + (entry.level ? ' — ' + entry.level : '');
    return 'Nouveau';
  };

  const renderEntries = () => {
    renderEntryList('exp', STATE.exp, renderExpEntry);
    renderEntryList('edu', STATE.edu, renderEduEntry);
    renderEntryList('lang', STATE.lang, renderLangEntry);
  };

  const renderEntryList = (type, arr, fn) => {
    const container = $(`${type}-list`);
    if (!container) return;
    container.innerHTML = arr.map(e => fn(type, e)).join('');
  };

  const makeEntryShell = (type, entry, bodyHTML) => `
    <div class="entry-card ${entry.open ? 'open' : ''}" id="ecard-${entry.id}">
      <div class="entry-card-header" onclick="App.toggleEntry('${type}','${entry.id}')">
        <span class="entry-title" id="entry-title-${entry.id}">${h(getEntryLabel(entry, type))}</span>
        <svg class="entry-toggle" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        <button class="entry-remove" onclick="event.stopPropagation();App.removeEntry('${type}','${entry.id}')" aria-label="Supprimer">✕</button>
      </div>
      <div class="entry-body">${bodyHTML}</div>
    </div>`;

  const renderExpEntry = (type, e) => makeEntryShell(type, e, `
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Poste</label>
        <input class="field-input" value="${h(e.title)}" placeholder="Développeur Senior" oninput="App.updateEntry('exp','${e.id}','title',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Entreprise</label>
        <input class="field-input" value="${h(e.company)}" placeholder="Google" oninput="App.updateEntry('exp','${e.id}','company',this.value)">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Période</label>
      <input class="field-input" value="${h(e.period)}" placeholder="Jan 2022 — Présent" oninput="App.updateEntry('exp','${e.id}','period',this.value)">
    </div>
    <div class="field-group">
      <label class="field-label">Description</label>
      <textarea class="field-textarea" placeholder="Responsabilités, réalisations clés…" oninput="App.updateEntry('exp','${e.id}','desc',this.value)">${h(e.desc)}</textarea>
    </div>`);

  const renderEduEntry = (type, e) => makeEntryShell(type, e, `
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Diplôme</label>
        <input class="field-input" value="${h(e.degree)}" placeholder="Master Informatique" oninput="App.updateEntry('edu','${e.id}','degree',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">École</label>
        <input class="field-input" value="${h(e.school)}" placeholder="Université de Lomé" oninput="App.updateEntry('edu','${e.id}','school',this.value)">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Période</label>
      <input class="field-input" value="${h(e.period)}" placeholder="2018 — 2021" oninput="App.updateEntry('edu','${e.id}','period',this.value)">
    </div>
    <div class="field-group">
      <label class="field-label">Description (optionnel)</label>
      <textarea class="field-textarea" placeholder="Mention, spécialité, projet…" oninput="App.updateEntry('edu','${e.id}','desc',this.value)">${h(e.desc)}</textarea>
    </div>`);

  const renderLangEntry = (type, e) => makeEntryShell(type, e, `
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Langue</label>
        <input class="field-input" value="${h(e.lang)}" placeholder="Anglais" oninput="App.updateEntry('lang','${e.id}','lang',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Niveau</label>
        <select class="field-select" onchange="App.updateEntry('lang','${e.id}','level',this.value)">
          ${['Débutant', 'Intermédiaire', 'Avancé', 'Courant', 'Bilingue', 'Langue maternelle']
      .map(l => `<option ${e.level === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
    </div>`);

  /* ════════════════════════════════════════════
     SKILLS
  ════════════════════════════════════════════ */
  const addSkill = () => {
    const input = $('skillInput');
    const val = (input.value || '').trim();
    if (val && !STATE.skills.includes(val)) {
      STATE.skills.push(val);
      input.value = '';
      renderSkills();
      update();
    }
  };

  const removeSkill = skill => {
    STATE.skills = STATE.skills.filter(s => s !== skill);
    renderSkills();
    update();
  };

  const skillKeydown = e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } };

  const renderSkills = () => {
    const container = $('skillTags');
    if (!container) return;
    container.innerHTML = STATE.skills.map(s =>
      `<span class="skill-tag">${h(s)}<button onclick="App.removeSkill('${h(s)}')" aria-label="Supprimer ${h(s)}">×</button></span>`
    ).join('');
  };

  /* ════════════════════════════════════════════
     ZOOM
  ════════════════════════════════════════════ */
  const zoomIn = () => { STATE.zoom = Math.min(1.5, STATE.zoom + 0.1); applyZoom(); };
  const zoomOut = () => { STATE.zoom = Math.max(0.5, STATE.zoom - 0.1); applyZoom(); };
  const applyZoom = () => {
    const sheet = $('cvSheet');
    if (sheet) sheet.style.transform = `scale(${STATE.zoom})`;
    const lvl = $('zoomLevel');
    if (lvl) lvl.textContent = Math.round(STATE.zoom * 100) + '%';
  };

  /* ════════════════════════════════════════════
     MOBILE TOGGLE
  ════════════════════════════════════════════ */
  const toggleMobileView = () => {
    const fp = document.querySelector('.form-panel');
    const pp = document.querySelector('.preview-panel');
    const lbl = $('mobileToggleLabel');
    const btn = $('mobileToggle');

    if (pp && pp.classList.contains('mobile-visible')) {
      pp.classList.remove('mobile-visible');
      fp && fp.classList.remove('mobile-hidden');
      if (lbl) lbl.textContent = 'Aperçu CV';
      btn && btn.querySelector('.icon-preview').setAttribute('hidden', '');
      btn && btn.querySelector('.icon-edit').removeAttribute('hidden');
    } else {
      pp && pp.classList.add('mobile-visible');
      fp && fp.classList.add('mobile-hidden');
      if (lbl) lbl.textContent = 'Éditer';
      btn && btn.querySelector('.icon-edit').setAttribute('hidden', '');
      btn && btn.querySelector('.icon-preview').removeAttribute('hidden');
    }
  };

  /* ════════════════════════════════════════════
     SAVE / LOAD / EXPORT
  ════════════════════════════════════════════ */
  const syncFromUI = () => {
    const fields = ['name', 'title', 'email', 'phone', 'location', 'web', 'summary'];
    fields.forEach(f => {
      const el = $(`f-${f}`);
      if (el) STATE[f] = el.value;
    });
    const togPh = $('tog-photo'); if (togPh) STATE.showPhoto = togPh.checked;
    const togLg = $('tog-logo'); if (togLg) STATE.showLogo = togLg.checked;
  };

  const syncToUI = () => {
    const fields = ['name', 'title', 'email', 'phone', 'location', 'web', 'summary'];
    fields.forEach(f => {
      const el = $(`f-${f}`);
      if (el) el.value = STATE[f] || '';
    });
    const togPh = $('tog-photo'); if (togPh) togPh.checked = STATE.showPhoto;
    const togLg = $('tog-logo'); if (togLg) togLg.checked = STATE.showLogo;

    if (STATE.photo) {
      const img = $('photoImg');
      img.src = STATE.photo; img.hidden = false;
      const ph = $('photoPlaceholder'); if (ph) ph.style.display = 'none';
    }
    if (STATE.logo) {
      const img = $('logoPreview');
      img.src = STATE.logo; img.hidden = false;
      const lph = $('logoPlaceholder'); if (lph) lph.style.display = 'none';
    }
  };

  const save = () => {
    syncFromUI();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e) { }
    const btn = $('saveBtn');
    if (btn) {
      const prev = btn.innerHTML;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Sauvegardé !</span>';
      setTimeout(() => { btn.innerHTML = prev; }, 1800);
    }
  };

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      Object.assign(STATE, saved);
      syncToUI();
      setThemeBtn(STATE.theme);
      setColorBtn(STATE.accent);
      setFontBtn(STATE.font);
      renderEntries();
      renderSkills();
      update();
    } catch (e) { }
  };

  const exportPDF = () => {
    syncFromUI();
    window.print();
  };

  /* ════════════════════════════════════════════
     KEYBOARD SHORTCUTS
  ════════════════════════════════════════════ */
  const initKeyboard = () => {
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    });
  };

  /* ════════════════════════════════════════════
     RENDER — helpers
  ════════════════════════════════════════════ */
  const photoHTML = (cls, sz = 78, radius = '50%') => {
    if (STATE.photo && STATE.showPhoto) {
      return `<img src="${STATE.photo}" style="width:${sz}px;height:${sz}px;object-fit:cover;border-radius:${radius}">`;
    }
    return '';
  };

  const logoHTML = (maxH = 34) => {
    if (STATE.logo && STATE.showLogo) {
      return `<img src="${STATE.logo}" alt="Logo" style="max-height:${maxH}px;max-width:140px;object-fit:contain;display:block;margin-bottom:6px">`;
    }
    return '';
  };

  const contactList = (...fields) =>
    fields.filter(Boolean).map(c => h(c));

  const expRows = (cls, accentColor) => STATE.exp.map(e => `
    <div class="${cls}-entry">
      <div class="${cls}-entry-header">
        <span class="${cls}-entry-title">${h(e.title)}</span>
        <span class="${cls}-entry-period">${h(e.period)}</span>
      </div>
      <div class="${cls}-entry-company" style="color:${accentColor}">${h(e.company)}</div>
      ${e.desc ? `<div class="${cls}-entry-desc">${h(e.desc)}</div>` : ''}
    </div>`).join('');

  const eduRows = (cls, accentColor) => STATE.edu.map(e => `
    <div class="${cls}-entry">
      <div class="${cls}-entry-header">
        <span class="${cls}-entry-title">${h(e.degree)}</span>
        <span class="${cls}-entry-period">${h(e.period)}</span>
      </div>
      <div class="${cls}-entry-company" style="color:${accentColor}">${h(e.school)}</div>
      ${e.desc ? `<div class="${cls}-entry-desc">${h(e.desc)}</div>` : ''}
    </div>`).join('');

  const skillTags = (cls, bg, color, border) => STATE.skills.map(s =>
    `<span class="${cls}" style="background:${bg};color:${color};${border ? 'border:1px solid ' + border + ';' : ''}">${h(s)}</span>`
  ).join('');

  const langItems = (cls, accentColor) => STATE.lang.map(l =>
    `<div class="${cls}-lang-item"><span style="font-weight:700">${h(l.lang)}</span><span class="${cls}-lang-level" style="color:${accentColor}">${h(l.level)}</span></div>`
  ).join('');

  /* ════════════════════════════════════════════
     RENDER — CV THEMES
  ════════════════════════════════════════════ */
  const renderSavane = (ac, fn) => {
    const acDark = lgt(ac, -40);
    return `
    <div class="cv-savane" style="font-family:${fn}">
      <div class="sav-sidebar" style="background:linear-gradient(175deg,${ac} 0%,${lgt(ac, -28)} 50%,${lgt(ac, -50)} 100%)">
        <div class="sav-ph">${STATE.photo && STATE.showPhoto ? `<img src="${STATE.photo}" alt="photo">` : '<span style="font-size:2rem">👤</span>'}</div>
        <div class="sav-name">${h(STATE.name) || 'Votre Nom'}</div>
        <div class="sav-title">${h(STATE.title) || 'Votre Titre'}</div>
        ${STATE.email ? `<div class="sav-sec" style="color:${lgt(ac, 60)}">Contact</div><div class="sav-contact-item">✉ ${h(STATE.email)}</div>` : ''}
        ${STATE.phone ? `<div class="sav-contact-item">📞 ${h(STATE.phone)}</div>` : ''}
        ${STATE.location ? `<div class="sav-contact-item">📍 ${h(STATE.location)}</div>` : ''}
        ${STATE.web ? `<div class="sav-contact-item">🔗 ${h(STATE.web)}</div>` : ''}
        ${STATE.skills.length ? `
          <div class="sav-sec" style="color:${lgt(ac, 60)}">Compétences</div>
          ${STATE.skills.map(s => `<div class="sav-skill"><div class="sav-skill-name">${h(s)}</div><div class="sav-skill-track"><div class="sav-skill-fill" style="width:85%;background:${lgt(ac, 60)}"></div></div></div>`).join('')}` : ''}
        ${STATE.lang.length ? `
          <div class="sav-sec" style="color:${lgt(ac, 60)}">Langues</div>
          ${STATE.lang.map(l => `<div class="sav-contact-item">${h(l.lang)}${l.level ? ' — ' + l.level : ''}</div>`).join('')}` : ''}
      </div>
      <div class="sav-main">
        ${logoHTML()}
        <div class="sav-heading" style="color:${acDark}">${h(STATE.name) || 'Votre Nom'}</div>
        <div class="sav-subtitle" style="color:${ac}">${h(STATE.title) || 'Votre Titre'}</div>
        ${STATE.summary ? `<div class="sav-section-lbl" style="color:${ac};border-bottom-color:${ac}">Profil</div><p class="sav-sum">${h(STATE.summary)}</p>` : ''}
        ${STATE.exp.length ? `
          <div class="sav-section-lbl" style="color:${ac};border-bottom-color:${ac}">Expérience Professionnelle</div>
          ${STATE.exp.map(e => `<div class="sav-entry"><div class="sav-entry-header"><span class="sav-entry-title">${h(e.title)}</span><span class="sav-entry-period">${h(e.period)}</span></div><div class="sav-entry-company" style="color:${ac}">${h(e.company)}</div>${e.desc ? `<div class="sav-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
        ${STATE.edu.length ? `
          <div class="sav-section-lbl" style="color:${ac};border-bottom-color:${ac}">Formation</div>
          ${STATE.edu.map(e => `<div class="sav-entry"><div class="sav-entry-header"><span class="sav-entry-title">${h(e.degree)}</span><span class="sav-entry-period">${h(e.period)}</span></div><div class="sav-entry-company" style="color:${ac}">${h(e.school)}</div>${e.desc ? `<div class="sav-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
      </div>
    </div>`;
  };

  const renderNuit = (ac, fn) => `
    <div class="cv-nuit" style="font-family:${fn}">
      <div class="nuit-top">
        <div style="flex:1;margin-right:.9rem">
          ${logoHTML(30)}
          <div class="nuit-name">${h(STATE.name) || 'Votre Nom'}</div>
          <div class="nuit-title-role" style="color:${ac}">${h(STATE.title) || 'Votre Titre'}</div>
        </div>
        <div>
          ${STATE.photo && STATE.showPhoto ? `<div class="nuit-ph"><img src="${STATE.photo}" alt="photo"></div>` : ''}
          <div class="nuit-contacts">${[STATE.email, STATE.phone, STATE.location].filter(Boolean).map(c => h(c)).join('<br>')}</div>
        </div>
      </div>
      ${STATE.summary ? `<div class="nuit-section" style="color:${ac}">Profil</div><p class="nuit-sum">${h(STATE.summary)}</p>` : ''}
      ${STATE.exp.length ? `
        <div class="nuit-section" style="color:${ac}">Expérience</div>
        ${STATE.exp.map(e => `<div class="nuit-entry"><div class="nuit-entry-left"><div class="nuit-entry-period" style="color:${ac}">${h(e.period)}</div><div class="nuit-entry-company">${h(e.company)}</div></div><div><div class="nuit-entry-title">${h(e.title)}</div>${e.desc ? `<div class="nuit-entry-desc">${h(e.desc)}</div>` : ''}</div></div>`).join('')}` : ''}
      ${STATE.edu.length ? `
        <div class="nuit-section" style="color:${ac}">Formation</div>
        ${STATE.edu.map(e => `<div class="nuit-entry"><div class="nuit-entry-left"><div class="nuit-entry-period" style="color:${ac}">${h(e.period)}</div><div class="nuit-entry-company">${h(e.school)}</div></div><div><div class="nuit-entry-title">${h(e.degree)}</div></div></div>`).join('')}` : ''}
      ${STATE.skills.length ? `<div class="nuit-section" style="color:${ac}">Compétences</div><div class="nuit-tags">${skillTags('nuit-tag', ac + '14', ac, ac + '30')}</div>` : ''}
      ${STATE.lang.length ? `<div class="nuit-section" style="color:${ac}">Langues</div><div class="nuit-tags">${STATE.lang.map(l => `<span class="nuit-tag" style="background:${ac}14;color:${ac};border:1px solid ${ac}30">${h(l.lang)} — ${h(l.level)}</span>`).join('')}</div>` : ''}
    </div>`;

  const renderNeon = (ac, fn) => {
    const mfn = "'DM Mono','Courier New',monospace";
    return `
    <div class="cv-neon" style="font-family:${mfn}">
      <div class="neon-bg-grid"></div>
      <div class="neon-profile-block" style="--neon-c:${ac}">
        <style>.neon-profile-block::before{color:${ac}}</style>
        ${STATE.photo && STATE.showPhoto ? `<div class="neon-ph" style="float:right;margin-left:.9rem;border-color:${ac}30"><img src="${STATE.photo}" alt="photo"></div>` : ''}
        ${logoHTML(26)}
        <div class="neon-full-name" style="color:${ac};text-shadow:0 0 20px ${ac}55">${h(STATE.name) || 'your_name'}</div>
        <div class="neon-role-label">${h(STATE.title) || 'your_role'}</div>
        <div class="neon-contacts-row">${[STATE.email, STATE.phone, STATE.location, STATE.web].filter(Boolean).map(c => `<span style="color:${ac}55">$ </span>${h(c)}`).join(' &nbsp; ')}</div>
      </div>
      ${STATE.summary ? `<div class="neon-sum" style="border-left-color:${ac}40;color:#7a9090">${h(STATE.summary)}</div>` : ''}
      ${STATE.exp.length ? `
        <div class="neon-comment" style="color:${ac}80">experience</div>
        ${STATE.exp.map(e => `<div class="neon-entry-block" style="border-left-color:${ac};border-color:${ac}18"><div class="neon-entry-title" style="color:${lgt(ac, 50)}">${h(e.title)}</div><div class="neon-entry-company" style="color:${ac}">${h(e.company)}</div><div class="neon-entry-period">${h(e.period)}</div>${e.desc ? `<div class="neon-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
      ${STATE.edu.length ? `
        <div class="neon-comment" style="color:${ac}80">education</div>
        ${STATE.edu.map(e => `<div class="neon-entry-block" style="border-left-color:${ac};border-color:${ac}18"><div class="neon-entry-title" style="color:${lgt(ac, 50)}">${h(e.degree)}</div><div class="neon-entry-company" style="color:${ac}">${h(e.school)}</div><div class="neon-entry-period">${h(e.period)}</div></div>`).join('')}` : ''}
      ${STATE.skills.length ? `<div class="neon-comment" style="color:${ac}80">skills</div><div class="neon-tags">${STATE.skills.map(s => `<span class="neon-chip" style="background:${ac}0d;color:${ac};border:1px solid ${ac}28">${h(s)}</span>`).join('')}</div>` : ''}
      ${STATE.lang.length ? `<div class="neon-comment" style="color:${ac}80">languages</div><div class="neon-tags">${STATE.lang.map(l => `<span class="neon-chip" style="background:${ac}0d;color:${ac};border:1px solid ${ac}28">${h(l.lang)} [${h(l.level)}]</span>`).join('')}</div>` : ''}
    </div>`;
  };

  const renderSahel = (ac, fn) => `
    <div class="cv-sahel" style="font-family:${fn}">
      <div class="sahel-header" style="color:${ac}">
        ${STATE.photo && STATE.showPhoto ? `<div class="sahel-ph" style="border-color:${ac}"><img src="${STATE.photo}" alt="photo"></div>` : ''}
        ${logoHTML(32)}
        <div class="sahel-full-name">${h(STATE.name) || 'Votre Nom'}</div>
        <div class="sahel-title" style="color:${ac}">${h(STATE.title) || 'Votre Titre'}</div>
        <div class="sahel-contacts">${contactList(STATE.email, STATE.phone, STATE.location, STATE.web).join(' · ')}</div>
      </div>
      <div class="sahel-body">
        <div>
          ${STATE.skills.length ? `<div class="sahel-section-lbl" style="color:${ac};border-color:${ac}35">${'Compétences'}</div>${STATE.skills.map(s => `<span class="sahel-chip" style="background:${ac}18;color:${lgt(ac, -55)}">${h(s)}</span>`).join('')}` : ''}
          ${STATE.lang.length ? `<div class="sahel-section-lbl" style="color:${ac};border-color:${ac}35">Langues</div>${langItems('sahel', ac)}` : ''}
        </div>
        <div>
          ${STATE.summary ? `<div class="sahel-section-lbl" style="color:${ac};border-color:${ac}35">Profil</div><p class="sahel-sum">${h(STATE.summary)}</p>` : ''}
          ${STATE.exp.length ? `<div class="sahel-section-lbl" style="color:${ac};border-color:${ac}35">Expérience</div>${STATE.exp.map(e => `<div class="sahel-entry"><div style="display:flex;justify-content:space-between"><span class="sahel-entry-title">${h(e.title)}</span><span class="sahel-entry-period">${h(e.period)}</span></div><div class="sahel-entry-company" style="color:${ac}">${h(e.company)}</div>${e.desc ? `<div class="sahel-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
          ${STATE.edu.length ? `<div class="sahel-section-lbl" style="color:${ac};border-color:${ac}35">Formation</div>${STATE.edu.map(e => `<div class="sahel-entry"><div style="display:flex;justify-content:space-between"><span class="sahel-entry-title">${h(e.degree)}</span><span class="sahel-entry-period">${h(e.period)}</span></div><div class="sahel-entry-company" style="color:${ac}">${h(e.school)}</div>${e.desc ? `<div class="sahel-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
        </div>
      </div>
    </div>`;

  const renderAurora = (ac, fn) => {
    const grad = `linear-gradient(135deg,${ac},${lgt(ac, 38)},${lgt(ac, 68)})`;
    return `
    <div class="cv-aurora" style="font-family:${fn}">
      <div class="aurora-header" style="background:${grad}">
        <div class="aurora-row">
          <div>
            ${logoHTML(30)}
            <div class="aurora-full-name">${h(STATE.name) || 'Votre Nom'}</div>
            <div class="aurora-role">${h(STATE.title) || 'Votre Titre'}</div>
          </div>
          <div>
            ${STATE.photo && STATE.showPhoto ? `<div class="aurora-ph"><img src="${STATE.photo}" alt="photo"></div>` : '<div class="aurora-ph" style="font-size:1.9rem">👤</div>'}
            <div class="aurora-contacts">${[STATE.email, STATE.phone, STATE.location].filter(Boolean).map(c => h(c)).join('<br>')}</div>
          </div>
        </div>
      </div>
      <div class="aurora-body">
        <div>
          ${STATE.skills.length ? `<div class="aurora-section" style="color:${ac}"><span style="background:${ac}"></span>Compétences</div><div class="aurora-tags">${STATE.skills.map(s => `<span class="aurora-tag" style="background:${ac}18;color:${lgt(ac, -45)}">${h(s)}</span>`).join('')}</div>` : ''}
          ${STATE.lang.length ? `<div class="aurora-section" style="color:${ac}"><span style="background:${ac}"></span>Langues</div>${STATE.lang.map(l => `<div class="aurora-lang-item"><div style="font-weight:700">${h(l.lang)}</div><div class="aurora-lang-level" style="color:${ac}">${h(l.level)}</div></div>`).join('')}` : ''}
        </div>
        <div>
          ${STATE.summary ? `<div class="aurora-section" style="color:${ac}"><span style="background:${ac}"></span>Profil</div><p class="aurora-sum">${h(STATE.summary)}</p>` : ''}
          ${STATE.exp.length ? `<div class="aurora-section" style="color:${ac}"><span style="background:${ac}"></span>Expérience</div>${STATE.exp.map(e => `<div class="aurora-entry"><div style="display:flex;justify-content:space-between"><span class="aurora-entry-title">${h(e.title)}</span><span class="aurora-entry-period">${h(e.period)}</span></div><div class="aurora-entry-company" style="color:${ac}">${h(e.company)}</div>${e.desc ? `<div class="aurora-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
          ${STATE.edu.length ? `<div class="aurora-section" style="color:${ac}"><span style="background:${ac}"></span>Formation</div>${STATE.edu.map(e => `<div class="aurora-entry"><div style="display:flex;justify-content:space-between"><span class="aurora-entry-title">${h(e.degree)}</span><span class="aurora-entry-period">${h(e.period)}</span></div><div class="aurora-entry-company" style="color:${ac}">${h(e.school)}</div>${e.desc ? `<div class="aurora-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
        </div>
      </div>
    </div>`;
  };

  const renderKente = (ac, fn) => `
    <div class="cv-kente" style="font-family:${fn}">
      <div class="kente-header">
        <div class="kente-stripe kente-stripe-top"></div>
        <div class="kente-inner">
          ${STATE.photo && STATE.showPhoto ? `<div class="kente-ph" style="border-color:${ac}"><img src="${STATE.photo}" alt="photo"></div>` : `<div class="kente-ph" style="border-color:${ac};font-size:2rem">👤</div>`}
          <div style="flex:1;margin-left:.9rem">
            ${logoHTML(28)}
            <div class="kente-full-name">${h(STATE.name) || 'Votre Nom'}</div>
            <div class="kente-role" style="color:${ac}">${h(STATE.title) || 'Votre Titre'}</div>
          </div>
          <div class="kente-contacts">${[STATE.email, STATE.phone, STATE.location].filter(Boolean).map(c => h(c)).join('<br>')}</div>
        </div>
        <div class="kente-stripe kente-stripe-bottom"></div>
      </div>
      <div class="kente-body">
        <div class="kente-2col">
          <div>
            ${STATE.skills.length ? `<div class="kente-section" style="color:${ac}">Compétences</div>${STATE.skills.map(s => `<div class="kente-skill-name">${h(s)}</div>`).join('')}` : ''}
            ${STATE.lang.length ? `<div class="kente-section" style="color:${ac}">Langues</div>${STATE.lang.map(l => `<div style="font-size:.72rem;margin-bottom:.3rem;font-weight:700">${h(l.lang)}<br><span style="color:${ac};font-size:.65rem;font-weight:600">${h(l.level)}</span></div>`).join('')}` : ''}
          </div>
          <div>
            ${STATE.summary ? `<div class="kente-section" style="color:${ac}">Profil</div><p class="kente-sum">${h(STATE.summary)}</p>` : ''}
            ${STATE.exp.length ? `<div class="kente-section" style="color:${ac}">Expérience</div>${STATE.exp.map(e => `<div class="kente-entry" style="border-left-color:${ac};background:${ac}07"><div class="kente-entry-header"><span class="kente-entry-title">${h(e.title)}</span><span class="kente-entry-period">${h(e.period)}</span></div><div class="kente-entry-company" style="color:${ac}">${h(e.company)}</div>${e.desc ? `<div class="kente-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
            ${STATE.edu.length ? `<div class="kente-section" style="color:${ac}">Formation</div>${STATE.edu.map(e => `<div class="kente-entry" style="border-left-color:${ac};background:${ac}07"><div class="kente-entry-header"><span class="kente-entry-title">${h(e.degree)}</span><span class="kente-entry-period">${h(e.period)}</span></div><div class="kente-entry-company" style="color:${ac}">${h(e.school)}</div>${e.desc ? `<div class="kente-entry-desc">${h(e.desc)}</div>` : ''}</div>`).join('')}` : ''}
          </div>
        </div>
      </div>
    </div>`;

  /* ════════════════════════════════════════════
     MAIN UPDATE FUNCTION
  ════════════════════════════════════════════ */
  const update = () => {
    syncFromUI();
    const sheet = $('cvSheet');
    if (!sheet) return;

    const ac = STATE.accent;
    const fn = fontMap[STATE.font] || fontMap.nunito;

    const renderers = {
      savane: renderSavane,
      nuit: renderNuit,
      neon: renderNeon,
      sahel: renderSahel,
      aurora: renderAurora,
      kente: renderKente,
    };

    const renderer = renderers[STATE.theme] || renderSavane;
    sheet.innerHTML = renderer(ac, fn);
    applyZoom();
  };

  /* ════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════ */
  const init = () => {
    initCursor();
    initNav();
    initKeyboard();
    load();

    // Intersection Observer for scroll animations
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.example-card, .theme-card, .feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)';
        observer.observe(el);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', init);

  /* ════════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════════ */
  return {
    openBuilder,
    closeBuilder,
    openBuilderWithTheme,
    loadExample,
    setTheme,
    setColor,
    setColorValue,
    setFont,
    toggleAccordion,
    handlePhoto,
    handleLogo,
    addEntry,
    removeEntry,
    toggleEntry,
    updateEntry,
    addSkill,
    removeSkill,
    skillKeydown,
    zoomIn,
    zoomOut,
    save,
    exportPDF,
    toggleMobileView,
    update,
  };

})();
