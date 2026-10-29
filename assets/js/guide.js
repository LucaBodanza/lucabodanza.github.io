/* Guida di MCLS: Pallino arriva appena si entra, si offre di fare il giro e risponde alle domande.
   Usa il motore della mascot (mascot.js), le sue parole (mascot-data.js) e le azioni della pagina (MCLSPage, in mcls.js).
   Il giro si interrompe quando l'utente tocca Pallino o preme Esc. */
(() => {
  'use strict';
  const P = window.Pallino, T = window.PALLINO_TEXT, Page = window.MCLSPage, BR = window.BRANDS;
  if (!P || !T || !Page) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = T.labels, pick = a => a[Math.floor(Math.random() * a.length)];
  const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));
  const $ = s => document.querySelector(s);
  let tourId = 0, touring = 0, hiddenBtn = null, refY = 0;
  const say0 = P.say; P.say = (...a) => { refY = scrollY; return say0(...a); };      // ricorda dove eravamo quando ha parlato

  /* ---- scelte ---- */
  const menu = () => { tourId++; return P.say(T.menu, { choices: [
    { label: L.tour, run: tour, primary: true },
    { label: L.whatMcls, run: () => ask('mcls') },
    { label: L.randomBrand, run: randomBrand },
    { label: L.who, run: () => ask('who') },
    { label: L.contact, run: () => ask('contact', [{ label: L.mail, href: 'mailto:bodanza.luca18@gmail.com', primary: true }]) },
    { label: L.alone, run: quiet },
  ] }); };
  const ask = (id, extra = []) => { tourId++; return P.say(T.qa[id], { choices: [...extra, { label: L.more, run: menu, primary: !extra.length }, { label: L.tour, run: tour }] }); };
  const quiet = () => {
    const q = ++tourId; P.point(null); P.walkTo('right');
    P.say(T.quiet, { choices: [{ label: L.hide, run: hide }] });
    setTimeout(() => { if (q === tourId) P.quiet(); }, 7000);          // dopo qualche secondo si zittisce da solo
  };
  const randomBrand = () => {
    tourId++; const b = pick(BR.items);
    P.say(T.brand.map(t => t.replace('{name}', b.name).replace('{sector}', b.sector)), { choices: [
      { label: L.openManual, href: `brand.html?b=${b.slug}`, primary: true }, { label: L.another, run: randomBrand }, { label: L.menu, run: menu }] });
  };

  /* ---- nascondersi e tornare ---- */
  const hide = () => {
    P.hide();
    hiddenBtn = hiddenBtn || Object.assign(document.createElement('button'), { type: 'button', className: 'mascot-back', textContent: L.callBack });
    hiddenBtn.setAttribute('aria-label', 'Richiama Pallino, la guida di MCLS');
    hiddenBtn.onclick = () => { hiddenBtn.remove(); P.show(); P.walkTo('right', { instant: true }); P.jump(); P.say(T.back, { choices: menuChoices() }); };
    document.body.appendChild(hiddenBtn);
  };
  const menuChoices = () => [{ label: L.tour, run: tour, primary: true }, { label: L.more, run: menu }, { label: L.alone, run: quiet }];

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
    P.walkTo('right'); P.point(null);
    if (!(await P.say(T.tour.start, { keep: true })) || !alive()) return;
    await Page.scrollTo('top-mcls'); if (!alive()) return;
    if (!(await look($('.mh__logotype'), T.tour.logo, id))) return;
    await Page.scrollTo('settori'); if (!alive()) return;
    if (!(await look($('.dists'), T.tour.settori, id))) return;
    await Page.openDistrict('tech'); await Page.scrollTo($('#dpanel'), 'start'); if (!alive()) return;
    if (!(await look($('.story'), T.tour.tech, id))) return;
    Page.closeDistrict(); await Page.scrollTo('segni'); if (!alive()) return;
    if (!(await look($('#segni .atl__alldots'), T.tour.segni, id))) return;
    Page.marksMode(2); if (!(await look($('#segni .lg-grid'), T.tour.traccia, id))) return;
    await wait(1200); Page.marksMode(0); if (!(await look($('#segni .lg-grid'), T.tour.nero, id))) return;
    P.point(null); P.walkTo('right'); P.jump();
    if (!alive()) return;
    touring = 0;
    P.say(T.tour.end, { choices: [{ label: L.randomBrand, run: randomBrand, primary: true }, { label: L.whatMcls, run: () => ask('mcls') }, { label: L.alone, run: quiet }] });
  }

  /* ---- ingressi ---- */
  P.onPoke = src => { tourId++; P.point(null); P.walkTo('right'); P.say(src === 'balloon' ? pick(T.pokes) : pick(T.pokes), { choices: menuChoices() }); };
  P.onIdle = () => P.say(pick(T.quips));

  addEventListener('scroll', () => {                              // se l'utente scorre per conto suo, Pallino si fa da parte
    if (touring && touring === tourId) return;
    if (document.querySelector('.mascot__say.is-on') && Math.abs(scrollY - refY) > 320) P.quiet();
  }, { passive: true });

  /* ---- arrivo: Pallino scende appena la pagina è visibile ---- */
  let started = false;
  const begin = async () => {
    if (started) return; started = true;
    let met = false; try { met = !!sessionStorage.getItem('pallino-met'); sessionStorage.setItem('pallino-met', '1'); } catch {}
    await P.enter(); P.walkTo('right', { instant: true });
    P.say(met ? T.back : T.greet, { choices: menuChoices() });
  };
  if (window.__revealed) begin(); else document.addEventListener('page:revealed', begin, { once: true });
  setTimeout(begin, 4200);                                       // paracadute: se l'evento non arriva, parte comunque
  window.PallinoGuide = { tour, menu, begin };
})();
