/* Guida di MCLS. Pallino compare nell'ingresso (la schermata blu: logo → scritta sul cerchio → Pallino sale da sotto, a mano libera, e saluta)
   e da lì si può già scegliere cosa fare: appena scegli una risposta prende il palloncino e ti porta dentro. Dentro l'interfaccia resta raccolto nel piccolo pulsante «Pallino» in basso a destra:
   lo richiami quando vuoi e, se scorri per conto tuo, si fa da parte. Non è mai un elemento fisso e grande sopra i contenuti.
   Usa il motore della mascot (mascot.js), le sue parole (mascot-data.js) e le azioni della pagina (MCLSPage, in mcls.js).
   Il giro si interrompe quando l'utente tocca Pallino o preme Esc. */
(() => {
  'use strict';
  const P = window.Pallino, T = window.PALLINO_TEXT, Page = window.MCLSPage, BR = window.BRANDS;
  if (!P || !T || !Page) return;
  const html = document.documentElement, reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = T.labels, pick = a => a[Math.floor(Math.random() * a.length)];
  const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));
  const $ = s => document.querySelector(s);
  let tourId = 0, touring = 0, hiddenBtn = null, refY = 0, inIntro = false, met = false;
  const say0 = P.say; P.say = (...a) => { refY = scrollY; return say0(...a); };      // ricorda dove eravamo quando ha parlato

  /* ---- scelte ---- */
  const mainChoices = () => [
    { label: L.tour, run: tour, primary: true },
    { label: L.whatMcls, run: () => ask('mcls') },
    { label: L.randomBrand, run: randomBrand },
    { label: L.who, run: () => ask('who') },
    { label: L.contact, run: () => ask('contact', [{ label: L.mail, href: 'mailto:bodanza.luca18@gmail.com', primary: true }]) },
    { label: L.alone, run: quiet },
  ];
  const menu = () => { tourId++; return P.say(T.menu, { choices: mainChoices() }); };
  const ask = (id, extra = []) => { tourId++; return P.say(T.qa[id], { choices: [...extra, { label: L.more, run: menu, primary: !extra.length }, { label: L.tour, run: tour }] }); };
  const menuChoices = () => [{ label: L.tour, run: tour, primary: true }, { label: L.more, run: menu }, { label: L.alone, run: quiet }];
  const randomBrand = () => {
    tourId++; const b = pick(BR.items);
    P.say(T.brand.map(t => t.replace('{name}', b.name).replace('{sector}', b.sector)), { choices: [
      { label: L.openManual, href: `brand.html?b=${b.slug}`, primary: true }, { label: L.another, run: randomBrand }, { label: L.menu, run: menu }] });
  };

  /* ---- raccolto nel pulsante, e di nuovo in scena ---- */
  const hide = silent => {
    P.hide();
    if (silent) return;
    hiddenBtn = hiddenBtn || Object.assign(document.createElement('button'), { type: 'button', className: 'mascot-back', textContent: L.callBack });
    hiddenBtn.setAttribute('aria-label', 'Richiama Pallino, la guida di MCLS');
    hiddenBtn.onclick = () => { hiddenBtn.remove(); summon(); };
    document.body.appendChild(hiddenBtn);
  };
  const summon = () => {                                          // sale da sotto, saluta e propone cosa fare
    P.show(); P.greet(false); P.hold(true); P.setBig(1); P.walkTo('right', { instant: true }); P.rise();
    P.say(met ? T.back : T.greet, { choices: menuChoices() }); met = true;
  };
  const quiet = async () => { tourId++; P.point(null); if (inIntro) await finishIntro(); hide(); };

  /* ---- l'ingresso, come nel disegno di Luca (Context/Schermata_sistemata.jpg): blu con le linee «serpente» dai margini, il logo con l'anello in alto al centro,
     Pallino che sale da sotto, GRANDE e tagliato dal bordo, e saluta a mano libera; si può già scegliere.
     Il palloncino non c'è: lo prende nel momento in cui scegli una risposta, e ti porta dentro MCLS (enter). ---- */
  const portal = () => $('.portal');
  /* misure di Pallino nel disegno (2000×1125): cima della testa a 51% dell'altezza, tutta la figura (braccia comprese) larga 556 px e centrata, piedi fuori dallo schermo.
     Dove non c'è posto per le scelte a destra (schermi stretti) la figura si fa più piccola oppure si sposta a sinistra. */
  const introPlace = () => {
    const W = innerWidth, H = innerHeight;
    const ks0 = .747 * H / 454;                                                                    // la misura del disegno
    const ksCenter = (W / 2 - 224) / 179.75, ksLeft = (W - 201) / 330;                            // quanto può crescere se centrata / se a sinistra, lasciando ~190 px alle scelte
    const left = ksCenter < ks0 && ksLeft > ksCenter;
    const ks = Math.max(.3, Math.min(ks0, left ? ksLeft : ksCenter)), KH = ks * 454;
    const base = Math.min(164, Math.max(104, Math.min(H * .165, W * .36)));
    P.setBig(KH / base);
    P.placeX(left ? 12 + 181 * ks : W / 2 + (181 - 150.25) * ks);                                 // centrata: il busto sta un po' a destra del centro della figura (braccio alzato a sinistra)
    const headTop = Math.max(.5105 * H, H - .78 * KH);
    P.setRest(headTop + 452 * ks - H + 6);                                                         // piedi sotto il bordo: la testa resta dov'è nel disegno
    P.setChoices({ dx: 160, right: false });                                                       // le scelte stanno oltre il braccio destro
  };
  const fitSnakes = () => {                                      // schermo in piedi: il disegno delle linee si gira di 90°, così riempie lo schermo invece di mostrarne una striscia
    const svg = $('.portal__snakes'), grp = svg && svg.firstElementChild; if (!svg || !grp) return;
    const portrait = innerHeight > innerWidth * 1.1;
    svg.setAttribute('viewBox', portrait ? '0 0 1125 2000' : '0 0 2000 1125');
    if (portrait) grp.setAttribute('transform', 'translate(1125 0) rotate(90)'); else grp.removeAttribute('transform');
  };
  const introNormal = smooth => { P.setBig(1, smooth); P.setRest(0, smooth); P.setChoices({ dx: 90, right: false }); };
  const fitRing = () => {                                        // la scritta deve coprire il cerchio per intero: si regola la spaziatura delle lettere
    const tp = $('.portal__ring textPath'), tx = tp && tp.parentNode; if (!tx) return;
    try {
      tx.setAttribute('letter-spacing', '0');
      const n = [...tp.textContent].length, L = tp.getComputedTextLength(), C = 2 * Math.PI * 254;
      if (n && L) tx.setAttribute('letter-spacing', ((C - L) / n).toFixed(3));
    } catch {}
  };
  const finishIntro = (o = {}) => {                              // carry: il blu si richiude attorno a Pallino, che resta in scena (ti ha portato dentro)
    if (!inIntro) return Promise.resolve();
    inIntro = false;
    const p = portal(), skip = $('.portal__skip'); if (skip) skip.hidden = true;
    P.greet(false);
    if (o.carry) {
      const [x, y] = P.where(); if (p) { p.style.setProperty('--ox', x + 'px'); p.style.setProperty('--oy', y + 'px'); }
      setTimeout(() => html.classList.add('mi-ink'), 320);
      setTimeout(() => { introNormal(true); P.walkTo('right'); }, 520);
    } else { P.quiet(); P.hold(true); P.hide(); }
    html.dataset.mi = 'out'; if (p) p.classList.add('mi-out');
    return new Promise(res => setTimeout(() => {
      html.classList.remove('pt-portal', 'mi-live', 'mi-ink'); delete html.dataset.mi; if (p) p.remove();
      try { sessionStorage.removeItem('portal'); } catch {}
      if (!o.carry) { introNormal(false); P.walkTo('right', { instant: true }); }
      scrollTo(0, 0); res();
    }, reduceMotion ? 0 : 1000));
  };
  let entering = false;
  const enter = async run => {                                   // una risposta scelta nell'ingresso: arriva il palloncino, Pallino lo prende e ti porta dentro
    if (!inIntro || entering) return;
    entering = true; tourId++;
    P.quiet(); P.point(null); P.greet(false); P.hold(true, { drop: true });
    await wait(1250);
    if (!inIntro) { entering = false; return; }
    await finishIntro({ carry: true }); entering = false;
    if (run) run();
  };
  const intro = async () => {
    inIntro = true; html.classList.add('mi-live');
    try { history.scrollRestoration = 'manual'; } catch {} scrollTo(0, 0);       // l'ingresso parte sempre dall'alto
    const p = portal(); if (p) p.setAttribute('aria-hidden', 'false');
    hide(true); P.hold(false); P.greet(true); introPlace(); fitSnakes();
    addEventListener('resize', () => { if (inIntro) { introPlace(); fitRing(); fitSnakes(); } });
    const skip = $('.portal__skip'); if (skip) skip.onclick = () => { tourId++; finishIntro().then(() => hide()); };
    addEventListener('keydown', e => { if (e.key === 'Escape' && inIntro) { tourId++; finishIntro().then(() => hide()); } });
    try { await Promise.race([document.fonts.ready, wait(1000)]); } catch {}
    fitRing();
    await wait(120); if (!inIntro) return; html.dataset.mi = 'in';              // il wordmark sale al suo posto, le linee e l'anello si disegnano
    await wait(380); if (!inIntro) return;
    P.show(); await P.rise(); if (!inIntro) return;                              // Pallino sale da sotto
    if (skip) skip.hidden = false; met = true;
    P.say(T.intro.greet, { plain: true, early: true, keep: true, onLine: i => { if (i) P.wave(2); },
      choices: mainChoices().map(c => ({ ...c, run: () => enter(c.run) })) });
  };

  /* ---- il giro: logo → settori → Tech → segni ---- */
  const side = el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2 > innerWidth * .55 ? 'left' : 'right'; };
  const look = async (el, lines, id) => {                       // si sposta dal lato libero, indica, parla
    if (!el) return true;
    P.walkTo(side(el)); P.point(el);
    const ok = await P.say(lines, { keep: true });
    return ok && id === tourId;
  };
  async function tour() {
    const id = ++tourId, alive = () => id === tourId; touring = id;
    if (inIntro) { await finishIntro(); if (!alive()) return; P.hold(true); P.show(); P.rise(); }
    P.walkTo('right'); P.point(null);
    if (!(await P.say(T.tour.start, { keep: true })) || !alive()) return;
    await Page.scrollTo('top-mcls'); if (!alive()) return;
    if (!(await look($('.mh__logotype'), T.tour.logo, id))) return;
    await Page.scrollTo('settori'); if (!alive()) return;
    if (!(await look($('.dists'), T.tour.settori, id))) return;
    await Page.openDistrict('tech'); await Page.scrollTo($('#dpanel'), 'start'); if (!alive()) return;
    if (!(await look($('.story'), T.tour.tech, id))) return;
    Page.closeDistrict(); await Page.scrollTo('segni'); if (!alive()) return;
    if (!(await look($('#segni .lg-grid'), T.tour.segni, id))) return;
    Page.marksMode(2); if (!(await look($('#segni .lg-grid'), T.tour.traccia, id))) return;
    await wait(1200); Page.marksMode(0); if (!(await look($('#segni .lg-grid'), T.tour.nero, id))) return;
    P.point(null); P.walkTo('right'); P.jump();
    if (!alive()) return;
    touring = 0;
    P.say(T.tour.end, { choices: [{ label: L.randomBrand, run: randomBrand, primary: true }, { label: L.whatMcls, run: () => ask('mcls') }, { label: L.alone, run: quiet }] });
  }

  /* ---- ingressi ---- */
  P.onPoke = () => { if (inIntro) return; tourId++; P.point(null); P.walkTo('right'); P.say(pick(T.pokes), { choices: menuChoices() }); };
  P.onIdle = () => { if (!inIntro) P.say(pick(T.quips)); };

  addEventListener('scroll', () => {                              // se l'utente scorre per conto suo, Pallino si fa da parte
    if (inIntro || (touring && touring === tourId) || P.state.hidden) return;
    if (Math.abs(scrollY - refY) > 160) { tourId++; hide(); }
  }, { passive: true });

  /* ---- avvio: in ingresso (arrivo dalla voce MCLS) parte la schermata blu, altrimenti Pallino sta già raccolto nel pulsante ---- */
  let started = false;
  const begin = () => {
    if (started) return; started = true;
    if (html.classList.contains('pt-portal') && !reduceMotion) { intro(); return; }
    html.classList.remove('pt-portal'); hide();
  };
  begin();
  window.PallinoGuide = { tour, menu, begin, summon, intro };
})();
