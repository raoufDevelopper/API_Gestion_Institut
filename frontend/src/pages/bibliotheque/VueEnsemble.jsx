import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVueEnsemble } from '../../api/bibliotheque';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';

function VueEnsemble() {
  const [donnees, setDonnees] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { getVueEnsemble().then((res) => setDonnees(res.data)); }, []);

  if (!donnees) return <Loader label="Chargement en cours..." />;
  
  const { kpis, activites_recentes } = donnees;
  
  
  
  return (
    <div className="container-principal">
  
      <div className="department-page">
  
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Bienvenue 👋</h3>
            <div className="sub">Voici un aperçu de l'activité de la bibliothèque</div>
          </div>
        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/catalogue')}>
            <div className="kpi-icon blue"><i className="fas fa-book"></i></div>
            <div className="count-top"><h2>{kpis.ressources}</h2><span>Ressources</span></div>
          </div>

          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/exemplaires')}>
            <div className="kpi-icon aqua"><i className="fas fa-copy"></i></div>
            <div className="count-top"><h2>{kpis.exemplaires}</h2><span>Exemplaires</span></div>
          </div>

          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/emprunts')}>
            <div className="kpi-icon violet"><i className="fas fa-book-reader"></i></div>
            <div className="count-top"><h2>{kpis.emprunts_en_cours}</h2><span>Emprunts en cours</span></div>
          </div>

        </div>



        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/emprunts/retards')}>
            <div className="kpi-icon red"><i className="fas fa-triangle-exclamation"></i></div>
            <div className="count-top"><h2>{kpis.retards}</h2><span>Retards</span></div>
          </div>

          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/reservations')}>
            <div className="kpi-icon orange"><i className="fas fa-bookmark"></i></div>
            <div className="count-top"><h2>{kpis.reservations}</h2><span>Réservations</span></div>
          </div>

        </div>





        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/adherents')}>
            <div className="kpi-icon green"><i className="fas fa-users"></i></div>
            <div className="count-top"><h2>{kpis.adherents}</h2><span>Adhérents</span></div>
          </div>

          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/acquisitions')}>
            <div className="kpi-icon blue"><i className="fas fa-truck-loading"></i></div>
            <div className="count-top"><h2>{kpis.acquisitions_annee}</h2><span>Acquisitions (cette année)</span></div>
          </div>

          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bibliotheque/inventaire')}>
            <div className="kpi-icon aqua"><i className="fas fa-clipboard-check"></i></div>
            <div className="count-top"><h2>{kpis.dernier_inventaire_total}</h2><span>Inventaire</span></div>
          </div>
        </div>



        <div className="doc-recent-actions-grid">

          <div className="doc-recent-list">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Activité récente</h3>
            {activites_recentes.map((a, i) => (
              <div className="doc-recent-item" key={i}>
                <div className="doc-recent-info"><div className="doc-recent-titre">{a.texte}</div></div>
                <span className="doc-recent-date">{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            ))}
            {activites_recentes.length === 0 && <div className="empty">Aucune activité récente.</div>}
          </div>



          <div className="doc-quick-actions">

            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Actions rapides</h3>

            <button className="doc-quick-btn violet" onClick={() => navigate('/bibliotheque/catalogue/nouvelle')}>
              <i className="fas fa-plus"></i> Ajouter une ressource
            </button>

            <button className="doc-quick-btn vert" onClick={() => navigate('/bibliotheque/emprunts/enregistrer')}>
              <i className="fas fa-plus"></i> Enregistrer un emprunt
            </button>
            
            <button className="doc-quick-btn outline" onClick={() => navigate('/bibliotheque/adherents')}>
              <i className="fas fa-user-plus"></i> Ajouter un adhérent
            </button>
            
            <button className="doc-quick-btn vert" onClick={() => navigate('/bibliotheque/emprunts/retours')}>
              <i className="fas fa-undo"></i> Enregistrer un retour
            </button>
            
            <button className="doc-quick-btn orange" onClick={() => navigate('/bibliotheque/inventaire')}>
              <i className="fas fa-clipboard-list"></i> Effectuer un inventaire
            </button>
         
          </div>
       
        </div>
      
      </div>

    </div>


  );

}



export default VueEnsemble;

