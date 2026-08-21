import { useAlert } from '../context/AlertContext';
import '../assets/css/AlertPopup.css'


function AlertPopup() {
  
  const { alerte, fermerAlerte } = useAlert();
  
  if (!alerte) return null;
  
  return (
    <div className="alert-popup-overlay" onClick={fermerAlerte}>
      <div className={`alert-popup-card ${alerte.type}`} onClick={(e) => e.stopPropagation()}>
        <div className="alert-popup-icon">
          <i className={`fas ${alerte.type === 'succes' ? 'fa-thumbs-up' : 'fa-xmark'}`}></i>
        </div>
        <p className="alert-popup-message">{alerte.message}</p>
        <span className="alert-popup-hint">Cliquez en dehors pour fermer</span>
      </div>
    </div>
  );

}

export default AlertPopup;