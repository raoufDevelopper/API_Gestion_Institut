import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, toggleLecture } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/NotificationsModal.css'





const ICONES_TYPE = {
  info: 'fa-circle-info',
  succes: 'fa-circle-check',
  avertissement: 'fa-triangle-exclamation',
  erreur: 'fa-circle-xmark',
};
function tempsEcoule(dateString) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(dateString)) / 60000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function NotificationsModal({ ouvert, onFermer }) {
  const [notifications, setNotifications] = useState([]);
  const { rafraichirNotifications } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ouvert) {
      getNotifications().then((res) => {
        setNotifications(res.data.filter((n) => !n.lue));
      });
    }
  }, [ouvert]);
  const marquerLue = async (id) => {
    await toggleLecture(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    rafraichirNotifications();
  };
  const voirToutes = () => {
    onFermer();
    navigate('/parametres/notifications');
  };
  if (!ouvert) return null;
  
  
  
  return (
    <div className="notif-modal-overlay" onClick={onFermer}>
      <div className="notif-modal-panel" onClick={(e) => e.stopPropagation()}>
        
        
        
        
        <div className="notif-modal-body">
          {notifications.length === 0 && (
            <div className="notif-modal-empty">
              <i className="fas fa-bell-slash"></i>
              <p>Aucune notification non lue.</p>
            </div>
          )}
          {notifications.map((n, index) => (
            <div
              key={n.id}
              className={`notif-modal-item type-${n.type_notification}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className={`notif-modal-icon type-${n.type_notification}`}>
                <i className={`fas ${ICONES_TYPE[n.type_notification] || 'fa-bell'}`}></i>
              </div>
              <div className="notif-modal-content">
                <p className="notif-modal-title">{n.titre}</p>
                <p className="notif-modal-message">{n.message}</p>
                <span className="notif-modal-time">{tempsEcoule(n.date_creation)}</span>
              </div>
              <button className="notif-modal-check" onClick={() => marquerLue(n.id)} title="Marquer comme lue">
                <i className="fas fa-check"></i>
              </button>
            </div>
          ))}
        </div>

      
      </div>
    </div>
  );
}
export default NotificationsModal;