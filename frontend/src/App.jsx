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

import EtudiantsListe from './pages/utilisateurs/EtudiantsListe';
import EtudiantForm from './pages/utilisateurs/EtudiantForm';
import EtudiantDetail from './pages/utilisateurs/EtudiantDetail';
import PersonnelsListe from './pages/utilisateurs/PersonnelsListe';
import PersonnelForm from './pages/utilisateurs/PersonnelForm';
import PersonnelDetail from './pages/utilisateurs/PersonnelDetail';
import FormateursListe from './pages/utilisateurs/FormateursListe';
import FormateurForm from './pages/utilisateurs/FormateurForm';
import FormateurDetail from './pages/utilisateurs/FormateurDetail';

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

import TypesEvaluation from './pages/notes/TypesEvaluation';
import SaisieNotes from './pages/notes/SaisieNotes';
import ConsultationNotes from './pages/notes/ConsultationNotes';
import ReleveNotes from './pages/notes/ReleveNotes';
import Deliberation from './pages/notes/Deliberation';

import CategoriesDepense from './pages/finances/CategoriesDepense';
import TypesPaiement from './pages/finances/TypesPaiement';
import Tarifs from './pages/finances/Tarifs';
import CaissesListe from './pages/finances/CaissesListe';
import CaisseDetail from './pages/finances/CaisseDetail';
import InscriptionsListe from './pages/finances/InscriptionsListe';
import InscriptionDetail from './pages/finances/InscriptionDetail';
import PaiementsListe from './pages/finances/PaiementsListe';
import PaiementDetail from './pages/finances/PaiementDetail';
import DepensesListe from './pages/finances/DepensesListe';
import DepenseDetail from './pages/finances/DepenseDetail';

import DocumentsOverview from './pages/documents/DocumentsOverview';
import DiplomesListe from './pages/documents/DiplomesListe';
import DiplomeDetail from './pages/documents/DiplomeDetail';
import DiplomeGenerer from './pages/documents/DiplomeGenerer';
import CertificatsListe from './pages/documents/CertificatsListe';
import CertificatGenerer from './pages/documents/CertificatGenerer';
import DocumentsListe from './pages/documents/DocumentsListe';
import DocumentDetail from './pages/documents/DocumentDetail';
import TypesCertificat from './pages/documents/TypesCertificat';

