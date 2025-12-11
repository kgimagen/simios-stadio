import React from "react";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

import { db } from "../firebase";

export default function MoverPromedio() {

    const mover = async () => {
    try {
        console.log("Cargando promedios en verano23_summary...");

        const promedios = [
        { name: "Jere", prom: 1.90 },
        { name: "Julián Sunsu", prom: 1.70 },
        { name: "Chavo", prom: 1.60 },
        { name: "Mati Juarez", prom: 1.40 },
        { name: "Kin", prom: 1.40 },
        { name: "Peluffo", prom: 1.10 },
        { name: "Leo Suarez", prom: 1.10 },
        { name: "Leo Guzman", prom: 1.10 },
        { name: "Jose", prom: 1.10 },
        { name: "Rama", prom: 1.10 },
        { name: "Chueco", prom: 1.10 },
        { name: "Juanjo", prom: 1.10 },
        { name: "Ferchu", prom: 1.00 },
        { name: "Kevin", prom: 1.00 },
        { name: "Chini", prom: 0.80 },           // Alexis
        { name: "Mati Agüero", prom: 0.80 },
        { name: "Jeque", prom: 0.70 },           // Eze
        { name: "Palito", prom: 0.70 },
        { name: "Pachu", prom: 0.40 },
        { name: "Lucas", prom: 0.40 }
        ];

        const descendedList = [
        "Chini",
        "Mati Agüero",
        "Jeque",
        "Palito",
        "Pachu",
        "Lucas"
        ];

        const ref = collection(db, "tournaments", "verano23_summary", "promedios");

        // PASO 1: borrar colección actual
        const currentDocs = await getDocs(ref);
        for (const docItem of currentDocs.docs) {
        await deleteDoc(docItem.ref);
        }

        // PASO 2: crear documentos nuevos con ID random
        for (const p of promedios) {
        const docRef = doc(ref); // ID aleatorio

        await setDoc(docRef, {
            name: p.name,
            prom: p.prom,
            descended: descendedList.includes(p.name)
        });
        }

        alert("Promedios de Verano 23 cargados correctamente.");

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al cargar Verano 23.");
    }
    };






  return (
    <div style={{ padding: 20 }}>
      <h2>Mover documentos de 'promedio' a 'promedios'</h2>
      <button
        onClick={mover}
        style={{
          padding: "10px 20px",
          background: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          fontSize: 16
        }}
      >
        Ejecutar acción
      </button>
    </div>
  );
}
