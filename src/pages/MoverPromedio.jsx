import React from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

export default function MoverPromedio() {
  const ejecutar = async () => {
    try {
      // =========================
      // REFERENCIAS
      // =========================
      const torneoRef = doc(db, "tournaments", "clausura25_summary");

      const playersRef = collection(torneoRef, "players");
      const promediosRef = collection(torneoRef, "promedios");
      const capitanesRef = collection(torneoRef, "capitanes");

      // =========================
      // LIMPIAR COLECCIONES
      // =========================
      const limpiar = async (ref) => {
        const snap = await getDocs(ref);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      };

      await limpiar(playersRef);
      await limpiar(promediosRef);
      await limpiar(capitanesRef);

      // =========================
      // DOCUMENTO PRINCIPAL
      // =========================
      await setDoc(torneoRef, {
        totalMatchdays: 18
      });

      // =========================
      // PLAYERS
      // =========================
      const players = [
        { name: "Damián", pts: 39, wins: 13, draws: 0, losses: 5, diff: 47, played: 18 },
        { name: "Israel", pts: 36, wins: 12, draws: 0, losses: 6, diff: 21, played: 18 },
        { name: "Kevin", pts: 30, wins: 10, draws: 0, losses: 5, diff: 38, played: 15 },
        { name: "Chavo", pts: 30, wins: 10, draws: 0, losses: 6, diff: 26, played: 16 },
        { name: "Agus Romero", pts: 30, wins: 10, draws: 0, losses: 7, diff: 1, played: 17 },
        { name: "Lucho", pts: 30, wins: 10, draws: 0, losses: 8, diff: -9, played: 18 },
        { name: "Ferchu", pts: 27, wins: 9, draws: 0, losses: 8, diff: -18, played: 17 },
        { name: "Juanjo", pts: 24, wins: 8, draws: 0, losses: 8, diff: 10, played: 16 },
        { name: "Kin", pts: 21, wins: 7, draws: 0, losses: 5, diff: -5, played: 12 },
        { name: "Matias Aguilar", pts: 18, wins: 6, draws: 0, losses: 6, diff: 14, played: 12 },
        { name: "Chini", pts: 18, wins: 6, draws: 0, losses: 6, diff: 13, played: 12 },
        { name: "Enzo", pts: 18, wins: 6, draws: 0, losses: 2, diff: 13, played: 8 },
        { name: "Julián Sunsu", pts: 18, wins: 6, draws: 0, losses: 6, diff: 9, played: 12 },
        { name: "Palito", pts: 15, wins: 5, draws: 0, losses: 6, diff: 5, played: 11 },
        { name: "Mati Agüero", pts: 15, wins: 5, draws: 0, losses: 9, diff: -8, played: 14 },
        { name: "Rama", pts: 15, wins: 5, draws: 0, losses: 10, diff: -28, played: 15 },
        { name: "Leo Guzman", pts: 15, wins: 5, draws: 0, losses: 9, diff: -30, played: 14 },
        { name: "Jeque", pts: 15, wins: 5, draws: 0, losses: 10, diff: -39, played: 15 },
        { name: "Sady", pts: 12, wins: 4, draws: 0, losses: 1, diff: 12, played: 5 },
        { name: "Cho", pts: 12, wins: 4, draws: 0, losses: 6, diff: 2, played: 10 },
        { name: "Polaco", pts: 9, wins: 3, draws: 0, losses: 3, diff: 8, played: 6 },
        { name: "Peluffo", pts: 9, wins: 3, draws: 0, losses: 3, diff: -6, played: 6 },
        { name: "Jere", pts: 9, wins: 3, draws: 0, losses: 12, diff: -51, played: 15 },
        { name: "Roberto", pts: 6, wins: 2, draws: 0, losses: 5, diff: -21, played: 7 }
      ];

      for (const p of players) {
        await setDoc(doc(playersRef), p);
      }

      // =========================
      // PROMEDIOS
      // =========================
      const descendidos = [
        "Jeque", "Peluffo", "Jere", "Sady",
        "Cho", "Polaco", "Chini", "Roberto"
      ];

      const promedios = [
        { name: "Agus Romero", prom: 1.725 },
        { name: "Damián", prom: 1.686 },
        { name: "Israel", prom: 1.627 },
        { name: "Kevin", prom: 1.51 },
        { name: "Ferchu", prom: 1.51 },
        { name: "Julián Sunsu", prom: 1.373 },
        { name: "Lucho", prom: 1.333 },
        { name: "Jeque", prom: 1.314 },
        { name: "Juanjo", prom: 1.216 },
        { name: "Matias Aguilar", prom: 1.216 },
        { name: "Rama", prom: 1.157 },
        { name: "Chavo", prom: 0.941 },
        { name: "Peluffo", prom: 0.922 },
        { name: "Jere", prom: 0.902 },
        { name: "Sady", prom: 0.889 },
        { name: "Kin", prom: 0.863 },
        { name: "Mati Agüero", prom: 0.863 },
        { name: "Enzo", prom: 0.843 },
        { name: "Palito", prom: 0.824 },
        { name: "Leo Guzman", prom: 0.824 },
        { name: "Cho", prom: 0.806 },
        { name: "Polaco", prom: 0.765 },
        { name: "Chini", prom: 0.745 },
        { name: "Roberto", prom: 0.529 }
      ];

      for (const p of promedios) {
        await setDoc(doc(promediosRef), {
          name: p.name,
          prom: p.prom,
          descended: descendidos.includes(p.name)
        });
      }

      // =========================
      // CAPITANES (ID = FECHA)
      // =========================
      const capitanes = [
        { f: 18, r: "Chini", b: "Cho", sr: 6, sb: 8 },
        { f: 17, r: "Kevin", b: "Damián", sr: 5, sb: 9 },
        { f: 16, r: "Chavo", b: "Juanjo", sr: 4, sb: 5 },
        { f: 15, r: "Jere", b: "Damián", sr: 3, sb: 8 },
        { f: 14, r: "Enzo", b: "Rama", sr: 8, sb: 5 },
        { f: 13, r: "Agus Romero", b: "Israel", sr: 6, sb: 7 },
        { f: 12, r: "Juanjo", b: "Lucho", sr: 18, sb: 2 },
        { f: 11, r: "Mati Agüero", b: "Matias Aguilar", sr: 10, sb: 5 },
        { f: 10, r: "Leo Guzman", b: "Ferchu", sr: 7, sb: 12 },
        { f: 9, r: "Kin", b: "Chini", sr: 4, sb: 8 },
        { f: 8, r: "Kevin", b: "Jeque", sr: 11, sb: 6 },
        { f: 7, r: "Rama", b: "Damián", sr: 2, sb: 4 },
        { f: 6, r: "Israel", b: "Jere", sr: 7, sb: 9 },
        { f: 5, r: "Sady", b: "Palito", sr: 10, sb: 3 },
        { f: 4, r: "Juanjo", b: "Lucho", sr: 11, sb: 7 },
        { f: 3, r: "Julián Sunsu", b: "Agus Romero", sr: 7, sb: 5 },
        { f: 2, r: "Polaco", b: "Peluffo", sr: 9, sb: 5 },
        { f: 1, r: "Mati Agüero", b: "Chavo", sr: 6, sb: 5 }
      ];

      for (const c of capitanes) {
        await setDoc(doc(capitanesRef, String(c.f)), {
          matchday: c.f,
          capRed: c.r,
          capBlue: c.b,
          scoreRed: c.sr,
          scoreBlue: c.sb,
          score: `${c.sr} - ${c.sb}`
        });
      }

      alert("Clausura 25 cargado correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al cargar Clausura 25.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Cargar Clausura 25 (Summary)</h2>
      <button
        onClick={ejecutar}
        style={{
          padding: "10px 20px",
          background: "#2196f3",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        Ejecutar carga
      </button>
    </div>
  );
}
