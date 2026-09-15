import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import UsersPanel from './pages/UsersPanel';
import Reports from './pages/Reports';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// CORRECCIÓN 1: Dejamos el Layout limpio. El Outlet se encarga de llamar al Dashboard automáticamente
function ProtectedLayout() {
  return (
    <>
      <main>
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Tu pantalla de Login (queda limpia, sin Navbar ni Footer) */}
          <Route path="/login" element={<Login />} />

          {/* CORRECCIÓN 2: Como tu PrivateRoute usa "children", lo envolvemos así */}
          <Route 
            element={
              <PrivateRoute>
                <ProtectedLayout />
              </PrivateRoute>
            }
          >
            {/* El Dashboard se queda aquí. React Router lo inyectará dentro del <Outlet /> de arriba */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<UsersPanel />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Tu redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

