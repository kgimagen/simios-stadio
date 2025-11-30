import { useEffect, useState } from "react";
import PlayerSelector from "../components/PlayerSelector";

import {
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Chip,
  IconButton,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";


// Máximo jugadores por equipo
const MAX_PLAYERS_PER_TEAM = 10;

function AdminMatch() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchToDelete, setMatchToDelete] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState("");


  const [matchday, setMatchday] = useState("");

  const [teamRed, setTeamRed] = useState([]);
  const [teamBlue, setTeamBlue] = useState([]);

  const [redSearch, setRedSearch] = useState("");
  const [blueSearch, setBlueSearch] = useState("");


  const [redGoals, setRedGoals] = useState("");
  const [blueGoals, setBlueGoals] = useState("");

  const [cardPlayer, setCardPlayer] = useState(null);
  const [cardType, setCardType] = useState("yellow"); // yellow | red
  const [cardMatches, setCardMatches] = useState("1");
  const [cards, setCards] = useState([]);

  const [status, setStatus] = useState("");

  const [captainRed, setCaptainRed] = useState(null);
  const [captainBlue, setCaptainBlue] = useState(null);


  // Cargar lista de jugadores desde Firestore
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const snap = await getDocs(collection(db, "players"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() || {}),
        }));
        // Orden alfabético por nombre
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setPlayers(list);
      } catch (err) {
        console.error(err);
        setStatus("Error al cargar jugadores.");
      }
    };
    loadPlayers();
  }, []);

  // Cargar partidos existentes
  useEffect(() => {
    const loadMatches = async () => {
      const snap = await getDocs(collection(db, "tournaments", "clausura25", "matches"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordenar por fecha ascendente
      list.sort((a, b) => a.matchday - b.matchday);
      setMatches(list);
    };

    loadMatches();
  }, []);


  const availablePlayers = players.map((p) => ({
    label: p.name || p.id,
    id: p.id,
  }));

  const usedIds = [...teamRed.map(p => p.id), ...teamBlue.map(p => p.id)];

  const filteredPlayers = availablePlayers.filter(p => !usedIds.includes(p.id));


  // Helpers para agregar jugadores a equipos
  const addToRedTeam = (player) => {
    if (!player) return;
    if (teamRed.find((p) => p.id === player.id)) return;
    if (teamBlue.find((p) => p.id === player.id)) {
      setStatus("Ese jugador ya está en el equipo Azul.");
      return;
    }
    if (teamRed.length >= MAX_PLAYERS_PER_TEAM) {
      setStatus(`Máximo ${MAX_PLAYERS_PER_TEAM} jugadores en el equipo Rojo.`);
      return;
    }
    setTeamRed([...teamRed, player]);
    setStatus("");
  };

  const addToBlueTeam = (player) => {
    if (!player) return;
    if (teamBlue.find((p) => p.id === player.id)) return;
    if (teamRed.find((p) => p.id === player.id)) {
      setStatus("Ese jugador ya está en el equipo Rojo.");
      return;
    }
    if (teamBlue.length >= MAX_PLAYERS_PER_TEAM) {
      setStatus(`Máximo ${MAX_PLAYERS_PER_TEAM} jugadores en el equipo Azul.`);
      return;
    }
    setTeamBlue([...teamBlue, player]);
    setStatus("");
  };

  const removeFromRedTeam = (id) => {
    setTeamRed(teamRed.filter((p) => p.id !== id));
  };

  const removeFromBlueTeam = (id) => {
    setTeamBlue(teamBlue.filter((p) => p.id !== id));
  };


  // Tarjetas
  const handleAddCard = () => {
    if (!cardPlayer) {
      setStatus("Seleccioná un jugador para la tarjeta.");
      return;
    }
    if (!cardType) {
      setStatus("Seleccioná tipo de tarjeta.");
      return;
    }
    let matches = null;
    if (cardType === "red") {
      const m = parseInt(cardMatches, 10);
      if (isNaN(m) || m <= 0) {
        setStatus("La cantidad de fechas para roja debe ser un número mayor a 0.");
        return;
      }
      matches = m;
    }

    const entry = {
      id: `${cardPlayer.id}-${cardType}-${cards.length}-${Date.now()}`,
      playerId: cardPlayer.id,
      playerName: cardPlayer.label,
      type: cardType, // yellow | red
      matches: matches, // solo para roja
    };

    setCards([...cards, entry]);
    setCardPlayer(null);
    setCardMatches("1");
    setCardType("yellow");
    setStatus("");
  };

  const removeCard = (id) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  // Envío del partido a Firestore
  const handleSaveMatch = async () => {
    setStatus("");

    const m = parseInt(matchday, 10);
    const gR = parseInt(redGoals, 10);
    const gB = parseInt(blueGoals, 10);

    if (isNaN(m) || m <= 0) {
      setStatus("La fecha debe ser un número mayor a 0.");
      return;
    }

    if (teamRed.length === 0 || teamBlue.length === 0) {
      setStatus("Ambos equipos deben tener al menos 1 jugador.");
      return;
    }

    if (isNaN(gR) || isNaN(gB)) {
      setStatus("Indicá los goles de cada equipo.");
      return;
    }

    const matchDoc = {
      matchday: m,
      createdAt: serverTimestamp(),
      red: {
        goals: gR,
        players: teamRed.map((p) => p.id),
        captain: captainRed
      },
      blue: {
        goals: gB,
        players: teamBlue.map((p) => p.id),
        captain: captainBlue
      },
      cards: cards.map((c) => ({
        playerId: c.playerId,
        type: c.type,
        matches: c.matches ?? null,
      })),
    };


    try {
      await addDoc(
        collection(db, "tournaments", "clausura25", "matches"),
        matchDoc
      );
      setStatus("Partido cargado con éxito.");

      // Reset formulario
      setMatchday("");
      setTeamRed([]);     // ← corregido
      setTeamBlue([]);    // ← corregido
      setRedGoals("");
      setBlueGoals("");
      setCards([]);
      setCardPlayer(null);
      setCardMatches("1");
      setCardType("yellow");
    } catch (err) {
      console.error(err);
      setStatus("Error al guardar el partido. Revisá la consola.");
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) {
      setDeleteStatus("Seleccioná una fecha para borrar.");
      return;
    }

    try {
      await deleteDoc(
        doc(db, "tournaments", "clausura25", "matches", matchToDelete.id)
      );

      setDeleteStatus(`Fecha ${matchToDelete.matchday} eliminada correctamente.`);

      // Recargar lista
      setMatches(matches.filter(m => m.id !== matchToDelete.id));
      setMatchToDelete(null);

    } catch (err) {
      console.error(err);
      setDeleteStatus("Error al borrar la fecha. Revisá la consola.");
    }
  };


  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 3, color: "#e2e2e2" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Registrar Partido
      </Typography>

      {/* Fecha */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#111418" }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>🗓️ Fecha 🗓️</Typography>
        <TextField
          type="number"
          size="small"
          value={matchday}
          onChange={(e) => setMatchday(e.target.value)}
          sx={{ width: 120 }}
          InputProps={{ inputProps: { min: 1 } }}
        />
      </Paper>




      {/* Equipos */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        {/* Equipo Rojo */}
        <Paper sx={{ flex: 1, p: 2, backgroundColor: "#111418" }}>
          <Typography sx={{ mb: 1, fontWeight: 600, color: "#ff6b6b" }}>
            🔴 Equipo Rojo 🔴
          </Typography>

          <Autocomplete
            freeSolo
            options={filteredPlayers.map((p) => p.label)}
            inputValue={redSearch}
            onInputChange={(_, value) => setRedSearch(value)}
            value={null}
            onChange={(_, value) => {
              if (!value) return;

              const exists = filteredPlayers.find((p) => p.label === value);

              if (exists) {
                addToRedTeam(exists);
              } else {
                // Invitado
                addToRedTeam({ id: value.toLowerCase().replace(/\s+/g, "_"), label: value });
              }

              setRedSearch("");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Agregar jugador (o invitado)" size="small" />
            )}
          />


          <Box sx={{ mt: 2 }}>
            {teamRed.map((p, index) => (
              <Box
                key={p.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography>
                  {index + 1}. {p.label}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeFromRedTeam(p.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Equipo Azul */}
        <Paper sx={{ flex: 1, p: 2, backgroundColor: "#111418" }}>
          <Typography sx={{ mb: 1, fontWeight: 600, color: "#4da3ff" }}>
            🔵 Equipo Azul 🔵
          </Typography>

          <Autocomplete
            freeSolo
            options={filteredPlayers.map((p) => p.label)}
            inputValue={blueSearch}
            onInputChange={(_, value) => setBlueSearch(value)}
            value={null}
            onChange={(_, value) => {
              if (!value) return;

              const exists = filteredPlayers.find((p) => p.label === value);

              if (exists) {
                addToBlueTeam(exists);
              } else {
                // Invitado
                addToBlueTeam({ id: value.toLowerCase().replace(/\s+/g, "_"), label: value });
              }

              setBlueSearch("");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Agregar jugador (o invitado)" size="small" />
            )}
          />


          <Box sx={{ mt: 2 }}>
            {teamBlue.map((p, index) => (
              <Box
                key={p.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography>
                  {index + 1}. {p.label}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeFromBlueTeam(p.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Paper>
      </Stack>

      {/* Capitanes (arriba de todo) */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#111418" }}>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          
          {/* Capitán Rojo */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: "#ff6b6b" }}>
              👑 Capitán Rojo 👑
            </Typography>

            <Autocomplete
              options={[...teamRed]}  // solo jugadores cargados
              getOptionLabel={(opt) => opt.label}
              onChange={(_, value) => setCaptainRed(value?.id || null)}
              renderInput={(params) => (
                <TextField {...params} label="Seleccionar capitán" size="small" />
              )}
            />
          </Box>

          {/* Capitán Azul */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: "#4da3ff" }}>
              👑 Capitán Azul 👑
            </Typography>

            <Autocomplete
              options={[...teamBlue]}
              getOptionLabel={(opt) => opt.label}
              onChange={(_, value) => setCaptainBlue(value?.id || null)}
              renderInput={(params) => (
                <TextField {...params} label="Seleccionar capitán" size="small" />
              )}
            />
          </Box>

        </Stack>
      </Paper>

      {/* Resultado */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#111418" }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>⚽ Resultado ⚽</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Rojo"
            type="number"
            size="small"
            value={redGoals}
            onChange={(e) => setRedGoals(e.target.value)}
            sx={{ width: 120 }}
          />
          <Typography variant="h6">-</Typography>
          <TextField
            label="Azul"
            type="number"
            size="small"
            value={blueGoals}
            onChange={(e) => setBlueGoals(e.target.value)}
            sx={{ width: 120 }}
          />
        </Stack>
      </Paper>

      {/* Tarjetas */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#111418" }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>🟥 Tarjetas 🟨</Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Autocomplete
            options={availablePlayers}
            value={cardPlayer}
            onChange={(_, value) => setCardPlayer(value)}
            sx={{ minWidth: 220 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Jugador"
                size="small"
                placeholder="Escribí para buscar..."
              />
            )}
          />


          <TextField
            select
            label="Tipo"
            size="small"
            SelectProps={{ native: true }}
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            sx={{ width: 140 }}
          >
            <option value="yellow">Amarilla</option>
            <option value="red">Roja</option>
          </TextField>

          {cardType === "red" && (
            <TextField
              label="Fechas de suspensión"
              type="number"
              size="small"
              value={cardMatches}
              onChange={(e) => setCardMatches(e.target.value)}
              sx={{ width: 180 }}
              InputProps={{ inputProps: { min: 1 } }}
            />
          )}

          <Button variant="contained" onClick={handleAddCard}>
            Agregar tarjeta
          </Button>
        </Stack>

        {/* Lista tarjetas */}
        <Box sx={{ mt: 2 }}>
          {cards.map((c, idx) => (
            <Stack
              key={c.id}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Chip
                label={`${idx + 1}. ${c.playerName} - ${
                  c.type === "yellow"
                    ? "Amarilla"
                    : `Roja (${c.matches} fecha${c.matches > 1 ? "s" : ""})`
                }`}
                color={c.type === "yellow" ? "warning" : "error"}
              />
              <IconButton size="small" onClick={() => removeCard(c.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Box>
      </Paper>

      {/* Estado + botón */}
      {status && (
        <Typography
          sx={{ mb: 2, color: status.startsWith("Error") ? "#ff7675" : "#55efc4" }}
        >
          {status}
        </Typography>
      )}

      <Button variant="contained" color="primary" onClick={handleSaveMatch}>
        Cargar partido
      </Button>

      {/* DIVISIÓN GRANDE */}
      <Divider sx={{ my: 5, borderColor: "#555" }} />

      {/* ELIMINAR PARTIDO */}
      <Paper sx={{ p: 2, backgroundColor: "#111418", border: "1px solid #882b2b" }}>
        <Typography sx={{ mb: 2, fontWeight: 700, color: "#ff4444" }}>
          Eliminar Partido
        </Typography>

        <Typography sx={{ mb: 1 }}>
          Seleccioná una fecha para eliminarla por completo:
        </Typography>

        <Autocomplete
          options={matches}
          getOptionLabel={(m) => `Fecha ${m.matchday}`}
          value={matchToDelete}
          onChange={(_, value) => setMatchToDelete(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Seleccionar fecha"
              size="small"
              placeholder="Elegí la fecha a borrar"
            />
          )}
          sx={{ maxWidth: 300, mb: 2 }}
        />

        <Button
          variant="contained"
          color="error"
          disabled={!matchToDelete}
          onClick={handleDeleteMatch}
        >
          Eliminar Fecha
        </Button>

        {deleteStatus && (
          <Typography
            sx={{
              mt: 2,
              color: deleteStatus.startsWith("Error") ? "#ff7675" : "#55efc4",
            }}
          >
            {deleteStatus}
          </Typography>
        )}
      </Paper>


    </Box>
  );
}

export default AdminMatch;
