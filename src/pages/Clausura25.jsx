import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs, doc, getDoc } from "firebase/firestore";
import TablaTemplate from "./TablaTemplate"; // ← IMPORTANTE

function Clausura25() {
  const [rows, setRows] = useState([]);
  const [promRows, setPromRows] = useState([]);
  const [cl25Total, setCl25Total] = useState(0);

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
            card: null,
            cardUntil: null,
          };
        });

        // 4️⃣ Procesar cada partido (ordenados por fecha)
        matches.sort((a, b) => a.matchday - b.matchday);

        matches.forEach((match) => {
          const redGoals = match.red.goals;
          const blueGoals = match.blue.goals;
          const redPlayers = match.red.players || [];
          const bluePlayers = match.blue.players || [];

          // Tarjetas
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

          // Goles
          redPlayers.forEach((id) => {
            stats[id].gf += redGoals;
            stats[id].gc += blueGoals;
          });

          bluePlayers.forEach((id) => {
            stats[id].gf += blueGoals;
            stats[id].gc += redGoals;
          });

          // Resultado
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

          // Last 5
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
              stats[id].last5.push("A");
            }
          });
        });

        // 5️⃣ Puntos y diferencia
        Object.values(stats).forEach((s) => {
          s.diff = s.gf - s.gc;
          s.points = s.wins * 3 + s.draws;
          s.last5 = s.last5.slice(-5);
        });

        // 6️⃣ Convertir a array
        const merged = Object.values(stats);

        // 7️⃣ Ordenar Clausura
        merged.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.diff !== a.diff) return b.diff - a.diff;
          return a.name.localeCompare(b.name);
        });

        // 8️⃣ Numerar posiciones Clausura
        merged.forEach((p, i) => (p.position = i + 1));

        setRows(merged);

        // Total fechas Clausura
        const cl25_total =
          matches.length > 0
            ? Number(Math.max(...matches.map((m) => m.matchday || 0)))
            : 0;

        setCl25Total(cl25_total);

        // ========================================================
        // >>>>>>   TABLA DE PROMEDIOS (TV24 + AP25 + CL25)  <<<<<<
        // ========================================================

        // Verano 24
        const veranoDoc = await getDoc(doc(db, "tournaments", "verano24_summary"));
        const tv24_total = veranoDoc.exists()
          ? Number(veranoDoc.data().totalMatchdays || 0)
          : 0;

        // Apertura 25
        const aperturaDoc = await getDoc(doc(db, "tournaments", "apertura25_summary"));
        const ap25_total = aperturaDoc.exists()
          ? Number(aperturaDoc.data().totalMatchdays || 0)
          : 0;

        // Puntos Verano 24
        const veranoSnap = await getDocs(
          collection(db, "tournaments", "verano24_summary", "players")
        );

        const veranoStats = {};
        const veranoPlayers = new Set();

        veranoSnap.docs.forEach((d) => {
          const x = d.data();
          veranoStats[x.name] = x.pts;
          veranoPlayers.add(x.name);
        });

        // Puntos Apertura 25
        const aperturaSnap = await getDocs(
          collection(db, "tournaments", "apertura25_summary", "players")
        );

        const aperturaStats = {};
        const aperturaPlayers = new Set();

        aperturaSnap.docs.forEach((d) => {
          const x = d.data();
          aperturaStats[x.name] = x.pts;
          aperturaPlayers.add(x.name);
        });

        // TABLA DE PROMEDIOS
        const promList = merged.map((p) => {
          const name = p.name;

          const tv24_pts = veranoStats[name] || 0;
          const ap25_pts = aperturaStats[name] || 0;
          const cl25_pts = p.points;

          const jugoCl25 = p.wins + p.draws + p.losses > 0;
          const cl25_pj = jugoCl25 ? cl25_total : 0;

          const pj =
            (veranoPlayers.has(name) ? tv24_total : 0) +
            (aperturaPlayers.has(name) ? ap25_total : 0) +
            cl25_pj;

          const totalPts = tv24_pts + ap25_pts + cl25_pts;

          const prom = pj > 0 ? Number((totalPts / pj).toFixed(3)) : 0;

          return {
            id: p.id,
            name,
            tv24_pts,
            ap25_pts,
            cl25_pts,
            pj,
            prom,
          };
        });

        promList.sort((a, b) => b.prom - a.prom);

        promList.forEach((x, i) => {
          x.position = i + 1;
          x.isLast4 = i >= promList.length - 4;
        });

        setPromRows(promList);
      }
    );

    return () => unsub();
  }, []);

  // Columnas Clausura
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
      },
    },
    { field: "name", headerName: "JUGADOR", width: 165, align: "left" },
    { field: "points", headerName: "PTS", width: 65, align: "center" },
    { field: "wins", headerName: "PG", width: 55, align: "center" },
    { field: "draws", headerName: "PE", width: 55, align: "center" },
    { field: "losses", headerName: "PP", width: 55, align: "center" },
    { field: "diff", headerName: "DG+", width: 60, align: "center" },
    {
      field: "played",
      headerName: "PJ",
      width: 55,
      align: "center",
      valueGetter: (params) => {
        const row = params?.row ?? {};
        return (row.wins ?? 0) + (row.draws ?? 0) + (row.losses ?? 0);
      },
    },
    {
      field: "last5",
      headerName: "ÚLTIMAS 5",
      width: 160,
      renderCell: (p) => (
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
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
                color: r === "E" ? "#000" : "#fff",
              }}
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
  ];

  // Columnas Promedios
  const promColumns = [
    { field: "position", headerName: "#", width: 55, align: "center" },
    { field: "name", headerName: "JUGADOR", width: 165 },
    { field: "tv24_pts", headerName: "TV24", width: 70, align: "center" },
    { field: "ap25_pts", headerName: "AP25", width: 70, align: "center" },
    { field: "cl25_pts", headerName: "CL25", width: 70, align: "center" },
    { field: "pj", headerName: "PJ", width: 70, align: "center" },
    { field: "prom", headerName: "PROM", width: 90, align: "center" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "50px",
        width: "100%",
        marginTop: 20,
      }}
    >

      {/* TABLA CLAUSURA */}
      <TablaTemplate
        title={`POSICIONES / FECHA ${cl25Total} DE 18`}
        rows={rows}
        columns={columns}
        height={650}
      />

      {/* TABLA PROMEDIOS */}
      <TablaTemplate
        title="TABLA DE PROMEDIOS"
        rows={promRows}
        columns={promColumns}
        height={650}
        getRowClassName={(params) =>
          params.row.isLast4 ? "last4-row" : ""
        }
      />

    </div>
  );
}

export default Clausura25;
