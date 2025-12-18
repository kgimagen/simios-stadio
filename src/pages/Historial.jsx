import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
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

function isCaptain(team, playerId, playersMap) {
  if (!team?.captain) return false;

  const cap = team.captain;

  // Caso 1: El capitán está guardado como ID
  if (cap === playerId) return true;

  // Caso 2: El capitán está guardado como NOMBRE
  const playerName = playersMap[playerId];
  if (playerName && cap === playerName) return true;

  return false;
}


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
      collection(db, "tournaments", "verano25", "matches"),
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
    <Box 
      sx={{ 
        width: "100%", 
        maxWidth: "100%", 
        px: { xs: 2, sm: 0 },  // aire lateral en mobile
        mt: 3, 
        color: "#e2e2e2",
        boxSizing: "border-box"
      }}
    >

      {/* ========== IMAGEN SUPERIOR (idéntica a Clausura25) ========== */}
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
                width: "350px",
                maxWidth: "90%",
                height: "auto",
                cursor: "pointer",
              }}
            />
          </Link>
        </div>
      </div>

      {/* ================== TÍTULO ================== */}
      <h2
        style={{
          background: "#191e25",
          color: "#ffffff",
          fontFamily: "Bebas Neue",
          fontSize: "32px",
          textAlign: "center",
          textTransform: "uppercase",
          padding: "5px 0",
          marginBottom: "15px",
          borderRadius: "8px",
          letterSpacing: "1px",
        }}
      >
        Historial de Partidos
      </h2>


      {matches.length === 0 ? (
        <Typography>No hay partidos registrados aún.</Typography>
      ) : (
        <>
          {/* NAVEGACIÓN */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
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

          {/* CARD PRINCIPAL */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "#111418",
              borderLeft: "4px solid #ff6b6b",
              borderRight: "4px solid #4da3ff",
              maxWidth: 600,      // ANCHO MÁXIMO CONTROLADO
              width: "100%",
              mx: "auto",         // CENTRADO TOTAL
              boxSizing: "border-box",
            }}
          >
            {/* RESULTADO */}
            <Typography 
              sx={{ 
                mb: 2, 
                fontSize: 18, 
                textAlign: "center", 
                fontWeight: 600 
              }}
            >
              <strong style={{ color: "#ff6b6b" }}>Rojo</strong>: {currentMatch.red.goals}
              {"  "} | {"  "}
              <strong style={{ color: "#4da3ff" }}>Azul</strong>: {currentMatch.blue.goals}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* EQUIPOS LADO A LADO EN TODAS LAS RESOLUCIONES */}
            <Stack 
              direction="row" 
              spacing={2} 
              sx={{ mt: 1, mb: 1 }}
            >
              {/* ROJO */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: "#ff6b6b", textAlign: "center" }}>
                  Equipo Rojo
                </Typography>

                <Stack direction="column" spacing={0.4}>
                  {currentMatch.red.players?.map((id, i) => {
                    let name = playersMap[id] || id;

                    if (!playersMap[id]) {
                      name = name.charAt(0).toUpperCase() + name.slice(1);
                    }

                    const isCap = isCaptain(currentMatch.red, id, playersMap);
                    const photo = `/players/${id}.jpg`;

                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img
                          src={photo}
                          alt={name}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 4,
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src = "/players/default.jpg";
                          }}
                        />

                        <Typography sx={{ fontSize: 14 }}>
                          {i + 1}. {name} {isCap ? "👑" : ""}
                        </Typography>
                      </div>
                    );
                  })}
                </Stack>
              </Box>

              {/* AZUL */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: "#4da3ff", textAlign: "center" }}>
                  Equipo Azul
                </Typography>

                <Stack direction="column" spacing={0.4}>
                  {currentMatch.blue.players?.map((id, i) => {
                    let name = playersMap[id] || id;

                    if (!playersMap[id]) {
                      name = name.charAt(0).toUpperCase() + name.slice(1);
                    }

                    const isCap = isCaptain(currentMatch.blue, id, playersMap);
                    const photo = `/players/${id}.jpg`;

                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img
                          src={photo}
                          alt={name}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 4,
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src = "/players/default.jpg";
                          }}
                        />

                        <Typography sx={{ fontSize: 14 }}>
                          {i + 1}. {name} {isCap ? "👑" : ""}
                        </Typography>
                      </div>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>

            {/* TARJETAS */}
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
