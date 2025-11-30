import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const navStyle = {
    padding: "12px",
    background: "#191e25",
    color: "white",
    display: "flex",
    gap: "18px",
    alignItems: "center",
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
  };

  const linkButtonHover = {
    background: "#4da3ff",
    color: "#000",
  };

  return (
    <nav style={navStyle}>
      {/* Botones del menú */}
      <Link
        to="/"
        style={linkButton}
        onMouseOver={(e) =>
          Object.assign(e.target.style, linkButtonHover)
        }
        onMouseOut={(e) =>
          Object.assign(e.target.style, linkButton)
        }
      >
        Tabla de Posiciones / Clausura 25
      </Link>

      <Link
        to="/historial"
        style={linkButton}
        onMouseOver={(e) =>
          Object.assign(e.target.style, linkButtonHover)
        }
        onMouseOut={(e) =>
          Object.assign(e.target.style, linkButton)
        }
      >
        Historial de Partidos
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

      {/* Panel derecho */}
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
    </nav>
  );
}

export default Navbar;
