// place files you want to import through the `$lib` alias in this folder.
export type overlap = {
    user: string,
    blackList:string[]
}

function respectedRules(rules: overlap, extraction: string) {
  if (rules.user === extraction) return false;
  // usa includes (o un Set) per controllare la blacklist
  return !rules.blackList.includes(extraction);
}

export function giftMatchingSystem(rules: overlap, participants: string[]) {
  // Filtra prima i candidati validi: niente self e niente blacklist
  const candidates = participants.filter(
    (p) => p !== rules.user && !rules.blackList.includes(p)
  );

  if (candidates.length === 0) {
    // gestisci come preferisci: throw, null, undefined, ecc.
    throw new Error("Nessun candidato valido disponibile");
  }

  // indice intero tra 0 e candidates.length - 1
  const idx = Math.floor(Math.random() * candidates.length);
  const extraction = candidates[idx];

  // opzionale: sicurezza extra
  if (!respectedRules(rules, extraction)) {
    throw new Error("Validazione fallita inaspettatamente");
  }
  return extraction;
}

export function parseCSV(csv: string) : overlap[]{
  const lines = csv.trim().split('\n');
  const headers = lines.shift()?.split(',') ?? [];
  
  return lines.map(line => {
      const [user, rawBlacklist,superSecretCode] = line.split(',');
      const blackList = rawBlacklist ? rawBlacklist.replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean) : [];
      return { user: user.trim(), blackList,superSecretCode };
    }
  );
}

export const rulesMessage = "Di base metteremo 10€ poi se uno vuole spenderne 5 o 15 è a sua discrezione,però insomma ovviamente non da 50€ ecco (il Babbo Natale Segreto è fatto apposta per non aspettarsi nulla di \"o mio dio\", quindi se fate un regalo da 20 euro e ne ricevete uno da 5… that's life!)\n\n1 La consegna avverrà durante una cena organizzata prima del 24 dicembre,\n\n2 REGALI MEME APPROVATI!\n\n3 I REGALI DOVRANNO ESSERE IMPACCHETTATI IN BORSETTE ROSSE MONOCOLORE,sarebbe meraviglioso se ci fossero quei libretti di carta attaccati sopra così da scrivere a chi è il regalo.\n4 Quando si aprirà il regalo il \"proprietario\" dovrà cercare di capire chi è il suo Babbo Natale Segreto; se sbaglierà nessun problema,gli verrà comunque comunicato dal suo Babbo Natale a seguito del coro\"SCEMO SCEMO SCEMO!\"\n\n<center>🎅 Buon Babbo Natale Segreto a tutti! 🎅🎅🎅</center>";
export const instructions = `Per usare il sito e scoprire a chi dover fare il regalo occorre:<br>0) Mettere il telefono in orizzontale<br>1) Selezionare il proprio nome tramite l'apposito selettore, affianco alla domanda chi sei?<br>2) Premere il pulsante Estrai<br>3) Aspettare il pop Up che vi comunicherà il destinatario del regalo<br><br>Se non vi ricordate a chi dovete fare il regalo è necessario ripetere la procedura descritta sopra, con l'eccezione che vi verrà presentato uno slot dove inserire un codice segreto, che vi verrà comunicato scrivendo a Matteo (creatore del sito). Una volta inserito premere recupera il destinatario e vi verrà scritto nel sito il nome del destinatario.`;
