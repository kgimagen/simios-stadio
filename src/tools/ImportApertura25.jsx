import { db } from "../firebase";
import { collection, setDoc, doc } from "firebase/firestore";

// =======================================
// DATOS DEL TORNEO CLAUSURA 22
// diff = 0 (no aparece DG+)
//
// played = PG + PE + PP
// =======================================
const clausura22Data = [
  { name: "Junior",       pts: 52, wins: 16, draws: 2, losses: 4, diff: 0, played: 22 },
  { name: "Polaco",       pts: 41, wins: 12, draws: 4, losses: 8, diff: 0, played: 24 },
  { name: "Kevin",        pts: 37, wins: 11, draws: 4, losses: 7, diff: 0, played: 22 },
  { name: "Jere",         pts: 35, wins: 10, draws: 3, losses: 8, diff: 0, played: 21 },
  { name: "Mati Aguero",  pts: 34, wins: 10, draws: 4, losses: 9, diff: 0, played: 23 },
  { name: "Alexis",       pts: 31, wins: 9,  draws: 4, losses: 10, diff: 0, played: 23 },
  { name: "Jose",         pts: 31, wins: 9,  draws: 4, losses: 10, diff: 0, played: 23 },
  { name: "Ferchu",       pts: 31, wins: 9,  draws: 3, losses: 5, diff: 0, played: 17 },
  { name: "Rama",         pts: 29, wins: 8,  draws: 4, losses: 9, diff: 0, played: 21 },
  { name: "Damian",       pts: 28, wins: 8,  draws: 4, losses: 5, diff: 0, played: 17 },
  { name: "Mati Juarez",  pts: 28, wins: 8,  draws: 3, losses: 6, diff: 0, played: 17 },
  { name: "Palito",       pts: 28, wins: 7,  draws: 5, losses: 9, diff: 0, played: 21 },
  { name: "Pachu",        pts: 26, wins: 8,  draws: 2, losses: 7, diff: 0, played: 17 },
  { name: "Chueco",       pts: 25, wins: 7,  draws: 3, losses: 8, diff: 0, played: 18 },
  { name: "Stiven",       pts: 24, wins: 7,  draws: 1, losses: 7, diff: 0, played: 15 },
  { name: "Eze",          pts: 24, wins: 6,  draws: 4, losses: 14, diff: 0, played: 24 },
  { name: "Sunsu",        pts: 24, wins: 7,  draws: 2, losses: 6, diff: 0, played: 15 },
  { name: "Chavo",        pts: 24, wins: 7,  draws: 3, losses: 5, diff: 0, played: 15 },
  { name: "Juanjo",       pts: 22, wins: 6,  draws: 4, losses: 10, diff: 0, played: 20 },
  { name: "Kin",          pts: 22, wins: 6,  draws: 4, losses: 10, diff: 0, played: 20 },
  { name: "Miche",        pts: 19, wins: 6,  draws: 1, losses: 4, diff: 0, played: 11 }
];

export default function ImportClausura22() {
  const runImport = async () => {
    // PATH: tournaments / clausura22_summary / players
    const col = collection(db, "tournaments", "clausura22_summary", "players");

    for (const p of clausura22Data) {
      await setDoc(doc(col), p);
    }

    alert("CLAUSURA 22 cargado correctamente.");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Importar Clausura 22</h2>

      <button
        onClick={runImport}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          background: "green",
          color: "white",
          border: "none",
          borderRadius: "6px"
        }}
      >
        CARGAR CLAUSURA 22
      </button>
    </div>
  );
}
