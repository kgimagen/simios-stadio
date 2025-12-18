// =======================================
// HISTORIAL DE TORNEOS
// =======================================

import { useEffect, useState } from "react";
import getTournamentSummary from "../utils/getTournamentSummary";
import TablaTemplate from "./TablaTemplate";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const TORNEOS = [
  "clausura25",
  "apertura25",
  "verano24",
  "clausura24",
  "apertura24",
  "clausura23",
  "apertura23",
  "verano23",
  "clausura22",
];

function formatTitle(id) {
  const name = id.replace(/[0-9]/g, "");
  const year = id.replace(/\D/g, "");
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ${year}`;
}

// ======================================================
// Resolver playerId a partir del nombre (para fotos)
// ======================================================
function findPlayerIdByName(name, rows) {
  const match = rows.find((p) => p.name === name);
  return match ? match.playerId : "default";
}

function HistorialTorneos() {
  const [index, setIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [promRows, setPromRows] = useState([]);
  const [resultRows, setResultRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const torneoActual = TORNEOS[index];

  // ============================
  // CLASIFICACIÓN DE DESCENSOS
  // ============================
  const descendidos = promRows.filter((p) => p.descended);

  const descensoPromedios = descendidos.slice(-4).map((p) => p.name);

  const descensoPosiciones = descendidos
    .slice(0, Math.max(descendidos.length - 4, 0))
    .map((p) => p.name);

  // ============================
  // COLUMNAS TABLA POSICIONES
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
            <span>
              {params.row.name}
              {descensoPosiciones.includes(params.row.name) ? " 📉" : ""}
            </span>
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
  // COLUMNAS TABLA PROMEDIOS
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
              {descensoPromedios.includes(params.row.name) ? " 📉" : ""}
            </span>
          </div>
        );
      },
    },
    { field: "prom", headerName: "Prom", width: 80, align: "center" },
  ];

  // ============================
  // COLUMNAS RESULTADOS CAPITANES
  // ============================
  const resultColumns = [
    {
      field: "matchday",
      headerName: "F",
      width: 30,
      align: "center",
      sortable: false,
      renderCell: (params) => `${params.row.matchday}.`,
    },
    {
      field: "capRed",
      headerName: "CAPITAN ROJO",
      width: 170,
      sortable: false,
      renderCell: (params) => {
        const playerId = findPlayerIdByName(params.row.capRed, rows);
        const url = `/players/${playerId}.jpg`;
        const lost = params.row.scoreRed < params.row.scoreBlue;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={url}
              alt={params.row.capRed}
              style={{
                width: 45,
                height: 32,
                borderRadius: 4,
                objectFit: "cover",
                filter: lost ? "grayscale(100%)" : "none",
                opacity: lost ? 0.5 : 1,
              }}
              onError={(e) => (e.target.src = "/players/default.jpg")}
            />
            <span style={{ opacity: lost ? 0.5 : 1 }}>
              {params.row.capRed}
            </span>
          </div>
        );
      },
    },
    {
      field: "capBlue",
      headerName: "CAPITAN AZUL",
      width: 170,
      sortable: false,
      renderCell: (params) => {
        const playerId = findPlayerIdByName(params.row.capBlue, rows);
        const url = `/players/${playerId}.jpg`;
        const lost = params.row.scoreBlue < params.row.scoreRed;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={url}
              alt={params.row.capBlue}
              style={{
                width: 45,
                height: 32,
                borderRadius: 4,
                objectFit: "cover",
                filter: lost ? "grayscale(100%)" : "none",
                opacity: lost ? 0.5 : 1,
              }}
              onError={(e) => (e.target.src = "/players/default.jpg")}
            />
            <span style={{ opacity: lost ? 0.5 : 1 }}>
              {params.row.capBlue}
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

  // ============================
  // LEER PROMEDIOS
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
  // LEER RESULTADOS CAPITANES
  // ============================
  async function loadCapitanes(torneoId) {
    try {
      const snap = await getDocs(
        collection(db, "tournaments", `${torneoId}_summary`, "capitanes")
      );

      const list = snap.docs
        .map((d) => {
          const x = d.data();
          return {
            id: d.id,
            matchday: Number(x.matchday),
            capRed: x.capRed,
            capBlue: x.capBlue,
            scoreRed: Number(x.scoreRed ?? 0),
            scoreBlue: Number(x.scoreBlue ?? 0),
            score: `${x.scoreRed ?? 0} - ${x.scoreBlue ?? 0}`,
          };
        })
        .sort((a, b) => a.matchday - b.matchday);

      setResultRows(list);
    } catch (err) {
      console.error("Error leyendo capitanes:", err);
      setResultRows([]);
    }
  }

  // ============================
  // CARGA GENERAL
  // ============================
  useEffect(() => {
    async function load() {
      setLoading(true);

      const data = await getTournamentSummary(torneoActual);
      setRows(data);

      await loadPromedios(torneoActual);
      await loadCapitanes(torneoActual);

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
        maxWidth: 1600,
        margin: "0 auto",
        paddingTop: 20,
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



      {/* TITULO */}
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

      {/* TABLAS */}
      <div className="historial-tablas">

        {/* ============= POSICIONES ============= */}
        <div className="table-wrapper">

          <TablaTemplate
            title={
              <span className="titulo-tabla">
                {formatTitle(torneoActual)}
              </span>
            }
            onPrev={prev}
            onNext={next}
            prevDisabled={index === TORNEOS.length - 1}
            nextDisabled={index === 0}
            mode="header"
          />

          <TablaTemplate
            rows={rows}
            columns={columns}
            height={550}
            loading={loading}
            mode="body"
            getRowClassName={(params) =>
              descensoPosiciones.includes(params.row.name)
                ? "row-descended"
                : ""
            }
          />
        </div>

        {/* ============= PROMEDIOS ============= */}
        <div className="table-wrapper historial-promedios">

          <TablaTemplate
            title="PROMEDIOS"
            mode="header"
            prevDisabled
            nextDisabled
          />

          <TablaTemplate
            rows={promRows}
            columns={promColumns}
            height={550}
            loading={loading}
            mode="body"
            getRowClassName={(params) =>
              descensoPromedios.includes(params.row.name)
                ? "row-descended"
                : ""
            }
          />
        </div>

        {/* ============= RESULTADOS DE CAPITANES ============= */}
        <div className="table-wrapper">

          <TablaTemplate
            title="RESULTADOS DE CAPITANES"
            mode="header"
            prevDisabled
            nextDisabled
          />

          <TablaTemplate
            rows={resultRows}
            columns={resultColumns}
            height={550}
            loading={loading}
            mode="body"
            getRowClassName={(params) => {
              if (params.row.scoreRed > params.row.scoreBlue) return "row-red-win";
              if (params.row.scoreBlue > params.row.scoreRed) return "row-blue-win";
              return "row-draw";
            }}
          />
        </div>

      </div>



      {/* ================== ESTILOS ================== */}
      <style>
        {`
          .historial-tablas {
            display: flex;
            gap: 25px;
            width: 100%;
            max-width: 1550px;
            margin: 0 auto;
            justify-content: center;
            align-items: flex-start;
          }

          /* Posiciones y Resultados */
          .historial-tablas > div:not(.historial-promedios) {
            flex: 1.2 1 0;
          }

          /* Promedios (más angosta) */
          .historial-promedios {
            flex: 0.7 1 0;
          }

          @media (max-width: 1100px) {
            .historial-tablas {
              flex-direction: column;
            }
          }


        `}
      </style>


    </div>
  );
}

export default HistorialTorneos;
