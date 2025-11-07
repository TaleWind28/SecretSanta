import { giftMatchingSystem, parseCSV } from "$lib";
import { db } from "$lib/firebase";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { FieldValue } from "firebase-admin/firestore";

export const GET: RequestHandler = async () => {
    const data = await db.collection("contestants").get()
   
    if (data.empty)return json({success:false});
    let drawnPartecipants:any[] = [];
    data.forEach((doc:any)=> {
        const arr = doc.data();
        let [key,values] = Object.entries(arr)[0];
        drawnPartecipants.push(values);
        
    })
    return json({success:true,drawnPartecipants:drawnPartecipants})
}

export const PUT: RequestHandler = async ({request,fetch}) => {
  try {
    // Ottieni i dati dal body della richiesta
    const data = await request.json();
    const rules = data.rules;

    //recupero i partecipanti
    const res = await fetch('/data/participants.csv');
    const text = await res.text();
    let ruling = parseCSV(text);
    const participants = [];    
    for (let entry of ruling){
        participants.push(entry.user)
    }

    //ottengo la reference al documento drawn
    const drawnRef = db.collection('contestants').doc('drawn')
    const drawnDoc = await drawnRef.get();
    const drawnData = drawnDoc.data();
    if (drawnData === undefined)return;
    const [key,values] = Object.entries(drawnData)[0];
    //recuperare da firestore quelli già estratti
    let notAvailables:string[] = values;

    console.log(notAvailables,"data");
    //espando le regole
    rules.blackList = [...rules.blackList,...notAvailables]
    let newDraw;
    
    try{
        //estraggo un nome
        newDraw = giftMatchingSystem(rules,participants);
    }catch(Error){
        console.log(Error);
        return;
    }
    

    console.log(newDraw,"drawn");
 
    //modifico la collezione
    await drawnRef.set({ bs1: FieldValue.arrayUnion(newDraw.trim()) }, { merge: true });

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