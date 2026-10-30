/* Pallino — la mascot di MCLS: burattino SVG con articolazioni, palloncino-fumetto e filo che lo segue.
   Il disegno è MCLS Kid di Luca, tagliato in pezzi da tools/build_mascot.py (dati in mascot-rig.js).
   · Corpo: torso, due braccia, due gambe (lo stesso contorno ritagliato per regione), testa con occhi/naso/bocca.
   · Vive: respira, sbatte gli occhi, guarda il cursore, cammina, salta, scende dal cielo appeso al palloncino.
   · Il palloncino è il fumetto: si gonfia quando parla (il testo è scritto dentro) e si sgonfia quando tace.
   · Il palloncino si può non avere: hold(false) lo toglie (l'ingresso di MCLS: Pallino saluta a mano libera), hold(true, {drop:true}) lo fa arrivare dall'alto e lo prende al volo.
   API (window.Pallino): say(righe, {choices, plain, early}) · point(elemento) · walkTo('left'|'center'|'right') · wave() · greet() · hold() · jump() · enter() · rise() · hide()/show() · poke().
   Il motore è deterministico: tick(ms) fa avanzare il tempo (lo usa il ciclo di animazione; nei test si chiama a mano). */
(() => {
  'use strict';
  const R = window.MASCOT_RIG;
  if (!R) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const K = R.kid, B = R.balloon;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const rot = (x, y, a, cx, cy) => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };
  const f1 = v => Math.round(v * 10) / 10;
  const wrapDeg = a => ((a + 540) % 360) - 180;
  const GREET = 0;                                              // di quanti gradi si alza il braccio rispetto a quando regge il palloncino (poi saluta ±18°, senza toccare la testa)

  /* molla critica: la posizione segue il bersaglio senza rimbalzi eccessivi */
  const spring = (v, target, k, dt, damp = 1) => { const c = 2 * Math.sqrt(k) * damp; v.v += (k * (target - v.x) - c * v.v) * dt; v.x += v.v * dt; return v.x; };
  const S = (x = 0) => ({ x, v: 0 });

  /* ---- costruzione dell'SVG e dell'involucro ---- */
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const html = (tag, cls, parent, attrs = {}) => { const n = document.createElement(tag); if (cls) n.className = cls; for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  const root = html('aside', 'mascot', document.body, { 'aria-label': 'Pallino, la guida di MCLS' });
  const svg = el('svg', { class: 'mascot__svg', 'aria-hidden': 'true', focusable: 'false' }, root);
  const defs = el('defs', {}, svg);
  const polyPts = pts => pts.map(p => p.join(',')).join(' ');
  for (const k in K.clips) el('polygon', { points: polyPts(K.clips[k]) }, el('clipPath', { id: `pl-${k}` }, defs));
  const balClip = el('clipPath', { id: 'pl-bal' }, defs);
  el('circle', { cx: B.clip.circle[0], cy: B.clip.circle[1], r: B.clip.circle[2] }, balClip);
  el('rect', { x: B.clip.rect[0], y: B.clip.rect[1], width: B.clip.rect[2], height: B.clip.rect[3] }, balClip);

  const gString = el('path', { class: 'mascot__string', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-width': B.stringW }, svg);
  const gKid = el('g', {}, svg);
  const gSquash = el('g', {}, gKid);
  const part = (name, parent = gSquash) => el('g', { class: `pl-${name}` }, parent);
  const bodyPath = (clip, parent) => el('path', { d: K.body, fill: 'currentColor', 'clip-path': `url(#pl-${clip})` }, parent);
  const gLegR = part('legR'); bodyPath('legR', gLegR); el('circle', { cx: K.pivots.legR[0], cy: K.pivots.legR[1], r: K.joints.legR, fill: 'currentColor' }, gLegR);
  const gLegL = part('legL'); bodyPath('legL', gLegL); el('circle', { cx: K.pivots.legL[0], cy: K.pivots.legL[1], r: K.joints.legL, fill: 'currentColor' }, gLegL);
  const gArmR = part('armR'); bodyPath('armR', gArmR); el('circle', { cx: K.pivots.armR[0], cy: K.pivots.armR[1], r: K.joints.armR, fill: 'currentColor' }, gArmR);
  const gTorso = part('torso'); bodyPath('torso', gTorso);
  const gArmL = part('armL'); bodyPath('armL', gArmL); el('circle', { cx: K.pivots.armL[0], cy: K.pivots.armL[1], r: K.joints.armL, fill: 'currentColor' }, gArmL);
  const gHead = part('head');
  K.head.hair.forEach(d => el('path', { d, fill: 'currentColor' }, gHead));
  el('path', { d: K.head.face, fill: 'currentColor' }, gHead);
  const gFace = el('g', {}, gHead);                              // occhi, naso, bocca: si spostano un po' per "guardare"
  const eyeL = el('path', { d: K.head.eyeL, fill: 'currentColor' }, gFace), eyeR = el('path', { d: K.head.eyeR, fill: 'currentColor' }, gFace);
  el('path', { d: K.head.nose, fill: 'currentColor' }, gFace);
  const mouth = el('path', { d: K.head.mouth, fill: 'currentColor' }, gFace);
  const mouthOpen = el('ellipse', { cx: K.head.mouthC[0], cy: K.head.mouthC[1] + 1, rx: 7.5, ry: 6, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.6, opacity: 0 }, gFace);
  const gBal = el('g', {}, svg);
  el('circle', { cx: B.center[0], cy: B.center[1], r: B.outer - 8, class: 'mascot__bfill' }, gBal);        // lo sfondo del fumetto: il testo si legge su qualunque pagina
  el('path', { d: B.d, fill: 'currentColor', 'clip-path': 'url(#pl-bal)' }, gBal);

  const say = html('div', 'mascot__say', root, { 'aria-hidden': 'true' });                 // il testo che si scrive lettera per lettera non va letto dallo screen reader
  const sr = html('p', 'mascot__sr', root, { 'aria-live': 'polite', 'aria-atomic': 'true' });   // ...che riceve la frase intera, in una volta
  const sayText = html('p', 'mascot__text', say);
  const cap = html('p', 'mascot__caption', root, { 'aria-hidden': 'true' });                 // il saluto "a mano libera": testo semplice accanto a Pallino, senza palloncino
  const choicesEl = html('div', 'mascot__choices', root, { role: 'group', 'aria-label': 'Cosa vuoi fare?' });
  const hitKid = html('button', 'mascot__hit mascot__hit--kid', root, { type: 'button', 'aria-label': 'Pallino: parlami' });
  const hitBal = html('button', 'mascot__hit mascot__hit--bal', root, { type: 'button', 'aria-label': 'Il palloncino di Pallino', tabindex: '-1' });

  /* ---- stato ---- */
  const st = {
    W: innerWidth, H: 600, ks: .3, big: 1, bigT: 1, bs: S(1), rest: S(0), restT: 0, stationPx: 0, chDx: 90, chRight: false, held: true, greet: false, chH: 0, rising: false, fx: 0, fy: 0, tx: 0, station: 'right', t: 0, hidden: false,
    flip: S(1), faceDir: 1, lean: S(0), sy: S(1), sx: S(1), hop: { y: 0, v: 0 },
    armL: S(0), armR: S(0), legL: S(0), legR: S(0), head: S(0), look: { x: S(0), y: S(0) },
    walkPhase: 0, walkAmt: S(0), walkSpeed: 0,
    waveT: 0, pointTo: null, dangle: 0, blinkT: 2.5, blink: 0,
    talk: S(0), typing: false,
    bal: { x: S(0), y: S(0), s: S(.08), target: 'idle', D: 0, sway: 0 },
    cursor: null, idleT: 0, ready: false,
  };
  const api = { state: st };

  /* ---- misure ---- */
  const sizeKid = () => { const KH = clamp(Math.min(innerHeight * .165, innerWidth * .36), 104, 164) * st.big; st.ks = KH / K.h; st.KH = KH; };
  const layout = () => {
    st.W = innerWidth; st.H = Math.min(680, innerHeight - 72);
    sizeKid();
    svg.setAttribute('viewBox', `0 0 ${st.W} ${st.H}`);
    root.style.setProperty('--mh', st.H + 'px');
    st.fy = st.H - 6 + st.rest.x;
    const x = stationX(st.station); st.tx = x; if (!st.ready || reduceMotion) st.fx = x;
    if (reduceMotion && api.tick) settle();
  };
  const stationX = name => name === 'px' ? st.stationPx : name === 'center' ? st.W / 2 : name === 'left' ? 18 + 150 * st.ks : st.W - 18 - 150 * st.ks;

  /* ---- geometria: da coordinate del disegno a pixel del contenitore (e ritorno) ---- */
  const kidToScreen = (x, y, armAng = 0, viaArmL = false) => {
    if (viaArmL) [x, y] = rot(x, y, armAng, K.pivots.armL[0], K.pivots.armL[1]);
    let dx = (x - K.feet[0]) * st.sx.x, dy = (y - K.feet[1]) * st.sy.x;
    [dx, dy] = rot(dx, dy, st.lean.x, 0, 0);
    return [st.fx + dx * st.ks * st.flip.x, st.fy + st.hop.y + dy * st.ks];
  };
  const screenToKid = (px, py) => [K.feet[0] + (px - st.fx) / (st.ks * (Math.abs(st.flip.x) < .05 ? 1 : st.flip.x)), K.feet[1] + (py - st.fy - st.hop.y) / st.ks];
  const handPos = () => kidToScreen(K.hand[0], K.hand[1], st.armL.x, true);

  /* ---- comportamenti ---- */
  const idleBlink = dt => { st.blinkT -= dt; if (st.blinkT <= 0) { st.blink = .16; st.blinkT = 2.4 + Math.random() * 3.6; } if (st.blink > 0) st.blink -= dt; };

  api.jump = (power = 520) => { if (reduceMotion) return; if (st.hop.y > -2) st.hop.v = -power; st.sy.v -= 3; };
  api.wave = (n = 3) => { if (reduceMotion) return; st.waveT = n * .62; };
  api.point = target => { st.pointTo = target || null; };
  api.walkTo = (station, opts = {}) => {
    st.station = station; st.tx = stationX(station); st.faceDir = station === 'left' ? -1 : 1;
    if (reduceMotion || opts.instant) { st.fx = st.tx; st.flip.x = st.faceDir; st.flip.v = 0; if (reduceMotion) settle(); }
  };
  api.enter = () => {                                          // scende dal cielo, appeso al palloncino
    layout(); st.fx = stationX(st.station); st.dangle = 1;
    if (reduceMotion) { st.fy = st.H - 6; st.dangle = 0; st.ready = true; settle(); return Promise.resolve(); }
    st.fy = -st.KH * 2.4; st.bal.target = 'idle'; st.ready = true; st.bal.init = false;     // il palloncino segue già da su
    return new Promise(res => { st.onLand = () => { st.dangle = 0; st.sy.x = .8; api.wave(3); res(); }; });
  };

  api.setBig = (v, smooth) => {                                // ingrandisce Pallino (l'ingresso di MCLS) o lo riporta alla misura normale (smooth: con calma)
    st.bigT = v;
    if (!smooth || reduceMotion) { st.bs.x = v; st.bs.v = 0; st.big = v; layout(); }
  };
  api.greet = on => { st.greet = on !== false; };
  api.setRest = (dy, smooth) => {                              // di quanto i piedi stanno sotto il bordo dello schermo (l'ingresso di MCLS: Pallino è tagliato dal bordo); smooth: sale con calma
    st.restT = dy;
    if (!smooth || reduceMotion) { st.rest.x = dy; st.rest.v = 0; if (!st.rising && !st.dangle) st.fy = st.H - 6 + dy; }
  };
  api.placeX = px => { st.stationPx = px; api.walkTo('px', { instant: true }); };      // posizione libera, in pixel
  api.setChoices = o => { if ('dx' in o) st.chDx = o.dx; if ('right' in o) st.chRight = !!o.right; last.pc = null; placeChoices(); };       // dove stanno le scelte rispetto a Pallino              // a mano libera: il braccio sta alzato e saluta
  api.hold = (on, opts = {}) => {                              // con o senza palloncino; drop: il palloncino arriva dall'alto e Pallino lo prende
    st.held = on !== false;
    if (!st.held) return;
    if (opts.drop && !reduceMotion) { st.bal.drop = true; st.bal.fast = 1.6; } else st.bal.init = false;
  };
  api.where = () => [st.fx, innerHeight - st.H + st.fy - st.KH * .45];     // il centro di Pallino sullo schermo
  api.rise = () => {                                           // sale da sotto lo schermo, tutto intero, salutando con la mano alzata
    layout(); st.fx = stationX(st.station); st.rising = true; st.dangle = 0; st.bal.init = false; st.ready = true; st.hidden = false;
    if (reduceMotion) { st.fy = st.H - 6 + st.rest.x; st.rising = false; settle(); return Promise.resolve(); }
    st.fy = st.H + st.ks * 452 + 30; api.wave(5); render();
    return new Promise(res => { st.onRise = () => { api.wave(3); res(); }; });
  };

  /* ---- fumetto: il palloncino si gonfia, il testo si scrive dentro ---- */
  const idleD = () => clamp(st.KH * .42, 46, 70);
  const fitD = (text) => {
    const font = clamp(st.W * .042, 14, 17.5), d = font * Math.sqrt(Math.max(12, text.length) * .92) / .6;
    return clamp(d, st.W < 520 ? 150 : 176, Math.min(st.W * .82, 320));
  };
  let queue = null, typeTimer = 0, holdTimer = 0, lineIdx = 0, runId = 0;
  const setD = D => { st.bal.D = D; st.bal.s.target = D; if (reduceMotion) settle(); };

  const clearTimers = () => { clearTimeout(typeTimer); clearTimeout(holdTimer); };
  const showChoices = list => {
    choicesEl.innerHTML = '';
    (list || []).forEach(c => {
      const b = html('button', 'mascot__choice', choicesEl, { type: 'button' }); b.textContent = c.label;
      if (c.primary) b.classList.add('is-primary');
      b.addEventListener('click', () => {
        choicesEl.innerHTML = ''; choicesEl.classList.remove('is-on'); st.idleT = 0;
        if (c.href) { (/^(mailto:|tel:|https?:)/.test(c.href) || !window.PageTransition) ? (location.href = c.href) : PageTransition.go(c.href); return; }
        if (c.run) c.run();
      });
    });
    choicesEl.classList.toggle('is-on', !!(list && list.length));
    st.chH = list && list.length ? choicesEl.offsetHeight : 0;   // l'altezza della colonna: il saluto si mette sopra
    placeChoices();
  };
  /* say(righe, {choices, keep, onLine, manual, plain, early})
     plain: le righe si scrivono come testo semplice accanto a Pallino (senza palloncino: è il saluto dell'ingresso);
     early: le scelte compaiono subito, non alla fine delle righe. */
  api.say = (lines, opts = {}) => {
    const id = ++runId; clearTimers(); lines = [].concat(lines).filter(Boolean);
    const plain = !!opts.plain, out = plain ? cap : sayText, box = plain ? cap : say;
    showChoices([]); st.idleT = 0; queue = { lines, opts, id }; lineIdx = 0;
    if (plain) say.classList.remove('is-on'); else cap.classList.remove('is-on');
    if (plain && opts.early && opts.choices) showChoices(opts.choices);
    return new Promise(res => {
      const next = () => {
        if (id !== runId) return res(false);
        if (lineIdx >= lines.length) {                           // finito: scelte, oppure si sgonfia
          st.typing = false;
          if (opts.choices && opts.choices.length) { if (!(plain && opts.early)) showChoices(opts.choices); }
          else if (!opts.keep && !plain) holdTimer = setTimeout(() => { if (id === runId) deflate(); }, 1800);
          return res(true);
        }
        const text = lines[lineIdx++]; out.textContent = ''; sr.textContent = text; box.classList.add('is-on'); if (!plain) setD(fitD(text));
        if (plain) placeChoices();
        if (opts.onLine) opts.onLine(lineIdx - 1);
        if (reduceMotion) { out.textContent = text; st.typing = false; holdTimer = setTimeout(next, opts.manual ? 1e9 : Math.min(5200, 1500 + text.length * 55)); return; }
        let i = 0; st.typing = true;
        const type = () => {
          if (id !== runId) return;
          i += 1; out.textContent = text.slice(0, i);
          if (i < text.length) typeTimer = setTimeout(type, /[.,!?]/.test(text[i - 1]) ? 150 : 26);
          else { st.typing = false; holdTimer = setTimeout(next, Math.min(4600, 1100 + text.length * 38)); }
        };
        typeTimer = setTimeout(type, plain ? 160 : 420);         // il tempo di gonfiarsi
      };
      queue.skip = () => {                                      // clic sul fumetto: se sta scrivendo completa la riga, altrimenti passa alla prossima
        clearTimers();
        if (st.typing) { out.textContent = lines[lineIdx - 1] || ''; st.typing = false; holdTimer = setTimeout(next, 650); } else next();
      };
      next();
    });
  };
  const deflate = () => { say.classList.remove('is-on'); cap.classList.remove('is-on'); st.typing = false; st.bal.D = idleD(); st.bal.s.target = idleD(); if (reduceMotion) settle(); };
  api.fit = text => {                                           // prova: la frase entra nel palloncino? (usata nei controlli)
    setD(fitD(text)); sayText.textContent = text; say.classList.add('is-on');
    for (let i = 0; i < 90; i++) api.tick(16);
    const box = say.getBoundingClientRect(), t = sayText.getBoundingClientRect();
    return { D: Math.round(st.bal.s.x), side: Math.round(box.width), textH: Math.round(t.height), textW: Math.round(t.width), fits: t.height <= box.height + 1 && t.width <= box.width + 1 };
  };
  api.quiet = () => { runId++; clearTimers(); showChoices([]); deflate(); st.pointTo = null; };
  api.skip = () => { if (queue && queue.skip && say.classList.contains('is-on')) queue.skip(); };

  api.hide = () => { st.hidden = true; root.classList.add('is-hidden'); api.quiet(); };
  api.show = () => { st.hidden = false; root.classList.remove('is-hidden'); render(); };

  /* ---- ciclo ---- */
  const placeChoices = () => {
    const on = choicesEl.classList.contains('is-on'), capOn = cap.classList.contains('is-on');
    if (!on && !capOn) return;
    const left = st.station === 'left' || st.station === 'center' || st.station === 'px';
    let x = left ? (st.fx + st.chDx * st.ks + 14) + 'px' : 'auto', r = left ? 'auto' : (st.W - st.fx + st.chDx * st.ks + 14) + 'px';
    if (st.chRight) { x = 'auto'; r = '12px'; }                  // sul telefono le scelte stanno contro il bordo destro
    const key = [on, capOn, x, r, st.chH, left, st.chRight].join('|');
    if (key === last.pc) return; last.pc = key;                 // cammina soltanto quando Pallino si sposta
    if (on) {
      choicesEl.style.bottom = '10px'; choicesEl.style.left = x; choicesEl.style.right = r;
      choicesEl.style.alignItems = left && !st.chRight ? 'flex-start' : 'flex-end';
    }
    if (capOn) { cap.style.bottom = (st.chH + 30) + 'px'; cap.style.left = x; cap.style.right = r; cap.style.textAlign = left && !st.chRight ? 'left' : 'right'; }
  };

  const settle = () => { for (let i = 0; i < 90; i++) step(1 / 30); render(); };      // con "riduci movimento": va subito nella posizione finale
  api.tick = ms => {
    const dt = Math.min(ms, 50) / 1000, steps = Math.max(1, Math.ceil(dt / (1 / 60)));
    for (let n = 0; n < steps; n++) step(dt / steps);
    render();
  };

  const step = dt => {
    st.t += dt; st.idleT += dt;
    const t = st.t;
    /* sposta: cammina verso la stazione */
    const dx = st.tx - st.fx, moving = Math.abs(dx) > 1.5 && !reduceMotion;
    if (moving) { const sp = clamp(Math.abs(dx) * 3, 90, 420) * Math.sign(dx); st.fx += sp * dt; st.walkPhase += Math.abs(sp) * dt * .045; if (Math.abs(st.tx - st.fx) < 1.5) st.fx = st.tx; }
    spring(st.walkAmt, moving ? 1 : 0, 90, dt);
    /* si gira */
    spring(st.flip, st.faceDir, 120, dt);
    /* discesa (entrata): scende lenta, le gambe dondolano */
    if (st.dangle > 0) {
      const g = st.H - 6, rem = g - st.fy;
      st.fy += clamp(rem * 1.6, 70, 360) * dt;
      if (rem < 2) { st.fy = g; if (st.onLand) { const f = st.onLand; st.onLand = null; f(); } }
    }
    /* salita da sotto */
    if (st.rising) {
      const g = st.H - 6 + st.rest.x, rem = st.fy - g;
      st.fy -= clamp(rem * 3.2, 140, 900) * dt;
      if (rem < 2) { st.fy = g; st.rising = false; if (st.onRise) { const f = st.onRise; st.onRise = null; f(); } }
    }
    /* a terra: i piedi seguono rest (sale con calma quando Pallino torna alla misura normale) */
    if (Math.abs(st.rest.x - st.restT) > .05 || Math.abs(st.rest.v) > .05) spring(st.rest, st.restT, 55, dt, 1);
    if (!st.rising && !(st.dangle > 0)) st.fy = st.H - 6 + st.rest.x;
    /* salto */
    st.hop.v += 2600 * dt; st.hop.y += st.hop.v * dt;
    if (st.hop.y >= 0) { if (st.hop.v > 240) st.sy.v += -st.hop.v * .004; st.hop.y = 0; st.hop.v = 0; }
    /* respiro e schiacciamento */
    spring(st.sy, 1 + .012 * Math.sin(t * 2.1), 160, dt, .7); st.sx.x = 1 / Math.sqrt(clamp(st.sy.x, .6, 1.4));
    /* gambe */
    const dang = st.dangle > 0 ? 1 : 0, wA = st.walkAmt.x * 22 * Math.sin(st.walkPhase * 3.2) + dang * 20 * Math.sin(t * 4.2);
    spring(st.legL, wA, 400, dt, .8); spring(st.legR, -wA * (dang ? .8 : 1) + (dang ? -4 : 0), 400, dt, .8);
    spring(st.lean, st.walkAmt.x * 4 * Math.sign(dx || 1) * (Math.abs(st.flip.x) < .5 ? 0 : 1), 120, dt);
    /* testa, occhi: guardano il cursore o il bersaglio */
    let lx = 0, ly = 0;
    const tgt = st.pointTo ? centerOf(st.pointTo) : st.cursor;
    if (tgt && !reduceMotion) { const [hx, hy] = kidToScreen(181, 120); lx = clamp((tgt[0] - hx) / 260, -1, 1); ly = clamp((tgt[1] - hy) / 260, -1, 1); }
    spring(st.look.x, lx, 140, dt); spring(st.look.y, ly, 140, dt); spring(st.head, st.look.x.x * 5 + 1.4 * Math.sin(t * 1.3), 160, dt);
    /* cresce o si rimpicciolisce con calma (setBig con smooth) */
    if (Math.abs(st.bs.x - st.bigT) > .0005 || Math.abs(st.bs.v) > .01) {
      spring(st.bs, st.bigT, 55, dt, 1);
      if (Math.abs(st.bs.x - st.bigT) < .0008 && Math.abs(st.bs.v) < .01) { st.bs.x = st.bigT; st.bs.v = 0; }
      st.big = st.bs.x; sizeKid(); st.tx = stationX(st.station);
    }
    /* braccio sinistro: saluto, indicazione, riposo */
    let armT = 4 * Math.sin(t * 1.1);
    if (st.greet) {                                              // a mano libera: il braccio sta alzato accanto alla testa e saluta
      armT = GREET + (st.waveT > 0 ? 18 * Math.sin(t * 10.5) : 4 * Math.sin(t * 1.7));
      if (st.waveT > 0) st.waveT -= dt;
    }
    else if (st.waveT > 0) { st.waveT -= dt; armT = 26 * Math.sin(t * 10.5) + 8; }
    else if (st.pointTo) {
      const c = centerOf(st.pointTo), [kx, ky] = screenToKid(c[0], c[1]), px = K.pivots.armL, base = Math.atan2(K.hand[1] - px[1], K.hand[0] - px[0]);
      armT = clamp(wrapDeg(deg(Math.atan2(ky - px[1], kx - px[0]) - base)), -135, 120);
    }
    spring(st.armL, st.dangle ? -8 + 6 * Math.sin(t * 3) : armT, 220, dt, .75);
    spring(st.armR, 3 * Math.sin(t * 1.3 + 1) + st.walkAmt.x * 16 * Math.sin(st.walkPhase * 3.2 + Math.PI), 200, dt, .8);
    /* bocca che parla */
    spring(st.talk, st.typing ? .5 + .5 * Math.sin(t * 17) : 0, 600, dt, .6);
    idleBlink(dt);
    /* palloncino: molla verso il punto sopra la mano, gonfiaggio */
    const [hx, hy] = handPos(), D = Math.max(1, st.bal.s.x), rO = (B.outer / B.r) * D / 2;
    const sc = D / (2 * B.r), len = Math.max(st.KH * .55, 40) + (say.classList.contains('is-on') ? st.KH * .1 : 0);
    const side = st.flip.x >= 0 ? -1 : 1, sway = Math.sin(t * 1.35) * 7, bob = Math.sin(t * 1.9) * 4;
    let bx = hx + side * (len * .45 + rO * .12) + sway, by = hy - len - rO + bob;
    bx = clamp(bx, rO + 6, st.W - rO - 6); by = Math.max(by, rO + 4);
    if (st.bal.drop) {                                           // il palloncino arriva dall'alto, sulla corda: Pallino lo prende al volo
      st.bal.drop = false; st.bal.init = true; st.bal.x.x = bx; st.bal.y.x = -(innerHeight - st.H) - rO * 2 - 30; st.bal.x.v = st.bal.y.v = 0;
    }
    if (!st.bal.init) { st.bal.init = true; st.bal.x.x = bx; st.bal.y.x = by; st.bal.x.v = st.bal.y.v = 0; }
    const kb = st.bal.fast > 0 ? 42 : 36; if (st.bal.fast > 0) st.bal.fast -= dt;
    spring(st.bal.x, bx, kb, dt, .55); spring(st.bal.y, by, kb, dt, st.bal.fast > 0 ? .8 : .55);
    spring(st.bal.s, st.bal.D || idleD(), 90, dt, .6);
    if (!st.bal.D) st.bal.D = idleD();
    st.bal.sc = sc; st.bal.rO = rO; st.bal.hand = [hx, hy];
    /* se è fermo da molto, qualche battuta */
    if (api.onIdle && st.idleT > 32 && !say.classList.contains('is-on') && !st.hidden) { st.idleT = 0; api.onIdle(); }
  };
  const centerOf = t => { if (Array.isArray(t)) return t; const r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2 - (innerHeight - st.H)]; };

  let last = { transform: {} };
  const setT = (node, key, v) => { if (last.transform[key] !== v) { last.transform[key] = v; node.setAttribute('transform', v); } };
  const render = () => {
    const ks = st.ks, [fx0, fy0] = K.feet;
    setT(gKid, 'kid', `translate(${f1(st.fx)} ${f1(st.fy + st.hop.y)}) scale(${(ks * (Math.abs(st.flip.x) < .02 ? .02 * Math.sign(st.flip.x || 1) : st.flip.x)).toFixed(4)} ${ks.toFixed(4)}) translate(${-fx0} ${-fy0})`);
    setT(gSquash, 'sq', `translate(${fx0} ${fy0}) rotate(${f1(st.lean.x)}) scale(${st.sx.x.toFixed(3)} ${st.sy.x.toFixed(3)}) translate(${-fx0} ${-fy0})`);
    setT(gArmL, 'al', `rotate(${f1(st.armL.x)} ${K.pivots.armL[0]} ${K.pivots.armL[1]})`);
    setT(gArmR, 'ar', `rotate(${f1(st.armR.x)} ${K.pivots.armR[0]} ${K.pivots.armR[1]})`);
    setT(gLegL, 'll', `rotate(${f1(st.legL.x)} ${K.pivots.legL[0]} ${K.pivots.legL[1]})`);
    setT(gLegR, 'lr', `rotate(${f1(st.legR.x)} ${K.pivots.legR[0]} ${K.pivots.legR[1]})`);
    setT(gHead, 'hd', `rotate(${f1(st.head.x)} ${K.pivots.head[0]} ${K.pivots.head[1]})`);
    setT(gFace, 'fc', `translate(${f1(st.look.x.x * 4.5)} ${f1(st.look.y.x * 3)})`);
    const by = st.blink > 0 ? .12 : 1;
    setT(eyeL, 'el', `translate(0 ${K.head.eyeLc[1] * (1 - by)}) scale(1 ${by})`); setT(eyeR, 'er', `translate(0 ${K.head.eyeRc[1] * (1 - by)}) scale(1 ${by})`);
    const open = clamp(st.talk.x, 0, 1);
    mouthOpen.setAttribute('opacity', open > .12 ? 1 : 0); mouth.setAttribute('opacity', open > .12 ? 0 : 1);
    setT(mouthOpen, 'mo', `translate(${K.head.mouthC[0]} ${K.head.mouthC[1] + 1}) scale(${(.55 + .45 * open).toFixed(2)} ${(.4 + .9 * open).toFixed(2)}) translate(${-K.head.mouthC[0]} ${-(K.head.mouthC[1] + 1)})`);
    /* palloncino e filo (a mano libera non ci sono) */
    if (last.held !== st.held) {
      last.held = st.held; const v = st.held ? 'visible' : 'hidden';
      gBal.setAttribute('visibility', v); gString.setAttribute('visibility', v); hitBal.style.display = st.held ? '' : 'none';
    }
    const sc = st.bal.sc || .1, bx = st.bal.x.x, by2 = st.bal.y.x;
    setT(gBal, 'bal', `translate(${f1(bx)} ${f1(by2)}) scale(${sc.toFixed(4)}) translate(${-B.center[0]} ${-B.center[1]})`);
    const [hx, hy] = st.bal.hand || [bx, by2 + 100], kx = bx + (B.knot[0] - B.center[0]) * sc, ky = by2 + (B.knot[1] - B.center[1]) * sc;
    const vx = kx - hx, vy = ky - hy, L = Math.hypot(vx, vy) || 1, nx = -vy / L, ny = vx / L, a = L * .05, tt = st.t;
    const o1 = a * Math.sin(tt * 2.1) + (st.bal.x.v) * -.03, o2 = a * Math.sin(tt * 2.1 + 1.7) + (st.bal.x.v) * -.05;
    const p = [`M${f1(hx)} ${f1(hy)}`, `C${f1(hx + vx * .3 + nx * o1)} ${f1(hy + vy * .3 + ny * o1)} ${f1(hx + vx * .7 + nx * o2)} ${f1(hy + vy * .7 + ny * o2)} ${f1(kx)} ${f1(ky)}`].join(' ');
    if (last.string !== p) { last.string = p; gString.setAttribute('d', p); gString.setAttribute('stroke-width', Math.max(1.2, B.stringW * ks * .55).toFixed(2)); }
    /* testo dentro il palloncino */
    const Dpx = 2 * B.r * sc, side = Dpx * .7;
    /* le posizioni cambiano a ogni fotogramma (il palloncino ondeggia): con "translate" non c'è layout; le misure si scrivono solo quando cambiano */
    const fs = f1(clamp(side * .112, 12.5, 21)), sd = f1(side), sk = sd + '|' + fs;
    if (last.sk !== sk) { last.sk = sk; say.style.cssText = `left:0;top:0;width:${sd}px;height:${sd}px;font-size:${fs}px;`; }
    say.style.translate = `${f1(bx - side / 2)}px ${f1(by2 - side / 2)}px`;
    /* aree cliccabili */
    const hk = f1(140 * ks) + '|' + f1(K.h * ks);
    if (last.hk !== hk) { last.hk = hk; hitKid.style.width = f1(140 * ks) + 'px'; hitKid.style.height = f1(K.h * ks) + 'px'; }
    hitKid.style.translate = `${f1(st.fx - 70 * ks)}px ${f1(st.fy + st.hop.y - K.h * ks)}px`;
    const rO = st.bal.rO || 30, hb = f1(rO * 2);
    if (last.hb !== hb) { last.hb = hb; hitBal.style.width = hb + 'px'; hitBal.style.height = hb + 'px'; }
    hitBal.style.translate = `${f1(bx - rO)}px ${f1(by2 - rO)}px`;
    placeChoices();
  };

  /* ---- ingressi dell'utente ---- */
  addEventListener('pointermove', e => { st.cursor = [e.clientX, e.clientY - (innerHeight - st.H)]; st.idleT = 0; }, { passive: true });
  addEventListener('resize', () => { layout(); });
  const poke = () => { st.idleT = 0; api.jump(380); if (api.onPoke) api.onPoke(); };
  api.poke = poke;
  hitKid.addEventListener('click', poke);
  hitBal.addEventListener('click', () => { api.skip(); if (api.onPoke) api.onPoke('balloon'); });
  say.addEventListener('click', () => api.skip());
  addEventListener('keydown', e => { if (e.key === 'Escape' && say.classList.contains('is-on')) api.quiet(); });

  /* ---- avvio ---- */
  layout();
  st.bal.D = idleD(); st.bal.s.x = idleD(); st.bal.s.target = idleD();
  st.fy = st.H - 6; st.fx = st.tx;
  if (reduceMotion) settle(); else render();
  let raf = 0, prev = 0, running = true;
  let acc = 0;
  const calm = () => !(st.waveT > 0 || st.typing || st.rising || st.dangle > 0 || st.pointTo || st.hop.y < -.5 || Math.abs(st.hop.v) > 5 || Math.abs(st.tx - st.fx) > 1.5 ||
    Math.abs(st.bs.x - st.bigT) > .0008 || st.bal.fast > 0 || Math.abs(st.flip.x - st.faceDir) > .02 || st.greet);
  const loop = now => {                                          // raccolto nel pulsante o scheda in secondo piano: non si fa nulla; a riposo bastano 30 fotogrammi al secondo (respiro, sguardo)
    raf = requestAnimationFrame(loop); if (!prev) prev = now;
    acc += now - prev; prev = now;
    if (!running || document.hidden || reduceMotion || st.hidden) { acc = 0; return; }
    if (acc < 30 && calm()) return;
    const ms = acc; acc = 0; api.tick(ms);
  };
  if (!reduceMotion) raf = requestAnimationFrame(loop);
  api.pause = () => { running = false; }; api.resume = () => { running = true; prev = 0; };
  api.layout = layout; api.root = root; api.name = 'Pallino';
  window.Pallino = api;
})();
