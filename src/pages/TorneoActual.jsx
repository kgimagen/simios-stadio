import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import TablaTemplate from "./TablaTemplate";


const TORNEO_ACTUAL = "verano25";
const TOTAL_FECHAS = 10;


function TorneoActual() {
  const [rows, setRows] = useState([]);
  const [promRows, setPromRows] = useState([]);
  const [cl25Total, setCl25Total] = useState(0);
  const [resultRows, setResultRows] = useState([]);

  // datos crudos
  const [allMatches, setAllMatches] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);

  // fecha que se está viendo (null = última)
  const [viewMatchday, setViewMatchday] = useState(null);

  const [loading, setLoading] = useState(true);

  
  // Cargar partidos + jugadores desde Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "tournaments", TORNEO_ACTUAL, "matches"),
      async (snapshot) => {
        const matches = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Ordenamos por fecha por las dudas
        matches.sort((a, b) => (a.matchday || 0) - (b.matchday || 0));

        const playersSnap = await getDocs(collection(db, "players"));
        const players = playersSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setAllMatches(matches);
        setAllPlayers(players);

        const cl25_total =
          matches.length > 0
            ? Number(
                Math.max(
                  ...matches.map((m) =>
                    m.matchday != null ? m.matchday : 0
                  )
                )
              )
            : 0;

        setCl25Total(cl25_total);
      }
    );

    return () => unsub();
  }, []);

  // Recalcular tablas cuando cambian partidos, jugadores o fecha vista
  useEffect(() => {
    const run = async () => {
      if (allMatches.length === 0 || allPlayers.length === 0) {
        setRows([]);
        setPromRows([]);
        setResultRows([]);
        return;
      }

      if (!cl25Total) {
        setRows([]);
        setPromRows([]);
        setResultRows([]);
        return;
      }

      // fecha que se muestra
      const currentMatchday = viewMatchday ?? cl25Total;

      // Partidos hasta esa fecha (inclusive)
      const matches = allMatches.filter(
        (m) => (m.matchday || 0) <= currentMatchday
      );

      // ===== 3️⃣ Inicializar estadísticas por jugador (Clausura) =====
      const stats = {};
      allPlayers.forEach((p) => {
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

      // ===== 4️⃣ Procesar cada partido (ordenados por fecha) =====
      matches.sort((a, b) => (a.matchday || 0) - (b.matchday || 0));

      matches.forEach((match) => {
        const redGoals = match.red?.goals ?? 0;
        const blueGoals = match.blue?.goals ?? 0;

        const rawRedPlayers = match.red?.players || [];
        const rawBluePlayers = match.blue?.players || [];

        function normalizePlayers(arr) {
          return arr
            .map((val) => {
              const raw = String(val).trim();
              if (stats[raw]) return raw;
              return null;
            })
            .filter(Boolean);
        }

        const redIds = normalizePlayers(rawRedPlayers);
        const blueIds = normalizePlayers(rawBluePlayers);

        // Tarjetas
        if (Array.isArray(match.cards)) {
          match.cards.forEach((card) => {
            if (!card?.playerId || !stats[card.playerId]) return;

            if (card.type === "yellow") {
              stats[card.playerId].card = "yellow";
            }

            if (card.type === "red") {
              stats[card.playerId].card = "red";
              stats[card.playerId].cardUntil =
                (match.matchday || 0) + (card.matches || 1);
            }
          });
        }

        // Goles a favor / en contra (con protección)
        redIds.forEach((id) => {
          if (!stats[id]) return;
          stats[id].gf += redGoals;
          stats[id].gc += blueGoals;
        });

        blueIds.forEach((id) => {
          if (!stats[id]) return;
          stats[id].gf += blueGoals;
          stats[id].gc += redGoals;
        });

        // Resultado (con protección)
        if (redGoals > blueGoals) {
          redIds.forEach((id) => {
            if (!stats[id]) return;
            stats[id].wins++;
          });
          blueIds.forEach((id) => {
            if (!stats[id]) return;
            stats[id].losses++;
          });
        } else if (redGoals < blueGoals) {
          blueIds.forEach((id) => {
            if (!stats[id]) return;
            stats[id].wins++;
          });
          redIds.forEach((id) => {
            if (!stats[id]) return;
            stats[id].losses++;
          });
        } else {
          redIds.forEach((id) => {
            if (!stats[id]) return;
            stats[id].draws++;
          });
          blueIds.forEach((id) => {
            if (!stats[id]) return;
            stats[id].draws++;
          });
        }


        // Last 5
        Object.keys(stats).forEach((id) => {
          const jugo = redIds.includes(id) || blueIds.includes(id);
          if (jugo) {
            if (redGoals === blueGoals) {
              stats[id].last5.push("E");
            } else if (
              (redGoals > blueGoals && redIds.includes(id)) ||
              (blueGoals > redGoals && blueIds.includes(id))
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

      // 5️⃣ Puntos, diferencia, PJ
      Object.values(stats).forEach((s) => {
        s.diff = s.gf - s.gc;
        s.points = s.wins * 3 + s.draws;
        s.last5 = s.last5.slice(-5);
        s.played = s.wins + s.draws + s.losses;
      });

      // 6️⃣ Convertir a array
      const merged = Object.values(stats);

      // 7️⃣ Ordenar Clausura
      merged.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.diff !== a.diff) return b.diff - a.diff;
        return a.name.localeCompare(b.name);
      });

      // 8️⃣ Posición Clausura
      merged.forEach((p, i) => {
        p.position = i + 1;
      });

      // ================================
      // POSICIÓN ANTERIOR & VARIACIÓN (Clausura)
      // ================================
      const prevPositions = {};

      if (currentMatchday > 1) {
        const prevMatches = allMatches.filter(
          (m) => (m.matchday || 0) < currentMatchday
        );

        const prevStats = {};
        allPlayers.forEach((p) => {
          prevStats[p.id] = {
            id: p.id,
            name: p.name ?? "Jugador",
            wins: 0,
            draws: 0,
            losses: 0,
            gf: 0,
            gc: 0,
          };
        });

        prevMatches.forEach((match) => {
          const redGoals = match.red?.goals ?? 0;
          const blueGoals = match.blue?.goals ?? 0;

          const rawRedPlayers = match.red?.players || [];
          const rawBluePlayers = match.blue?.players || [];

          const redIds = rawRedPlayers
            .map((val) => {
              const raw = String(val).trim();
              if (prevStats[raw]) return raw;
              return null;
            })
            .filter(Boolean);

          const blueIds = rawBluePlayers
            .map((val) => {
              const raw = String(val).trim();
              if (prevStats[raw]) return raw;
              return null;
            })
            .filter(Boolean);

          redIds.forEach((id) => {
            if (!prevStats[id]) return;
            prevStats[id].gf += redGoals;
            prevStats[id].gc += blueGoals;
          });

          blueIds.forEach((id) => {
            if (!prevStats[id]) return;
            prevStats[id].gf += blueGoals;
            prevStats[id].gc += redGoals;
          });

          if (redGoals > blueGoals) {
            redIds.forEach((id) => prevStats[id].wins++);
            blueIds.forEach((id) => prevStats[id].losses++);
          } else if (blueGoals > redGoals) {
            blueIds.forEach((id) => prevStats[id].wins++);
            redIds.forEach((id) => prevStats[id].losses++);
          } else {
            redIds.forEach((id) => prevStats[id].draws++);
            blueIds.forEach((id) => prevStats[id].draws++);
          }
        });

        const prevArray = Object.values(prevStats).map((s) => ({
          ...s,
          points: s.wins * 3 + s.draws,
          diff: s.gf - s.gc,
        }));

        prevArray.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.diff !== a.diff) return b.diff - a.diff;
          return a.name.localeCompare(b.name);
        });

        prevArray.forEach((p, i) => {
          prevPositions[p.id] = i + 1;
        });
      }

      merged.forEach((p) => {
        const prev = prevPositions[p.id];

        if (!prev) {
          p.trend = "same";
        } else if (prev > p.position) {
          p.trend = "up";
        } else if (prev < p.position) {
          p.trend = "down";
        } else {
          p.trend = "same";
        }
      });

      // ========================================================
      // TABLA RESULTADOS (hasta fecha vista)
      // ========================================================
      const resultsMapped = matches.map((m) => {
        const redCapFound = allPlayers.find(
          (p) => p.id === m.red?.captain || p.name === m.red?.captain
        );
        const blueCapFound = allPlayers.find(
          (p) => p.id === m.blue?.captain || p.name === m.blue?.captain
        );

        const redCap = redCapFound?.name || m.red?.captain || "-";
        const blueCap = blueCapFound?.name || m.blue?.captain || "-";

        return {
          id: m.id,
          matchday: m.matchday,
          capRed: redCap,
          capBlue: blueCap,
          capRedId: redCapFound?.id || "default",
          capBlueId: blueCapFound?.id || "default",

          scoreRed: m.red?.goals ?? 0,
          scoreBlue: m.blue?.goals ?? 0,

          score: `${m.red?.goals ?? 0} - ${m.blue?.goals ?? 0}`,
        };


      });

      resultsMapped.reverse();
      // ========================================================
      // TABLA DE PROMEDIOS (AP25 + CL25 + TV25 hasta fecha vista)
      // ========================================================

      // Apertura 25 (summary)
      const aperturaDoc = await getDoc(
        doc(db, "tournaments", "apertura25_summary")
      );
      const ap25_total = aperturaDoc.exists()
        ? Number(aperturaDoc.data().totalMatchdays || 0)
        : 0;

      // Clausura 25 (summary)
      const clausuraDoc = await getDoc(
        doc(db, "tournaments", "clausura25_summary")
      );
      const cl25_total = clausuraDoc.exists()
        ? Number(clausuraDoc.data().totalMatchdays || 0)
        : 0;

      // Torneo actual TV25 (verano25)
      const tv25Doc = await getDoc(
        doc(db, "tournaments", TORNEO_ACTUAL)
      );
      const tv25_total = tv25Doc.exists()
        ? Number(tv25Doc.data().totalMatchdays || 0)
        : 0;

      // Puntos AP25 (summary/players)
      const aperturaSnap = await getDocs(
        collection(db, "tournaments", "apertura25_summary", "players")
      );
      const aperturaStats = {};
      aperturaSnap.docs.forEach((d) => {
        const x = d.data();
        aperturaStats[x.name] = Number(x.pts || 0);
      });

      // Puntos CL25 (summary/players)
      const clausuraSnap = await getDocs(
        collection(db, "tournaments", "clausura25_summary", "players")
      );
      const clausuraStats = {};
      clausuraSnap.docs.forEach((d) => {
        const x = d.data();
        clausuraStats[x.name] = Number(x.pts || 0);
      });

      // TABLA DE PROMEDIOS (actual)
      const promList = merged.map((p) => {
        const name = p.name;

        const ap25_pts = aperturaStats[name] || 0;
        const cl25_pts = clausuraStats[name] || 0;
        const tv25_pts = p.points; // puntos del torneo actual (hasta fecha vista)

        let pj = 0;

        // AP25 → solo si tuvo puntos
        if (ap25_pts > 0) {
          pj += ap25_total;
        }

        // CL25 → solo si tuvo puntos
        if (cl25_pts > 0) {
          pj += cl25_total;
        }

        // TV25 → siempre suma
        pj += currentMatchday;



        const totalPts = ap25_pts + cl25_pts + tv25_pts;
        const prom = pj > 0 ? Number((totalPts / pj).toFixed(3)) : 0;

        return {
          id: p.id,
          name,
          ap25_pts,
          cl25_pts,
          tv25_pts,
          pj,
          prom,
        };
      });


      // ================================
      // POSICIÓN ANTERIOR EN PROMEDIOS
      // ================================
      let prevProm = {};

      if (currentMatchday > 1) {
        const prevMatchesProm = allMatches.filter(
          (m) => (m.matchday || 0) < currentMatchday
        );

        const prevStatsProm = {};
        allPlayers.forEach((p) => {
          prevStatsProm[p.id] = {
            id: p.id,
            name: p.name ?? "Jugador",
            wins: 0,
            draws: 0,
            losses: 0,
            gf: 0,
            gc: 0,
          };
        });

        prevMatchesProm.forEach((match) => {
          const redGoals = match.red?.goals ?? 0;
          const blueGoals = match.blue?.goals ?? 0;

          const redIds = match.red?.players ?? [];
          const blueIds = match.blue?.players ?? [];

          redIds.forEach((id) => {
            if (!prevStatsProm[id]) return;
            prevStatsProm[id].gf += redGoals;
            prevStatsProm[id].gc += blueGoals;
          });
          blueIds.forEach((id) => {
            if (!prevStatsProm[id]) return;
            prevStatsProm[id].gf += blueGoals;
            prevStatsProm[id].gc += redGoals;
          });

          if (redGoals > blueGoals) {
            redIds.forEach((id) => {
              if (!prevStatsProm[id]) return;
              prevStatsProm[id].wins++;
            });
            blueIds.forEach((id) => {
              if (!prevStatsProm[id]) return;
              prevStatsProm[id].losses++;
            });
          } else if (blueGoals > redGoals) {
            blueIds.forEach((id) => {
              if (!prevStatsProm[id]) return;
              prevStatsProm[id].wins++;
            });
            redIds.forEach((id) => {
              if (!prevStatsProm[id]) return;
              prevStatsProm[id].losses++;
            });
          } else {
            redIds.forEach((id) => {
              if (!prevStatsProm[id]) return;
              prevStatsProm[id].draws++;
            });
            blueIds.forEach((id) => {
              if (!prevStatsProm[id]) return;
              prevStatsProm[id].draws++;
            });
          }

        });

        const prevMergedProm = Object.values(prevStatsProm).map((s) => ({
          ...s,
          points: s.wins * 3 + s.draws,
          diff: s.gf - s.gc,
        }));

        prevMergedProm.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.diff !== a.diff) return b.diff - a.diff;
          return a.name.localeCompare(b.name);
        });

        const prevPromList = prevMergedProm.map((p) => {
          const name = p.name;

          const ap25_pts = aperturaStats[name] || 0;
          const cl25_pts = clausuraStats[name] || 0;
          const tv25_pts = p.points; // puntos del torneo actual hasta (currentMatchday - 1)

          const pj = ap25_total + cl25_total + (currentMatchday - 1);


          const totalPts = ap25_pts + cl25_pts + tv25_pts;
          const prom = pj > 0 ? Number((totalPts / pj).toFixed(3)) : 0;

          return { name, prom };
        });


        prevPromList.sort((a, b) => b.prom - a.prom);

        prevPromList.forEach((p, i) => {
          prevProm[p.name] = i + 1;
        });
      }

      // ORDENAR PROMEDIOS
      promList.sort((a, b) => b.prom - a.prom);

      // POSICIÓN ACTUAL + últimos 4
      promList.forEach((x, i) => {
        x.position = i + 1;
        x.isLast4 = i >= promList.length - 4;
      });

      // TENDENCIA EN PROMEDIOS
      promList.forEach((p) => {
        const prev = prevProm[p.name];

        if (!prev) p.trendProm = "same";
        else if (prev > p.position) p.trendProm = "up";
        else if (prev < p.position) p.trendProm = "down";
        else p.trendProm = "same";
      });

      // ===========================================
      // ULTIMOS 4 EN POSICIONES (excluyendo Promedios)
      // ===========================================
      const last4PromNames = new Set(
        promList.slice(-4).map((p) => p.name)
      );

      const posicionesFiltered = merged.slice().reverse();

      const posicionesLast4 = [];
      for (const p of posicionesFiltered) {
        if (!last4PromNames.has(p.name)) {
          posicionesLast4.push(p.id);
          if (posicionesLast4.length === 4) break;
        }
      }

      merged.forEach((p) => {
        p.isLast4pos = posicionesLast4.includes(p.id);
      });

      // Actualizar estados
      setRows(merged);
      setPromRows(promList);
      setResultRows(resultsMapped);
      setLoading(false);
    };

    run();
  }, [allMatches, allPlayers, viewMatchday, cl25Total]);

  // ===========================
  // Columnas Clausura
  // ===========================
  const columns = [
    {
      field: "position",
      headerName: "#",
      width: 40,
      align: "center",
      renderCell: (params) => `${params.row.position}.`,
    },
    {
      field: "name",
      headerName: "JUGADOR",
      width: 230,
      align: "left",
      renderCell: (params) => {
        const playerId = params.row.id;
        const url = `/players/${playerId}.jpg`;

        const isLast4 = params.row.isLast4pos;
        const card = params.row.card;

        // iconos: tarjetas + últimos 4
        let icons = "";
        if (card === "yellow") icons += "🟨";
        if (card === "red") icons += "🟥";
        if (isLast4) icons += "📉";

        // flecha de tendencia
        const trend = params.row.trend;
        let arrow = "=";
        let arrowColor = "#cccccc";

        if (trend === "up") {
          arrow = "▲";
          arrowColor = "#00ff55";
        } else if (trend === "down") {
          arrow = "▼";
          arrowColor = "#ff4444";
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            
            {/* FLECHA PRIMERO */}
            <span
              style={{
                color: arrowColor,
                fontWeight: 700,
                fontSize: 16,
                width: 18,
                textAlign: "center",
              }}
            >
              {arrow}
            </span>

            {/* FOTO */}
            <img
              src={url}
              alt={params.row.name}
              style={{
                width: 65,
                height: 45,
                borderRadius: 4,
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = "/players/default.jpg";
              }}
            />

            {/* NOMBRE + ICONOS */}
            <span>
              {params.row.name}
              {icons && <span style={{ marginLeft: 5 }}>{icons}</span>}
            </span>

          </div>
        );
      },

    },



    { field: "points", headerName: "PTS", width: 40, align: "center" },
    { field: "wins", headerName: "PG", width: 40, align: "center" },
    { field: "draws", headerName: "PE", width: 40, align: "center" },
    { field: "losses", headerName: "PP", width: 40, align: "center" },
    { field: "diff", headerName: "DG+", width: 40, align: "center" },
    {
      field: "played",
      headerName: "PJ",
      width: 40,
      align: "center",
    },

    {
      field: "last5",
      headerName: "ÚLTIMAS 5",
      width: 140,
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
          {p.row.last5
            ?.slice()
            .reverse()
            .map((r, i) => (
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
                    r === "V"
                      ? "green"
                      : r === "D"
                      ? "red"
                      : r === "E"
                      ? "yellow"
                      : "#666",
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

  // ===========================
  // Columnas Promedios
  // ===========================
  const promColumns = [
    {
      field: "position",
      headerName: "#",
      width: 55,
      align: "center",
      renderCell: (params) => `${params.row.position}.`,
    },

    {
      field: "name",
      headerName: "JUGADOR",
      width: 230,
      align: "left",
      renderCell: (params) => {
        const playerId = params.row.id;
        const url = `/players/${playerId}.jpg`;

        const isLast4 = params.row.isLast4; // último 4 en promedios

        // flecha de tendencia
        const trend = params.row.trendProm;
        let arrow = "=";
        let arrowColor = "#cccccc";

        if (trend === "up") {
          arrow = "▲";
          arrowColor = "#00ff55";
        } else if (trend === "down") {
          arrow = "▼";
          arrowColor = "#ff4444";
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* FLECHA PRIMERO */}
            <span
              style={{
                color: arrowColor,
                fontWeight: 700,
                fontSize: 16,
                width: 18,
                textAlign: "center",
              }}
            >
              {arrow}
            </span>

            {/* FOTO */}
            <img
              src={url}
              alt={params.row.name}
              style={{
                width: 65,
                height: 45,
                borderRadius: 4,
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = "/players/default.jpg";
              }}
            />

            {/* NOMBRE + ICONO ÚLTIMOS 4 */}
            <span>
              {params.row.name}
              {isLast4 && (
                <span style={{ color: "#ff0000", fontSize: 16, marginLeft: 5 }}>
                  📉
                </span>
              )}
            </span>

          </div>
        );
      },
    },

    { field: "ap25_pts", headerName: "AP25", width: 40, align: "center" },
    { field: "cl25_pts", headerName: "CL25", width: 40, align: "center" },
    { field: "tv25_pts", headerName: "TV25", width: 40, align: "center" },
    { field: "pj", headerName: "PJ", width: 40, align: "center" },
    { field: "prom", headerName: "PROM", width: 70, align: "center" },
  ];


  // ===========================
  // Columnas Resultados de Capitanes
  // ===========================
  const resultColumns = [
    {
      field: "matchday",
      headerName: "F",
      width: 30,
      sortable: false,
      align: "center",
      renderCell: (params) => `${params.row.matchday}.`,
    },

    // CAPITÁN EQUIPO ROJO (CON FOTO)
    {
      field: "capRed",
      headerName: "CAPITAN ROJO",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const id = params.row.capRedId;
        const name = params.row.capRed;
        const url = `/players/${id}.jpg`;

        const lost = params.row.scoreRed < params.row.scoreBlue;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={url}
              alt={name}
              style={{
                width: 45,
                height: 35,
                borderRadius: 4,
                objectFit: "cover",
                filter: lost ? "grayscale(100%)" : "none",
                opacity: lost ? 0.5 : 1,
              }}
              onError={(e) => (e.target.src = "/players/default.jpg")}
            />

            <span
              style={{
                opacity: lost ? 0.5 : 1,
              }}
            >
              {name}
            </span>
          </div>
        );
      },
    },




    // CAPITÁN EQUIPO AZUL (CON FOTO)
    {
      field: "capBlue",
      headerName: "CAPITAN AZUL",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const id = params.row.capBlueId;
        const name = params.row.capBlue;
        const url = `/players/${id}.jpg`;

        const lost = params.row.scoreBlue < params.row.scoreRed;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={url}
              alt={name}
              style={{
                width: 45,
                height: 35,
                borderRadius: 4,
                objectFit: "cover",
                filter: lost ? "grayscale(100%)" : "none",
                opacity: lost ? 0.5 : 1,
              }}
              onError={(e) => (e.target.src = "/players/default.jpg")}
            />

            <span
              style={{
                opacity: lost ? 0.5 : 1,
              }}
            >
              {name}
            </span>
          </div>
        );
      },
    },



    {
      field: "score",
      headerName: "RESULTADO",
      width: 100,
      sortable: false,
    },
  ];


  // ===========================
  // Navegación por fechas
  // ===========================
  const shownMatchday = viewMatchday || cl25Total || 0;

  const goPrev = () => {
    if (!cl25Total || shownMatchday === 1) return;
    setLoading(true);
    setViewMatchday(shownMatchday - 1);
  };

  const goNext = () => {
    if (!cl25Total || shownMatchday === cl25Total) return;
    setLoading(true);
    setViewMatchday(shownMatchday + 1);
  };

  return (
    <div className="cl25-root" style={{ scale: "0.85", transformOrigin: "top center" }}>

      {/* HEADER CON IMAGEN */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        {/* LOGO */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src="https://i.ibb.co/8DkLkqD5/somos-balon-pie-png-1.webp"
              alt="Somos Balonpie y Morashop"
              style={{
                width: "400px",
                maxWidth: "90%",
                height: "auto",
                cursor: "pointer",
              }}
            />
          </Link>
        </div>

      </div>

      {/* CONTENEDOR DE LAS 3 TABLAS */}
      <div
        className="cl25-container"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "50px",
          width: "100%",
          marginTop: 20,
        }}
      >

        {/* ============= TABLA POSICIONES ============= */}
        <div className="table-wrapper">

          {/* HEADER FIJO */}
          <TablaTemplate
            title={
              <span className="titulo-tabla">
                TABLA DE POSICIONES 
                <span className="solo-escritorio"> / FECHA {shownMatchday} DE {TOTAL_FECHAS}</span>
                <span className="solo-mobile"><br />FECHA {shownMatchday} DE {TOTAL_FECHAS}</span>
              </span>
            }

            onPrev={goPrev}
            onNext={goNext}
            prevDisabled={shownMatchday === 1}
            nextDisabled={shownMatchday === cl25Total}
            mode="header"
          />


          {/* TABLA SCROLLEABLE */}
          <TablaTemplate
            rows={rows}
            columns={columns}
            height={650}
            loading={loading}
            getRowClassName={(params) => params.row.isLast4pos ? "last4-row" : ""}
            mode="body"
          />
        </div>

        {/* ============= TABLA PROMEDIOS ============= */}
        <div className="table-wrapper">

          <TablaTemplate
            title="PROMEDIOS VERANO 25/26"
            mode="header"
            prevDisabled={true}
            nextDisabled={true}
          />

          <TablaTemplate
            rows={promRows}
            columns={promColumns}
            height={650}
            loading={loading}
            getRowClassName={(params) => params.row.isLast4 ? "last4-row" : ""}
            mode="body"
          />

        </div>

        {/* ============= TABLA RESULTADOS DE CAPITANES ============= */}
        <div className="table-wrapper">

          <TablaTemplate
            title="RESULTADOS DE CAPITANES"
            mode="header"
            prevDisabled={true}
            nextDisabled={true}
          />

          <TablaTemplate
            rows={resultRows}
            columns={resultColumns}
            height={650}
            loading={loading}
            getRowClassName={(params) => {
              const [r, b] = (params.row.score || "0 - 0")
                .split("-")
                .map(n => parseInt(n.trim(), 10));

              if (r > b) return "row-red-win";
              if (b > r) return "row-blue-win";
              return "row-draw";
            }}
            mode="body"
          />

        </div>

      </div>

      {/* ================== ESTILOS RESPONSIVE ================== */}
      <style>
      {`
        @media (max-width: 768px) {

          /* fuerza 100% ancho real */
          div.cl25-root {
            transform: scale(1) !important;
            scale: 1 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .cl25-container {
            flex-direction: column !important;
            align-items: center !important;
            gap: 30px !important;
            width: 100% !important;
          }

          /* wrapper de cada tabla */
          .table-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          /* header fijo */
          .tabla-header-fixed {
            width: 100% !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 20 !important;
            background: #1a1f27 !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          /* cuerpo con scroll */
          .tabla-scroll-body {
            overflow-x: auto !important;
          }
        }

        /* escritorio */
        .table-wrapper {
          overflow-x: visible;
          width: auto;
          padding: 0;
        }
      `}
      </style>

    </div>
  );


}


export default TorneoActual;
