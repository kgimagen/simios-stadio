const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Escucha cuando se registra un nuevo partido
exports.processMatch = functions.firestore
    .document("matches/{matchId}")
    .onCreate(async (snap, context) => {
      const match = snap.data();

      console.log("Nuevo partido detectado:", match);

      // TODO: aquí implementaremos:
      // 1) Actualizar puntos PG/PE/PP
      // 2) Actualizar diferencia de gol
      // 3) Guardar resultado en historial ultimos 5
      // 4) Guardar tarjetas
      // 5) Actualizar partidos jugados (PJ)

      return null;
    });
