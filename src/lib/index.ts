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
      const [user, rawBlacklist] = line.split(',');
      const blackList = 
          rawBlacklist ? rawBlacklist.replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean) : [];
          return { user: user.trim(), blackList };
      }
  );
}

export const rulesMessage = "Di base metteremo 10€ poi se uno vuole spenderne 5 o 15 è a sua discrezione,però insomma ovviamente non da 50€ ecco (il Babbo Natale Segreto è fatto apposta\nper non aspettarsi nulla di \"o mio dio\", quindi se fate un regalo da 20 euro e\nne ricevete uno da 5… that's life!)\n\n4️⃣ La consegna avverrà durante una cena organizzata prima del 24 dicembre,\nquindi direi un giorno papabile tra il 19 e il 23 compreso.\nVerrà fatto a breve un sondaggio dove si deciderà bene il giorno e il posto\n(se avete proposte avanzate io propongo la Gavarina d'Oro).\n\n5️⃣ REGALI MEME APPROVATI!\n\n6️⃣ I REGALI DOVRANNO ESSERE IMPACCHETTATI IN BORSETTE ROSSE MONOCOLORE,\nsarebbe meraviglioso se ci fossero quei libretti di carta attaccati sopra\ncosì da scrivere a chi è il regalo.\n\n7️⃣ Quando si aprirà il regalo il \"proprietario\" dovrà cercare di capire chi è\nil suo Babbo Natale Segreto; se sbaglierà nessun problema,\ngli verrà comunque comunicato dal suo Babbo Natale a seguito del coro\n\"SCEMO SCEMO SCEMO!\"\n\n🎅 Buon Babbo Natale Segreto a tutti! 🎅🎅🎅";
