import { useState, useMemo } from 'react';

import { NavLink } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import { useParametre } from '../../context/ParametreContext';






const MENUS = [
  {
    id: 'tableau_bord',
    titre: 'Tableau de bord',
    classe: 'tb',
    items: [
      // à enrichir quand l'app statistiques sera construite
    ],
  },

  {
    id: 'authentification',
    titre: 'Auth et Autorisations',
    classe: 'gaa',
    items: [
      { label: 'Permissions', to: '/utilisateurs/permissions', icone: 'fa-key', permission: 'voir_permissions' },
      { label: 'Rôles', to: '/utilisateurs/roles', icone: 'fa-user-tag', permission: 'gerer_roles' },
      { label: 'Utilisateurs', to: '/utilisateurs/comptes', icone: 'fa-user', permission: 'gerer_utilisateurs' },
    ],
  },
  
  {
    id: 'utilisateurs',
    titre: 'Gestion des Utilisateurs',
    classe: 'gu',
    items: [
      { label: 'Étudiants', to: '/utilisateurs/etudiants', icone: 'fa-user-graduate', permission: 'gerer_etudiants' },
      { label: 'Personnel', to: '/utilisateurs/personnel', icone: 'fa-users', permission: 'gerer_personnel' },
      { label: 'Formateurs', to: '/utilisateurs/formateurs', icone: 'fa-chalkboard-teacher', permission: 'gerer_formateurs' },
    ],
  },
  
  {
    id: 'academique',
    titre: 'Gestion Académique',
    classe: 'ga',
    items: [
      { label: 'Filières', to: '/academique/filieres', icone: 'fa-sitemap', permission: 'gerer_filieres' },
      { label: 'Spécialités', to: '/academique/specialites', icone: 'fa-diagram-project', permission: 'gerer_specialites' },
      { label: 'Salles', to: '/academique/salles', icone: 'fa-door-open', permission: 'gerer_salles' },
      { label: 'Matières', to: '/academique/matieres', icone: 'fa-book-open', permission: 'gerer_matieres' },
      { label: 'Niveaux', to: '/academique/niveaux', icone: 'fa-layer-group', permission: 'gerer_niveaux' },
      { label: 'Types-salle', to: '/academique/types-salle', icone: 'fa-tags', permission: 'gerer_salles' },
      { label: 'Classes', to: '/academique/classes', icone: 'fa-users-rectangle', permission: 'gerer_classes' },
      { label: 'Sanctions', to: '/academique/sanctions', icone: 'fa-gavel', permission: 'gerer_sanctions' },
      { label: 'Année.Aca', to: '/academique/annees-academiques', icone: 'fa-calendar-days', permission: 'gerer_annees_academiques' },
      { label: 'Emplois du temps', to: '/academique/emplois-du-temps', icone: 'fa-table-list', permission: 'gerer_emplois_du_temps' },
    ],
  },
  
  {
    id: 'notes',
    titre: 'Gestion des Notes',
    classe: 'gn',
    items: [
      { label: "Evaluation", to: '/notes/types-evaluation', icone: 'fa-list-check', permission: 'gerer_notes' },
      { label: 'Saisie des notes', to: '/notes/saisie', icone: 'fa-pen-to-square', permission: 'gerer_notes' },
      { label: 'Consultation', to: '/notes/consultation', icone: 'fa-eye', permission: 'gerer_notes' },
      { label: 'Relevé de notes', to: '/notes/releve', icone: 'fa-file-lines', permission: 'gerer_notes' },
      { label: 'Délibération', to: '/notes/deliberation', icone: 'fa-scale-balanced', permission: 'gerer_notes' },
    ],
  },
  
  {
    id: 'finances',
    titre: 'Gestion Financière',
    classe: 'gf',
    items: [
      { label: 'Catégories.Dép', to: '/finances/categories-depense', icone: 'fa-tags', permission: 'gerer_depenses' },
      { label: 'Types-paiement', to: '/finances/types-paiement', icone: 'fa-money-check-dollar', permission: 'gerer_tarifs' },
      { label: 'Tarifs', to: '/finances/tarifs', icone: 'fa-sack-dollar', permission: 'gerer_tarifs' },
      { label: 'Caisse', to: '/finances/caisse', icone: 'fa-cash-register', permission: 'gerer_caisse' },
      { label: 'Inscriptions', to: '/finances/inscriptions', icone: 'fa-user-plus', permission: 'gerer_inscriptions' },
      { label: 'Paiements', to: '/finances/paiements', icone: 'fa-credit-card', permission: 'gerer_paiements' },
      { label: 'Dépenses', to: '/finances/depenses', icone: 'fa-money-bill-wave', permission: 'gerer_depenses' },
    ],
  },
  
  {
    id: 'documents',
    titre: 'Gestion Documentaire',
    classe: 'gd',
    items: [
      { label: "Vue d'ensemble", to: '/documents', icone: 'fa-chart-pie', permission: 'gerer_documents' },
      { label: 'Diplômes', to: '/documents/diplomes', icone: 'fa-graduation-cap', permission: 'gerer_documents' },
      { label: 'Certificats', to: '/documents/certificats', icone: 'fa-certificate', permission: 'gerer_documents' },
      { label: 'Documents', to: '/documents/documents', icone: 'fa-folder', permission: 'gerer_documents' },
      { label: 'Types de certificats', to: '/documents/types-certificat', icone: 'fa-tags', permission: 'gerer_documents' },
    ],
  },
  
  {
    id: 'bibliotheque',
    titre: 'Bibliothèque',
    classe: 'gb',
    items: [
      { label: "Vue d'ensemble", to: '/bibliotheque', icone: 'fa-chart-pie', permission: 'gerer_bibliotheque_ressources' },
      { label: 'Catalogue', to: '/bibliotheque/catalogue', icone: 'fa-book', permission: 'gerer_bibliotheque_ressources' },
      { label: 'Exemplaires', to: '/bibliotheque/exemplaires', icone: 'fa-copy', permission: 'gerer_bibliotheque_exemplaires' },
      { label: 'Emprunts en cours', to: '/bibliotheque/emprunts', icone: 'fa-book-reader', permission: 'gerer_bibliotheque_emprunts' },
      { label: 'Retards', to: '/bibliotheque/emprunts/retards', icone: 'fa-triangle-exclamation', permission: 'gerer_bibliotheque_emprunts' },
      { label: 'Historique emprunts', to: '/bibliotheque/emprunts/historique', icone: 'fa-clock-rotate-left', permission: 'gerer_bibliotheque_emprunts' },
      { label: 'Réservations', to: '/bibliotheque/reservations', icone: 'fa-bookmark', permission: 'gerer_bibliotheque_reservations' },
      { label: 'Adhérents', to: '/bibliotheque/adherents', icone: 'fa-users', permission: 'gerer_bibliotheque_adherents' },
      { label: 'Inventaire', to: '/bibliotheque/inventaire', icone: 'fa-clipboard-check', permission: 'gerer_bibliotheque_inventaire' },
      { label: 'Acquisitions', to: '/bibliotheque/acquisitions', icone: 'fa-truck-loading', permission: 'gerer_bibliotheque_acquisitions' },
      { label: 'Fournisseurs', to: '/bibliotheque/fournisseurs', icone: 'fa-industry', permission: 'gerer_bibliotheque_fournisseurs' },
      { label: 'Auteurs', to: '/bibliotheque/auteurs', icone: 'fa-feather', permission: 'gerer_bibliotheque_auteurs' },
      { label: 'Éditeurs', to: '/bibliotheque/editeurs', icone: 'fa-building', permission: 'gerer_bibliotheque_editeurs' },
      { label: 'Catégories', to: '/bibliotheque/categories', icone: 'fa-tags', permission: 'gerer_bibliotheque_categories' },
    ],
  },
  
  {
    id: 'parametres',
    titre: 'Paramètre et Sécurité',
    classe: 'ps',
    items: [
      { label: 'Institut', to: '/parametres/institut', icone: 'fa-school', permission: 'gerer_parametres' },
      { label: 'Notifications', to: '/parametres/notifications', icone: 'fa-bell', permission: null },
      { label: 'Archive', to: '/parametres/archives', icone: 'fa-box-archive', permission: 'gerer_archives' },
      { label: 'Sauvegarde', to: '/parametres/sauvegardes', icone: 'fa-floppy-disk', permission: 'gerer_sauvegardes' },
    ],
  },

];






