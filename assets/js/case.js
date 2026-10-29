/* Pagina del singolo case: case.html?c=<slug>, generata da cases.js.
   Le sezioni usano il layout della loro tipologia (scheda identità, cataloghi, piattaforme, formati social, muro di cover)
   quando case-layouts.js ne dichiara uno per quella fase; altrimenti la griglia di figure standard. */
(() => {
  'use strict';
  const IMG_BASE = 'assets/img/';
  const pad = n => String(n).padStart(2, '0');
  const { CASES, PHASES } = window;
  const LAYOUTS = window.CASE_LAYOUTS || {};
  const i = CASES.findIndex(c => c.slug === new URLSearchParams(location.search).get('c'));
  if (i < 0) { location.replace('index.html#lavori'); return; }
  const c = CASES[i];
  const L = LAYOUTS[c.slug] || {};
  const phaseKeys = Object.keys(PHASES);
  const para = t => (Array.isArray(t) ? t : [t]).map(p => `<p>${p}</p>`).join('');
  document.title = `${c.title} — Luca Bodanza`;

  // immagini del case, nell'ordine in cui vengono disegnate: servono al lightbox
  const all = [];
  const reg = im => { im.g = all.length; all.push(im); return im; };
  const src = f => IMG_BASE + (window.siteImg ? siteImg(f) : f);
  const cols = n => n === 1 ? 1 : n >= 12 ? 4 : (n === 2 || n === 4) ? 2 : 3;

  /* utilità: carattere da Google Fonts per lo specimen, colore del testo sopra un campione */
  const loadFont = fam => {
    const id = 'gf-' + fam.replace(/\W/g, '');
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${fam.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(l);
  };
  const onColor = hex => {
    const n = parseInt(hex.slice(1), 16), f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255) > .4 ? '#0c0c0d' : '#fff';
  };

  /* figure standard */
  const figs = imgs => imgs.length ? `<div class="figs figs--${cols(imgs.length)} col-12">${imgs.map(im => `
          <figure class="fig reveal"><button class="fig__btn" type="button" data-g="${reg(im).g}"><img src="${src(im.src)}" alt="${im.alt || im.cap || c.title}" loading="lazy" decoding="async"></button>${im.cap ? `<figcaption>${im.cap}</figcaption>` : ''}</figure>`).join('')}</div>` : '';

  const catalogs = [];
  const pagesOf = it => Array.from({ length: it.n }, (_, k) => `${it.dir}/${pad(k + 1)}.jpg`);
  // i cataloghi con back:true sono copertina · pagine interne · retro; gli altri sono una serie di immagini
  const pageLabel = (it, k) => it.back ? (k === 0 ? 'copertina' : k === it.n - 1 ? 'retro' : 'pagina interna') : `immagine ${k + 1} di ${it.n}`;
  const strip = it => pagesOf(it).map((p, k) => `<button class="cat__page" type="button" data-i="${k}" aria-label="${it.name} — ${pageLabel(it, k)}"><img src="${src(p)}" alt="${it.name} — ${pageLabel(it, k)}" loading="lazy" decoding="async"></button>`).join('');
  const catCap = it => `<b>${it.name}</b> · ${it.meta} · ${it.n} <span data-t="case.ui.${it.back ? 'pages' : 'images'}">${it.back ? 'pagine' : 'immagini'}</span> <span data-t="case.ui.preview">in anteprima</span>`;

  /* un renderer per tipologia di sviluppo */
  const R = {
    /* brand identity: logo, carattere, palette */
    identity(d, imgs) {
      const logos = (d.logos || []).map(l => reg({ src: l.src, cap: l.cap, lb: `${c.title} — ${l.cap}` }));
      const t = d.type;
      if (t) loadFont(t.family);
      const tiles = logos.length + (t ? 1 : 0);
      const logoHtml = logos.map(im => `
        <figure class="idt reveal"><button class="fig__btn" type="button" data-g="${im.g}"><img src="${src(im.src)}" alt="${c.title} — ${im.cap}" loading="lazy" decoding="async"></button><figcaption>${im.cap}</figcaption></figure>`).join('');
      const spec = t ? `
        <figure class="idt reveal"><div class="specimen" style="font-family:'${t.family}',var(--display)"><span class="specimen__aa" aria-hidden="true">Aa</span><span class="specimen__abc" aria-hidden="true">ABCDEFGHIJKLM<br>NOPQRSTUVWXYZ<br>abcdefghijklm<br>nopqrstuvwxyz<br>0123456789</span></div><figcaption><b>${t.family}</b> · ${t.weights}${t.note ? `<br>${t.note}` : ''}</figcaption></figure>` : '';
      const pal = (d.palettes || []).map(p => `
          <div class="palette"><ul class="palette__sw">${p.colors.map(k => `<li><button class="sw" type="button" data-hex="${k.hex}" style="--c:${k.hex};--on:${onColor(k.hex)}" aria-label="Copia ${k.hex}"><b>${k.hex}</b>${k.name ? `<small>${k.name}</small>` : ''}</button></li>`).join('')}</ul><p class="palette__cap">${p.label}</p></div>`).join('');
      const sp = tiles >= 3 ? 12 : 12 - 4 * tiles;
      return `<div class="idsheet col-12">${logoHtml}${spec}${pal ? `<div class="idsheet__pal reveal" style="--sp:${sp}">${pal}</div>` : ''}</div>${figs(imgs)}`;
    },

    /* cataloghi: indice + sfogliatore delle pagine */
    catalog(d) {
      const b = catalogs.push({ d, sel: 0 }) - 1;
      return `<div class="cat col-12" data-b="${b}">
        <dl class="cat__stats reveal">${d.stats.map(([n, l]) => `<div><dt>${n}</dt><dd>${l}</dd></div>`).join('')}</dl>
        <div class="cat__body">
          <ol class="cat__list reveal">${d.items.map((it, n) => `<li><button class="cat__item" type="button" data-n="${n}" aria-pressed="${n === 0}"><span>${pad(n + 1)}</span><b>${it.name}</b><small>${it.meta}</small></button></li>`).join('')}</ol>
          <div class="cat__view reveal">
            <div class="cat__strip" tabindex="0" aria-label="Pagine del catalogo selezionato">${strip(d.items[0])}</div>
            <p class="cat__cap" aria-live="polite">${catCap(d.items[0])}</p>
            ${d.note ? `<p class="cat__note">${d.note}</p>` : ''}
          </div>
        </div>
      </div>`;
    },

    /* piattaforme web: cornice browser + funzioni */
    platform(d) {
      const im = reg({ src: d.shot, cap: 'La piattaforma', lb: `${c.title} — schermata della piattaforma` });
      const u = new URL(d.url);
      return `<div class="platform col-12">
        <div class="browser reveal">
          <div class="browser__bar"><i></i><i></i><i></i><span class="browser__url" data-tn>${u.host}${u.pathname.replace(/\/$/, '')}</span><em data-t="case.ui.reserved">Accesso riservato</em></div>
          <button class="fig__btn browser__shot" type="button" data-g="${im.g}"><img src="${src(d.shot)}" alt="${c.title} — schermata della piattaforma" loading="lazy" decoding="async"></button>
        </div>
        <ol class="features" style="--n:${d.features.length}">${d.features.map((f, n) => `<li class="reveal" style="--d:${n * 70}ms"><span>${pad(n + 1)}</span><h3>${f.t}</h3><p>${f.d}</p></li>`).join('')}</ol>
        <a class="btn btn--solid" href="${d.url}" target="_blank" rel="noopener"><span class="btn__label">${d.label}</span></a>
      </div>`;
    },

    /* social / ADV: tavola dei formati per ogni concept */
    formats(groups) {
      const lab = { story: 'Instagram Story · 9:16', post: 'Facebook post · 1:1', banner: 'LinkedIn post · 1,91:1' };      // etichette: nei figcaption (modificabili), qui servono al lightbox
      const f = (g, k) => {
        const im = reg({ src: g[k], cap: lab[k], lb: `${g.title} — ${lab[k]}` });
        return `<figure class="board__${k}"><button class="fig__btn" type="button" data-g="${im.g}"><img src="${src(g[k])}" alt="${g.title} — ${lab[k]}" loading="lazy" decoding="async"></button><figcaption data-t="case.fmt.${k}">${lab[k]}</figcaption></figure>`;
      };
      return `<div class="boards col-12">${groups.map(g => `
        <div class="board reveal"><p class="eyebrow">${g.title}</p><div class="board__grid">${f(g, 'story')}<div class="board__col">${f(g, 'post')}${f(g, 'banner')}</div></div></div>`).join('')}</div>`;
    },

    /* cover / visual: muro denso a tutta larghezza */
    wall(_, imgs) {
      const n = imgs.length <= 6 ? 3 : 5;
      return `<ul class="wallfull wallfull--${n} col-12">${imgs.map((im, k) => `
        <li class="wall__i reveal" style="--d:${(k % n) * 60}ms"><button class="fig__btn" type="button" data-g="${reg(im).g}" aria-label="${im.lb || im.cap || c.title}"><img src="${src(im.src)}" alt="${im.alt || im.cap || c.title}" loading="lazy" decoding="async"></button></li>`).join('')}</ul>`;
    },
  };

  const sections = c.sections.map(s => {
    const k = phaseKeys.indexOf(s.phase);
    const lay = L[s.phase];
    const skip = (lay && lay.skip) || [];
    const imgs = skip.includes('*') ? [] : s.images.filter(im => !skip.includes(im.src.split('/').pop()));
    const body = lay && R[lay.layout] ? R[lay.layout](lay[lay.layout], imgs) : figs(imgs);
    return `
    <section class="case__sec${lay ? ` case__sec--${lay.layout}` : ''}" id="${s.phase}">
      <div class="container grid section__grid">
        <div class="col-3 section__label reveal"><b>${pad(k + 1)}</b>${PHASES[s.phase]}</div>
        <div class="col-9 start-4 case__text reveal"><h2 class="sec__title">${s.title}</h2>${para(s.text)}</div>
        ${body}
      </div>
    </section>`;
  }).join('');

  const hasSection = k => c.sections.some(s => s.phase === k);
  const prev = CASES[(i - 1 + CASES.length) % CASES.length], next = CASES[(i + 1) % CASES.length];

  document.getElementById('case').innerHTML = `
    <header class="case__head container grid" id="top">
      <p class="eyebrow col-3 reveal"><span data-t="case.ui.case">Case</span> ${c.n}<br>${c.year}</p>
      <div class="col-9 start-4 reveal" style="--d:80ms">
        <p class="eyebrow">${c.kicker}</p>
        <h1 class="case__title">${c.title}</h1>
        <p class="lead">${c.lead}</p>
        ${(c.tags || []).length ? `<ul class="tags" aria-label="Tipologie di lavoro">${c.tags.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
        ${(c.links || []).map(l => `<a class="btn btn--solid" href="${l.url}" target="_blank" rel="noopener"><span class="btn__label">${l.label}</span></a>`).join('')}
      </div>
    </header>

    <figure class="case__cover container reveal"><img src="${src(c.cover)}" alt="${c.title}" width="1600" height="1200"></figure>

    <dl class="facts container grid reveal">${c.facts.map(([k, v]) => `<div class="fact"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>

    <nav class="anatomy-nav container reveal" aria-label="Anatomia del progetto">
      <p class="eyebrow"><span data-t="case.ui.anatomy">Anatomia del progetto</span> · ${c.phases.length} <span data-t="case.ui.phasesOf">fasi su</span> ${phaseKeys.length}</p>
      <ol>${phaseKeys.map((k, n) => {
        const on = c.phases.includes(k);
        const inner = `<span>${pad(n + 1)}</span>${PHASES[k]}`;
        return `<li class="${on ? 'on' : 'off'}">${on && hasSection(k) ? `<a href="#${k}">${inner}</a>` : inner}</li>`;
      }).join('')}</ol>
    </nav>

    ${sections}

    <section class="case__sec">
      <div class="container grid section__grid">
        <div class="col-3 section__label reveal"><b>→</b><span data-t="case.ui.output">Output</span></div>
        <ul class="outputs col-9 start-4 reveal">${c.outputs.map(o => `<li>${o}</li>`).join('')}</ul>
      </div>
    </section>

    <nav class="case__nav container grid" aria-label="Altri case">
      <a class="case__next col-6" href="case.html?c=${prev.slug}"><span class="eyebrow" data-t="case.ui.prev">← Precedente</span><b>${prev.title}</b></a>
      <a class="case__next col-6 case__next--r" href="case.html?c=${next.slug}"><span class="eyebrow" data-t="case.ui.next">Successivo →</span><b>${next.title}</b></a>
    </nav>`;

  /* interazioni: lightbox, sfogliatore dei cataloghi, copia dei colori */
  const lbOpts = { title: c.title, meta: c.lead, tag: c.kicker };
  document.getElementById('case').addEventListener('click', e => {
    const fig = e.target.closest('.fig__btn');
    if (fig) { Lightbox.open({ ...lbOpts, files: all.map(im => ({ src: im.src, cap: im.lb || im.cap })), index: +fig.dataset.g }); return; }

    const cat = e.target.closest('.cat');
    if (cat) {
      const st = catalogs[+cat.dataset.b], items = st.d.items;
      const item = e.target.closest('.cat__item');
      if (item) {
        st.sel = +item.dataset.n;
        cat.querySelectorAll('.cat__item').forEach(b => b.setAttribute('aria-pressed', b === item));
        const strp = cat.querySelector('.cat__strip');
        strp.innerHTML = strip(items[st.sel]); strp.scrollLeft = 0;
        cat.querySelector('.cat__cap').innerHTML = catCap(items[st.sel]);
        return;
      }
      const pg = e.target.closest('.cat__page');
      if (pg) {
        const it = items[st.sel];
        Lightbox.open({ title: c.title, tag: c.kicker, meta: `${it.name} · ${it.meta}`, index: +pg.dataset.i,
          files: pagesOf(it).map((p, k) => ({ src: p, cap: `${it.name} — ${pageLabel(it, k)}` })) });
      }
      return;
    }

    const sw = e.target.closest('.sw');
    if (sw) {
      const b = sw.querySelector('b'), hex = sw.dataset.hex;
      (navigator.clipboard ? navigator.clipboard.writeText(hex) : Promise.reject()).then(() => {
        b.textContent = SITE_TEXT.ui.copied; setTimeout(() => { b.textContent = hex; }, 1200);
      }).catch(() => {});
    }
  });

  /* reveal */
  const io = new IntersectionObserver((es, o) => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); o.unobserve(en.target); } }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
