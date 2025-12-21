import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext";

import TorneoActual from "./pages/TorneoActual.jsx";
import Descensos from "./pages/Descensos.jsx";
import Historial from "./pages/Historial.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminMatch from "./pages/AdminMatch.jsx";
import HistorialTorneos from "./pages/HistorialTorneos.jsx";
import MoverPromedio from "./pages/MoverPromedio.jsx"; // <--- IMPORT NECESARIO
import Palmares from "./pages/PalmaresPage.jsx";



function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/admin" />;
}

function App() {
  return (
    <div style={{ background: "#242e3a", minHeight: "100vh" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<TorneoActual />} />
        <Route path="/descensos" element={<Descensos />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/torneos" element={<HistorialTorneos />} />
        <Route path="/palmares" element={<Palmares />} />
          

        <Route path="/mover-promedio" element={<PrivateRoute><MoverPromedio /></PrivateRoute>} />


        <Route path="/admin" element={<AdminLogin />} />

        <Route path="/admin/match" element={<PrivateRoute><AdminMatch /></PrivateRoute>} />

        <Route path="/admin/panel" element={<Navigate to="/admin/match" />} />
      </Routes>
    </div>
  );
}

export default App;
