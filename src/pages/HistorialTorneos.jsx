// =======================================
// HISTORIAL DE TORNEOS
// =======================================

import { useEffect, useState } from "react";
import getTournamentSummary from "../utils/getTournamentSummary";
import TablaTemplate from "./TablaTemplate";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const TORNEOS = [
  "apertura25",
  "verano24",
  "clausura24",
  "apertura24",
  "clausura23",
  "apertura23",
  "verano23",
  "clausura22"
];

function formatTitle(id) {
  const name = id.replace(/[0-9]/g, "");
  const year = id.replace(/\D/g, "");
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ${year}`;
}

function HistorialTorneos() {
  const [index, setIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [promRows, setPromRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const torneoActual = TORNEOS[index];

  // ============================
  // COL. TABLA POSICIONES
  // ============================
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
                width: 45,
                height: 32,
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

  // ============================
  // COL. TABLA PROMEDIOS
  // ============================
  const promColumns = [
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
        const match = rows.find((p) => p.name === params.row.name);
        const playerId = match ? match.playerId : params.row.id;

        const url = `/players/${playerId}.jpg`;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={url}
              alt={params.row.name}
              style={{
                width: 45,
                height: 32,
                borderRadius: 4,
                objectFit: "cover",
              }}
              onError={(e) => (e.target.src = "/players/default.jpg")}
            />
            <span>
              {params.row.name}
              {params.row.descended ? " 📉" : ""}
            </span>
          </div>
        );
      },
    },

    { field: "prom", headerName: "Prom", width: 80, align: "center" },
  ];

  // ============================
  // LEER PROMEDIOS FIRESTORE
  // ============================
  async function loadPromedios(torneoId) {
    try {
      const snap = await getDocs(
        collection(db, "tournaments", `${torneoId}_summary`, "promedios")
      );

      let list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      list.sort((a, b) => b.prom - a.prom);

      list = list.map((item, index) => ({
        ...item,
        position: index + 1,
      }));

      setPromRows(list);
    } catch (err) {
      console.error("Error leyendo promedios:", err);
      setPromRows([]);
    }
  }

  // ============================
  // CARGA POSICIONES + PROMEDIOS
  // ============================
  useEffect(() => {
    async function load() {
      setLoading(true);

      const data = await getTournamentSummary(torneoActual);
      setRows(data);

      await loadPromedios(torneoActual);

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
        maxWidth: 1200,
        margin: "0 auto",
        paddingTop: 20,
      }}
    >
      {/* LOGO */}
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
          marginBottom: 15,
        }}
      >
        Historial de Torneos
      </h2>

      {/* =========================
          TABLAS LADO A LADO
      ========================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 25,
          marginTop: 5,
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {/* Tabla izquierda: TORNEO (header + body) */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: 350,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TablaTemplate
            title={formatTitle(torneoActual)}
            rows={rows}
            columns={columns}
            height={550}
            loading={loading}
            mode="full"
            onPrev={prev}
            onNext={next}
            prevDisabled={index === TORNEOS.length - 1}
            nextDisabled={index === 0}
          />
        </div>

        {/* Tabla derecha: PROMEDIOS (header + body) */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: 350,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TablaTemplate
            title="Promedios"
            rows={promRows}
            columns={promColumns}
            height={550}
            loading={loading}
            mode="full"
            getRowClassName={(params) =>
              params.row.descended ? "row-descended" : ""
            }
            prevDisabled
            nextDisabled
          />
        </div>
      </div>
    </div>
  );
}

export default HistorialTorneos;
