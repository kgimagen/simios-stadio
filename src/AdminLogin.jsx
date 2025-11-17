import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

// PEGAR AQUI LOS UID AUTORIZADOS
const ADMINS = ["WZvdE9gkhmWAM3S78UWeU5160L43"];

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (!ADMINS.includes(res.user.uid)) {
        setError("No estás autorizado.");
        return;
      }
      navigate("/admin/panel");
    } catch (err) {
      setError("Login inválido.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>ADMIN LOGIN</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/><br/>

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/><br/>

        <button type="submit">Ingresar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