function normaliser(texte) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // retire les accents pour une recherche plus tolérante
}



function Sidebar({ fermee, affichee }) 
{
  const { user, logout, aPermission } = useAuth();

  const { parametre } = useParametre();

  const [menuOuvert, setMenuOuvert] = useState(null);

  const [recherche, setRecherche] = useState('');


  const toggleMenu = (nom) => {
    setMenuOuvert((actuel) => (actuel === nom ? null : nom));
  };

  const termeRecherche = normaliser(recherche.trim());

  const menusFiltres = useMemo(() => 
  {
    if (!termeRecherche) return MENUS;
  
    return MENUS.map((groupe) => {
      const titreCorrespond = normaliser(groupe.titre).includes(termeRecherche);
  
      const itemsFiltres = groupe.items.filter((item) => {
  
        if (item.permission && !aPermission(item.permission)) return false;
  
        if (titreCorrespond) return true; // le titre du groupe matche : on garde tous ses items visibles
  
        return normaliser(item.label).includes(termeRecherche);
  
      });
  
  
      if (titreCorrespond || itemsFiltres.length > 0) {
        return { ...groupe, items: itemsFiltres };
      }
  
      return null;
  
    }).filter(Boolean);
  
  }, [termeRecherche, aPermission]);
  
  
  const groupeOuvertPourRecherche = (groupeId) => {
    if (!termeRecherche) return menuOuvert === groupeId;
    return true; // pendant une recherche, tous les groupes résultats restent ouverts
  };
  
  
  return (
    <aside className={`sidebar ${fermee ? 'closed' : ''} ${affichee ? 'show' : ''}`} id="sidebar">
  
      <div className="sidebar-top">
        <div className="app-brand">
          {parametre?.logo && <img src={parametre.logo} alt="logo institut" />}
          <h2>{parametre?.sigle || parametre?.nom || 'Institut'}</h2>
        </div>
      </div>
  
      <div className="menu-container">
  
        <div className="profile-box">
          {user ? (
            <>
              {user.photo_profil && <img src={user.photo_profil} alt="profil" />}
              <div className="nom">
                <h4>{user.username}</h4>
                <span>{user.role}</span>
              </div>
            </>
          ) : (
            <p>Vous n'êtes pas connecté.</p>
          )}
          <div className="contact">
            <a href="#"><i className="fas fa-envelope"></i></a>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-whatsapp"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
            <a href="#"><i className="fas fa-phone"></i></a>
          </div>
        </div>
  
  
        <div className="sidebar-search">
          <input type="text" placeholder="rechercher un menu ici ..." className="search-menu" value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
        </div>


        <NavLink to="/" end className={({ isActive }) => `menu-item drop ${isActive ? 'active' : ''}`}>
          <i className="fas fa-home"></i>
          Accueil
        </NavLink>
        
        
        {menusFiltres.map((groupe) => (
          <div key={groupe.id} className={`drop dropdown ${groupeOuvertPourRecherche(groupe.id) ? 'open' : ''}`}>
            
            <div className={`dropdown-btn ${groupe.classe}`} onClick={() => toggleMenu(groupe.id)}>
              <span>{groupe.titre}</span>
            </div>
            
            <div className="dropdown-content">
            
              {groupe.items.length === 0 && !termeRecherche && (
                <span className="menu-vide">Bientôt disponible</span>
              )}
            
              {groupe.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <i className={`fa-solid ${item.icone}`}></i>
                  {item.label}
                </NavLink>
              ))}

              {termeRecherche && groupe.items.length === 0 && (
                <span className="menu-vide">Aucun menu ne correspond</span>
              )}
            
            </div>
          
          </div>
        
        ))}
        
        
        {termeRecherche && menusFiltres.length === 0 && (
          <p className="recherche-vide">Aucun résultat pour « {recherche} »</p>
        )}
      
      </div>
      
      
      <div className="logout-box">
        <button onClick={logout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>
    </aside>
  
  );

}

export default Sidebar;