// =========================================
// COMPONENTE PLANTILLA PARA TABLAS (Mejorado con modes + scroll fix)
// =========================================

import { useRef, useEffect } from "react";
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
  mode = "full",    // <-- NUEVO (full, header, body)
}) {
  const hideArrows = prevDisabled && nextDisabled;

  // ============================================================
  // FIX: Permitir que el scroll siga hacia abajo cuando termina
  // ============================================================
  const gridRef = useRef(null);

  useEffect(() => {
    const virtualScroller =
      gridRef.current?.querySelector(".MuiDataGrid-virtualScroller");

    if (!virtualScroller) return;

    const handleWheel = (e) => {
      const atTop = virtualScroller.scrollTop === 0;
      const atBottom =
        virtualScroller.scrollHeight - virtualScroller.clientHeight ===
        virtualScroller.scrollTop;

      // Permitir pasar scroll al body
      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault();
        window.scrollBy({
          top: e.deltaY,
          behavior: "auto",
        });
      }
    };

    virtualScroller.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      virtualScroller.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // ===========================
  // 1) MODO HEADER ÚNICAMENTE
  // ===========================
  if (mode === "header") {
    return (
      <div style={{ width: "100%" }}>
        <div
          className="tabla-header-fixed"
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

          <span>{title}</span>

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
      </div>
    );
  }

  // ===========================
  // 2) MODO CUERPO ÚNICAMENTE
  // ===========================
  if (mode === "body") {
    return (
      <div
        className="tabla-scroll-body"
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
          ref={gridRef}
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
          disableColumnResize
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

            "& .row-red-win .MuiDataGrid-cell": {
              backgroundColor: "#0b5394 !important",
              color: "#fff !important",
            },

            "& .row-blue-win .MuiDataGrid-cell": {
              backgroundColor: "#0b5394 !important",
              color: "#fff !important",
            },

            "& .row-draw .MuiDataGrid-cell": {
              backgroundColor: "#0b5394 !important",
              color: "#fff !important",
            },
          }}
        />
      </div>
    );
  }

  // ===========================
  // 3) MODO FULL (ESCRITORIO)
  // ===========================
  return (
    <div style={{ display: "inline-block" }}>
      {/* Header */}
      <TablaTemplate
        title={title}
        onPrev={onPrev}
        onNext={onNext}
        prevDisabled={prevDisabled}
        nextDisabled={nextDisabled}
        mode="header"
      />

      {/* Body */}
      <TablaTemplate
        rows={rows}
        columns={columns}
        height={height}
        loading={loading}
        getRowClassName={getRowClassName}
        mode="body"
      />
    </div>
  );
}

export default TablaTemplate;
