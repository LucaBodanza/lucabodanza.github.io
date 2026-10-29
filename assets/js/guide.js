/* Guida di MCLS. Pallino compare nell'ingresso (la schermata blu: logo → scritta sul tracciato → Pallino sale da sotto e saluta)
   e da lì si può già scegliere cosa fare. Dentro l'interfaccia resta raccolto nel piccolo pulsante «Pallino» in basso a destra:
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
    P.show(); P.setBig(1); P.walkTo('right', { instant: true }); P.rise();
    P.say(met ? T.back : T.greet, { choices: menuChoices() }); met = true;
  };
  const quiet = async () => { tourId++; P.point(null); if (inIntro) await finishIntro(); hide(); };

  /* ---- l'ingresso: schermata blu → logo → scritta sul tracciato → Pallino sale da sotto e saluta; si può già scegliere ---- */
  const portal = () => $('.portal');
  const finishIntro = () => {
    if (!inIntro) return Promise.resolve();
    inIntro = false; P.quiet(); P.hide();
    const p = portal(), skip = $('.portal__skip'); if (skip) skip.hidden = true;
    html.dataset.mi = 'out'; if (p) p.classList.add('mi-out');
    return new Promise(res => setTimeout(() => {
      html.classList.remove('pt-portal', 'mi-live'); delete html.dataset.mi; if (p) p.remove();
      try { sessionStorage.removeItem('portal'); } catch {}
      P.setBig(1); P.walkTo('right', { instant: true }); scrollTo(0, 0); res();
    }, reduceMotion ? 0 : 1000));
  };
  const intro = async () => {
    inIntro = true; html.classList.add('mi-live'); html.dataset.mi = 'logo';
    try { history.scrollRestoration = 'manual'; } catch {} scrollTo(0, 0);       // l'ingresso parte sempre dall'alto
    const p = portal(); if (p) p.setAttribute('aria-hidden', 'false');
    hide(true); P.setBig(1.3); P.walkTo('center', { instant: true });
    const skip = $('.portal__skip'); if (skip) skip.onclick = () => { tourId++; finishIntro().then(() => hide()); };
    addEventListener('keydown', e => { if (e.key === 'Escape' && inIntro) { tourId++; finishIntro().then(() => hide()); } });
    await wait(1000); if (!inIntro) return; html.dataset.mi = 'ring';
    await wait(1900); if (!inIntro) return; html.dataset.mi = 'rise';
    await wait(500); if (!inIntro) return;
    P.show(); await P.rise(); if (!inIntro) return;
    if (skip) skip.hidden = false; met = true;
    P.say(T.intro.greet, { choices: mainChoices() });
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
    if (inIntro) { await finishIntro(); if (!alive()) return; P.show(); P.rise(); }
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
