import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PeutAcceder from '../PeutAcceder';



function Sidebar({ fermee, affichee }) {

  const { user , logout } = useAuth();
  
  const [menuOuvert, setMenuOuvert] = useState(null);
  
  const toggleMenu = (nom) => {
    setMenuOuvert((actuel) => (actuel === nom ? null : nom));
  };


  return (
    <aside className={`sidebar ${fermee ? 'closed' : ''} ${affichee ? 'show' : ''}`} id="sidebar">
      
      <div className="sidebar-top">

        <div className="app-brand">
          {/* logo de l'institut à brancher une fois l'app parametres consommée */}
          <img src="/logo_ifpPo.png" alt="logo" />
          <h2>IFP-PERLE D'OR</h2>
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
          <input type="text" placeholder="rechercher un menu ici ..." className="search-menu" />
        </div>
        
        <NavLink to="/" end className={({ isActive }) => `menu-item drop ${isActive ? 'active' : ''}`}>
          <i className="fas fa-home"></i>
          Accueil
        </NavLink>
        
        
        {/* ---- Tableau de bord (à enrichir avec statistiques) ---- */}
        <div className={`drop dropdown ${menuOuvert === 'tableau_bord' ? 'open' : ''}`}>
          <div className="dropdown-btn tb" onClick={() => toggleMenu('tableau_bord')}>
            <span>Tableau de bord</span>
          </div>
          <div className="dropdown-content">
            {/* liens à ajouter quand l'app statistiques sera construite */}
          </div>
        </div>
        
        
        {/* ---- Gestion des Utilisateurs (à enrichir) ---- */}
        <div className={`drop dropdown ${menuOuvert === 'utilisateurs' ? 'open' : ''}`}>
          <div className="dropdown-btn gu" onClick={() => toggleMenu('utilisateurs')}>
            <span><label>Gestion des Utilisateurs</label></span>
          </div>
          <div className="dropdown-content">
            {/* PeutAcceder permission="voir_personnel" / "voir_formateurs" / "voir_etudiants" / "voir_utilisateurs" / "voir_roles" à ajouter ici */}
          </div>
        </div>
        
        
        
        {/* ---- Gestion Académique (à enrichir) ---- */}
        <div className={`drop dropdown ${menuOuvert === 'academique' ? 'open' : ''}`}>
          <div className="dropdown-btn ga" onClick={() => toggleMenu('academique')}>
            <span>Gestion Académique</span>
          </div>
          <div className="dropdown-content">
            {/* PeutAcceder permission="voir_filieres" / "voir_specialites" / "voir_matieres" / "voir_salles" / "voir_emplois_du_temps" / "voir_sanctions" à ajouter ici */}
          </div>
        </div>
        
        
        
        {/* ---- Gestion des Notes (à enrichir) ---- */}
        <div className={`drop dropdown ${menuOuvert === 'notes' ? 'open' : ''}`}>
          <div className="dropdown-btn gn" onClick={() => toggleMenu('notes')}>
            <span>Gestion des Notes</span>
          </div>
          <div className="dropdown-content">
            {/* PeutAcceder permission="voir_notes" à ajouter ici */}
          </div>
        </div>
        
        
        
        {/* ---- Gestion Financière (à enrichir) ---- */}
        <div className={`drop dropdown ${menuOuvert === 'finances' ? 'open' : ''}`}>
          <div className="dropdown-btn gf" onClick={() => toggleMenu('finances')}>
            <span>Gestion Financière</span>
          </div>
          <div className="dropdown-content">
            {/* PeutAcceder permission="voir_inscriptions" / "voir_paiements" / "voir_depenses" / "voir_caisse" / "gerer_tarifs" à ajouter ici */}
          </div>
        </div>
        
        
        
        
        {/* ---- Gestion Documentaire (à enrichir) ---- */}
        <div className={`drop dropdown ${menuOuvert === 'documents' ? 'open' : ''}`}>
          <div className="dropdown-btn gd" onClick={() => toggleMenu('documents')}>
            <span>Gestion Documentaire</span>
          </div>
          <div className="dropdown-content">
            {/* PeutAcceder permission="gerer_documents" à ajouter ici */}
          </div>
        </div>
        
        
        
        {/* ---- Bibliothèque (à enrichir) ---- */}
        <div className={`drop dropdown ${menuOuvert === 'bibliotheque' ? 'open' : ''}`}>
          <div className="dropdown-btn gb" onClick={() => toggleMenu('bibliotheque')}>
            <span>Bibliothèque</span>
          </div>
          <div className="dropdown-content">
            {/* PeutAcceder permission="voir_bibliotheque" à ajouter ici */}
          </div>
        </div>
        
        
        
        {/* ---- Paramètre et Sécurité (à enrichir) ---- */}
        <PeutAcceder permission="gerer_parametres">
        <div className={`drop dropdown ${menuOuvert === 'parametres' ? 'open' : ''}`}>
          <div className="dropdown-btn ps" onClick={() => toggleMenu('parametres')}>
            <span>Paramètre et Sécurité</span>
          </div>
          <div className="dropdown-content">
            <PeutAcceder permission="gerer_parametres">
              <NavLink to="/parametres/institut" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa-solid fa-school"></i>
                Institut
              </NavLink>
            </PeutAcceder>
            <PeutAcceder permission="gerer_archives">
              <NavLink to="/parametres/archives" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa-solid fa-box-archive"></i>
                Archive
              </NavLink>
            </PeutAcceder>
            <PeutAcceder permission="gerer_sauvegardes">
              <NavLink to="/parametres/sauvegardes" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa-solid fa-floppy-disk"></i>
                Sauvegarde
              </NavLink>
            </PeutAcceder>
          </div>
        </div>
        </PeutAcceder>
      </div>
      
      
      <div className="logout-box">
        <button onClick={logout} className='logout-btn'>
          <i className="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>

    </aside>
  );
}
export default Sidebar;