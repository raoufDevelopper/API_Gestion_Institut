import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RouteProtegee from './components/RouteProtegee';
import Layout from './components/layout/Layout';
import LoginRegister from './pages/authentification/LoginRegister';
import Dashboard from './pages/Dashboard';
import AbonnementExpire from './pages/AbonnementExpire';
import NonAutorise from './pages/NonAutorise';
import { ThemeProvider } from './context/ThemeContext';


function App() {
  
  return (
    
    <BrowserRouter>
    
      <ThemeProvider>
    
        <AuthProvider>
    
          <Routes>
            
            <Route path="/login" element={<LoginRegister />} />
            
            <Route path="/abonnement-expire" element={<AbonnementExpire />} />
            
            <Route path="/non-autorise" element={<NonAutorise />} />
            
            <Route element={ <RouteProtegee> <Layout /> </RouteProtegee> }>
              <Route path="/" element={<Dashboard />} />
            </Route>

          </Routes>
        
        </AuthProvider>
      
      </ThemeProvider>
    
    </BrowserRouter>
  );

}


export default App;