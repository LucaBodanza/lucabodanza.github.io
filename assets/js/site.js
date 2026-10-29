/* Applica i ritocchi dell'Admin (window.SITE, da site-data.js) ai dati e alle pagine del sito, prima che le pagine li leggano.
   Gestisce: progetti nascosti o nuovi, titoli e testi modificati, copertine e immagini sostituite, foto di "Chi sono",
   e TUTTI i testi del sito:
     · tx     → testi con data-t="chiave" nell'HTML (anche quello disegnato dagli script): sostituisce il contenuto;
                data-ta="attributo:chiave" fa lo stesso per un attributo (href, content…)
     · paths  → testi dentro i dati (cases.js, case-layouts.js, mcls-data.js, mascot-data.js, texts.js…): "RADICE|passo|passo" → valore
     · lists  → liste di blocchi (data-list / data-li): ordine, copie, voci tolte
     · repl   → sostituzioni globali (email, telefono, indirizzi) in testi e link
   Senza ritocchi non cambia nulla. Con ?__raw=1 ignora i testi modificati (serve all'Admin per leggere gli originali).
   Va caricato dopo tutti i file di dati (cases.js, archive.js, brands.js, marks.js, mcls-data.js, mascot-data.js, texts.js…) e prima di common.js / main.js. */
