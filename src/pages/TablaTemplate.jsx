// =========================================
// COMPONENTE PLANTILLA PARA TABLAS
// =========================================

import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function TablaTemplate({
  title,
  rows,
  columns,
  height = 650,
  getRowClassName,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  loading = false,
}) {
  const hideArrows = prevDisabled && nextDisabled;

  return (
    <div style={{ display: "inline-block" }}>

      {/* TÍTULO CON FLECHAS (si corresponde) */}
      <div
        style={{
          background: "#191e25",
          color: "#ffffff",
          fontFamily: "Bebas Neue",
          fontSize: "35px",
          textAlign: "center",
          textTransform: "uppercase",
          padding: "5px 0",
          marginBottom: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >

        {/* Flecha izquierda — solo cuando corresponde */}
        {!hideArrows && (
          <IconButton
            onClick={onPrev}
            disabled={prevDisabled}
            sx={{ padding: 0 }}
          >
            <ArrowBackIosNewIcon
              sx={{
                fontSize: 25,
                color: prevDisabled ? "#0b4a81" : "#4da3ff",
              }}
            />
          </IconButton>
        )}

        {/* Título */}
        <span>{title}</span>

        {/* Flecha derecha — solo cuando corresponde */}
        {!hideArrows && (
          <IconButton
            onClick={onNext}
            disabled={nextDisabled}
            sx={{ padding: 0 }}
          >
            <ArrowForwardIosIcon
              sx={{
                fontSize: 25,
                color: nextDisabled ? "#0b4a81" : "#4da3ff",
              }}
            />
          </IconButton>
        )}

      </div>

      {/* CONTENEDOR DE TABLA O LOADING */}
      <div
        style={{
          height,
          borderRadius: "12px",
          overflow: "hidden",
          background: "#212121",
          position: "relative",
        }}
      >

        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              fontFamily: "Bebas Neue",
              fontSize: "26px",
              color: "#ffffff",
              backdropFilter: "blur(2px)",
            }}
          >
            Cargando resultados...
          </div>
        )}

        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter
          hideFooterPagination
          hideFooterSelectedRowCount
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableColumnSorting
          sortingMode="none"
          getRowClassName={getRowClassName}
          columnBuffer={4}
          disableExtendRowFullWidth={true}
          sx={{
            fontSize: "14px",
            color: "#fff",
            background: "#0b5394",
            borderRadius: "10px",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#191e25",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              borderBottom: "1px solid #191e25",
              height: 42,
            },

            "& .MuiDataGrid-cell": {
              backgroundColor: "#0b5394",
              color: "#fff",
              borderColor: "#191e25",
            },


            "& .MuiDataGrid-row": {
              borderBottom: "1px solid #191e25",
            },

            "& .last4-row .MuiDataGrid-cell": {
              backgroundColor: "#073763 !important",
              color: "#fff !important",
              fontWeight: 600,
            },

            "& .MuiDataGrid-cell[data-field='matchday']": {
              backgroundColor: "#0b5394 !important",
            },

            "& .MuiDataGrid-cell[data-field='capRed']": {
              backgroundColor: "#5b0f00 !important",
            },

            "& .MuiDataGrid-cell[data-field='capBlue']": {
              backgroundColor: "#073763 !important",
            },

            "& .MuiDataGrid-cell[data-field='score']": {
              backgroundColor: "#242e3a !important",
            },

            "& .row-red-win .MuiDataGrid-cell": {
              backgroundColor: "#5b0f00 !important",   // rojo victoria
              color: "#fff !important",
            },

            "& .row-blue-win .MuiDataGrid-cell": {
              backgroundColor: "#073763 !important",   // azul victoria
              color: "#fff !important",
            },

            "& .row-draw .MuiDataGrid-cell": {
              backgroundColor: "#242e3a !important",   // el gris que usás en Resultados
              color: "#fff !important",
            },

          }}
        />

      </div>

    </div>
  );
}

export default TablaTemplate;
