import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RouteProtegee from './components/RouteProtegee';
import LoginRegister from './pages/authentification/LoginRegister';
import Dashboard from './pages/Dashboard';
import AbonnementExpire from './pages/AbonnementExpire';
import NonAutorise from './pages/NonAutorise';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/abonnement-expire" element={<AbonnementExpire />} />
          <Route path="/non-autorise" element={<NonAutorise />} />
          <Route path="/" element={
            <RouteProtegee>
              <Dashboard />
            </RouteProtegee>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;