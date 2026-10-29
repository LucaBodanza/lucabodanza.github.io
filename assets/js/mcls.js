/* Luca Bodanza — Portfolio 2026 · mcls.js — il mondo MCLS (mcls.html)
   1 hero col logotipo e la mascot · 2 settori: un'azienda per ogni settore, ognuna col suo brand manual · 3 archivio dei segni (monogrammi e pittogrammi in tre versioni)
   Dati in mcls-data.js (settori), brands.js (brand manual), marks.js (segni); disegni vettoriali in assets/img/mcls/ (tools/build_mcls_assets.py).
   Tema, menu, orologio e ingresso a portale sono in common.js; lightbox in lightbox.js; tessere dei segni in logo-tile.js. */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = 'assets/img/';
  const pad = n => String(n).padStart(2, '0');
  const M = window.MCLS, BR = window.BRANDS, MK = window.MARKS, LT = window.LogoTile;
  const main = $('#mcls');

  const bySlug = new Map(BR.items.map(b => [b.slug, b]));
  const D = M.districts.map(d => ({ ...d, list: d.slugs.map(s => bySlug.get(s)).filter(Boolean) })).filter(d => d.list.length);
  const TXT = window.SITE_TEXT.mcls, nAz = n => `${n} ${n === 1 ? TXT.company.one : TXT.company.many}`;
  const mk = (name, cls = '') => `<i class="mk ${cls}" style="-webkit-mask-image:url(${IMG}mcls/${name}.svg);mask-image:url(${IMG}mcls/${name}.svg)" aria-hidden="true"></i>`;
  const coverOf = b => `${IMG}brands/${b.slug}.webp`;
  const amp = s => s.replace(/&/g, '&amp;');

  /* 1. HERO ------------------------------------------------------------------------------------------ */
  const hero = () => `<section class="mh" id="top-mcls">
    ${mk('pinwheel', 'mh__pin mh__pin--a')}${mk('pinwheel', 'mh__pin mh__pin--b')}
    <div class="container mh__in">
      <div class="mh__txt">
        <p class="eyebrow" data-t="mcls.hero.eyebrow">Il mio studio · 2022 — 2026</p>
        <h1 class="mh__logo" aria-label="MCLS — ${M.payoff}">${mk('logotype', 'mh__logotype')}</h1>
        <p class="mh__lead" data-t="mcls.hero.lead">MCLS è il mio studio personale: il laboratorio dove progetto per sfogo creativo e per allenare competenze a 360°. Qui vive un sogno surreale: un’azienda per ogni settore, ognuna con il suo logotipo e il suo brand manual completo.</p>
        <p class="mh__note" data-t="mcls.hero.note">Sono tutti progetti miei, nati senza committente.</p>
        <ul class="mh__stats">
          <li><b>${BR.items.length}</b><span data-t="mcls.hero.s1">aziende</span></li><li><b>${D.length}</b><span data-t="mcls.hero.s2">settori</span></li><li><b>${MK.items.length}</b><span data-t="mcls.hero.s3">segni</span></li>
        </ul>
        <p class="mh__cta"><a class="btn btn--solid" href="#settori"><span class="btn__label" data-t="mcls.hero.cta1">Entra nei settori ↓</span></a><a class="btn" href="#segni"><span class="btn__label" data-t="mcls.hero.cta2">Archivio dei segni ↓</span></a></p>
      </div>
    </div>
  </section>`;

  /* 2. SETTORI ---------------------------------------------------------------------------------------- */
  const distBtn = (d, i) => `<button class="dist" type="button" data-d="${d.k}" aria-pressed="false" aria-controls="dpanel" data-cursor="Apri">
    <span class="dist__n">${pad(i + 1)}</span><span class="dist__t">${amp(d.label)}</span><span class="dist__d">${d.desc}</span><span class="dist__c">${nAz(d.list.length)}</span>
    <span class="dist__stack" aria-hidden="true">${d.list.slice(0, 3).map((b, n) => `<i style="--i:${n};background-image:url('${coverOf(b)}')"></i>`).join('')}</span></button>`;
  const bmCard = (b, k) => `<li class="bm-item" style="--k:${Math.min(k, 8)}"><a class="bm" href="brand.html?b=${b.slug}" data-cursor="Apri"><span class="bm__img"><img src="${coverOf(b)}" alt="Brand manual ${b.name}" loading="lazy" decoding="async"></span>
    <span class="bm__cap"><b>${b.name}</b><span>${b.sector}</span><small><span data-t="mcls.ui.n">N°</span> ${pad(b.n)}</small></span></a></li>`;
  const storyHtml = d => !d.story ? '' : `<article class="story"><div class="story__t"><p class="eyebrow">${d.story.kicker}</p><h4>${d.story.title}</h4>${d.story.text.map(p => `<p>${p}</p>`).join('')}</div>
    <p class="story__l">${d.story.slugs.map(s => bySlug.get(s)).filter(Boolean).map(b => `<a class="btn" href="brand.html?b=${b.slug}"><span class="btn__label"><span data-t="mcls.ui.bm">Brand manual</span> ${b.name} →</span></a>`).join('')}</p></article>`;
  const panelHtml = d => `<div class="dpanel__h"><div><p class="eyebrow"><span data-t="mcls.ui.sector">Settore</span> ${pad(D.indexOf(d) + 1)} · ${nAz(d.list.length)}</p><h3>${amp(d.label)}</h3><p>${d.desc}</p></div><button class="dpanel__x" type="button" data-t="mcls.ui.close">Chiudi ✕</button></div>
    ${storyHtml(d)}<ul class="bm-grid">${d.list.map(bmCard).join('')}</ul>`;
  const settori = () => `<section class="ms" id="settori"><div class="container">
    <div class="ms__h">
      <div><p class="eyebrow" data-t="mcls.settori.eyebrow">Settori</p><h2 class="title" data-t="mcls.settori.title">I settori<br><em>di MCLS</em></h2>
        <p class="lead" data-t="mcls.settori.lead">Scegline uno per entrare: dentro trovi le sue aziende, ognuna con il brand manual completo da sfogliare e scaricare in PDF.</p></div>
      <figure class="ms__kid">${mk('kid-wave', 'ms__wave')}<figcaption data-t="mcls.settori.kid">Da dove cominci?</figcaption></figure>
    </div>
    <div class="dists" role="group" aria-label="Settori">${D.map(distBtn).join('')}</div>
    <div class="dpanel" id="dpanel" aria-live="polite"></div>
  </div></section>`;

  /* 3. SEGNI ------------------------------------------------------------------------------------------ */
  const segni = () => `<section class="ms" id="segni"><div class="container">
    <div class="atl atl--first" data-sec="segni">
      <div class="atl__h"><div><p class="eyebrow" data-t="mcls.segni.eyebrow">Archivio</p><h2 class="title" data-t="mcls.segni.title">Monogrammi<br><em>&amp; pittogrammi</em></h2>
        <p class="lead" data-t="mcls.segni.lead">Ogni segno in tre versioni — nero su bianco, bianco su nero e traccia (solo il contorno). Cambia versione con i tre pallini.</p></div>
        <span class="atl__all"><span data-t="mcls.segni.all">Tutti</span><span class="atl__alldots"></span></span></div>
      <div class="filters atl__cats" role="group" aria-label="Tipo di segno"></div>
      <ul class="lg-grid atl__grid"></ul>
      <p class="atl__more"><button class="btn" type="button" data-more><span class="btn__label" data-t="mcls.segni.more">Mostra altri segni</span></button></p>
    </div></div></section>`;

  main.innerHTML = hero() + settori() + segni();

  /* — settori: si apre un settore alla volta; l'indirizzo ricorda quale (?d=tech) per il ritorno dal viewer dei manual — */
  let sel = null;
  const dpanel = $('#dpanel');
  const drawD = scroll => {
    const d = D.find(x => x.k === sel);
    $$('.dist', main).forEach(b => b.setAttribute('aria-pressed', b.dataset.d === sel));
    dpanel.innerHTML = d ? panelHtml(d) : '';
    dpanel.classList.toggle('is-on', !!d);
    try { history.replaceState(null, '', sel ? `?d=${sel}#settori` : `${location.pathname}#settori`); } catch {}
    if (d && scroll) dpanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  };

  /* — segni: gli stessi tre pallini del UI Kit — */
  const marks = MK.items.map(m => ({ ...m, kind: 'mark' })), mById = new Map(marks.map(m => [m.id, m]));
  const st = { type: 'all', shown: 15, mode: 0, modes: new Map(marks.map(m => [m.id, 0])) };
  const ALL_DOTS = { kind: 'mark', k: [] };
  const mList = () => marks.filter(m => st.type === 'all' || m.type === st.type);
  const chips = (list, cur) => list.map(([k, l]) => `<button class="chip" type="button" data-k="${k}" aria-pressed="${k === cur}" data-t="mcls.chip.${k}">${l}</button>`).join('');
  const drawM = () => {
    const el = $('#segni');
    $('.atl__cats', el).innerHTML = chips([['all', 'Tutti'], ['Monogramma', 'Monogrammi'], ['Pittogramma', 'Pittogrammi']], st.type);
    const list = mList();
    $('.atl__grid', el).innerHTML = list.slice(0, st.shown).map(m => LT.tile(m, st.modes.get(m.id), TXT.types[m.type] || m.type)).join('');
    $$('.reveal', el).forEach(r => r.classList.add('is-in'));
    $('.atl__alldots', el).innerHTML = LT.dots(ALL_DOTS, st.mode, 'Versione di tutti i segni');
    $('[data-more]', el).hidden = st.shown >= list.length;
  };

  const setAllMode = m => {
    st.mode = m; marks.forEach(x => st.modes.set(x.id, m));
    $('#segni .atl__alldots').innerHTML = LT.dots(ALL_DOTS, m, 'Versione di tutti i segni');
    $$('#segni .lg-item').forEach(li => LT.update(li, mById.get(li.dataset.id), m));
  };

  main.addEventListener('click', e => {
    const dist = e.target.closest('.dist'); if (dist) { sel = sel === dist.dataset.d ? null : dist.dataset.d; drawD(true); return; }
    if (e.target.closest('.dpanel__x')) { sel = null; drawD(false); $('#settori .dists').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' }); return; }
    const chip = e.target.closest('#segni .chip'); if (chip) { st.type = chip.dataset.k; st.shown = 15; drawM(); return; }
    if (e.target.closest('#segni [data-more]')) { st.shown += 15; drawM(); return; }
    const all = e.target.closest('#segni .atl__alldots .lg-dot');
    if (all) setAllMode(+all.dataset.m);
  });
  LT.bind(main, { item: id => mById.get(id), getMode: it => st.modes.get(it.id), setMode: (it, m) => st.modes.set(it.id, m),
    open: it => { const vis = mList(); Lightbox.open({ title: TXT.lightboxTitle, tag: TXT.lightboxTag, index: Math.max(0, vis.findIndex(x => x.id === it.id)),
      files: vis.map(x => { const m = st.modes.get(x.id), v = LT.view(x, m); return { src: v.src.replace('assets/img/', ''), filter: v.filter, bg: v.bg, pad: '10%', cap: `${LT.pad(x.n)} — ${x.name} · ${x.type} · ${LT.modesOf(x)[m].label}` }; }) }); } });
  drawM();

  /* azioni per la guida (Pallino): scorrere, aprire un settore, cambiare la versione dei segni */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  window.MCLSPage = {
    districts: D,
    scrollTo: async (target, block = 'start') => { const n = typeof target === 'string' ? document.getElementById(target) : target; if (n) n.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block }); await wait(reduceMotion ? 50 : 1100); },
    openDistrict: async k => { sel = k; drawD(false); await wait(120); },
    closeDistrict: () => { sel = null; drawD(false); },
    marksMode: m => setAllMode(m),
  };

  const fromUrl = new URLSearchParams(location.search).get('d');           // dal viewer dei brand manual: si torna al settore, già aperto
  if (fromUrl && D.some(d => d.k === fromUrl)) { sel = fromUrl; drawD(false); setTimeout(() => $('#settori').scrollIntoView({ block: 'start' }), 120); }
})();
