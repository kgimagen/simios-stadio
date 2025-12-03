// =======================================
// HISTORIAL DE TORNEOS
// =======================================

import { useEffect, useState } from "react";
import getTournamentSummary from "../utils/getTournamentSummary";
import TablaTemplate from "./TablaTemplate";


const TORNEOS = [
  "apertura23",
  "apertura24",
  "apertura25",
  "clausura22",
  "clausura23",
  "clausura24",
  "clausura25",
  "verano23",
  "verano24"
];

function formatTitle(id) {
  // "apertura23" → "Apertura 23"
  const name = id.replace(/[0-9]/g, "");
  const year = id.replace(/\D/g, "");
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ${year}`;
}

function HistorialTorneos() {
  const [index, setIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const torneoActual = TORNEOS[index];

  const columns = [
    {
      field: "position",
      headerName: "#",
      width: 50,
      align: "center",
      renderCell: (params) => `${params.row.position}.`,
    },
    {
      field: "name",
      headerName: "Jugador",
      width: 170,
      renderCell: (params) => {
        const url = `/players/${params.row.playerId}.jpg`;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={url}
              alt={params.row.name}
              style={{
                width: 55,
                height: 40,
                borderRadius: 4,
                objectFit: "cover",
              }}
              onError={(e) => (e.target.src = "/players/default.jpg")}
            />
            <span>{params.row.name}</span>
          </div>
        );
      },
    },

    { field: "pts", headerName: "PTS", width: 60, align: "center" },
    { field: "wins", headerName: "PG", width: 60, align: "center" },
    { field: "draws", headerName: "PE", width: 60, align: "center" },
    { field: "losses", headerName: "PP", width: 60, align: "center" },
    { field: "played", headerName: "PJ", width: 60, align: "center" },
    { field: "diff", headerName: "DG", width: 60, align: "center" },
  ];





  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getTournamentSummary(torneoActual);
      setRows(data);
      setLoading(false);
    }
    load();
  }, [torneoActual]);

  const prev = () => {
    if (index < TORNEOS.length - 1) setIndex(index + 1);
  };

  const next = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <div
      className="cl25-root"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        paddingTop: 20,
      }}
    >
      {/* LOGO IGUAL QUE HISTORIAL DE PARTIDOS */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <img
          src="https://i.ibb.co/8Dx2X5Gf/somos-balon-pie-png.webp"
          alt="Somos Balonpie"
          style={{ width: 200, height: "auto" }}
        />
      </div>

      {/* TÍTULO */}
      <h2
        style={{
          background: "#191e25",
          color: "#fff",
          fontFamily: "Bebas Neue",
          fontSize: 32,
          textAlign: "center",
          textTransform: "uppercase",
          padding: "8px 0",
          borderRadius: 8,
          marginBottom: 15
        }}
      >
        Historial de Torneos
      </h2>

      {/* Selector de torneos */}
      <TablaTemplate
        title={formatTitle(torneoActual)}
        onPrev={prev}
        onNext={next}
        prevDisabled={index === TORNEOS.length - 1}
        nextDisabled={index === 0}
        mode="header"
      />

      {/* Tabla final */}
      <TablaTemplate
        rows={rows}
        columns={columns}
        height={650}
        loading={loading}
        mode="body"
      />
    </div>
  );
}

export default HistorialTorneos;
