// Palmares.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Box, Typography, Stack, Paper, Divider } from "@mui/material";
import { db } from "../firebase.js";

/* ================= Helpers ================= */

function formatTournament(id) {
  return id
    .replace("_summary", "")
    .replace(/([a-z]+)(\d+)/i, (_, t, y) =>
      `${t.charAt(0).toUpperCase() + t.slice(1)} ${y}`
    );
}

function normName(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

const TOURNAMENT_ORDER = [
  "Clausura 22",
  "Verano 23",
  "Apertura 23",
  "Clausura 23",
  "Apertura 24",
  "Clausura 24",
  "Verano 24",
  "Apertura 25",
  "Clausura 25",
];

/* ================= Component ================= */

export default function Palmares() {
  const [champions, setChampions] = useState([]);
  const [relegated, setRelegated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllChampions, setShowAllChampions] = useState(false);
  const [showAllRelegated, setShowAllRelegated] = useState(false);

  useEffect(() => {
    loadPalmares();
  }, []);

  async function loadPalmares() {
    setLoading(true);

    const playersRootSnap = await getDocs(collection(db, "players"));
    const playerIdByName = {};
    playersRootSnap.docs.forEach((d) => {
      const data = d.data();
      if (data?.name) {
        playerIdByName[normName(data.name)] = d.id;
      }
    });

    const tournamentsSnap = await getDocs(collection(db, "tournaments"));

    const championsMap = {};
    const relegatedMap = {};

    const summaryDocs = tournamentsSnap.docs.filter((d) =>
      d.id.endsWith("_summary")
    );

    await Promise.all(
      summaryDocs.map(async (docSnap) => {
        const tournamentName = formatTournament(docSnap.id);

        const playersRef = collection(
          db,
          "tournaments",
          docSnap.id,
          "players"
        );
        const promediosRef = collection(
          db,
          "tournaments",
          docSnap.id,
          "promedios"
        );

        /* ========= CAMPEÓN ========= */
        const championQuery = query(playersRef, where("campeon", "==", true));

        const [championSnap, promediosSnap] = await Promise.all([
          getDocs(championQuery),
          getDocs(promediosRef),
        ]);

        championSnap.forEach((p) => {
          const data = p.data();
          const name = data?.name ?? "Sin nombre";
          const key = normName(name);
          const realId = playerIdByName[key] || null;

          if (!championsMap[key]) {
            championsMap[key] = {
              id: realId,
              name,
              titles: [],
            };
          }

          if (!championsMap[key].id && realId) {
            championsMap[key].id = realId;
          }

          championsMap[key].titles.push(tournamentName);
        });

        /* ========= DESCENDIDOS ========= */
        promediosSnap.forEach((p) => {
          const data = p.data();
          if (!data?.descended) return;

          const key = normName(data.name);
          const realId = playerIdByName[key] || null;

          if (!relegatedMap[key]) {
            relegatedMap[key] = {
              id: realId,
              name: data.name,
              tournaments: [],
            };
          }

          if (!relegatedMap[key].id && realId) {
            relegatedMap[key].id = realId;
          }

          relegatedMap[key].tournaments.push(tournamentName);
        });
      })
    );

    Object.values(championsMap).forEach((p) =>
      p.titles.sort(
        (a, b) => TOURNAMENT_ORDER.indexOf(b) - TOURNAMENT_ORDER.indexOf(a)
      )
    );

    Object.values(relegatedMap).forEach((p) =>
      p.tournaments.sort(
        (a, b) => TOURNAMENT_ORDER.indexOf(b) - TOURNAMENT_ORDER.indexOf(a)
      )
    );

    setChampions(
      Object.values(championsMap).sort((a, b) => {
        if (b.titles.length !== a.titles.length) {
          return b.titles.length - a.titles.length;
        }

        const lastA = TOURNAMENT_ORDER.indexOf(a.titles[0]);
        const lastB = TOURNAMENT_ORDER.indexOf(b.titles[0]);

        return lastB - lastA;
      })
    );

    setRelegated(
      Object.values(relegatedMap).sort((a, b) => {
        if (b.tournaments.length !== a.tournaments.length) {
          return b.tournaments.length - a.tournaments.length;
        }

        const lastA = TOURNAMENT_ORDER.indexOf(a.tournaments[0]);
        const lastB = TOURNAMENT_ORDER.indexOf(b.tournaments[0]);

        return lastB - lastA;
      })
    );

    setLoading(false);
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ================= CAMPEONES ================= */}
      <Typography
        sx={{
          fontFamily: "Bebas Neue",
          fontSize: "28px",
          letterSpacing: "1px",
          color: "white",
          marginBottom: "10px",
          borderBottom: "2px solid rgba(255,255,255,0.15)",
          paddingBottom: "6px",
          textAlign: "center",
        }}
      >
        CAMPEONES
      </Typography>

      {loading && (
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "Bebas Neue",
            fontSize: "16px",
            letterSpacing: "2px",
            opacity: 0.6,
            mb: 2,
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        >
          CARGANDO RESULTADOS
        </Typography>
      )}

      <Stack spacing={2} alignItems="center">
        {!loading &&
          (showAllChampions ? champions : champions.slice(0, 3)).map(
            (player) => (
              <Paper
                key={`champ-${player.name}`}
                sx={{ p: 2, width: "100%", maxWidth: 275 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      minWidth: 90,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={
                        player.id
                          ? `/players/${player.id}.jpg`
                          : "/players/default.jpg"
                      }
                      alt={player.name}
                      width={50}
                      height={50}
                      style={{
                        borderRadius: 6,
                        objectFit: "cover",
                        marginBottom: 6,
                      }}
                      onError={(e) => {
                        e.target.src = "/players/default.jpg";
                      }}
                    />
                    <Typography fontWeight="bold">
                      {player.name} ({player.titles.length})
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Stack spacing={0.2} alignItems="center">
                      {player.titles.map((t) => (
                        <Typography
                          key={`title-${player.name}-${t}`}
                          variant="body2"
                          sx={{ fontWeight: 700 }}
                        >
                          {t}{" "}
                          <span
                            style={{
                              color: t.includes("Verano")
                                ? "#C0C0C0"
                                : "#FFD700",
                              fontWeight: 700,
                              marginLeft: "4px",
                              fontSize: "16px",
                            }}
                          >
                            ★
                          </span>
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            )
          )}
      </Stack>

      {!loading && champions.length > 3 && !showAllChampions && (
        <Typography
          sx={{
            margin: "16px auto 0",
            padding: "10px 26px",
            display: "block",
            width: "fit-content",
            textAlign: "center",
            fontFamily: "Bebas Neue",
            fontSize: "18px",
            letterSpacing: "2px",
            cursor: "pointer",
            color: "#ffffff",
            background: "#1d2024",
            borderRadius: "999px",
            transition: "transform 0.2s ease, opacity 0.2s ease",
            userSelect: "none",
          }}
          onClick={() => setShowAllChampions(true)}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.opacity = "0.85";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.opacity = "1";
          }}
        >
          VER MÁS
        </Typography>
      )}

      <Divider sx={{ my: 4 }} />

      {/* ================= DESCENDIDOS ================= */}
      <Typography
        sx={{
          fontFamily: "Bebas Neue",
          fontSize: "28px",
          letterSpacing: "1px",
          color: "white",
          marginBottom: "10px",
          borderBottom: "2px solid rgba(255,255,255,0.15)",
          paddingBottom: "6px",
          textAlign: "center",
        }}
      >
        DESCENDIDOS
      </Typography>

      {loading && (
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "Bebas Neue",
            fontSize: "16px",
            letterSpacing: "2px",
            opacity: 0.6,
            mb: 2,
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        >
          CARGANDO RESULTADOS
        </Typography>
      )}

      <Stack spacing={2} alignItems="center">
        {!loading &&
          (showAllRelegated ? relegated : relegated.slice(0, 3)).map(
            (player) => (
              <Paper
                key={`rel-${player.name}`}
                sx={{ p: 2, width: "100%", maxWidth: 275 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      minWidth: 90,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={
                        player.id
                          ? `/players/${player.id}.jpg`
                          : "/players/default.jpg"
                      }
                      alt={player.name}
                      width={50}
                      height={50}
                      style={{
                        borderRadius: 6,
                        objectFit: "cover",
                        marginBottom: 6,
                      }}
                      onError={(e) => {
                        e.target.src = "/players/default.jpg";
                      }}
                    />
                    <Typography fontWeight="bold">
                      {player.name} ({player.tournaments.length})
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Stack spacing={0.4} alignItems="center">
                      {player.tournaments.map((t) => (
                        <Typography
                          key={`rel-${player.name}-${t}`}
                          variant="body2"
                        >
                          {t} 📉
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            )
          )}
      </Stack>

      {!loading && relegated.length > 3 && !showAllRelegated && (
        <Typography
          sx={{
            margin: "16px auto 0",
            padding: "10px 26px",
            display: "block",
            width: "fit-content",
            textAlign: "center",
            fontFamily: "Bebas Neue",
            fontSize: "18px",
            letterSpacing: "2px",
            cursor: "pointer",
            color: "#ffffff",
            background: "#1d2024",
            borderRadius: "999px",
            transition: "transform 0.2s ease, opacity 0.2s ease",
            userSelect: "none",
          }}
          onClick={() => setShowAllRelegated(true)}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.opacity = "0.85";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.opacity = "1";
          }}
        >
          VER MÁS
        </Typography>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 0.8; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </Box>
  );
}
