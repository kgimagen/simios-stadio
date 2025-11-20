// =========================================
// COMPONENTE PLANTILLA PARA AMBAS TABLAS
// =========================================

import { DataGrid } from "@mui/x-data-grid";

function TablaTemplate({
  title,
  rows,
  columns,
  height = 650,
  getRowClassName
}) {
  return (
    <div style={{ display: "inline-block" }}>
      
      {/* TÍTULO UNIFICADO */}
      <h2
        style={{
          background: "#191e25",
          color: "#ffffff",
          fontFamily: "Bebas Neue",
          fontSize: "25px",
          textAlign: "center",
          textTransform: "uppercase",
          padding: "5px 0",
          marginBottom: "8px",
          borderRadius: "8px",
        }}
      >
        {title}
      </h2>

      {/* CONTENEDOR UNIFICADO */}
      <div
        style={{
          height,
          borderRadius: "12px",
          overflow: "hidden",
          background: "#212121",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter
          hideFooterPagination
          hideFooterSelectedRowCount

          // 🔥 DESACTIVAR TODOS LOS MENÚS Y ORDENAMIENTOS
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableColumnSorting
          sortingMode="none"

          getRowClassName={getRowClassName}
          columnBuffer={4}
          disableExtendRowFullWidth={true}
          sx={{

            // FUENTE GENERAL
            fontSize: "14px",
            color: "#fff",

            // CONTENEDOR PRINCIPAL
            background: "#0b5394",
            borderRadius: "10px",

            // ===============
            // HEADER UNIFICADO
            // ===============
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#191e25",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              borderBottom: "1px solid #191e25",
              height: 42,
            },

            // ============================
            // CELDAS GENERALES (ambas tablas)
            // ============================
            "& .MuiDataGrid-cell": {
              backgroundColor: "#0b5394",
              color: "#fff",
              borderColor: "#191e25",
            },

            // ============================
            // FILAS ALTERNADAS
            // ============================
            "& .MuiDataGrid-row:nth-of-type(odd) .MuiDataGrid-cell": {
              backgroundColor: "#0b4a81",
            },

            // LÍNEA SEPARADORA ENTRE FILAS
            "& .MuiDataGrid-row": {
              borderBottom: "1px solid #191e25",
            },

            // ============================
            // CLASE EXTRA POR TABLA (ej: últimas 4)
            // ============================
            "& .last4-row .MuiDataGrid-cell": {
              backgroundColor: "#073763 !important",
              color: "#fff !important",
              fontWeight: 600,
            },

            // ============================
            // ESTILOS PERSONALIZADOS RESULTADOS
            // ============================

            // Fondo columna F
            "& .MuiDataGrid-cell[data-field='matchday']": {
              backgroundColor: "#0b5394 !important",
            },

            // Fondo capitán ROJO
            "& .MuiDataGrid-cell[data-field='capRed']": {
              backgroundColor: "#5b0f00 !important",
            },

            // Fondo capitán AZUL
            "& .MuiDataGrid-cell[data-field='capBlue']": {
              backgroundColor: "#073763 !important",
            },

            // Fondo RESULTADO
            "& .MuiDataGrid-cell[data-field='score']": {
              backgroundColor: "#242e3a !important",
            },

          }}

        />
      </div>
    </div>
  );
}

export default TablaTemplate;
