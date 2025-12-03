// ==========================================
// getTournamentSummary.js
// Lee la tabla final de un torneo pasado y enlaza fotos
// ==========================================

import { db } from "../firebase";
import { collection, getDocs, query } from "firebase/firestore";

export default async function getTournamentSummary(torneoId) {
  try {
    const basePath = `tournaments/${torneoId}_summary`;
    const playersPath = `${basePath}/players`;

    const q = query(collection(db, playersPath));
    const snap = await getDocs(q);

    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Leer base de jugadores para obtener ID de foto
    const globalSnap = await getDocs(collection(db, "players"));
    const allPlayers = globalSnap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
    }));

    const nameToId = {};
    allPlayers.forEach((p) => {
      if (p.name) nameToId[p.name.trim().toLowerCase()] = p.id;
    });

    // Asignar playerId para fotos
    rows.forEach((r) => {
      const n = r.name?.trim().toLowerCase();
      r.playerId = nameToId[n] || "default";
    });

    // ORDENAR
    rows.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return b.wins - a.wins;
    });

    // AGREGAR POSICIÓN NUMÉRICA
    rows.forEach((r, index) => {
      r.position = index + 1;
    });

    return rows;

  } catch (err) {
    console.error("Error leyendo resumen de torneo", err);
    return [];
  }
}

