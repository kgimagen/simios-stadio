import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const navStyle = {
    padding: "12px",
    background: "#024b32",
    color: "white",
    display: "flex",
    gap: "18px",
    alignItems: "center",
  };

  const linkStyle = { color: "white", textDecoration: "none" };

  return (
    <nav style={navStyle}>
      <strong>Los Simios de Estadio</strong>

      <Link style={linkStyle} to="/">Clausura 25</Link>
      <Link style={linkStyle} to="/descensos">Descensos</Link>
      <Link style={linkStyle} to="/historial">Historial</Link>

      <span style={{ marginLeft: "auto", display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? (
          <>
            <Link style={linkStyle} to="/admin/panel">Cargar Fecha</Link>
            <span>Hola, {user.displayName || user.email}</span>
            <button 
              onClick={logout}
              style={{ 
                background: "transparent",
                border: "1px solid white",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "5px"
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link style={linkStyle} to="/admin">Admin</Link>
        )}
      </span>
    </nav>
  );
}

export default Navbar;
