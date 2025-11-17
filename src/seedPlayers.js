import { db } from "./firebase";
import { collection, setDoc, doc } from "firebase/firestore";

export const seedPlayers = async () => {
  const players = [
    "Damián","Kevin","Chavo","Israel","Agus Romero","Ferchu","Lucho","Matias Aguilar",
    "Juanjo","Kin","Palito","Sady","Enzo","Chini","Julián Sunsu","Polaco","Peluffo",
    "Cho","Mati Agüero","Rama","Leo Guzman","Jere","Roberto","Jeque"
  ];

  for (const p of players) {
    const id = p.toLowerCase().replace(/ /g, "_");
    
    await setDoc(doc(collection(db, "players"), id), {
      name: p,
      photoURL: null,
      active: true,
      stats: {
        totalMatches: 0,
        totalPoints: 0,
        totalDiff: 0
      }
    });

    await setDoc(doc(collection(db, "tournaments", "clausura25", "standings"), id), {
      points: 0,
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      diff: 0,
      lastFive: []
    });
  }
    console.log("Seed iniciado...");
  alert("Jugadores cargados con éxito");
};
