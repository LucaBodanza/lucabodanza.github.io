/* Pagina di un brand manual: brand.html?b=<slug> — il manuale (brand-manuals/<slug>/index.html) si sfoglia qui dentro, il PDF si scarica.
   Dati in brands.js (generato da tools/build_brands.py). Tema e menu sono in common.js. */
(() => {
  'use strict';
  const BR = window.BRANDS, root = document.documentElement, main = document.getElementById('brand');
  const slug = new URLSearchParams(location.search).get('b');
  const i = BR.items.findIndex(b => b.slug === slug);
  const dist = window.MCLS && window.MCLS.districtOf(slug);               // settore dell'azienda: il ritorno riapre quello
  const back = dist ? `mcls.html?d=${dist.k}#settori` : 'mcls.html#settori';
  if (i < 0) {
    main.innerHTML = `<section class="container bv"><h1 class="bv__t" data-t="brand.ui.missing">Brand manual non trovato</h1><p class="bv__sector" data-t="brand.ui.missing2">Il link non porta a un progetto della libreria.</p><p class="bv__pn"><a class="btn" href="${back}"><span class="btn__label" data-t="brand.ui.back">← MCLS</span></a></p></section>`;
    return;
  }
  const b = BR.items[i], prev = BR.items[(i + BR.items.length - 1) % BR.items.length], next = BR.items[(i + 1) % BR.items.length];
  const cat = BR.cats.find(c => c.k === b.cat).label, dir = `brand-manuals/${b.slug}/`;
  document.title = `${b.name} — Brand manual — Luca Bodanza`;
  main.innerHTML = `<section class="container bv">
    <a class="bv__back" href="${back}"><span data-t="brand.ui.back">← MCLS</span> · ${dist ? dist.label.replace('&', '&amp;') : 'Settori'}</a>
    <div class="bv__head">
      <div><p class="eyebrow">${cat} · <span data-t="brand.ui.n">N°</span> ${String(b.n).padStart(2, '0')}</p><h1 class="bv__t">${b.name}</h1><p class="bv__sector">${b.sector}</p></div>
      <div class="bv__tools">
        <span class="bv__pal" role="img" aria-label="Palette del brand">${b.palette.map(c => `<i style="background:${c}"></i>`).join('')}</span>
        <a class="btn btn--solid" href="${dir}${b.slug}.pdf" download="Brand_Manual_${b.name}.pdf"><span class="btn__label" data-t="brand.ui.pdf">Scarica il PDF ↓</span></a>
        <a class="btn" href="${dir}index.html" target="_blank" rel="noopener"><span class="btn__label" data-t="brand.ui.full">Schermo intero ↗</span></a>
      </div>
    </div>
    <div class="bv__frame"><iframe src="${dir}index.html" title="Brand manual ${b.name}"></iframe></div>
    <nav class="bv__pn" aria-label="Altri brand manual">
      <a class="bv__a" href="brand.html?b=${prev.slug}"><small data-t="brand.ui.prev">← Precedente</small><b>${prev.name}</b></a>
      <a class="bv__a bv__a--n" href="brand.html?b=${next.slug}"><small data-t="brand.ui.next">Successivo →</small><b>${next.name}</b></a>
    </nav></section>`;
  const frame = main.querySelector('iframe');                  // il manuale segue il tema chiaro/scuro del sito
  const sync = () => { try { frame.contentDocument.documentElement.dataset.theme = root.dataset.theme; } catch {} };
  frame.addEventListener('load', sync);
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
