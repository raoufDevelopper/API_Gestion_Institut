import { useState, useEffect, useMemo } from 'react';
import { getNotifications, toggleLecture, supprimerNotification, marquerToutesLues, effacerLues, } from '../../api/notifications';
import '../../assets/css/notification.css'


const ICONES_TYPE = {
  info: 'fa-circle-info',
  succes: 'fa-circle-check',
  avertissement: 'fa-triangle-exclamation',
  erreur: 'fa-circle-xmark',
};


function nomGroupeDate(dateString) 
{
  const date = new Date(dateString);

  const aujourdHui = new Date();

  const hier = new Date();

  hier.setDate(aujourdHui.getDate() - 1);

  if (date.toDateString() === aujourdHui.toDateString()) return "Aujourd'hui";

  if (date.toDateString() === hier.toDateString()) return 'Hier';

  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}


function Notifications() 
{
  const [notifications, setNotifications] = useState([]);

  const [onglet, setOnglet] = useState('toutes');

  const [typeActif, setTypeActif] = useState('toutes');

  const [recherche, setRecherche] = useState('');

  const charger = async () => {
    const res = await getNotifications();
    setNotifications(res.data);
  };

  useEffect(() => {
    charger();
  }, []);


  const total = notifications.length;

  const nbNonLues = notifications.filter((n) => !n.lue).length;

  const nbLues = total - nbNonLues;

  const compteursType = useMemo(() => {

    const compteurs = {};

    notifications.forEach((n) => {
      compteurs[n.type_notification] = (compteurs[n.type_notification] || 0) + 1;
    });

    return compteurs;

  }, [notifications]);
  
  
  const notificationsFiltrees = notifications.filter((n) => {
  
    if (onglet === 'non-lues' && n.lue) return false;
  
    if (onglet === 'lues' && !n.lue) return false;
  
    if (typeActif !== 'toutes' && n.type_notification !== typeActif) return false;
  
    if (recherche) {
      const texte = (n.titre + ' ' + n.message).toLowerCase();
      if (!texte.includes(recherche.toLowerCase())) return false;
    }
  
    return true;
  
  });
  
  const groupes = notificationsFiltrees.reduce((acc, n) => {
  
    const nom = nomGroupeDate(n.date_creation);
  
    if (!acc[nom]) acc[nom] = [];
  
    acc[nom].push(n);
  
    return acc;
  
  }, {});
  
  const handleToggleLecture = async (id) => {
    const res = await toggleLecture(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? res.data : n)));
  };
  
  
  const handleSupprimer = async (id) => {
    await supprimerNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  
  const handleToutLu = async () => {
    await marquerToutesLues();
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
  };
  
  const handleEffacerLues = async () => {
    await effacerLues();
    setNotifications((prev) => prev.filter((n) => !n.lue));
  };


  const formatDateNotification = (dateCreation) => {
    
    const maintenant = new Date();
    
    const date = new Date(dateCreation);
    
    const difference = maintenant - date;
    
    const secondes = Math.floor(difference / 1000);
    
    const minutes = Math.floor(secondes / 60);
    
    const heures = Math.floor(minutes / 60);
    
    if (secondes < 60) {
        return `Il y a ${secondes} seconde${secondes > 1 ? 's' : ''}`;
    }
    
    if (minutes < 60) {
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    if (heures < 24 && maintenant.toDateString() === date.toDateString()) {
        return `Il y a ${heures} heure${heures > 1 ? 's' : ''}`;
    }
    
    return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', {hour: '2-digit',minute: '2-digit'});  
  
  };
  
  
  return (
    <div className="container-principal">
  
      <div className="shell">
  
        <div className="page-header">
  
          <div>
            <h1>
              <i className="fas fa-bell icon-bell"></i>
              Notifications
            </h1>
            <p id="resume-header">
              {total} notification{total > 1 ? 's' : ''} au total, dont {nbNonLues} non lue{nbNonLues > 1 ? 's' : ''}.
            </p>
          </div>
  
  
          <div className="header-actions">
            <button type="button" className="btn btn-outline" onClick={handleToutLu}>
              <i className="fas fa-check"></i>
              Tout marquer comme lu
            </button>
            <button type="button" className="btn btn-outline" onClick={handleEffacerLues}>
              <i className="fas fa-trash"></i>
              Effacer les lues
            </button>
          </div>
  
        </div>
  
  
        <div className="layout">
  
            <div>
    
                <div className="toolbar">
    
                    <div className="search-box">
                        <i className="fas fa-magnifying-glass"></i>
                        <input type="text" placeholder="Rechercher une notification..." value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
                    </div>
        
                    <div className="tab-group">
                        <button type="button" className={`tab-btn ${onglet === 'toutes' ? 'active' : ''}`} onClick={() => setOnglet('toutes')} >
                            Toutes <span className="count">{total}</span>
                        </button>
                        <button type="button" className={`tab-btn ${onglet === 'non-lues' ? 'active' : ''}`} onClick={() => setOnglet('non-lues')} >
                            Non lues <span className="count">{nbNonLues}</span>
                        </button>
                        <button type="button" className={`tab-btn ${onglet === 'lues' ? 'active' : ''}`} onClick={() => setOnglet('lues')} >
                            Lues <span className="count">{nbLues}</span>
                        </button>
                    </div>

                </div>


                {total === 0 && (
                  <div className="notif-list">
                    <div className="empty-state">
                      <i className="fas fa-bell"></i>
                      <p>Aucune notification pour le moment.</p>
                    </div>
                  </div>
                )}


                {Object.entries(groupes).map(([nomGroupe, notifs]) => (
                
                    <div className="date-group" key={nomGroupe}>
                        
                        <p className="date-group-title">{nomGroupe}</p>
                        
                        <div className="notif-list">
                        
                        {notifs.map((n) => (
                        
                            <div key={n.id} className={`notif-item ${!n.lue ? 'non-lue' : ''}`}>

                                <div className={`notif-icon type-${n.type_notification}`}>
                                    <i className={`fas ${ICONES_TYPE[n.type_notification] || 'fa-bell'}`}></i>
                                </div>


                                <div className="notif-body">

                                    <div className="notif-top-row">
                                    
                                        <div className="notif-title">
                                            {!n.lue && <span className="dot-non-lue"></span>}
                                            {n.titre}
                                        </div>

                                        <div className="notif-time">
                                            {formatDateNotification(n.date_creation)}
                                        </div>

                                    </div>

                                    <div className="notif-desc">{n.message}</div>

                                    <div className="notif-actions">

                                        <button type="button" className="notif-action-btn" onClick={() => handleToggleLecture(n.id)}>
                                            <i className={`fas ${n.lue ? 'fa-circle' : 'fa-check'}`}></i>
                                            {n.lue ? 'Marquer comme non lue' : 'Marquer comme lue'}
                                        </button>
                                        
                                        {n.lien && (<a href={n.lien} className="notif-action-btn">Ouvrir</a>)}
                                        
                                        <button type="button" className="notif-action-btn danger" onClick={() => handleSupprimer(n.id)}>
                                            <i className="fas fa-trash"></i>
                                            Supprimer
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                        </div>

                    </div>

                ))}

            </div>



            <div>
                
                <div className="side-card">
                
                    <div className="summary-total">
                        <span className="value">{nbNonLues}</span>
                        <span className="label">non lues sur {total}</span>
                    </div>
                    
                    <button type="button" className={`filter-btn ${typeActif === 'toutes' ? 'active' : ''}`} onClick={() => setTypeActif('toutes')}>
                        <span className="left">
                            <span className="summary-dot" style={{ background: 'var(--indigo)' }}></span>
                            Toutes les catégories
                        </span>
                        <span className="count-badge">{total}</span>
                    </button>
                    
                    {['info', 'succes', 'avertissement', 'erreur'].map((type) => (
                    
                        <button key={type} type="button" className={`filter-btn ${typeActif === type ? 'active' : ''}`} onClick={() => setTypeActif(type)}>
                            <span className="left">
                                <span className={`summary-dot dot-${type}`}></span>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                            <span className="count-badge">{compteursType[type] || 0}</span>
                        </button>
                    
                    ))}

                </div>

            </div>

        </div>

      </div>

    </div>

  );

}


export default Notifications;