import { useState, useMemo } from 'react';

import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import { useParametre } from '../../context/ParametreContext';






const MENUS = [

  {
    id: 'espace_etudiant',
    titre: 'Mon espace',
    classe: 'mep',
    items: [
      { label: 'Vue globale', to: '/espace-etudiant', icone: 'fa-chart-pie', permission: 'voir_espace_etudiant' },
      { label: 'Mon planning', to: '/espace-etudiant/planning', icone: 'fa-calendar-week', permission: 'voir_espace_etudiant' },
      { label: 'Mes résultats', to: '/espace-etudiant/resultats', icone: 'fa-chart-line', permission: 'voir_espace_etudiant' },
      { label: 'Ma formation', to: '/espace-etudiant/formation', icone: 'fa-graduation-cap', permission: 'voir_espace_etudiant' },
      { label: 'Mes finances', to: '/espace-etudiant/finances', icone: 'fa-sack-dollar', permission: 'voir_espace_etudiant' },
      { label: 'Mes documents', to: '/espace-etudiant/documents', icone: 'fa-folder', permission: 'voir_espace_etudiant' },
      { label: 'Mon dossier', to: '/espace-etudiant/dossier', icone: 'fa-id-card', permission: 'voir_espace_etudiant' },
      { label: 'Mon compte', to: '/espace-etudiant/compte', icone: 'fa-user-gear', permission: 'voir_espace_etudiant' },
    ],
  },

  {
    id: 'tableau_bord',
    titre: 'Tableau de bord',
    classe: 'tb',
    items: [
      { label: 'Résultats', to: '/statistiques/academique', icone: 'fa-chart-line', permission: 'gerer_notes' },
      { label: 'Bibliothèque', to: '/statistiques/bibliotheque', icone: 'fa-chart-pie', permission: 'gerer_bibliotheque_ressources' },
      { label: 'Finance', to: '/statistiques/finance', icone: 'fa-sack-dollar', permission: 'gerer_finances' },
      { label: 'Document', to: '/statistiques/documents', icone: 'fa-folder-tree', permission: 'gerer_documents' },
    ],
  },

  {
    id: 'authentification',
    titre: 'Auth et Autorisations',
    classe: 'gaa',
    items: [
      { label: 'Permissions', to: '/utilisateurs/permissions', icone: 'fa-key', permission: 'gerer_permissions' },
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
      { label: 'Classes', to: '/academique/classes', icone: 'fa-users-rectangle', permission: 'gerer_classes' },
      { label: 'Sanctions', to: '/academique/sanctions', icone: 'fa-gavel', permission: 'gerer_sanctions' },
      { label: 'Emplois du temps', to: '/academique/emplois-du-temps', icone: 'fa-table-list', permission: 'gerer_emplois_du_temps' },
      
      {
        label: 'Configurations', icone: 'fa-gear', sousMenu: [
          { label: 'Niveaux', to: '/academique/niveaux', icone: 'fa-layer-group', permission: 'gerer_niveaux' },
          { label: 'Types-salle', to: '/academique/types-salle', icone: 'fa-tags', permission: 'gerer_salles' },
          { label: 'Année.Aca', to: '/academique/annees-academiques', icone: 'fa-calendar-days', permission: 'gerer_annees_academiques' },
        ],
      },

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
      { label: 'Inscriptions', to: '/finances/inscriptions', icone: 'fa-user-plus', permission: 'gerer_inscriptions' },
      { label: 'Paiements', to: '/finances/paiements', icone: 'fa-credit-card', permission: 'gerer_paiements' },
      { label: 'Dépenses', to: '/finances/depenses', icone: 'fa-money-bill-wave', permission: 'gerer_depenses' },
      { label: 'Caisse', to: '/finances/caisse', icone: 'fa-cash-register', permission: 'gerer_caisse' },

      {
        label: 'Configurations', icone: 'fa-gear', sousMenu: [
          { label: 'Catégories.Dép', to: '/finances/categories-depense', icone: 'fa-tags', permission: 'gerer_depenses' },
          { label: 'Types-paiement', to: '/finances/types-paiement', icone: 'fa-money-check-dollar', permission: 'gerer_tarifs' },
          { label: 'Tarifs', to: '/finances/tarifs', icone: 'fa-sack-dollar', permission: 'gerer_tarifs' },
        ],
      },

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

      {
        label: 'Configurations', icone: 'fa-gear', sousMenu: [
          { label: 'Type.certif', to: '/documents/types-certificat', icone: 'fa-tags', permission: 'gerer_documents' },
        ],
      },

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
      {
        label: 'Configurations', icone: 'fa-gear', sousMenu: [
          { label: 'Catégories', to: '/bibliotheque/categories', icone: 'fa-tags', permission: 'gerer_bibliotheque_categories' },
          { label: 'Auteurs', to: '/bibliotheque/auteurs', icone: 'fa-feather', permission: 'gerer_bibliotheque_auteurs' },
          { label: 'Éditeurs', to: '/bibliotheque/editeurs', icone: 'fa-building', permission: 'gerer_bibliotheque_editeurs' },
          { label: 'Localisations', to: '/bibliotheque/localisations', icone: 'fa-map-marker-alt', permission: 'gerer_bibliotheque_ressources' },
          { label: 'Acquisitions', to: '/bibliotheque/acquisitions', icone: 'fa-truck-loading', permission: 'gerer_bibliotheque_acquisitions' },
          { label: 'Fournisseurs', to: '/bibliotheque/fournisseurs', icone: 'fa-industry', permission: 'gerer_bibliotheque_fournisseurs' },
        ],
      },
    ],
  },
  
  {
    id: 'parametres',
    titre: 'Paramètre et Sécurité',
    classe: 'ps',
    items: [
      { label: 'Institut', to: '/parametres/institut', icone: 'fa-school', permission: 'gerer_parametres' },
      { label: 'Notifications', to: '/parametres/notifications', icone: 'fa-bell', permission: 'gerer_parametres' },
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

// Filtre un item unique (feuille ou groupe "Config") selon permission + recherche.
// Retourne null si l'item doit être masqué, sinon l'item (éventuellement avec sousMenu réduit).
function filtrerItem(item, aPermission, termeRecherche, titreGroupeCorrespond) {
  if (item.sousMenu) {
    const sousFiltres = item.sousMenu.filter((sub) => {
      if (sub.permission && !aPermission(sub.permission)) return false;
      if (!termeRecherche) return true;
      if (titreGroupeCorrespond) return true;
      return normaliser(item.label).includes(termeRecherche) || normaliser(sub.label).includes(termeRecherche);
    });
    if (sousFiltres.length === 0) return null;
    return { ...item, sousMenu: sousFiltres };
  }
  if (item.permission && !aPermission(item.permission)) return null;
  if (!termeRecherche) return item;
  if (titreGroupeCorrespond) return item;
  return normaliser(item.label).includes(termeRecherche) ? item : null;
}
function Sidebar({ fermee, affichee })
{
  const { user, logout, aPermission } = useAuth();
  const { parametre } = useParametre();
  const [menuOuvert, setMenuOuvert] = useState(null);
  const [sousMenuOuvert, setSousMenuOuvert] = useState(null);
  const [recherche, setRecherche] = useState('');
  const location = useLocation();
  const toggleMenu = (nom) => {
    setMenuOuvert((actuel) => (actuel === nom ? null : nom));
  };
  const termeRecherche = normaliser(recherche.trim());
  // Filtrage TOUJOURS appliqué (permission + recherche), plus de court-circuit "pas de recherche = tout afficher".
  const menusFiltres = useMemo(() =>
  {
    return MENUS.map((groupe) => {
      const titreCorrespond = termeRecherche ? normaliser(groupe.titre).includes(termeRecherche) : false;
      const itemsFiltres = groupe.items
        .map((item) => filtrerItem(item, aPermission, termeRecherche, titreCorrespond))
        .filter(Boolean);
      if (itemsFiltres.length > 0) {
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
          {parametre?.logo && <img src={parametre.logo} alt="" />}
          <h2>{parametre?.sigle || parametre?.nom || 'Nom de l Institut'}</h2>
        </div>
      </div>
 
      <div className="menu-container">
 
        <div className="profile-box">
          {user ? (
            <>
              {user.photo_profil && <img src={user.photo_profil} alt="profil" />}
              <div className="nom">
                <h4>{user.username}</h4>
                <span className={`badge-${user.role === 'Étudiant' ? 'orange' : 'violet'}`}>
                  <p className='bull'>&bull;</p>
                  {user.role}
                </span>
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
              {groupe.items.map((item) => (
                item.sousMenu ? (
                  <div
                    key={item.label}
                    className="menu-item-parent"
                    onMouseEnter={() => setSousMenuOuvert(`${groupe.id}-${item.label}`)}
                    onMouseLeave={() => setSousMenuOuvert(null)}
                  >
                    <div
                      className={`sous-menu-declencheur ${item.sousMenu.some((s) => location.pathname === s.to) ? 'active' : ''}`}
                      onClick={() => setSousMenuOuvert((actuel) => (actuel === `${groupe.id}-${item.label}` ? null : `${groupe.id}-${item.label}`))}
                    >
                      <i className={`fa-solid ${item.icone}`}></i>
                      {item.label}
                      <i className="fas fa-chevron-right fleche-sous-menu"></i>
                    </div>
                    {sousMenuOuvert === `${groupe.id}-${item.label}` && (
                      <div className="flyout-panel">
                        <div className="flyout-titre">{item.label}</div>
                        {item.sousMenu.map((sub) => (
                          <NavLink key={sub.to} to={sub.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
                            <i className={`fa-solid ${sub.icone}`}></i>
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink key={item.to} to={item.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
                    <i className={`fa-solid ${item.icone}`}></i>
                    {item.label}
                  </NavLink>
                )
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
