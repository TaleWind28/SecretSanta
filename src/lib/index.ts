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

export function giftMatchingSystem(rules: overlap, participants: string[], notAvailables: string[]) {
  // Filtra prima i candidati validi: niente self e niente blacklist
  const candidates = participants.filter(
    (p) => p !== rules.user && !rules.blackList.includes(p) && !notAvailables.includes(p)
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