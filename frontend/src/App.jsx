import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import { ParametreProvider } from './context/ParametreContext';

import RouteProtegee from './components/RouteProtegee';
import AlertPopup from './components/AlertPopup';
import Layout from './components/layout/Layout';

import Dashboard from './pages/Dashboard';
import AbonnementExpire from './pages/AbonnementExpire';
import NonAutorise from './pages/NonAutorise';

import Notifications from './pages/parametres/Notifications';
import ParametresInstitut from './pages/parametres/ParametresInstitut';

import Permissions from './pages/authentification/Permissions';
import LoginRegister from './pages/authentification/LoginRegister';
import Roles from './pages/authentification/Roles';
import Utilisateurs from './pages/authentification/Utilisateurs';

import Etudiants from './pages/utilisateurs/Etudiants';

import Niveaux from './pages/academique/Niveaux';
import Specialites from './pages/academique/Specialites';
import Filieres from './pages/academique/Filieres';
import TypesSalle from './pages/academique/TypesSalle';
import Salles from './pages/academique/Salles';
import Matieres from './pages/academique/Matieres';
import Classes from './pages/academique/Classes';
import Sanctions from './pages/academique/Sanctions';
import AnneesAcademiques from './pages/academique/AnneesAcademiques';
import EmploisDuTempsListe from './pages/academique/EmploisDuTempsListe';
import EmploisDuTempsBlocs from './pages/academique/EmploisDuTempsBlocs';
import EmploiDuTempsForm from './pages/academique/EmploiDuTempsForm';
import EmploiDuTempsDetail from './pages/academique/EmploiDuTempsDetail';




function App() {

  return (

    <ThemeProvider>
    
      <AuthProvider>
    
        <ParametreProvider>
    
          <AlertProvider>
    
            <BrowserRouter>
    
              <Routes>
                  
                {/* ================ Routes non Protégées ================ */}

                <Route path="/login" element={<LoginRegister />} />


              
                <Route element={ <RouteProtegee> <Layout /> </RouteProtegee> }>
                  
                  
                  <Route path="/abonnement-expire" element={<AbonnementExpire />} />
                
                  <Route path="/non-autorise" element={<NonAutorise />} />





                  {/* ================ Page d'accueil ================ */}
                  <Route path="/" element={<Dashboard />} />
                  




                  {/* ================ Parametres ================ */}
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





                  {/* ================ Authentification ================ */}
                  <Route path="/utilisateurs/permissions" element={
                    <RouteProtegee permission="gerer_permissions">
                      <Permissions />
                    </RouteProtegee>
                  } />

                  <Route path="/utilisateurs/roles" element={
                    <RouteProtegee permission="gerer_roles">
                      <Roles />
                    </RouteProtegee>
                  } />

                  <Route path="/utilisateurs/comptes" element={
                    <RouteProtegee permission="gerer_utilisateurs">
                      <Utilisateurs />
                    </RouteProtegee>
                  } />





                  {/* ================ Utilisateurs ================ */}
                  <Route path="/utilisateurs/etudiants" element={
                    <RouteProtegee permission="gerer_etudiants">
                      <Etudiants />
                    </RouteProtegee>
                  } />






                  {/* ================ Academique ================ */}
                  <Route path="/academique/niveaux" element={
                    <RouteProtegee permission="gerer_niveaux">
                      <Niveaux />
                    </RouteProtegee>
                  } />

                  <Route path="/academique/filieres" element={
                    <RouteProtegee permission="gerer_filieres">
                      <Filieres />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/academique/specialites" element={
                    <RouteProtegee permission="gerer_specialites">
                      <Specialites />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/academique/types-salle" element={
                    <RouteProtegee permission="gerer_salles">
                      <TypesSalle />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/academique/salles" element={
                    <RouteProtegee permission="gerer_salles">
                      <Salles />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/academique/matieres" element={
                    <RouteProtegee permission="gerer_matieres">
                      <Matieres />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/academique/classes" element={
                    <RouteProtegee permission="gerer_classes">
                      <Classes />
                    </RouteProtegee>
                  } />

                  <Route path="/academique/sanctions" element={
                    <RouteProtegee permission="gerer_sanctions">
                      <Sanctions />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/academique/annees-academiques" element={
                    <RouteProtegee permission="gerer_annees_academiques">
                      <AnneesAcademiques />
                    </RouteProtegee>
                  } />

                  <Route path="/academique/emplois-du-temps" element={
                    <RouteProtegee permission="gerer_emplois_du_temps">
                      <EmploisDuTempsListe />
                    </RouteProtegee>
                  } />

                  <Route path="/academique/emplois-du-temps/blocs" element={
                    <RouteProtegee permission="gerer_emplois_du_temps">
                      <EmploisDuTempsBlocs />
                    </RouteProtegee>
                  } />

                  <Route path="/academique/emplois-du-temps/nouveau" element={
                    <RouteProtegee permission="gerer_emplois_du_temps">
                      <EmploiDuTempsForm />
                    </RouteProtegee>
                  } />

                  <Route path="/academique/emplois-du-temps/:id/modifier" element={
                    <RouteProtegee permission="gerer_emplois_du_temps">
                      <EmploiDuTempsForm />
                    </RouteProtegee>
                  } />

                  <Route path="/academique/emplois-du-temps/:id" element={
                    <RouteProtegee permission="gerer_emplois_du_temps">
                      <EmploiDuTempsDetail />
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