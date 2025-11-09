import { giftMatchingSystem, parseCSV } from "$lib";
import { db } from "$lib/firebase";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({url}) => {
  const ssc = url.searchParams.get('ssc');
  console.log('superSecretCode:', ssc);

  const snapshot = await db.collection('contestants').get();
  let receiver = "";
  snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.superSecretCode === ssc) {
        receiver = data.giftTo;
      }
  });
  return json({success:true,receiver:receiver})
}

export const PUT: RequestHandler = async ({request,fetch}) => {
  try {
    // Ottieni i dati dal body della richiesta
    const data = await request.json();
    const rules = data.rules;

    const userRef = db.collection('contestants').doc(rules.user);
    const userData = (await userRef.get()).data();
    if (userData === undefined)return json({success:false});
    if (userData.giftTo!== "" ){
      return json({success:false,message:"Estrazione già avvenuta"});
    }
    //recupero i partecipanti
    const res = await fetch('/data/participants.csv');
    const text = await res.text();
    let ruling = parseCSV(text);
    const participants = [];
    for (let entry of ruling){
      participants.push(entry.user)
    }

    //ottengo la reference al documento drawn
    const constestantsRef = db.collection('contestants')

    const snapshot = await db.collection('contestants').get();
    const assigned: any[] = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.giftFrom && data.giftFrom.trim() !== "") {
            assigned.push(doc.id);
        }
    });
    //recuperare da firestore quelli già estratti
    let notAvailables:string[] = assigned;

    console.log(notAvailables,"data");
    //espando le regole
    rules.blackList = [...rules.blackList,...notAvailables]
    let newDraw;
    
    try{
        //estraggo un nome
        newDraw = giftMatchingSystem(rules,participants);
    }catch(Error){
      console.log(Error);
      return json({success:false});
    }
    

    console.log(newDraw,"drawn");
    await constestantsRef.doc(newDraw).update({giftFrom:rules.user});
    await constestantsRef.doc(rules.user).update({giftTo:newDraw});
    //aggiungere al firestore il salvataggio delle estrazioni per recuperare i dati
    
    
    return json({ 
      success: true, 
      message: 'Estrazione Registrata con successo!',
      drawn:newDraw
    });

  } catch (err: any) {
    console.error("Errore nella registrazione dell'estrazione:", err);
    
    // Se è un errore di parsing JSON
    if (err instanceof SyntaxError) {
      throw error(400, 'Formato JSON non valido');
    }
    
    // Se è un errore gestito da noi (es. 401, 404), rilancia
    if (err.status) throw err;
    
    // Errore generico del server
    throw error(500, 'Errore interno del server durante l\'aggiornamento');
  }
};