/* Archivio: tutti gli altri lavori, ordinati per tipologia.
   - origin: da dove arriva il lavoro          - macro / sub: macro-categoria e sotto-tipologia
   - c: 1 creativo … 5 tecnico                  - p: 1 pratico … 5 teorico        - d: durata 1 breve … 5 lunga
   Per aggiungere un lavoro: copia una riga, salva le immagini in assets/img/projects/<dir>/ (01.jpg … NN.jpg + t-01.jpg).
   I valori c / p / d sono una prima stima: correggili liberamente.                                              */
window.ARCHIVE = {
  origins: {
    timmagine: 'Timmagine',
    lube:      'LuBe Consulting',
    procryon:  'Procryon',
    personale: 'Personale',
    ifts:      'IFTS · ITS Machina Lonati',
  },
  macros: {
    identita:  { label: 'Identità & Logo',      subs: ['Logotipo', 'Monogramma & simbolo', 'Lettering & streetwear', 'Restyling', 'Brand & materiali'] },
    editoria:  { label: 'Editoria & Stampa',    subs: ['Depliant & brochure', 'Cartoleria', 'Manifesti', 'Cataloghi', 'Documenti'] },
    digitale:  { label: 'Digitale & Social',    subs: ['Social'] },
    packaging: { label: 'Packaging',            subs: ['Etichette', 'Fustelle'] },
    moda:      { label: 'Moda & Streetwear',    subs: ['T-shirt & felpe', 'Stampa & ricamo'] },
    visual:    { label: 'Visual & Fotografia',  subs: ['Fotoritocco'] },
    eventi:    { label: 'Eventi',               subs: ['Progetti per evento'] },
  },
  axes: {
    c: ['Creativo', 'Tecnico'],
    p: ['Pratico', 'Teorico'],
    d: ['Breve', 'Lungo'],
  },
  // Loghi autorizzati da Leonardo Pelo (Direttore Creativo) e Francesca Baronio (Art Director), Timmagine
  clients: [
    { name: 'Daikin', file: 'daikin.svg', ar: 4.555 }, { name: 'Bridgestone', file: 'bridgeston.svg', ar: 1.112 }, { name: 'GIVI', file: 'givi.svg', ar: 1.0 },
    { name: 'First Stop', file: 'first-stop.svg', ar: 5.581 }, { name: 'Contadi Castaldi', file: 'contadi-castaldi.svg', ar: 2.076 },
    { name: 'Bellavista', file: 'bellavista.svg', ar: 1.427 }, { name: 'Tau Metalli', file: 'taumetalli.png', ar: 1.462 }, { name: 'AmTrust', file: 'amtrust.svg', ar: 2.661 },
    { name: 'MCS Facchetti', file: 'mcs-facchetti.svg', ar: 1.914 }, { name: 'Trismoka', file: 'trismoka.svg', ar: 2.917 }, { name: 'SIPA', file: 'sipa.svg', ar: 2.937 },
    { name: 'Techne', file: 'techne.svg', ar: 4.371 }, { name: 'Fantini', file: 'fantini.svg', ar: 2.986 }, { name: 'Calvi', file: 'calvi.svg', ar: 4.285 },
    { name: 'Almag', file: 'almag.svg', ar: 4.362 },
  ],
  items: [
    { origin: 'personale', macro: 'packaging', sub: 'Fustelle', dir: 'personali/fustelle', n: 22, c: 3, p: 5, d: 4, title: 'Fustelle — libreria di modelli', meta: '22 modelli per astucci e scatole, dall’A4 all’A0' },
    { origin: 'timmagine', macro: 'editoria', sub: 'Depliant & brochure', dir: 'agenzia/amtrust', n: 2, c: 3, p: 1, d: 2, title: 'AmTrust — Depliant', meta: 'Depliant a 3 ante' },
    { origin: 'timmagine', macro: 'digitale', sub: 'Social', dir: 'agenzia/bellavista-stories', n: 12, c: 2, p: 1, d: 2, title: 'Cantina Bellavista — Storie IG', meta: 'Copertine per le storie Instagram' },
    { origin: 'timmagine', macro: 'editoria', sub: 'Cartoleria', dir: 'agenzia/tau-metalli', n: 6, c: 4, p: 1, d: 1, title: 'Tau Metalli — Biglietti da visita', meta: 'Biglietti da visita' },
    { origin: 'timmagine', macro: 'packaging', sub: 'Etichette', dir: 'agenzia/trismoka-etichette', n: 2, c: 3, p: 1, d: 2, title: 'Trismoka — Etichette', meta: 'Etichette prodotto' },
    { origin: 'timmagine', macro: 'editoria', sub: 'Documenti', dir: 'agenzia/trismoka-listino', n: 1, c: 5, p: 1, d: 1, title: 'Trismoka — Documento rialzo prezzi', meta: 'Documento commerciale' },
    { origin: 'timmagine', macro: 'editoria', sub: 'Cartoleria', dir: 'agenzia/gregorj-natale', n: 3, c: 2, p: 1, d: 1, title: 'GregorJ — Biglietto di Natale', meta: 'Biglietto augurale' },
    { origin: 'timmagine', macro: 'editoria', sub: 'Cartoleria', dir: 'agenzia/mcs-facchetti-natale', n: 3, c: 2, p: 1, d: 1, title: 'MCS Facchetti — Biglietto di Natale', meta: 'Biglietto augurale' },
    { origin: 'personale', macro: 'identita', sub: 'Logotipo', dir: 'personali/llp', n: 10, c: 1, p: 1, d: 4, title: 'Luke Logo Production', meta: 'LLP — progettazione loghi e brand identity' },
    { origin: 'personale', macro: 'moda', sub: 'T-shirt & felpe', dir: 'personali/streetwear', n: 10, c: 1, p: 1, d: 3, title: 'Streetwear — T-shirt & felpe', meta: 'Capi finiti e mockup' },
    { origin: 'personale', macro: 'moda', sub: 'Lettering & streetwear', dir: 'personali/loghi-abbigliamento', n: 10, c: 2, p: 1, d: 3, title: 'Loghi abbigliamento', meta: 'Dynamo, Monstra, Anstellar' },
    { origin: 'personale', macro: 'moda', sub: 'Stampa & ricamo', dir: 'personali/stampa-ricamo', n: 8, c: 4, p: 1, d: 2, title: 'Stampa & ricamo', meta: 'Elementi per stampa e ricamo dei brand' },
    { origin: 'personale', macro: 'identita', sub: 'Restyling', dir: 'personali/qdp', n: 8, c: 2, p: 2, d: 2, title: 'QDP — Re-Branding', meta: 'Logo e presentazione del re-branding' },
    { origin: 'personale', macro: 'identita', sub: 'Monogramma & simbolo', dir: 'personali/uve', n: 1, c: 1, p: 1, d: 1, title: 'L’uvè — Logo', meta: 'Logo' },
    { origin: 'personale', macro: 'identita', sub: 'Brand & materiali', dir: 'personali/bf-service', n: 10, c: 3, p: 1, d: 5, title: 'Bf-Service — Brand & materiali', meta: 'Logo, cartellina, etichette, adesivi, banner' },
    { origin: 'personale', macro: 'identita', sub: 'Logotipo', dir: 'personali/loghi-terzi', n: 6, c: 2, p: 1, d: 2, title: 'Rosyca · Daysea · BrainWave', meta: 'Tre logotipi' },
    { origin: 'ifts', macro: 'eventi', sub: 'Progetti per evento', dir: 'formazione/eventi-matrimonio-civile', n: 8, c: 2, p: 4, d: 2, title: 'Eventi — Matrimonio civile', meta: 'Corso Organizzazione Eventi' },
    { origin: 'ifts', macro: 'eventi', sub: 'Progetti per evento', dir: 'formazione/eventi-matrimonio-religioso', n: 8, c: 2, p: 4, d: 2, title: 'Eventi — Matrimonio religioso', meta: 'Corso Organizzazione Eventi' },
    { origin: 'ifts', macro: 'eventi', sub: 'Progetti per evento', dir: 'formazione/eventi-matrimonio-fiera', n: 8, c: 2, p: 4, d: 2, title: 'Eventi — Matrimonio in fiera', meta: 'Corso Organizzazione Eventi' },
    { origin: 'ifts', macro: 'eventi', sub: 'Progetti per evento', dir: 'formazione/eventi-18esimo', n: 8, c: 2, p: 4, d: 2, title: 'Eventi — 18esimo', meta: 'Corso Organizzazione Eventi' },
    { origin: 'ifts', macro: 'eventi', sub: 'Progetti per evento', dir: 'formazione/eventi-festa-privata', n: 8, c: 2, p: 4, d: 2, title: 'Eventi — Festa privata', meta: 'Corso Organizzazione Eventi' },
    { origin: 'ifts', macro: 'identita', sub: 'Logotipo', dir: 'formazione/eventora', n: 4, c: 2, p: 3, d: 2, title: 'EventOra', meta: 'Corso Organizzazione Eventi' },
  ],
};
