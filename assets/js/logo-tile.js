/* Tessera logo con tre versioni — nero su bianco · bianco su nero · in palette — e i tre pallini per cambiarle (come da UI Kit).
   Usata dalla libreria Progetti personali (home). Dati: window.LOGOS (assets/js/logos.js). Immagini: assets/img/atlas/.
   Per ogni logo: <id>.m.png = sagoma (nero/bianco via filtro CSS), <id>.webp = colori. Se logos.js ha nero/bianco/pal (file già pronti), vincono quelli.
   Segni (kind:'mark', dati in marks.js, immagini in assets/img/marks/): terza versione = traccia (solo contorno) al posto della palette. */
(() => {
  'use strict';
  const BASE = 'assets/img/atlas/';
  const INK = '#0a0a0a';
  const MARKS = 'assets/img/marks/';
  const MODES = [{ label: 'Nero su bianco' }, { label: 'Bianco su nero' }, { label: 'In palette' }];
  const MARK_MODES = [{ label: 'Nero su bianco' }, { label: 'Bianco su nero' }, { label: 'Traccia' }];
  const modesOf = it => it && it.kind === 'mark' ? MARK_MODES : MODES;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  const R = 10.5, C = 12;
  const at = a => `${(C + R * Math.cos(a)).toFixed(2)} ${(C + R * Math.sin(a)).toFixed(2)}`;

  /* un pallino: pieno quando è attivo, solo traccia quando non lo è (come Shift+X in Illustrator).
     Il pallino palette ha uno spicchio per ogni tinta del logo. */
  const dotSvg = (it, m, on) => {
    const k = it.k && it.k.length ? it.k : ['#1c1c1b'], n = k.length;
    const circ = (fill, stroke, w) => `<circle cx="${C}" cy="${C}" r="${R}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
    let g;
    if (m === 0) g = circ(on ? INK : 'none', INK, 1);
    else if (m === 2 && it.kind === 'mark') g = on ? circ('none', INK, 2.6) + `<circle cx="${C}" cy="${C}" r="5.2" fill="none" stroke="${INK}" stroke-width="1"/>` : circ('none', INK, 1);
    else if (m === 1) g = on ? circ('#fff', 'rgba(0,0,0,.16)', .8) : circ('none', INK, 1);
    else if (on) g = n === 1 ? circ(k[0], 'none', 0)
      : k.map((c, i) => { const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n; return `<path d="M${C} ${C}L${at(a0)}A${R} ${R} 0 0 1 ${at(a1)}Z" fill="${c}"/>`; }).join('');
    else g = circ('none', INK, 1) + (n === 1 ? `<circle cx="${C}" cy="${C}" r="3.6" fill="${k[0]}"/>`
      : k.map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return `<path d="M${C} ${C}L${at(a)}" stroke="${INK}" stroke-width=".8" fill="none"/>`; }).join(''));
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${g}</svg>`;
  };
  const dots = (it, m, label = 'Versione del logo') => `<div class="lg-dots" role="group" aria-label="${label}">${modesOf(it).map((x, i) =>
    `<button class="lg-dot" type="button" data-m="${i}" aria-pressed="${i === m}" aria-label="${x.label}" title="${x.label}">${dotSvg(it, i, i === m)}</button>`).join('')}</div>`;

  /* quale immagine + filtro + sfondo per una versione */
  const view = (it, m) => {
    if (it.kind === 'mark') {                               // segno: nero · bianco · traccia (file pronti oppure sagoma + filtro)
      const f = [it.nero, it.bianco, it.traccia][m], bg = m === 1 ? INK : '#fff';
      if (f) return { src: MARKS + f, filter: '', bg };
      if (m === 2) return { src: `${MARKS}${it.id}.t.png`, filter: '', bg };
      return { src: `${MARKS}${it.id}.m.png`, filter: m === 0 ? 'brightness(0)' : 'brightness(0) invert(1)', bg };
    }
    const own = [it.nero, it.bianco, it.pal][m], bg = m === 1 ? INK : '#fff';
    if (own) return { src: BASE + own, filter: '', bg };
    if (m === 2) return { src: `${BASE}${it.id}.webp`, filter: '', bg };
    return { src: `${BASE}${it.id}.m.png`, filter: m === 0 ? 'brightness(0)' : 'brightness(0) invert(1)', bg };
  };

  const tile = (it, m, catLabel) => {
    const v = view(it, m);
    return `<li class="lg-item reveal" data-id="${it.id}">
      <div class="lg-tile" data-m="${m}">
        <button class="lg-open" type="button" aria-label="Ingrandisci ${it.name}" data-cursor="Apri"><span class="lg-box"><img src="${v.src}" style="filter:${v.filter || 'none'}" alt="Logo ${it.name}" loading="lazy" decoding="async"></span></button>
        ${dots(it, m)}
      </div>
      <p class="lg-cap"><b>${pad(it.n)}</b><span>${it.name}</span>${catLabel ? `<small>${catLabel}</small>` : ''}</p>
    </li>`;
  };

  /* cambia versione di una tessera già in pagina */
  const update = (li, it, m) => {
    const t = li.querySelector('.lg-tile'), img = li.querySelector('img'), v = view(it, m);
    t.dataset.m = m;
    li.querySelector('.lg-dots').outerHTML = dots(it, m);
    const apply = () => {
      img.src = v.src; img.style.filter = v.filter || 'none';
      if (!reduce) img.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
    };
    if (img.src.endsWith(v.src)) apply(); else { const pre = new Image(); pre.onload = pre.onerror = apply; pre.src = v.src; }
  };

  /* delega: click su un pallino (cambia solo quella tessera) o sul logo (ingrandisce) */
  const bind = (root, { item, getMode, setMode, open }) => root.addEventListener('click', e => {
    const li = e.target.closest('.lg-item'); if (!li) return;
    const it = item(li.dataset.id);
    const dot = e.target.closest('.lg-dot');
    if (dot) { const m = +dot.dataset.m; setMode(it, m); update(li, it, m); return; }
    if (e.target.closest('.lg-open')) open(it, li);
  });

  /* un file che non arriva (server locale lento, rete) si riprova due volte */
  document.addEventListener('error', e => {
    const img = e.target; if (!img.matches || !img.matches('.lg-box img')) return;
    const n = +(img.dataset.tries || 0); if (n >= 2) return;
    img.dataset.tries = n + 1; const src = img.getAttribute('src').split('?')[0];
    setTimeout(() => { img.src = `${src}?r=${n + 1}`; }, 400 + n * 600);
  }, true);

  window.LogoTile = { MODES, MARK_MODES, modesOf, view, dots, tile, update, bind, pad };
})();
