/* Testi del sito che vengono dal codice e si usano in più punti (cartelle della home, conteggi, etichette dei pulsanti).
   Tutti si cambiano dall'Admin (scheda «Testi»): qui stanno solo i valori di partenza. {n} e {c} sono numeri che il sito calcola da solo. */
window.SITE_TEXT = {
  ui: { clock: 'Brescia', copied: 'Copiato', open: 'Apri ↗' },
  mcls: { company: { one: 'azienda', many: 'aziende' }, types: { Monogramma: 'Monogramma', Pittogramma: 'Pittogramma' }, lightboxTitle: 'Monogrammi & Pittogrammi', lightboxTag: 'MCLS · Segni' },
  home: {
    lead: '{n} lavori in {c} cartelle, divise per natura del progetto: lavori per aziende, progetti personali e i progetti del percorso IFTS. I brand manual completi e i segni stanno nel mondo MCLS (la voce nella barra in alto). Apri una cartella, scegli la sotto-cartella e scorri le schede: ogni scheda porta al progetto.',
    count: '{n} lavori · {c} cartelle',
    work: { one: 'lavoro', many: 'lavori' },
    mclsLink: 'Apri il mondo MCLS →',
    copied: 'Copiato ✓',
    folders: {
      aziende: { label: 'Lavori per aziende', desc: 'Cataloghi tecnici, web-app, campagne e stampa realizzati per aziende',
        subs: {
          cataloghi: { label: 'Cataloghi tecnici & web-app', desc: 'Documentazione tecnica e piattaforme web per l’industria.' },
          comunicazione: { label: 'Comunicazione & stampa', desc: 'Campagne, social, stampa e cartoleria realizzati in agenzia.' },
        } },
      personali: { label: 'Progetti personali', desc: 'Brand identity, packaging, streetwear e cover art: i progetti che mi sono dato per allenare competenze a 360°',
        subs: {
          identita: { label: 'Brand identity', desc: 'Logotipi, restyling e manuali: dal logo al sistema.' },
          packaging: { label: 'Packaging', desc: 'Scatole, astucci e modelli di fustella.' },
          street: { label: 'Streetwear & cover art', desc: 'Brand di moda, stampe, lettering e copertine.' },
          mcls: { label: 'Brand manual & segni', desc: 'Un’azienda per ogni settore, ognuna con il suo brand manual completo, e i monogrammi e pittogrammi in tre versioni: nel mondo MCLS.' },
        } },
      lab: { label: 'Made in Italy Lab', desc: 'I progetti del percorso IFTS all’ITS Machina Lonati: eventi, packaging e strategia' },
    },
  },
};
