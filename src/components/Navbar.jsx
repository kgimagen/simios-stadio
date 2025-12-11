import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navStyle = {
    padding: "12px",
    background: "#191e25",
    color: "white",
    display: "flex",
    alignItems: "center",
    position: "relative",
  };

  const linkButton = {
    padding: "6px 12px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    textDecoration: "none",
    fontFamily: "Bebas Neue",
    fontSize: "18px",
    letterSpacing: "0.5px",
    transition: "0.2s",
    display: "block",
  };

  const linkButtonHover = {
    background: "#4da3ff",
    color: "#000",
  };

  // Ícono hamburguesa
  const hamburgerStyles = {
    display: "none",
    flexDirection: "column",
    gap: "4px",
    cursor: "pointer",
  };

  // Barras del menú: SIEMPRE BLANCAS
  const bar = {
    width: "26px",
    height: "3px",
    background: "#ffffff",        // ← 100% blanco garantizado
    borderRadius: "3px",
    transition: "background 0.2s",
  };

  // MENU MOBILE
  const mobileMenu = {
    position: "absolute",
    top: "60px",
    left: "0",
    width: "100%",
    background: "#1f242c",
    padding: "15px",
    display: open ? "flex" : "none",
    flexDirection: "column",
    gap: "12px",
    zIndex: 99,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <nav style={navStyle}>
      {/* Ícono hamburguesa visible solo en celular */}
      <div
        className="hamburger"
        style={hamburgerStyles}
        onClick={() => setOpen(!open)}
      >
        <span style={bar}></span>
        <span style={bar}></span>
        <span style={bar}></span>
      </div>

      {/* Menú desktop */}
      <div className="menu-desktop" style={{ display: "flex", gap: "18px" }}>
        <Link
          to="/"
          style={linkButton}
          onMouseOver={(e) => Object.assign(e.target.style, linkButtonHover)}
          onMouseOut={(e) => Object.assign(e.target.style, linkButton)}
        >
          Tabla de Posiciones / Clausura 25
        </Link>

        <Link
          to="/historial"
          style={linkButton}
          onMouseOver={(e) => Object.assign(e.target.style, linkButtonHover)}
          onMouseOut={(e) => Object.assign(e.target.style, linkButton)}
        >
          Historial de Partidos
        </Link>

        <Link
          to="/torneos"
          style={linkButton}
          onMouseOver={(e) => Object.assign(e.target.style, linkButtonHover)}
          onMouseOut={(e) => Object.assign(e.target.style, linkButton)}
        >
          Historial de Torneos
        </Link>


        {user && (
          <Link
            to="/admin/match"
            style={linkButton}
            onMouseOver={(e) =>
              Object.assign(e.target.style, linkButtonHover)
            }
            onMouseOut={(e) =>
              Object.assign(e.target.style, linkButton)
            }
          >
            Cargar Fecha
          </Link>
        )}
      </div>

      {/* Menú Mobile desplegable */}
      <div style={mobileMenu} className="menu-mobile">
        <Link to="/" style={linkButton}>Tabla de Posiciones / Clausura 25</Link>
        <Link to="/historial" style={linkButton}>Historial de Partidos</Link>
        <Link to="/torneos" style={linkButton}>Historial de Torneos</Link>
        {user && <Link to="/admin/match" style={linkButton}>Cargar Fecha</Link>}
      </div>

      {/* Derecha */}
      <span
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        {user ? (
          <>
            <span>Hola, {user.displayName || user.email}</span>

            <button
              onClick={logout}
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid white",
                color: "white",
                cursor: "pointer",
                borderRadius: "6px",
                fontFamily: "Bebas Neue",
                fontSize: "16px",
                transition: "0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#ff4d4d";
                e.target.style.color = "#000";
                e.target.style.borderColor = "#ff4d4d";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "white";
                e.target.style.borderColor = "white";
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link
            to="/admin"
            style={linkButton}
            onMouseOver={(e) =>
              Object.assign(e.target.style, linkButtonHover)
            }
            onMouseOut={(e) =>
              Object.assign(e.target.style, linkButton)
            }
          >
            Iniciar sesión
          </Link>
        )}
      </span>

      {/* Estilos responsive */}
      <style>
        {`
          @media (max-width: 768px) {
            .hamburger {
              display: flex !important;
            }
            .menu-desktop {
              display: none !important;
            }
            /* Fuerza las barras a ser siempre blancas */
            .hamburger span {
              background: #ffffff !important;
            }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;
