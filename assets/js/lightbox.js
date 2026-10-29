/* Lightbox condiviso (index e case): window.Lightbox.open({ files, index, title, meta, tag, url, urlLabel })
   files: array di percorsi relativi a assets/img/ oppure { src, cap, filter, bg, pad }. Frecce a schermo, tastiera ← →, swipe. */
(() => {
  'use strict';
  const IMG_BASE = 'assets/img/';
  const box = document.getElementById('lightbox');
  if (!box) return;
  const $ = (s) => box.querySelector(s);
  const stage = $('.lightbox__stage'), img = $('img'), prev = $('.lightbox__nav--prev'), next = $('.lightbox__nav--next');
  const caption = $('.lightbox__cap p'), link = $('.lightbox__link'), linkLabel = $('.btn__label', link), defLabel = linkLabel ? linkLabel.innerHTML : 'Apri ↗';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  let files = [], idx = 0, meta = '', tag = '';

  const show = (n, dir = 0) => {
    idx = (n + files.length) % files.length;
    const f = files[idx];
    stage.classList.remove('is-empty');
    img.hidden = false;
    img.src = IMG_BASE + (window.siteImg ? siteImg(f.src) : f.src);
    img.alt = f.cap || $('h3').textContent;
    img.style.filter = f.filter || '';                 // file con filter/bg/pad: loghi in versione nero/bianco (atlante)
    img.style.padding = f.pad || '';
    stage.style.background = f.bg || '';
    caption.textContent = f.cap || meta;
    $('.lightbox__cat').textContent = tag + (files.length > 1 ? ` · ${pad(idx + 1)} / ${pad(files.length)}` : '');
    prev.hidden = next.hidden = files.length < 2;
    if (dir && !reduceMotion) img.animate(
      [{ opacity: 0, transform: `translateX(${dir * 32}px)` }, { opacity: 1, transform: 'none' }],
      { duration: 350, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (files.length > 1) new Image().src = IMG_BASE + files[(idx + 1) % files.length].src;   // precarica la successiva
  };
  const step = d => files.length > 1 && show(idx + d, d);

  img.addEventListener('error', () => {            // immagine mancante: placeholder + percorso da usare
    img.hidden = true;
    stage.classList.add('is-empty');
    caption.textContent = `Immagine da aggiungere: ${IMG_BASE}${files[idx].src}`;
  });

  window.Lightbox = {
    open(o) {
      files = o.files.map(f => typeof f === 'string' ? { src: f } : f);
      meta = o.meta || ''; tag = o.tag || '';
      $('h3').textContent = o.title || '';
      link.hidden = !o.url;
      if (o.url) { link.href = o.url; if (linkLabel) { if (o.urlLabel) linkLabel.textContent = o.urlLabel; else linkLabel.innerHTML = defLabel; } }
      show(o.index || 0);
      box.showModal();
    },
  };

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  document.addEventListener('keydown', e => {
    if (!box.open) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  let swipeX = null;                               // swipe su touch/trackpad
  stage.addEventListener('pointerdown', e => { swipeX = e.clientX; });
  stage.addEventListener('pointerup', e => {
    if (swipeX !== null && Math.abs(e.clientX - swipeX) > 50) step(e.clientX < swipeX ? 1 : -1);
    swipeX = null;
  });

  box.addEventListener('click', e => {
    const r = box.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside || e.target.closest('[data-close]')) box.close();
  });
})();
