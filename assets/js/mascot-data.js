/* Pallino — le parole. Tutto quello che dice la mascot sta qui: per cambiare un testo basta cambiarlo in questo file.
   Sono BOZZE scritte con le parole di Luca (e con i fatti che conosco): da rivedere. Ogni riga finisce dentro il palloncino: brevi (sotto i 90 caratteri).
   Per aggiungere una domanda: una voce in "qa" e una scelta in menu() di guide.js.
   Cose che servono a Luca per completarlo: mission e vision, obiettivi, progetti in cantiere, idee concept (non le invento io). */
window.PALLINO_TEXT = {
  name: 'Pallino',
  greet: ['Ciao! Io sono Pallino.', 'In MCLS c’è un’azienda per ogni settore.', 'Ti accompagno a spasso? Scegli tu.'],
  back: ['Rieccoti!', 'Da dove riprendiamo?'],
  menu: ['Cosa vuoi fare?'],
  quiet: ['Va bene! Se ti serve, tocca me o il palloncino.'],
  brand: ['Ti porto da {name}.', '{sector}.'],            // {name} e {sector}: l’azienda scelta a caso
  labels: {                                            // i testi dei pulsanti
    tour: 'Fammi fare il giro', whatMcls: 'Cos’è MCLS?', randomBrand: 'Un’azienda a caso', who: 'Chi sei tu?', contact: 'Contatta Luca',
    alone: 'Esploro da solo', mail: 'Scrivigli una mail', more: 'Altre domande', hide: 'Nascondi Pallino', another: 'Un’altra!',
    menu: 'Torna al menu', openManual: 'Apri il brand manual', callBack: 'Pallino',
  },
  pokes: ['Ehi! Solletico!', 'Sì, sono io. Dimmi.', 'Attento al palloncino!', 'Eccomi! Cosa facciamo?', 'Hop!'],
  quips: [
    'Respira. Qui si crea, non ci si stressa.',
    'Se ti perdi, chiedi a me. Ho un ottimo senso dell’orientamento, per essere un bambino con un palloncino.',
    'Sai che tutte e 42 le aziende hanno un brand manual completo?',
    'Tocca il palloncino, se vuoi. Non scoppia.',
  ],
  tour: {
    start: ['Si parte! Il giro è breve.', 'Se vuoi fermarmi, toccami o premi Esc.'],
    logo: ['Questo è MCLS: More Creativity, Less Stress.', 'Più creatività, meno stress.'],
    settori: ['Qui sotto il cuore del mondo: un’azienda per ogni settore.', 'Otto settori, quarantadue aziende. Ognuna col suo brand manual.'],
    tech: ['Il mio preferito è il Tech.', 'Qui vivono Quby e MY HOME: la domotica che, nel sogno di Luca, non ha concorrenti.'],
    segni: ['Ora i segni: monogrammi e pittogrammi.', 'Guarda: ognuno ha tre versioni.'],
    traccia: ['Prima la traccia, solo il contorno…'],
    nero: ['…poi di nuovo nero su bianco.'],
    end: ['Giro finito!', 'Adesso tocca a te: chiedimi quello che vuoi.'],
  },
  qa: {
    mcls: ['MCLS è lo studio personale di Luca Bodanza.', 'È il suo laboratorio: ci progetta per sfogo creativo e per allenare competenze a 360°.', 'Più creatività, meno stress: è il motto.'],
    who: ['Sono Pallino, la mascot di MCLS.', 'Reggo il palloncino e faccio da guida.', 'Il palloncino è anche il mio megafono: parlo lì dentro.'],
    numeri: ['42 aziende, 8 settori, 43 segni.', 'Nessuna esiste davvero: sono sogni di Luca, disegnati come se dovessero esistere.'],
    myhome: ['Quby e MY HOME sono l’azienda inventata di Luca per la domotica.', 'Nel sogno, tutto ciò che succede in casa è gestito da un assistente personale con un machine learning su misura.', 'E non ha concorrenti.'],
    contact: ['Vuoi parlare con Luca?', 'Ti apro la mail: scrivigli pure.'],
  },
};