import VueEnsemble from './pages/bibliotheque/VueEnsemble';
import CatalogueListe from './pages/bibliotheque/CatalogueListe';
import RessourceDetail from './pages/bibliotheque/RessourceDetail';
import RessourceForm from './pages/bibliotheque/RessourceForm';
import ExemplairesListe from './pages/bibliotheque/ExemplairesListe';
import EmpruntsEnCours from './pages/bibliotheque/EmpruntsEnCours';
import EnregistrerEmprunt from './pages/bibliotheque/EnregistrerEmprunt';
import EnregistrerRetour from './pages/bibliotheque/EnregistrerRetour';
import EmpruntsRetards from './pages/bibliotheque/EmpruntsRetards';
import HistoriqueEmprunts from './pages/bibliotheque/HistoriqueEmprunts';
import ReservationsListe from './pages/bibliotheque/ReservationsListe';
import AdherentsListe from './pages/bibliotheque/AdherentsListe';
import InventairesListe from './pages/bibliotheque/InventairesListe';
import InventaireDetail from './pages/bibliotheque/InventaireDetail';
import AcquisitionsListe from './pages/bibliotheque/AcquisitionsListe';
import FournisseursListe from './pages/bibliotheque/FournisseursListe';
import AuteursListe from './pages/bibliotheque/AuteursListe';
import EditeursListe from './pages/bibliotheque/EditeursListe';
import CategoriesListe from './pages/bibliotheque/CategoriesListe';


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

                <Route path="/abonnement-expire" element={<AbonnementExpire />} />
                
                <Route path="/non-autorise" element={<NonAutorise />} />
    
              
                <Route element={ <RouteProtegee> <Layout /> </RouteProtegee> }>
                  

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
                      <EtudiantsListe />
                    </RouteProtegee>
                  } />

                  <Route path="/utilisateurs/etudiants/nouveau" element={
                    <RouteProtegee permission="gerer_etudiants">
                      <EtudiantForm />
                    </RouteProtegee>
                  } />

                  <Route path="/utilisateurs/etudiants/:id/modifier" element={
                    <RouteProtegee permission="gerer_etudiants">
                      <EtudiantForm />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/etudiants/:id" element={
                    <RouteProtegee permission="gerer_etudiants">
                      <EtudiantDetail />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/personnel" element={
                    <RouteProtegee permission="gerer_personnel">
                      <PersonnelsListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/personnel/nouveau" element={
                    <RouteProtegee permission="gerer_personnel">
                      <PersonnelForm />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/personnel/:id/modifier" element={
                    <RouteProtegee permission="gerer_personnel">
                      <PersonnelForm />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/personnel/:id" element={
                    <RouteProtegee permission="gerer_personnel">
                      <PersonnelDetail />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/formateurs" element={
                    <RouteProtegee permission="gerer_formateurs">
                      <FormateursListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/formateurs/nouveau" element={
                    <RouteProtegee permission="gerer_formateurs">
                      <FormateurForm />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/formateurs/:id/modifier" element={
                    <RouteProtegee permission="gerer_formateurs">
                      <FormateurForm />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/utilisateurs/formateurs/:id" element={
                    <RouteProtegee permission="gerer_formateurs">
                      <FormateurDetail />
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






                  {/* ================ Notes ================ */}
                  <Route path="/notes/types-evaluation" element={
                    <RouteProtegee permission="gerer_notes">
                      <TypesEvaluation />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/notes/saisie" element={
                    <RouteProtegee permission="gerer_notes">
                      <SaisieNotes />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/notes/consultation" element={
                    <RouteProtegee permission="gerer_notes">
                      <ConsultationNotes />
                    </RouteProtegee>
                  } />

                  <Route path="/notes/releve" element={
                    <RouteProtegee permission="gerer_notes">
                      <ReleveNotes />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/notes/deliberation" element={
                    <RouteProtegee permission="gerer_notes">
                      <Deliberation />
                    </RouteProtegee>
                  } />







                  {/* ================ Finance ================ */}
                  <Route path="/finances/categories-depense" element={
                    <RouteProtegee permission="gerer_depenses">
                      <CategoriesDepense />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/finances/types-paiement" element={
                    <RouteProtegee permission="gerer_tarifs">
                      <TypesPaiement />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/finances/tarifs" element={
                    <RouteProtegee permission="gerer_tarifs">
                      <Tarifs />
                    </RouteProtegee>
                  } />

                  <Route path="/finances/caisse" element={
                    <RouteProtegee permission="gerer_caisse">
                      <CaissesListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/finances/caisse/:id" element={
                    <RouteProtegee permission="gerer_caisse">
                      <CaisseDetail />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/finances/inscriptions" element={
                    <RouteProtegee permission="gerer_inscriptions">
                      <InscriptionsListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/finances/inscriptions/:id" element={
                    <RouteProtegee permission="gerer_inscriptions">
                      <InscriptionDetail />
                    </RouteProtegee>
                  } />

                  <Route path="/finances/paiements" element={
                    <RouteProtegee permission="gerer_paiements">
                      <PaiementsListe />
                    </RouteProtegee>
                  } />

                  <Route path="/finances/paiements/:id" element={
                    <RouteProtegee permission="gerer_paiements">
                      <PaiementDetail />
                    </RouteProtegee>
                  } />

                  <Route path="/finances/depenses" element={
                    <RouteProtegee permission="gerer_depenses">
                      <DepensesListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/finances/depenses/:id" element={
                    <RouteProtegee permission="gerer_depenses">
                      <DepenseDetail />
                    </RouteProtegee>
                  } />







                  {/* ================ documents ================ */}
                  <Route path="/documents" element={
                    <RouteProtegee permission="gerer_documents">
                      <DocumentsOverview />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/diplomes" element={
                    <RouteProtegee permission="gerer_documents">
                      <DiplomesListe />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/diplomes/generer" element={
                    <RouteProtegee permission="gerer_documents">
                      <DiplomeGenerer />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/diplomes/:id" element={
                    <RouteProtegee permission="gerer_documents">
                      <DiplomeDetail />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/certificats" element={
                    <RouteProtegee permission="gerer_documents">
                      <CertificatsListe />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/certificats/generer" element={
                    <RouteProtegee permission="gerer_documents">
                      <CertificatGenerer />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/documents" element={
                    <RouteProtegee permission="gerer_documents">
                      <DocumentsListe />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/documents/:id" element={
                    <RouteProtegee permission="gerer_documents">
                      <DocumentDetail />
                    </RouteProtegee>
                  } />

                  <Route path="/documents/types-certificat" element={
                    <RouteProtegee permission="gerer_documents">
                      <TypesCertificat />
                    </RouteProtegee>
                  } />







                  {/* ================ Bibliotheque ================ */}
                  <Route path="/bibliotheque" element={
                    <RouteProtegee permission="gerer_bibliotheque_ressources">
                      <VueEnsemble />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/catalogue" element={
                    <RouteProtegee permission="gerer_bibliotheque_ressources">
                      <CatalogueListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/catalogue/nouvelle" element={
                    <RouteProtegee permission="gerer_bibliotheque_ressources">
                      <RessourceForm />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/catalogue/:id" element={
                    <RouteProtegee permission="gerer_bibliotheque_ressources">
                      <RessourceDetail />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/catalogue/:id/modifier" element={
                    <RouteProtegee permission="gerer_bibliotheque_ressources">
                      <RessourceForm />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/exemplaires" element={
                    <RouteProtegee permission="gerer_bibliotheque_exemplaires">
                      <ExemplairesListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/emprunts" element={
                    <RouteProtegee permission="gerer_bibliotheque_emprunts">
                      <EmpruntsEnCours />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/emprunts/enregistrer" element={
                    <RouteProtegee permission="gerer_bibliotheque_emprunts">
                      <EnregistrerEmprunt />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/emprunts/retours" element={
                    <RouteProtegee permission="gerer_bibliotheque_emprunts">
                      <EnregistrerRetour />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/emprunts/retards" element={
                    <RouteProtegee permission="gerer_bibliotheque_emprunts">
                      <EmpruntsRetards />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/emprunts/historique" element={
                    <RouteProtegee permission="gerer_bibliotheque_emprunts">
                      <HistoriqueEmprunts />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/reservations" element={
                    <RouteProtegee permission="gerer_bibliotheque_reservations">
                      <ReservationsListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/adherents" element={
                    <RouteProtegee permission="gerer_bibliotheque_adherents">
                      <AdherentsListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/inventaire" element={
                    <RouteProtegee permission="gerer_bibliotheque_inventaire">
                      <InventairesListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/inventaire/:id" element={
                    <RouteProtegee permission="gerer_bibliotheque_inventaire">
                      <InventaireDetail />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/acquisitions" element={
                    <RouteProtegee permission="gerer_bibliotheque_acquisitions">
                      <AcquisitionsListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/fournisseurs" element={
                    <RouteProtegee permission="gerer_bibliotheque_fournisseurs">
                      <FournisseursListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/auteurs" element={
                    <RouteProtegee permission="gerer_bibliotheque_auteurs">
                      <AuteursListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/editeurs" element={
                    <RouteProtegee permission="gerer_bibliotheque_editeurs">
                      <EditeursListe />
                    </RouteProtegee>
                  } />
                  
                  <Route path="/bibliotheque/categories" element={
                    <RouteProtegee permission="gerer_bibliotheque_categories">
                      <CategoriesListe />
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