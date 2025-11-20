import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query, getDocs } from "firebase/firestore";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Stack,
  IconButton
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function Historial() {
  const [matches, setMatches] = useState([]);
  const [playersMap, setPlayersMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load players
  useEffect(() => {
    const loadPlayers = async () => {
      const snap = await getDocs(collection(db, "players"));
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        map[d.id] = data.name ?? d.id;
      });
      setPlayersMap(map);
    };
    loadPlayers();
  }, []);

  // Load matches ordered by newest
  useEffect(() => {
    const q = query(
      collection(db, "tournaments", "clausura25", "matches"),
      orderBy("matchday", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMatches(data);
      setCurrentIndex(0);
    });

    return () => unsub();
  }, []);

  const goPrev = () => {
    if (currentIndex < matches.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goNext = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const currentMatch = matches[currentIndex];

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 3, color: "#e2e2e2" }}>
      <h2
        style={{
          background: "#191e25",
          color: "#ffffff",
          fontFamily: "Bebas Neue",
          fontSize: "25px",
          textAlign: "center",
          textTransform: "uppercase",
          padding: "5px 0",
          marginBottom: "15px",
          borderRadius: "8px",
        }}
      >
        Historial de Partidos
      </h2>


      {matches.length === 0 ? (
        <Typography>No hay partidos registrados aún.</Typography>
      ) : (
        <>
          {/* Navigation */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            {/* Flecha izquierda */}
            <IconButton
              onClick={goPrev}
              disabled={currentIndex === matches.length - 1}
            >
              <ArrowBackIosNewIcon
                sx={{
                  color:
                    currentIndex === matches.length - 1
                      ? "#0b4a81"
                      : "#4da3ff",
                }}
              />
            </IconButton>

            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
              Fecha {currentMatch.matchday}
            </Typography>

            {/* Flecha derecha */}
            <IconButton
              onClick={goNext}
              disabled={currentIndex === 0}
            >
              <ArrowForwardIosIcon
                sx={{
                  color:
                    currentIndex === 0
                      ? "#0b4a81"
                      : "#4da3ff",
                }}
              />
            </IconButton>
          </Stack>


          {/* CARD */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "#111418",
              borderLeft: "4px solid #ff6b6b",
              borderRight: "4px solid #4da3ff",
              maxWidth: 600,          // ← Agregá esto
              mx: "auto",             // ← Centrado real
            }}
          >
            {/* Resultado */}
            <Typography sx={{ mb: 2, fontSize: 16, textAlign: "center" }}>
              <strong style={{ color: "#ff6b6b" }}>Rojo</strong>: {currentMatch.red.goals}
              {"  "} | {"  "}
              <strong style={{ color: "#4da3ff" }}>Azul</strong>: {currentMatch.blue.goals}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 1, mb: 1 }}
            >
              {/* ROJO */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: "#ff6b6b" }}>
                  Equipo Rojo
                </Typography>

                <Stack direction="column" spacing={0.4}>
                  {currentMatch.red.players?.map((id, i) => (
                    <Typography key={i} sx={{ fontSize: 14 }}>
                      {i + 1}. {playersMap[id] || id}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              {/* AZUL */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: "#4da3ff" }}>
                  Equipo Azul
                </Typography>

                <Stack direction="column" spacing={0.4}>
                  {currentMatch.blue.players?.map((id, i) => (
                    <Typography key={i} sx={{ fontSize: 14 }}>
                      {i + 1}. {playersMap[id] || id}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Stack>


            {/* Tarjetas */}
            {currentMatch.cards?.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                  Tarjetas:
                </Typography>
                <Stack direction="column" spacing={0.5}>
                  {currentMatch.cards.map((c, index) => (
                    <Chip
                      key={index}
                      label={
                        c.type === "yellow"
                          ? `🟨 ${playersMap[c.playerId] || c.playerId}`
                          : `🟥 ${playersMap[c.playerId] || c.playerId} (${c.matches} fecha${c.matches > 1 ? "s" : ""})`
                      }
                      sx={{
                        width: "fit-content",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}

export default Historial;