(() => {
  'use strict';
  let S0 = window.SITE || {};
  if (/[?&]__probe=1(&|$)/.test(location.search)) { try { S0 = JSON.parse(localStorage.getItem('__probe')) || {}; } catch {} }   // controllo dell'Admin: ogni testo modificabile diventa «§…»
  const S = S0, hid = S.hidden || {}, ed = S.edits || {}, map = S.imgmap || {};
  const raw = /[?&]__raw=1(&|$)/.test(location.search);
  const TX = raw ? {} : (S.tx || {}), PATHS = raw ? {} : (S.paths || {}), LISTS = raw ? {} : (S.lists || {}), REPL = raw ? [] : (S.repl || []).filter(r => r && r.from && typeof r.to === 'string' && !r.to.includes(r.from));
  window.siteImg = p => map[p] || p;                              // percorso (relativo a assets/img/) dopo le sostituzioni
  const has = (list, v) => Array.isArray(list) && list.includes(v);
  const drop = (arr, f) => { for (let i = arr.length - 1; i >= 0; i--) if (f(arr[i])) arr.splice(i, 1); };
  const take = (to, from, keys) => { if (from) keys.forEach(k => { if (from[k] !== undefined && from[k] !== '') to[k] = from[k]; }); };

  if (window.CASES) {
    drop(window.CASES, c => has(hid.cases, c.slug));
    window.CASES.forEach(c => take(c, ed['case:' + c.slug], ['title', 'year', 'kicker', 'lead']));
  }
  if (window.ARCHIVE) {
    const A = window.ARCHIVE;
    drop(A.items, it => has(hid.arch, it.dir));
    A.items.forEach(it => {
      const e = ed['arch:' + it.dir]; take(it, e, ['title', 'meta', 'sub', 'macro', 'cover']);
      if (e && Array.isArray(e.images) && e.images.length) { it.images = e.images; it.n = e.images.length; }
    });
    (S.projects || []).forEach(p => {
      if (has(hid.arch, p.dir)) return;
      A.items.push({ origin: p.origin || 'personale', macro: p.macro, sub: p.sub || '', dir: p.dir, n: p.images.length, c: 3, p: 3, d: 3,
        title: p.title, meta: p.meta || '', cover: p.cover || p.images[0], images: p.images });
    });
  }
  if (window.BRANDS) drop(window.BRANDS.items, b => has(hid.brands, b.slug));
  if (window.MARKS) drop(window.MARKS.items, m => has(hid.marks, m.id));

  /* ---- testi dentro i dati: "RADICE|passo|slug=xxx|passo" ---------------------------------------------------- */
  const ROOTS = () => ({ CASES: window.CASES, CASE_LAYOUTS: window.CASE_LAYOUTS, PHASES: window.PHASES, ARCHIVE: window.ARCHIVE, BRANDS: window.BRANDS, MARKS: window.MARKS,
    MCLS: window.MCLS, PALLINO_TEXT: window.PALLINO_TEXT, SITE_TEXT: window.SITE_TEXT });
  const step = (o, s) => {
    if (o == null) return undefined;
    const m = /^([\w-]+)=(.*)$/.exec(s);
    if (m && Array.isArray(o)) return o.find(x => x && String(x[m[1]]) === m[2]);
    return o[s];
  };
  Object.entries(PATHS).forEach(([path, val]) => {
    const segs = path.split('|'), root = ROOTS()[segs[0]];
    if (!root) return;
    const last = segs.pop(); let o = root;
    for (const s of segs.slice(1)) o = step(o, s);
    if (o != null && typeof o === 'object' && last in o) o[last] = val;
  });

  /* ---- foto di "Chi sono" (i testi della sezione si cambiano dalla scheda «Testi» dell'Admin) ----------------------------- */
  const photo = (S.about || {}).photo;
  if (photo) document.addEventListener('DOMContentLoaded', () => { const img = document.querySelector('.portrait img'); if (img) img.src = 'assets/img/' + photo; });

  /* ---- testi nell'HTML ---------------------------------------------------------------------------------------------- */
  const ALLOWED = new Set(['A', 'B', 'STRONG', 'EM', 'I', 'BR', 'SMALL', 'SPAN', 'SUP', 'SUB', 'KBD']);
  const ATTRS = /^(href|target|rel|class|data-folder|data-arch|data-cursor|data-noTransition)$/i;
  const clean = html => {                                           // solo qualche tag semplice: il resto viene tolto
    const t = document.createElement('template'); t.innerHTML = String(html);
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType !== 1) return;
      walk(c);
      if (!ALLOWED.has(c.tagName)) { c.replaceWith(...c.childNodes); return; }
      [...c.attributes].forEach(at => { if (!ATTRS.test(at.name) || (at.name === 'href' && /^\s*(javascript|data):/i.test(at.value))) c.removeAttribute(at.name); });
    });
    walk(t.content);
    return t.innerHTML;
  };
  const R = s => REPL.reduce((acc, r) => acc.split(r.from).join(r.to), s);
  const applyEl = el => {
    const k = el.getAttribute('data-t');
    if (k && (k in TX || REPL.length)) {
      const target = R(k in TX ? clean(TX[k]) : el.innerHTML);
      if (el.innerHTML !== target && !(el._txIn === target && el.innerHTML === el._txOut)) {   // non ricomincia se l'abbiamo appena scritto noi
        el.innerHTML = target; el._txIn = target; el._txOut = el.innerHTML;
      }
    }
    const ta = el.getAttribute('data-ta');
    if (ta) ta.split(',').forEach(p => { const i = p.indexOf(':'), at = p.slice(0, i), key = p.slice(i + 1); const v = key in TX ? TX[key] : el.getAttribute(at); if (v != null && !/^\s*javascript:/i.test(v)) { const r = R(v); if (el.getAttribute(at) !== r) el.setAttribute(at, r); } });
  };
  const applyLinks = root => {                                      // sostituzioni globali negli indirizzi (email, telefono…)
    if (!REPL.length) return;
    (root.matches && root.matches('a[href],[data-copy]') ? [root] : []).concat([...root.querySelectorAll('a[href],[data-copy]')]).forEach(n => {
      ['href', 'data-copy'].forEach(at => { const v = n.getAttribute(at); if (v) { const r = R(v); if (r !== v) n.setAttribute(at, r); } });
    });
  };
  const scan = root => {
    if (root.matches && root.matches('[data-t],[data-ta]')) applyEl(root);
    root.querySelectorAll('[data-t],[data-ta]').forEach(applyEl);
    applyLinks(root);
  };

  /* liste di blocchi: ordine, copie (le chiavi dei testi della copia prendono il suffisso ~id), voci tolte */
  const suffix = (n, id) => {
    if (n.hasAttribute('data-t')) n.setAttribute('data-t', n.getAttribute('data-t') + '~' + id);
    if (n.hasAttribute('data-ta')) n.setAttribute('data-ta', n.getAttribute('data-ta').split(',').map(p => { const i = p.indexOf(':'); return p.slice(0, i + 1) + p.slice(i + 1) + '~' + id; }).join(','));
  };
  const doLists = () => document.querySelectorAll('[data-list]').forEach(box => {
    const spec = LISTS[box.dataset.list]; if (!Array.isArray(spec)) return;
    const orig = new Map([...box.children].map(c => [c.dataset.li, c])), frag = document.createDocumentFragment();
    spec.forEach(it => {
      let el = it.from ? orig.get(it.from) && orig.get(it.from).cloneNode(true) : orig.get(it.id);
      if (!el) return;
      if (it.from) { el.dataset.li = it.id; suffix(el, it.id); el.querySelectorAll('[data-t],[data-ta]').forEach(n => suffix(n, it.id)); }
      frag.append(el);
    });
    box.replaceChildren(frag);
    if (box.hasAttribute('data-numbered')) [...box.children].forEach((c, i) => { const n = c.querySelector('[data-n]'); if (n) n.textContent = String(i + 1).padStart(2, '0'); });   // 01, 02… seguono l'ordine
  });

  const start = () => {
    doLists();
    scan(document);
    if (!raw && (Object.keys(TX).length || REPL.length)) {
      new MutationObserver(recs => recs.forEach(r => {
        r.addedNodes.forEach(n => { if (n.nodeType === 1) scan(n); });
        const t = r.target.nodeType === 1 ? r.target : r.target.parentElement, h = t && t.closest && t.closest('[data-t]');
        if (h && r.type === 'childList') applyEl(h);
      })).observe(document.documentElement, { childList: true, subtree: true });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
