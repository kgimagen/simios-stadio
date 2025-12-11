import React from "react";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase"; // AJUSTAR SI TU ARCHIVO ESTÁ EN OTRA CARPETA

const db = getFirestore(app);

export default function MoverPromedio() {
  const mover = async () => {
    try {
      console.log("Iniciando copia de documentos...");

      const oldRef = collection(db, "tournaments", "verano24_summary", "promedio");
      const newRef = collection(db, "tournaments", "verano24_summary", "promedios");

      const snapshot = await getDocs(oldRef);

      if (snapshot.empty) {
        console.log("No hay documentos en 'promedio'.");
        alert("No se encontraron documentos en 'promedio'.");
        return;
      }

      for (const d of snapshot.docs) {
        await setDoc(doc(newRef, d.id), d.data());
      }

      console.log("Documentos copiados correctamente.");
      alert("Documentos copiados con éxito. Ya podés borrar la colección 'promedio'.");

    } catch (error) {
      console.error("Error al copiar documentos:", error);
      alert("Ocurrió un error. Revisá la consola.");
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
