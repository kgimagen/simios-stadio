import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// LISTA DE CUENTAS PERMITIDAS
const ADMIN_EMAILS = ["kgimagen@gmail.com"]; // agregá otros emails si querés

function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!ADMIN_EMAILS.includes(user.email)) {
        setError("No estás autorizado.");
        await auth.signOut();
        return;
      }

      navigate("/admin/panel");
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>LOGIN ADMIN</h1>

      <button
        onClick={handleLogin}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          background: "#4285F4",
          border: "none",
          borderRadius: "4px",
          color: "white",
        }}
      >
        Ingresar con Google
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
