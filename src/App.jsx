import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext";

import Clausura from "./pages/Clausura25.jsx";
import Descensos from "./pages/Descensos.jsx";
import Historial from "./pages/Historial.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminMatch from "./pages/AdminMatch.jsx";
import HistorialTorneos from "./pages/HistorialTorneos.jsx";


function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/admin" />;
}

function App() {
  return (
    <div style={{ background: "#242e3a", minHeight: "100vh" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Clausura />} />
        <Route path="/descensos" element={<Descensos />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/torneos" element={<HistorialTorneos />} />
        
        {/* Login */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Único panel oficial */}
        <Route path="/admin/match" element={<PrivateRoute><AdminMatch /></PrivateRoute>} />

        {/* Si intentan ir a /admin/panel los redirijo */}
        <Route path="/admin/panel" element={<Navigate to="/admin/match" />} />
      </Routes>
    </div>
  );
}

export default App;
