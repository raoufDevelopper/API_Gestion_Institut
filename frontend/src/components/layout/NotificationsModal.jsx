import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
function NotificationsModal({ ouvert, onFermer }) {
  const [notifications, setNotifications] = useState([]);
  const [filtre, setFiltre] = useState('all');
  useEffect(() => {
    if (ouvert) {
      api.get('parametres/notifications/').then((res) => setNotifications(res.data));
    }
  }, [ouvert]);
  const marquerLue = async (id) => {
    await api.patch(`parametres/notifications/${id}/lue/`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
    );
  };
  const notificationsFiltrees = notifications.filter((n) => {
    if (filtre === 'unread') return !n.lue;
    if (filtre === 'read') return n.lue;
    return true;
  });
  if (!ouvert) return null;
  return (
    <div id="notificationsModal" className="modalNotif">
      <div className="modal-content-notif">
        <span className="closeNotif" onClick={onFermer}>&times;</span>
        <div className="header_notif">
          <h2>Notifications</h2>
          <div className="filter">
            <button className={filtre === 'all' ? 'active' : ''} onClick={() => setFiltre('all')}>Toutes</button>
            <button className={filtre === 'unread' ? 'active' : ''} onClick={() => setFiltre('unread')}>Non lues</button>
            <button className={filtre === 'read' ? 'active' : ''} onClick={() => setFiltre('read')}>Lues</button>
          </div>
        </div>
        <div className="notifications-container" id="notificationsList">
          {notificationsFiltrees.map((notif) => (
            <div key={notif.id} className={`notification ${!notif.lue ? 'unread' : ''}`}>
              <div className="notification-info">
                <div className="notification-title">{notif.titre}</div>
                <div className="notification-message">{notif.message}</div>
                <div className="notification-time">
                  {new Date(notif.date_creation).toLocaleString('fr-FR')}
                </div>
              </div>
              {!notif.lue && (
                <button className="mark-read" onClick={() => marquerLue(notif.id)}>
                  Marquer comme lue
                </button>
              )}
            </div>
          ))}
          {notificationsFiltrees.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px' }}>Aucune notification.</p>
          )}
        </div>
      </div>
    </div>
  );
}
export default NotificationsModal;