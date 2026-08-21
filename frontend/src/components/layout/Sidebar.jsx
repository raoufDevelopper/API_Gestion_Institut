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
      { label: 'Permissions', to: '/utilisateurs/permissions', icone: 'fa-user-tag', permission: 'voir_permissions' },
    ],
  },
  {
    id: 'utilisateurs',
    titre: 'Gestion des Utilisateurs',
    classe: 'gu',
    items: [
      // { label: 'Personnel', to: '/utilisateurs/personnel', icone: 'fa-users', permission: 'voir_personnel' },
      // { label: 'Formateur', to: '/utilisateurs/formateurs', icone: 'fa-person-chalkboard', permission: 'voir_formateurs' },
      // { label: 'Apprenant', to: '/utilisateurs/etudiants', icone: 'fa-user-graduate', permission: 'voir_etudiants' },
      // { label: 'Utilisateur', to: '/utilisateurs/comptes', icone: 'fa-user', permission: 'voir_utilisateurs' },
      // { label: 'Rôle', to: '/utilisateurs/roles', icone: 'fa-user-tag', permission: 'voir_roles' },
    ],
  },
  {
    id: 'academique',
    titre: 'Gestion Académique',
    classe: 'ga',
    items: [],
  },
  {
    id: 'notes',
    titre: 'Gestion des Notes',
    classe: 'gn',
    items: [],
  },
  {
    id: 'finances',
    titre: 'Gestion Financière',
    classe: 'gf',
    items: [],
  },
  {
    id: 'documents',
    titre: 'Gestion Documentaire',
    classe: 'gd',
    items: [],
  },
  {
    id: 'bibliotheque',
    titre: 'Bibliothèque',
    classe: 'gb',
    items: [],
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