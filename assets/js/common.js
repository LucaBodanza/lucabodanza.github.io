/* Script comune a tutte le pagine: menu a schermo intero, transizioni di pagina, tema chiaro/scuro, orologio, cursore con etichetta. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu a schermo intero ------------------------------------------------------------------------ */
  const isHome = /(^|\/)(index\.html)?$/.test(location.pathname);
  const href = h => /^[#?]/.test(h) ? (isHome && h.startsWith('#') ? '' : 'index.html') + h : h;      // '#…' e '?…' sono della home; 'mcls.html' è una pagina a sé
  const NAV = [['#lavori', 'Lavori', 'lavori'], ['#chi-sono', 'Chi sono', 'chi-sono'], ['#storia', 'Storia', 'storia'], ['mcls.html', 'MCLS', 'mcls'], ['#contatti', 'Contatti', 'contatti']];
  const cases = (window.CASES || []).map(c => `<li><a href="case.html?c=${c.slug}">${c.title}</a></li>`).join('');
  const menu = document.createElement('div');
  menu.className = 'menu'; menu.id = 'menu-overlay'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', 'Menu'); menu.inert = true;
  menu.innerHTML = `
    <div class="menu__in container">
      <div class="menu__bar"><span class="eyebrow" data-t="menu.title">Menu</span><button class="menu__close" type="button"><span data-t="menu.close">Chiudi</span> <i aria-hidden="true">✕</i></button></div>
      <nav class="menu__main" aria-label="Sezioni">${NAV.map(([h, l, k], i) => `<a href="${href(h)}" style="--i:${i}"><small>${String(i + 1).padStart(2, '0')}</small><span data-t="nav.${k}">${l}</span></a>`).join('')}</nav>
      <div class="menu__side">
        <div><p class="eyebrow" data-t="menu.cases">Case history</p><ul class="menu__list">${cases}<li><a href="${href('?f=personali#lavori')}" data-t="menu.personali">Progetti personali</a></li></ul></div>
        <div><p class="eyebrow" data-t="menu.contact">Contatti</p><p><a class="menu__mail" href="mailto:bodanza.luca18@gmail.com" data-t="menu.mail">bodanza.luca18@gmail.com</a></p><p class="menu__where" data-t="menu.where">Graphic designer · Brescia</p></div>
      </div>
      <div class="menu__foot"><span data-clock></span><button class="theme-toggle" type="button" aria-label="Cambia tema chiaro/scuro"><i></i></button><span class="menu__hint" data-t="menu.hint">Esc per chiudere</span></div>
    </div>`;
  document.body.appendChild(menu);
  const toggles = [...document.querySelectorAll('.nav__toggle')], nav = document.querySelector('.nav');
  toggles.forEach(t => t.setAttribute('aria-controls', 'menu-overlay'));
  let lastFocus = null;
  const setMenu = open => {
    menu.classList.toggle('is-open', open); menu.inert = !open;
    nav?.classList.toggle('is-open', open); toggles.forEach(t => t.setAttribute('aria-expanded', open));
    root.style.overflow = open ? 'hidden' : '';
    if (open) { lastFocus = document.activeElement; menu.querySelector('.menu__close').focus({ preventScroll: true }); }
    else if (lastFocus) { lastFocus.focus({ preventScroll: true }); lastFocus = null; }
  };
  document.addEventListener('click', e => {
    if (e.target.closest('.nav__toggle')) { setMenu(!menu.classList.contains('is-open')); return; }
    if (e.target.closest('.menu__close')) { setMenu(false); return; }
    const a = e.target.closest('.menu a'); if (a && menu.classList.contains('is-open')) { if (a.getAttribute('href').startsWith('#')) setMenu(false); }   // gli altri link passano dalla transizione
  });
  document.addEventListener('keydown', e => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') { setMenu(false); return; }
    if (e.key === 'Tab') {                                     // il fuoco resta dentro il menu
      const f = [...menu.querySelectorAll('a, button')].filter(x => !x.disabled), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Transizioni di pagina: sipario che sale, la pagina dopo lo apre ----------------------------- */
  const curtain = document.querySelector('.curtain') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'curtain', innerHTML: '<span>LB<i>.</i></span>' }));
  curtain.setAttribute('aria-hidden', 'true');
  const E = 'cubic-bezier(.76, 0, .24, 1)';
  let leaving = false;
  const isPortal = u => /(^|\/)mcls\.html$/.test(new URL(u, location.href).pathname);
  const inWorld = u => /(^|\/)(mcls|brand)\.html$/.test(new URL(u, location.href).pathname);      // dentro il mondo MCLS (settori ↔ brand manual) si usa il sipario normale
  const portalEl = () => document.querySelector('.portal') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'portal', innerHTML: '<i class="portal__w mk" style="-webkit-mask-image:url(assets/img/mcls/wordmark.svg);mask-image:url(assets/img/mcls/wordmark.svg)"></i>' }));
  const go = (url, at) => {
    if (reduceMotion || leaving) { location.href = url; return; }
    leaving = true; setMenu(false);
    if (isPortal(url) && !inWorld(location.href)) {              // voce MCLS: il portale blu si apre dal punto del clic
      try { sessionStorage.setItem('portal', '1'); } catch {}
      const p = portalEl(); p.style.setProperty('--px', `${at ? at.x : innerWidth / 2}px`); p.style.setProperty('--py', `${at ? at.y : innerHeight / 2}px`);
      p.getBoundingClientRect(); p.classList.add('is-on');
      setTimeout(() => { location.href = url; }, 900);
    } else {
      try { sessionStorage.setItem('pt', '1'); } catch {}
      curtain.style.transition = `clip-path 520ms ${E}`; curtain.style.clipPath = 'inset(0)';
      setTimeout(() => { location.href = url; }, 540);
    }
    setTimeout(() => { leaving = false; }, 3000);                // se il browser resta qui (annullato), sblocca
  };
  window.PageTransition = { go };
  /* Ogni accesso parte con il sipario chiuso ("LB." sul bianco) che sale: da URL, QR code o link interno.
     Dopo un link interno il sipario si apre subito; al primo ingresso resta un istante in più. */
  const announce = () => { window.__revealed = true; document.dispatchEvent(new Event('page:revealed')); };   // la pagina è visibile: parte chi aspettava (la guida)
  let internal = false; try { internal = !!sessionStorage.getItem('pt'); sessionStorage.removeItem('pt'); } catch {}
  if (root.classList.contains('pt-enter') && !reduceMotion) {
    curtain.style.transition = 'none'; curtain.style.clipPath = 'inset(0)'; root.classList.remove('pt-enter');
    const open = () => setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.style.transition = `clip-path 800ms ${E}`; curtain.style.clipPath = 'inset(0 0 100% 0)';
      setTimeout(() => { curtain.style.transition = 'none'; curtain.style.clipPath = ''; announce(); }, 950);
    })), Math.max(0, (internal ? 150 : 1000) - performance.now()));
    document.readyState === 'complete' ? open() : addEventListener('load', open, { once: true });
  } else { root.classList.remove('pt-enter'); if (!root.classList.contains('pt-portal')) setTimeout(announce, 60); }
  /* Arrivo dal portale (pagina MCLS): niente seconda animazione. La schermata blu è già lì e continua con l'ingresso di MCLS
     (logo → scritta sul tracciato → Pallino sale e saluta), gestito da guide.js; qui si toglie solo il segnaposto se non serve. */
  try { sessionStorage.removeItem('portal'); } catch {}
  if (reduceMotion) root.classList.remove('pt-portal');
  addEventListener('pageshow', e => { if (e.persisted) { leaving = false; curtain.style.transition = 'none'; curtain.style.clipPath = ''; root.style.overflow = ''; document.querySelector('.portal')?.classList.remove('is-on'); } });
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noTransition !== undefined) return;
    const u = new URL(a.href, location.href);
    if (!/^https?:$|^file:$/.test(u.protocol) || u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return;   // stessa pagina (ancore): scorrimento normale
    e.preventDefault();
    const r = a.getBoundingClientRect();                          // il portale parte da dove si è cliccato (dal centro della voce, se da tastiera)
    go(u.href, e.detail ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  });

  /* Tema (l'impostazione iniziale è nello script in <head>) */
  document.addEventListener('click', e => {
    if (!e.target.closest('.theme-toggle')) return;
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#f1f1ed' : '#121212');
  });

  /* Orologio dal vivo, ora di Brescia */
  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const city = (window.SITE_TEXT && SITE_TEXT.ui.clock) || 'Brescia';
    const tick = () => { const t = `${city} · ${fmt.format(new Date())}`; clocks.forEach(c => { c.textContent = t; }); };
    tick(); setInterval(tick, 1000);
  }

  /* Cursore: punto che segue il mouse, con etichetta sugli elementi [data-cursor] */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    const cur = document.createElement('div');
    cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur);
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * .22; y += (ty - y) * .22;
      cur.style.transform = `translate(${x}px, ${y}px)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .1 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!cur.classList.contains('is-on')) { x = tx; y = ty; cur.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      cur.classList.toggle('has-label', !!t);
      cur.textContent = t ? t.dataset.cursor : '';
    });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
  }

  /* Animazioni infinite (girandole, striscia scorrevole): si fermano quando l'elemento esce dallo schermo */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-off', !e.isIntersecting)), { rootMargin: '80px' });
    document.querySelectorAll('.mh, .ticker').forEach(n => io.observe(n));
  }
})();
