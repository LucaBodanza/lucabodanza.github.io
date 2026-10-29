/* Layout speciali delle sezioni dei case: window.CASE_LAYOUTS[slug][fase] = { layout, …dati, skip }.
   Layout disponibili:
   - identity : scheda identità → logos [{src, cap}], type {family, weights, note}, palettes [{label, colors:[{hex, name}]}]
   - catalog  : indice + sfogliatore → items [{name, meta, dir, n}], stats [[numero, etichetta]], note
   - platform : cornice browser → url, shot, features [{t, d}]
   - formats  : tavola dei formati social/ADV → groups [{title, story, post, banner}]
   - wall     : muro di immagini a tutta larghezza (usa le images della sezione)
   skip: nomi di file delle images da non mostrare più ('*' = tutte). Palette e caratteri sono quelli dei documenti originali;
   dove non esistono (Valkirie, Abstract, CREA) sono i colori dominanti misurati sulle immagini.                                 */
(() => {
  const lube = (n, name, pages) => ({ name, meta: `${pages} pagine`, dir: `projects/lube/catalogo-${n}`, n: 6, pages, back: true });
  const ELSAP = [
    lube('01-serie-metrica', 'Serie Metrica', 324), lube('02-data-connectors', 'Data Connectors', 140), lube('03-power', 'Power', 132),
    lube('05-moduli-io', 'Moduli I/O', 238), lube('06-moduli-io-lion-safety', 'Moduli I/O — LioN Safety', 52), lube('07-elettrovalvole', 'Elettrovalvole', 1454),
    lube('08-sensor-connectors', 'Sensor Connectors', 124), lube('09-single-pair-ethernet', 'Single Pair Ethernet', 58), lube('11-quicklock', 'Quicklock', 32),
    lube('13-railway', 'Railway', 60), lube('14-mpronto', 'MPronto', 156), lube('15-x-lok', 'X-Lok', 1150), lube('16-eco-mate', 'Eco-Mate', 112),
  ];
  const pages = ELSAP.reduce((s, i) => s + i.pages, 0).toLocaleString('it-IT');

  window.CASE_LAYOUTS = {
    lubeconnect: {
      design: { layout: 'identity', skip: ['palette.jpg', 'tipografia.jpg'],
        identity: { type: { family: 'Source Sans 3', weights: 'Regular · Medium · Semi-Bold · Bold', note: 'Con un monospace per codici prodotto e valori tecnici' },
          palettes: [{ label: 'Palette', colors: [{ hex: '#B22A2E', name: 'Rosso crimson' }, { hex: '#323E48', name: 'Antracite' }, { hex: '#7D868D', name: 'Grigio tecnico' }, { hex: '#DFE2E2', name: 'Grigio chiaro' }] }] } },
    },
    'save-the-duck': {
      design: { layout: 'identity', skip: ['palette.jpg'],
        identity: { palettes: [{ label: 'Palette', colors: [{ hex: '#6B7C5F', name: 'Verde salvia' }, { hex: '#1F4E4A', name: 'Petrolio' }, { hex: '#E8A33B', name: 'Giallo-arancio' }, { hex: '#F5F1EA', name: 'Bianco piuma' }, { hex: '#9BA4A9', name: 'Grigio pioggia' }] }] } },
    },
    morino: {
      design: { layout: 'identity', skip: ['palette.jpg', 'palette-2.jpg', 'tipografia.jpg'],
        identity: {
          logos: [{ src: 'logos/scuola-morino-stemma.jpg', cap: 'Stemma' }, { src: 'logos/scuola-morino-wordmark-payoff.jpg', cap: 'Wordmark + payoff' }],
          type: { family: 'Lora', weights: 'Regular · Italic · Medium · Semibold · Bold', note: 'Serif contemporanea, maiuscolo' },
          palettes: [
            { label: 'Core', colors: ['#1B1C1C', '#B83318', '#BFB8AE', '#B45741', '#D5B185', '#4A5340'].map(hex => ({ hex })) },
            { label: 'Secondaria', colors: ['#8C4B30', '#D7BEA3', '#A85137', '#F0E1CB', '#C9A16F'].map(hex => ({ hex })) },
            { label: 'Neutri', colors: ['#1D1B19', '#BFB8AB', '#6F685F', '#F4F2F2'].map(hex => ({ hex })) },
          ] } },
    },
    oceano: {
      design: { layout: 'identity', skip: ['palette.jpg', 'restyling.jpg'],
        identity: {
          logos: [{ src: 'logos/restyling-oceano-restyling.jpg', cap: 'Il nuovo logo' }, { src: 'logos/restyling-oceano-wordmark.jpg', cap: 'Solo testo' }],
          type: { family: 'Outfit', weights: 'Alfabeto, numeri e simboli principali', note: 'Design pulito, moderno e ben bilanciato' },
          palettes: [{ label: 'Palette', colors: [{ hex: '#1078AF', name: 'Blu Intenso' }, { hex: '#A8A4B5', name: 'Lavanda Grigia' }, { hex: '#5D5F7B', name: 'Violetto' }] }] } },
    },
    valkirie: {
      design: { layout: 'identity', skip: ['logo.jpg'],
        identity: { logos: [{ src: 'logos/llp-valkirie-boutique.jpg', cap: 'Il marchio' }],
          palettes: [{ label: 'Colori dominanti', colors: ['#123B35', '#164F56', '#507C81'].map(hex => ({ hex })) }] } },
    },
    abstract: {
      design: { layout: 'identity', skip: ['logo.jpg'],
        identity: { logos: [{ src: 'logos/streetwear-abstract.jpg', cap: 'Il logo' }],
          palettes: [{ label: 'Colori dominanti', colors: ['#121315', '#A75438', '#683A29'].map(hex => ({ hex })) }] } },
      applicazioni: { layout: 'wall' },
    },
    crea: {
      design: { layout: 'identity', skip: ['logo.jpg'],
        identity: { logos: [{ src: 'logos/scuola-maracuja.jpg', cap: 'Marchio Maracuja' }],
          palettes: [{ label: 'Colori dominanti', colors: ['#793773', '#ECC82B', '#77B768'].map(hex => ({ hex })) }] } },
    },
    'first-stop': {
      applicazioni: { layout: 'formats', skip: ['*'],
        formats: [
          { title: 'Concept 1 — “Prendi appuntamento in un Centro First Stop”', story: 'cases/first-stop/a1-story.jpg', post: 'cases/first-stop/a1-post.jpg', banner: 'cases/first-stop/a1-in.jpg' },
          { title: 'Concept 2 — “Prenota online”', story: 'cases/first-stop/a2-story.jpg', post: 'cases/first-stop/a2-post.jpg', banner: 'cases/first-stop/a2-in.jpg' },
        ] },
    },
    elsap: {
      applicazioni: { layout: 'catalog', skip: ['*'],
        catalog: { items: ELSAP, stats: [[ELSAP.length, 'cataloghi in archivio'], [pages, 'pagine impaginate'], ['1', 'standard grafico']],
          note: 'Qui i 13 cataloghi disponibili in archivio, su un totale di 17 realizzati. Scegli un catalogo per sfogliarne copertina, pagine interne e retro.' } },
      output: { layout: 'platform', skip: ['*'],
        platform: { url: 'https://lucabodanza.github.io/LUBE/', shot: 'projects/lube/elsap-dsgn/01.jpg', label: 'Apri ELSAP DSGN ↗',
          features: [{ t: 'Mappa dei cataloghi', d: 'Tutti i comparti, i cataloghi e le loro sezioni: dove si trova cosa.' },
                     { t: 'Cerca codice', d: 'Trova il codice giusto nel database dei cataloghi.' },
                     { t: 'Interrogatore', d: 'Descrivi cosa ti serve: la piattaforma indica comparto, catalogo e pagina.' }] } },
    },
    procryon: {
      applicazioni: { layout: 'catalog', skip: ['*'],
        catalog: { items: [
            { name: 'Serie PRO', meta: '9 varianti · fino a 285 pagine', dir: 'projects/procryon/serie-pro', n: 13 },
            { name: 'Serie PROS', meta: '6 varianti · fino a 271 pagine', dir: 'projects/procryon/serie-pros', n: 8 },
            { name: 'Serie FPRO', meta: '3 varianti · 154 pagine', dir: 'projects/procryon/serie-fpro', n: 7 },
            { name: 'Serie FPROS', meta: '3 varianti · 184 pagine', dir: 'projects/procryon/serie-fpros', n: 7 },
            { name: 'PRO-DRY', meta: '1 catalogo · 30 pagine', dir: 'projects/procryon/serie-pro-dry', n: 5 },
          ], stats: [['22', 'cataloghi'], ['5', 'serie di prodotto'], ['1', 'standard grafico']],
          note: 'Scegli una serie per sfogliare le copertine delle varianti e le pagine interne del catalogo principale.' } },
      output: { layout: 'platform', skip: ['*'],
        platform: { url: 'https://lucabodanza.github.io/Cryon-DSGN/', shot: 'projects/procryon/cryon-dsgn/01.jpg', label: 'Apri Cryon DSGN ↗',
          features: [{ t: 'Scelta macchina', d: 'Tre passi — tipologia di condensazione, di gas e di compressore — e vedi solo le serie giuste.' },
                     { t: 'Configuratore', d: 'Configura il tuo chiller partendo dalla serie scelta.' },
                     { t: 'Listino prezzi', d: 'Il listino Procryon, consultabile dalla piattaforma.' },
                     { t: 'Analisi risparmio', d: 'Quanto fa risparmiare il chiller giusto.' }] } },
    },
    'luke-cover': { output: { layout: 'wall' } },
  };
})();
