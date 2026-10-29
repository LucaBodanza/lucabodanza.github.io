/* MCLS — dati del mondo: colore di marca e settori.
   I 42 brand manual (brands.js, generato da tools/build_brands.py) sono distribuiti nei settori per slug: per spostare
   un'azienda da un settore all'altro basta cambiare la lista "slugs". Un settore con "story" mostra il racconto sopra le schede.
   I testi sono bozze scritte con le parole di Luca: da rivedere. Usato da mcls.js e da brand.js (link di ritorno). */
window.MCLS = {
  blue: '#001E87',                                   // blu dell'icona social MCLS
  payoff: 'More Creativity, Less Stress',
  districts: [
    { k: 'tech', label: 'Tech', desc: 'Neurotech, cloud, assistenti vocali, domotica e hardware.',
      slugs: ['quby', 'my-home', 'brainwave', 'x-cloud', 'vram-armory'],
      story: { kicker: 'Il sogno della domotica', title: 'Quby + MY HOME', slugs: ['quby', 'my-home'],
        text: ['Quby e MY HOME sono la mia azienda inventata per la domotica. Nel sogno dominano il mercato della smart home: tutto quello che serve in casa, dal risveglio fino a quando ci si rimette a letto, è gestito, automatizzato e controllato da un assistente personale con un machine learning su misura.',
          'E nel sogno non ci sono concorrenti.'] } },
    { k: 'musica', label: 'Musica', desc: 'Etichette e studi di registrazione, dal rap alla techno, dal pop all’ambient.',
      slugs: ['21world', 'asphalt-sound', 'look-music', 'yearecords', 'alos-music-co', 'bridge-music', 'high-music', 'code-s', 'succes', 'v-sounds-records', '4-studio', 'sound-boss'] },
    { k: 'moda', label: 'Moda & lusso', desc: 'Alta sartoria, pelletteria, orologeria e abbigliamento contemporaneo.',
      slugs: ['danez', 'louren', 'victoire', 'thomas-hook', 'valkirie-boutique', 'gran-lorin-s'] },
    { k: 'street', label: 'Streetwear & lifestyle', desc: 'Abbigliamento urbano, benessere e cultura digitale.',
      slugs: ['dynamo', 'monstram', 'anstellar', 'captcha', 'byte-mwp', 'merin'] },
    { k: 'design', label: 'Design, arte & architettura', desc: 'Una galleria neoclassica, uno studio di progettazione spaziale, l’architettura costiera.',
      slugs: ['life-of-statue', 'abstract-design', 'maestral'] },
    { k: 'outdoor', label: 'Outdoor & motorsport', desc: 'Spedizioni, esplorazione e un team di motorsport GT.',
      slugs: ['wild-life', 'astro-wild', 'ziheck-ren-sport'] },
    { k: 'food', label: 'Food & beverage', desc: 'Torrefazione, bistrot mediterraneo e vino toscano.',
      slugs: ['lyron-coffe', 'peperino-food', 'l-uve'] },
    { k: 'servizi', label: 'Servizi & consulenza', desc: 'Impianti, consulenza istituzionale, una libreria per bambini e servizi alla comunità.',
      slugs: ['fabrizio-lombardi', 'lsg', 'pianeta-dei-lettori', 'people'] },
  ],
};
window.MCLS.districtOf = slug => window.MCLS.districts.find(d => d.slugs.includes(slug));
