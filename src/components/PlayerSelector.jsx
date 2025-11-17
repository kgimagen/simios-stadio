import { useState } from "react";
import { TextField, Autocomplete, Chip } from "@mui/material";

export default function PlayerSelector({ players, label, selected, setSelected }) {
  const [inputValue, setInputValue] = useState("");

  const handleSelect = (event, value) => {
    if (!value) return;
    if (!selected.includes(value)) {
      setSelected([...selected, value]);
    }
    setInputValue(""); // limpiar el input luego de seleccionar
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>{label}</h3>

      <Autocomplete
        options={players.filter(p => !selected.includes(p))} // evita duplicados
        value={null}
        inputValue={inputValue}
        onInputChange={(e, newValue) => setInputValue(newValue)}
        onChange={handleSelect}
        clearOnBlur
        clearOnEscape
        renderInput={(params) => (
          <TextField {...params} label="Buscar jugador..." />
        )}
      />

      <div style={{ marginTop: "10px" }}>
        {selected.map((player, idx) => (
          <Chip
            key={player}
            label={`${idx + 1}. ${player}`}
            onDelete={() =>
              setSelected(selected.filter((name) => name !== player))
            }
            style={{ marginRight: "5px", marginTop: "5px" }}
          />
        ))}
      </div>
    </div>
  );
}
