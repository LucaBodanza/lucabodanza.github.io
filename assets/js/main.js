/* Luca Bodanza — Portfolio 2026 · main.js (vanilla ES6+) — solo home
   1 hero · 2 nastro e numeri · 3 indice lavori (tre cartelle con sotto-cartelle, + libreria brand manual e segni) · 4 loghi dello stage (nella Storia) · 5 interazioni (ripple, nav, reveal, copia, griglia)
   Tema, orologio e cursore sono in common.js; lightbox in lightbox.js; dati in cases.js, archive.js, logos.js, brands.js, marks.js. */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = 'assets/img/';
  const pad = n => String(n).padStart(2, '0');
  const { CASES } = window, A = window.ARCHIVE, LG = window.LOGOS, TXT = window.SITE_TEXT.home;     // testi in texts.js: si cambiano dall'Admin

  /* 1. HERO: ritratto, parola a tutta larghezza, griglia di punti ------------------------------ */
  const photo = $('.portrait img');
  const noPhoto = () => { photo.closest('.portrait').classList.add('is-empty'); photo.remove(); };
  if (photo) { if (photo.complete && !photo.naturalWidth) noPhoto(); else photo.addEventListener('error', noPhoto); }

  const word = $('.hero__word'), fit = $('.hero__fit');
  const fitWord = () => {                                   // il nome occupa esattamente la larghezza del contenitore
    word.style.fontSize = '100px';
    word.style.fontSize = `${100 * word.parentElement.clientWidth / fit.offsetWidth}px`;
  };
  fitWord(); addEventListener('resize', fitWord); document.fonts?.ready.then(fitWord);

  const cv = $('.hero__dots'), ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, mx = -9999, my = -9999, heroVisible = true, drawing = false;
  const GAP = 36;
  const sizeCanvas = () => {
    dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  };
  const draw = () => {                                      // griglia di punti che si allontana dal cursore
    ctx.clearRect(0, 0, W, H);
    const rgb = root.dataset.theme === 'light' ? '12,12,13' : '243,242,237';
    for (let x = GAP / 2; x < W; x += GAP) for (let y = GAP / 2; y < H; y += GAP) {
      const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy), k = Math.max(0, 1 - d / 170);
      const px = x + (d ? dx / d : 0) * k * 26, py = y + (d ? dy / d : 0) * k * 26;
      ctx.fillStyle = `rgba(${rgb},${.16 + k * .55})`;
      ctx.beginPath(); ctx.arc(px, py, 1 + k * 2.2, 0, 6.2832); ctx.fill();
    }
  };
  const loop = () => { draw(); drawing = heroVisible && (mx > -9000); if (drawing) requestAnimationFrame(loop); };
  sizeCanvas(); addEventListener('resize', sizeCanvas);
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    $('.hero').addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!drawing) { drawing = true; requestAnimationFrame(loop); }
    });
    $('.hero').addEventListener('pointerleave', () => { mx = my = -9999; draw(); });
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe($('.hero'));
  }
  new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /* 2. NASTRO E NUMERI -------------------------------------------------------------------------- */
  const words = ['Brand identity', 'Cataloghi tecnici', 'Packaging', 'Piattaforme web', 'Social & ADV', 'Cover art', 'Streetwear', 'Loghi', 'Editoria'];
  const run = words.flatMap((w, i) => [`<span data-t="home.ticker.${i}">${w}</span>`, '<span>•</span>']).join('');
  $('#ticker').innerHTML = run + run;                       // due copie: lo scorrimento a -50% è senza stacchi

  $('#hero-stats').innerHTML = [
    ['7+', 'esperienze di lavoro', 'tra stage, collaborazioni e agenzie'],
    [CASES.length, 'case history', 'raccontate per intero'],
    [A.items.length, 'lavori in archivio', 'oltre alle case history'],
    [LG.items.length, 'loghi progettati', 'tra brand, monogrammi e pittogrammi'],
  ].map(([n, l, s], i) => `<div class="stat"><b${i ? '' : ` data-t="home.stats.0.n"`}>${n}</b><span data-t="home.stats.${i}.l">${l}</span><small data-t="home.stats.${i}.s">${s}</small></div>`).join('');

  /* 3. LAVORI: tre cartelle, divise per natura del progetto -------------------------------------------------
     · Lavori per aziende — incarichi per aziende (LuBe Consulting, Procryon, Timmagine)
     · Progetti personali — brand identity, packaging, streetwear e cover art, con la libreria dei brand manual e dei segni
     · Made in Italy Lab — i progetti del percorso IFTS (ITS Machina Lonati)
     La cartella si deduce da "origin" del lavoro; la sotto-cartella dalla tipologia ("macro"): vedi pick() qui sotto. */
  const ORIGINS = A.origins;
  const CASE_ORIGIN = { lubeconnect: 'ifts', 'save-the-duck': 'ifts', morino: 'personale', 'first-stop': 'timmagine', elsap: 'lube', procryon: 'procryon', 'luke-cover': 'personale', crea: 'ifts', valkirie: 'personale', abstract: 'personale', oceano: 'personale' };
  const COMPANY = new Set(['timmagine', 'lube', 'procryon']);
  const persSub = it => ({ packaging: 'packaging', moda: 'street', visual: 'street' })[it.macro] || 'identita';
  const FOLDERS = [
    { k: 'aziende', ...TXT.folders.aziende, pick: it => COMPANY.has(it.origin),
      subs: [
        { k: 'cataloghi', ...TXT.folders.aziende.subs.cataloghi, pick: it => it.macro === 'cataloghi' },
        { k: 'comunicazione', ...TXT.folders.aziende.subs.comunicazione, pick: it => it.macro !== 'cataloghi' },
      ] },
    { k: 'personali', ...TXT.folders.personali, pick: it => it.origin === 'personale',
      subs: [
        { k: 'identita', ...TXT.folders.personali.subs.identita, pick: it => persSub(it) === 'identita' },
        { k: 'packaging', ...TXT.folders.personali.subs.packaging, pick: it => persSub(it) === 'packaging' },
        { k: 'street', ...TXT.folders.personali.subs.street, pick: it => persSub(it) === 'street' },
        { k: 'mcls', ...TXT.folders.personali.subs.mcls, href: 'mcls.html' },
      ] },
    { k: 'lab', ...TXT.folders.lab, pick: it => it.origin === 'ifts' },
  ];

  const items = [
    ...CASES.map(c => ({ kind: 'case', title: c.title, tags: c.tags, year: c.year, href: `case.html?c=${c.slug}`, img: `${IMG}${siteImg(c.cover)}`, macro: c.macro, origin: CASE_ORIGIN[c.slug] || 'personale' })),
    ...A.items.map(it => ({ kind: 'arch', title: it.title, tags: [A.macros[it.macro].label, it.sub], year: ORIGINS[it.origin], img: `${IMG}${siteImg(it.cover || `projects/${it.dir}/t-01.jpg`)}`,
      macro: it.macro, origin: it.origin, dir: it.dir, n: it.n, meta: it.meta, sub: it.sub })),
  ];
  const indexed = items.map((it, i) => [it, i]);
  const folders = FOLDERS.map(f => {
    const list = indexed.filter(([it]) => f.pick(it));
    return { ...f, list, subs: (f.subs || []).map(s => s.href ? s : { ...s, list: list.filter(([it]) => s.pick(it)) }).filter(s => s.href || s.list.length) };
  }).filter(f => f.list.length);
  const state = { view: 'rows', open: null };   // all'inizio tutte chiuse: sceglie chi guarda
  const yearLabel = it => `(${it.year})`;
  const nWord = n => `${n} ${n === 1 ? TXT.work.one : TXT.work.many}`;
  const NUM = ['zero', 'una', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette'];
  const countOf = f => nWord(f.list.length);
  const subCount = s => s.href ? TXT.mclsLink : nWord(s.list.length);

  const fill = t => t.replace('{n}', items.length).replace('{c}', NUM[folders.length] || folders.length);
  $('#works-lead').textContent = fill(TXT.lead);
  $('#f-count').textContent = TXT.count.replace('{n}', items.length).replace('{c}', folders.length);

  const card = ([it, i], k) => {
    const media = `<span class="fc__img${it.kind === 'case' ? '' : ' is-contain'}"><img src="${it.img}" alt="${it.title}" loading="lazy" decoding="async"></span><span class="fc__cap"><b>${it.title}</b><span>${it.tags.join(' · ')}</span><small>${yearLabel(it)}</small></span>`;
    return it.kind === 'arch' ? `<button class="fc" type="button" data-i="${i}" data-cursor="Vedi" style="--k:${Math.min(k, 8)}">${media}</button>`
      : `<a class="fc" href="${it.href}" data-cursor="Apri" style="--k:${Math.min(k, 8)}">${media}</a>`;
  };
  const scroller = f => `<div class="fcs"><div class="fcs__track" tabindex="0" role="list" aria-label="${f.label}">${f.list.map(card).join('')}</div>
    <div class="fcs__nav"><button class="fcs__b" type="button" data-d="-1" aria-label="Scheda precedente">←</button><span class="fcs__c">1 / ${f.list.length}</span><button class="fcs__b" type="button" data-d="1" aria-label="Scheda successiva">→</button></div></div>`;
  const FEATURED = ['danez', 'abstract-design', 'louren'].map(slug => `${IMG}brands/${slug}.webp`);   // copertine della scheda che porta a MCLS
  const covers = f => f.list.slice(0, 3).map(([it]) => it.img);
  const thumbs = f => covers(f).map((src, n) => `<i style="--n:${n};background-image:url('${src}')"></i>`).join('');
  const stackOf = s => s.href ? FEATURED : s.list.slice(0, 3).map(([it]) => it.img);

  /* Sotto-cartelle (Lavori per aziende, Progetti personali): ognuna è una fila di schede a scorrimento.
     Nei Progetti personali una scheda porta al mondo MCLS (mcls.html), dove stanno i brand manual e i segni. */
  const sel = {};                                                         // sotto-cartella aperta, per ogni cartella
  const subStack = (srcs, cls = '') => `<span class="sub__stack ${cls}" aria-hidden="true">${srcs.map((s, i) => `<i style="--i:${i};background-image:url('${s}')"></i>`).join('')}</span>`;
  const subBtn = s => {
    const inner = `<span class="sub__txt"><b>${s.label.replace('&', '&amp;')}</b><span>${s.desc}</span><small>${subCount(s)}</small></span>${subStack(stackOf(s))}`;
    return s.href ? `<a class="sub sub--link" href="${s.href}" data-cursor="Entra">${inner}</a>` : `<button class="sub" type="button" data-sub="${s.k}" aria-pressed="false" data-cursor="Apri">${inner}</button>`;
  };
  const libHtml = f => `<div class="lib" data-f="${f.k}">
    <div class="lib__subs" data-n="${f.subs.length}" role="group" aria-label="Sottocartelle di ${f.label}">${f.subs.map(subBtn).join('')}</div>
    <div class="lib__body"></div>
  </div>`;
  const cardsSkel = s => `<div class="atl" data-sec="${s.k}">
    <div class="atl__h"><div><h4>${s.label.replace('&', '&amp;')}</h4><p>${s.desc}</p></div></div>${scroller(s)}</div>`;
  const drawLib = el => {
    const f = byKey(el.dataset.f), cur = sel[f.k] || null, s = f.subs.find(x => x.k === cur), body = $('.lib__body', el);
    $$('button.sub', el).forEach(b => b.setAttribute('aria-pressed', b.dataset.sub === cur));
    if (!s) { body.innerHTML = ''; body.dataset.built = ''; return; }
    if (body.dataset.built !== s.k) { body.innerHTML = cardsSkel(s); body.dataset.built = s.k; }
  };
  const refreshLib = () => $$('.lib').forEach(drawLib);
  const withExtras = f => f.subs.length ? libHtml(f) : scroller(f);

  const rowsEl = $('#frows'), gridEl = $('#fgrid'), wrap = $('#fgrid-wrap'), panel = $('#fpanel');
  rowsEl.innerHTML = folders.map((f, n) => `<li class="frow" data-k="${f.k}">
    <button class="frow__h" type="button" aria-expanded="false" aria-controls="fp-${f.k}" data-cursor="Apri"><span class="frow__n">${pad(n + 1)}</span><span class="frow__t">${f.label}</span><span class="frow__d">${f.desc}</span><span class="frow__c">${f.subs.some(s => s.lib) ? `${nWord(f.list.length)}<br>${countParts(f).slice(1).join(' · ')}` : countOf(f)}</span><span class="frow__x" aria-hidden="true"></span><span class="frow__thumbs" aria-hidden="true">${thumbs(f)}</span></button>
    <div class="frow__p" id="fp-${f.k}"><div class="frow__pi"></div></div></li>`).join('');
  gridEl.innerHTML = folders.map((f, n) => `<button class="folder" type="button" data-k="${f.k}" aria-expanded="false" data-cursor="Apri">
    <span class="folder__3d" aria-hidden="true"><span class="folder__back"></span>${covers(f).map((src, i) => `<span class="folder__file" style="--i:${i};background-image:url('${src}')"></span>`).join('')}<span class="folder__front"></span></span>
    <span class="folder__cap"><b><i>${pad(n + 1)}</i>${f.label}</b><small>${countOf(f)}</small></span></button>`).join('');

  const byKey = k => folders.find(f => f.k === k);
  const sync = animate => {
    const open = state.open && byKey(state.open);
    $$('.view-toggle button').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === state.view));
    rowsEl.hidden = state.view !== 'rows'; wrap.hidden = state.view !== 'grid';
    $$('.frow', rowsEl).forEach(li => {
      const on = li.dataset.k === state.open, inner = $('.frow__pi', li);
      if (on && !inner.firstChild) { inner.innerHTML = withExtras(byKey(li.dataset.k)); $$('.lib', inner).forEach(drawLib); }
      li.classList.toggle('is-open', on); $('.frow__h', li).setAttribute('aria-expanded', on);
    });
    $$('.folder', gridEl).forEach(b => b.setAttribute('aria-expanded', b.dataset.k === state.open));
    panel.classList.toggle('is-on', !!open && state.view === 'grid');
    if (open && state.view === 'grid') {
      panel.innerHTML = `<div class="fpanel__h"><h3>${open.label}</h3><p>${open.desc}</p><button class="fpanel__x" type="button" data-t="home.ui.close">Chiudi ✕</button></div>${withExtras(open)}`;
      $$('.lib', panel).forEach(drawLib);
      if (animate) panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  };
  const toggleFolder = k => { state.open = state.open === k ? null : k; sync(true); };

  $('#lavori').addEventListener('click', e => {
    const vt = e.target.closest('.view-toggle button');
    if (vt) { state.view = vt.dataset.view; sync(false); return; }
    const row = e.target.closest('.frow__h'); if (row) { toggleFolder(row.closest('.frow').dataset.k); return; }
    const fd = e.target.closest('.folder'); if (fd) { toggleFolder(fd.dataset.k); return; }
    if (e.target.closest('.fpanel__x')) { state.open = null; sync(false); return; }
    const nb = e.target.closest('.fcs__b');
    if (nb) { const tr = nb.closest('.fcs').querySelector('.fcs__track'), c = tr.querySelector('.fc'); tr.scrollBy({ left: nb.dataset.d * (c.offsetWidth + 24), behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    const arch = e.target.closest('button.fc');                 // archivio: galleria nel lightbox
    if (arch) { openArch(items[arch.dataset.i]); return; }
    const sub = e.target.closest('button.sub'); if (sub) { const fk = sub.closest('.lib').dataset.f; sel[fk] = sel[fk] === sub.dataset.sub ? null : sub.dataset.sub; refreshLib(); return; }
  });

  function openArch(it) {
    Lightbox.open({ files: it.images || Array.from({ length: it.n }, (_, k) => `projects/${it.dir}/${pad(k + 1)}.jpg`), title: it.title, meta: it.meta, tag: `${ORIGINS[it.origin]} · ${it.sub}` });
  }
  document.addEventListener('click', e => {                     // link dalla Storia: apre la cartella o la galleria giusta
    const f = e.target.closest('a[data-folder]');
    if (f) {
      e.preventDefault(); state.open = f.dataset.folder; sync(false);
      setTimeout(() => (state.view === 'rows' ? $(`.frow[data-k="${state.open}"]`) : panel).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }), 80);
      return;
    }
    const a = e.target.closest('a[data-arch]');
    if (a) { e.preventDefault(); const it = items.find(x => x.dir === a.dataset.arch); if (it) openArch(it); }
  });
  document.addEventListener('scroll', e => {                    // contatore delle schede
    const tr = e.target; if (!tr.classList || !tr.classList.contains('fcs__track')) return;
    const c = tr.querySelector('.fc'); if (!c) return;
    const n = tr.children.length, i = Math.min(n, Math.round(tr.scrollLeft / (c.offsetWidth + 24)) + 1);
    tr.closest('.fcs').querySelector('.fcs__c').textContent = `${i} / ${n}`;
  }, true);
  sync(false);
  const q = new URLSearchParams(location.search), fromUrl = q.get('f');   // dal viewer dei brand manual: si torna alla libreria, già aperta
  if (fromUrl && byKey(fromUrl)) {
    state.open = fromUrl; if (byKey(fromUrl).subs.some(s => s.k === q.get('s'))) sel[fromUrl] = q.get('s');
    sync(false);
    setTimeout(() => (state.view === 'rows' ? $(`.frow[data-k="${state.open}"]`) : panel).scrollIntoView({ block: 'start' }), 120);
  }

  /* 4. LOGHI DELLO STAGE (nella Storia, voce Timmagine)------------------------------------------------------------------------------------- */
  // ogni logo occupa la stessa superficie ottica nel riquadro: larghezza dalla proporzione (già ritagliata sull'inchiostro), con tetto in larghezza e altezza
  const logoW = ar => { let w = Math.sqrt(1750 * ar), h = w / ar; if (w > 88) { h *= 88 / w; w = 88; } if (h > 36) { w *= 36 / h; } return w; };
  $('#clients-list').innerHTML = A.clients.map(c => `<li><img src="${IMG}clients/${c.file}?v=2" alt="${c.name}" style="width:${logoW(c.ar).toFixed(1)}%" loading="lazy" decoding="async"></li>`).join('');

  /* 5. INTERAZIONI ------------------------------------------------------------------------------- */
  if (!reduceMotion) {                                       // ripple al click
    document.addEventListener('pointerdown', e => {
      const el = e.target.closest('.btn, .chip, .nav__links a'); if (!el) return;
      const r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2, dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      el.appendChild(dot); dot.addEventListener('animationend', () => dot.remove());
    });
  }

  const links = new Map($$('.nav__links a').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.classList.remove('is-active')); links.get(en.target.id)?.classList.add('is-active');
  }), { rootMargin: '-45% 0px -50% 0px' });
  [...links.keys(), 'top'].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });

  const reveal = new IntersectionObserver((entries, obs) => entries.forEach(en => {
    if (!en.isIntersecting) return; en.target.classList.add('is-in'); obs.unobserve(en.target);
  }), { threshold: .12 });
  $$('.reveal').forEach(el => reveal.observe(el));

  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const label = $('.btn__label', btn), original = label.textContent;
    try { await navigator.clipboard.writeText(btn.dataset.copy); } catch { return; }
    label.textContent = TXT.copied; setTimeout(() => { label.textContent = original; }, 1800);
  }));

  document.addEventListener('keydown', e => {                // tasto G: griglia a 12 colonne
    if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    document.body.classList.toggle('show-grid');
  });
})();
