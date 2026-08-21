import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RouteProtegee from './components/RouteProtegee';
import Layout from './components/layout/Layout';
import LoginRegister from './pages/authentification/LoginRegister';
import Dashboard from './pages/Dashboard';
import AbonnementExpire from './pages/AbonnementExpire';
import NonAutorise from './pages/NonAutorise';
import { ThemeProvider } from './context/ThemeContext';
import Notifications from './pages/parametres/Notifications';
import ParametresInstitut from './pages/parametres/ParametresInstitut';
import { AlertProvider } from './context/AlertContext';
import AlertPopup from './components/AlertPopup';
import { ParametreProvider } from './context/ParametreContext';
import Permissions from './pages/authentification/Permissions';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ParametreProvider>
          <AlertProvider>
            <BrowserRouter>
              <Routes>
                  
                  <Route path="/login" element={<LoginRegister />} />
                  
                  <Route path="/abonnement-expire" element={<AbonnementExpire />} />
                  
                  <Route path="/non-autorise" element={<NonAutorise />} />
                  
                
                  <Route element={ <RouteProtegee> <Layout /> </RouteProtegee> }>
                    
                    <Route path="/" element={<Dashboard />} />
                    
                    <Route path="/parametres/notifications" element={
                      <RouteProtegee permission="gerer_parametres">
                        <Notifications />
                      </RouteProtegee>
                    } />

                    <Route path="/parametres/institut" element={
                      <RouteProtegee permission="gerer_parametres">
                        <ParametresInstitut />
                      </RouteProtegee>
                    } />

                    <Route path="/utilisateurs/permissions" element={
                      <RouteProtegee permission="voir_permissions">
                        <Permissions />
                      </RouteProtegee>
                    } />
                                        
                  </Route>
                
                </Routes>

            </BrowserRouter>

            <AlertPopup />
          
          </AlertProvider>
        </ParametreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;