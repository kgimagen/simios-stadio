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
} from "firebase/firestore";

// Máximo jugadores por equipo
const MAX_PLAYERS_PER_TEAM = 10;

function AdminMatch() {
  const [players, setPlayers] = useState([]);

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
        players: teamRed.map((p) => p.id)
      },
      blue: {
        goals: gB,
        players: teamBlue.map((p) => p.id)
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


  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 3, color: "#e2e2e2" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Registrar Partido
      </Typography>

      {/* Fecha */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#111418" }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Fecha</Typography>
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
            Equipo Rojo
          </Typography>

          <Autocomplete
            options={filteredPlayers}
            inputValue={redSearch}
            onInputChange={(_, value) => setRedSearch(value)}
            value={null}
            onChange={(_, value) => {
              addToRedTeam(value);
              setRedSearch("");
            }}
            filterOptions={(options, state) => {
              const text = state.inputValue.toLowerCase();
              return options.filter(opt => opt.label.toLowerCase().includes(text));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Agregar jugador"
                size="small"
                placeholder="Escribí para buscar..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const matches = filteredPlayers.filter(p =>
                      p.label.toLowerCase().includes(redSearch.toLowerCase())
                    );
                    if (matches.length > 0) {
                      addToRedTeam(matches[0]);
                      setRedSearch("");
                    }
                  }
                }}
              />
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
            Equipo Azul
          </Typography>

          <Autocomplete
            options={filteredPlayers}
            inputValue={blueSearch}
            onInputChange={(_, value) => setBlueSearch(value)}
            value={null}
            onChange={(_, value) => {
              addToBlueTeam(value);
              setBlueSearch("");
            }}
            filterOptions={(options, state) => {
              const text = state.inputValue.toLowerCase();
              return options.filter(opt => opt.label.toLowerCase().includes(text));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Agregar jugador"
                size="small"
                placeholder="Escribí para buscar..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const matches = filteredPlayers.filter(p =>
                      p.label.toLowerCase().includes(blueSearch.toLowerCase())
                    );
                    if (matches.length > 0) {
                      addToBlueTeam(matches[0]);
                      setBlueSearch("");
                    }
                  }
                }}
              />
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

      {/* Resultado */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#111418" }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Resultado (goles)</Typography>
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
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Tarjetas</Typography>

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

      <Divider sx={{ mb: 2 }} />

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
    </Box>
  );
}

export default AdminMatch;
