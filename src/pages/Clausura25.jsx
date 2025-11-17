import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { DataGrid } from "@mui/x-data-grid";

function Clausura25() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "tournaments", "clausura25", "matches"),
      async (snapshot) => {

        // 1️⃣ Leer todos los partidos cargados
        const matches = snapshot.docs.map((doc) => doc.data());

        // 2️⃣ Obtener jugadores
        const playersSnap = await getDocs(collection(db, "players"));
        const players = playersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 3️⃣ Inicializar estadísticas por jugador
        const stats = {};
        players.forEach((p) => {
          stats[p.id] = {
            id: p.id,
            name: p.name ?? "Jugador",
            wins: 0,
            draws: 0,
            losses: 0,
            gf: 0,
            gc: 0,
            diff: 0,
            last5: [],
            card: null,       // ← NUEVO: sin tarjeta
            cardUntil: null,  // ← NUEVO: fecha de finalización si es roja
                      
          };
        });

        // 4️⃣ Procesar cada partido (ordenados por fecha)
        matches.sort((a, b) => a.matchday - b.matchday);

        matches.forEach((match) => {
          const redGoals = match.red.goals;
          const blueGoals = match.blue.goals;
          const redPlayers = match.red.players || [];
          const bluePlayers = match.blue.players || [];
          const playedIds = [...redPlayers, ...bluePlayers];

          // Tarjetas (si existen en el partido)
          if (Array.isArray(match.cards)) {
            match.cards.forEach((card) => {
              if (!stats[card.playerId]) return;

              if (card.type === "yellow") {
                stats[card.playerId].card = "yellow";
              }

              if (card.type === "red") {
                stats[card.playerId].card = "red";
                stats[card.playerId].cardUntil = match.matchday + (card.matches || 1);
              }
            });
          }

          // Goles a favor y en contra
          redPlayers.forEach((id) => {
            stats[id].gf += redGoals;
            stats[id].gc += blueGoals;
          });

          bluePlayers.forEach((id) => {
            stats[id].gf += blueGoals;
            stats[id].gc += redGoals;
          });

          // Resultado (solo para los que jugaron)
          if (redGoals > blueGoals) {
            redPlayers.forEach((id) => stats[id].wins++);
            bluePlayers.forEach((id) => stats[id].losses++);
          } else if (redGoals < blueGoals) {
            bluePlayers.forEach((id) => stats[id].wins++);
            redPlayers.forEach((id) => stats[id].losses++);
          } else {
            redPlayers.forEach((id) => stats[id].draws++);
            bluePlayers.forEach((id) => stats[id].draws++);
          }

          // Registrar resultado en last5
          Object.keys(stats).forEach((id) => {
            if (redPlayers.includes(id) || bluePlayers.includes(id)) {
              if (redGoals === blueGoals) {
                stats[id].last5.push("E");
              } else if (
                (redGoals > blueGoals && redPlayers.includes(id)) ||
                (blueGoals > redGoals && bluePlayers.includes(id))
              ) {
                stats[id].last5.push("V");
              } else {
                stats[id].last5.push("D");
              }
            } else {
              // No jugó → Ausente
              stats[id].last5.push("A");
            }
          });
        });



        // 5️⃣ Calcular diferencia y puntos
        Object.values(stats).forEach((s) => {
          s.diff = s.gf - s.gc;
          s.points = s.wins * 3 + s.draws;
          s.last5 = s.last5.slice(-5); // solo últimos 5 partidos
        });

        // 6️⃣ Convertir a array
        const merged = Object.values(stats);

        // 7️⃣ Ordenar por puntos, diferencia, nombre
        merged.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.diff !== a.diff) return b.diff - a.diff;
          return a.name.localeCompare(b.name);
        });

        // 8️⃣ Numerar posiciones
        merged.forEach((p, i) => (p.position = i + 1));

        setRows(merged);
      }
    );

    return () => unsub();
  }, []);

  // Columnas de la tabla
  const columns = [
    { field: "position", headerName: "#", width: 55, headerAlign: "left", align: "center" },

    {
      field: "card",
      headerName: "T",
      width: 50,
      align: "center",
      headerAlign: "center",
      renderCell: (p) => {
        if (p.row.card === "yellow") return "🟨";
        if (p.row.card === "red") return "🟥";
        return "–";
      }
    },


    { field: "name", headerName: "JUGADOR", width: 165, headerAlign: "left", align: "left" },

    { field: "points", headerName: "PTS", width: 65, type: "number", headerAlign: "left", align: "center" },

    { field: "wins", headerName: "PG", width: 55, type: "number", headerAlign: "left", align: "center" },
    { field: "draws", headerName: "PE", width: 55, type: "number", headerAlign: "left", align: "center" },
    { field: "losses", headerName: "PP", width: 55, type: "number", headerAlign: "left", align: "center" },

    { field: "diff", headerName: "DG+", width: 60, type: "number", headerAlign: "left", align: "center" },

    {
      field: "played",
      headerName: "PJ",
      width: 55,
      type: "number",
      headerAlign: "left",
      align: "center",
      valueGetter: (params) => {
        const row = params?.row ?? {};
        return (row.wins ?? 0) + (row.draws ?? 0) + (row.losses ?? 0);
      }
    },

    {
      field: "last5",
      headerName: "ÚLTIMAS 5",
      width: 160,
      renderCell: (p) => (
        <div style={{ display: "flex", gap: "4px" }}>
          {p.row.last5?.slice().reverse().map((r, i) => (
            <span
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                background:
                  r === "V" ? "green" :
                  r === "D" ? "red" :
                  r === "E" ? "yellow" :
                  "#666",
                color: r === "E" ? "#000" : "#fff"
              }}
            >
              {r}
            </span>
          ))}
        </div>
      )
    },
  ];



  return (
    <div style={{ width: "100%", textAlign: "center", marginTop: 20 }}>
      
      <h2 style={{ color: "#2ecc71", marginBottom: 15 }}>
        CLAUSURA 25 - Tabla de Posiciones
      </h2>

      <div
        style={{
          height: 650,
          width: 850,
          margin: "0 auto",
          padding: "5px 0",
          borderRadius: "12px",
          overflow: "hidden"
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter={false}
          sx={{
            fontSize: "14px",
            background: "#0f2619",
            color: "#d6ffd6",
            borderRadius: "10px",
            border: "1px solid #194d34",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#0a3a24",
              color: "#d6ffd6",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              borderBottom: "1px solid #194d34",
              height: 42
            },

            "& .MuiDataGrid-row": {
              backgroundColor: "#11301f",
              height: 38,
            },

            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#10281b",
            },

            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#174a2f",
              cursor: "pointer",
            },

            "& .MuiDataGrid-cell": {
              borderColor: "#194d34",
              padding: "4px 8px",
            },

            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#0a3a24",
              borderTop: "1px solid #194d34",
              color: "#fff",
              fontSize: "12px"
            },
          }}
        />
      </div>
    </div>
  );

}

export default Clausura25;
