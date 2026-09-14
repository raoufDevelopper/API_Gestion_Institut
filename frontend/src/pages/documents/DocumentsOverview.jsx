
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocumentsOverview } from '../../api/documents';
import { ICONE_TYPE_RECENT } from './documentsConstantes';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';



function DocumentsOverview() {
  const [donnees, setDonnees] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    getDocumentsOverview().then((res) => setDonnees(res.data));
  }, []);
  
  if (!donnees) return <Loader label="Chargement en cours..." />;
  
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion documentaire</h3>
            <div className="sub">Centralisez, générez et consultez les documents administratifs et académiques de l'institut.</div>
          </div>
        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/documents/diplomes')}>
            <div className="kpi-icon blue"><i className="fas fa-graduation-cap"></i></div>
            <div className="count-top"><h2>{donnees.diplomes_total}</h2><span>Diplômes</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{donnees.diplomes_valides}</h2><span>Diplômes validés</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{donnees.diplomes_revoques}</h2><span>Diplômes révoqués</span></div>
          </div>
        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/documents/certificats')}>
            <div className="kpi-icon aqua"><i className="fas fa-certificate"></i></div>
            <div className="count-top"><h2>{donnees.certificats_total}</h2><span>Certificats</span></div>
          </div>
          <div className="department-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/documents/documents')}>
            <div className="kpi-icon violet"><i className="fas fa-folder"></i></div>
            <div className="count-top"><h2>{donnees.documents_total}</h2><span>Documents</span></div>
          </div>
        </div>


        <div className="doc-recent-actions-grid">
          <div className="doc-recent-list">
            
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Documents récents</h3>
            
            {donnees.recents.map((r) => (
              <div className="doc-recent-item" key={`${r.type}-${r.id}`}>
                
                <div style={{ display: 'flex'}}>
                  <div className="doc-recent-icon">
                    <i className={`fas ${ICONE_TYPE_RECENT[r.type]}`}></i>
                  </div>
                  <div className="doc-recent-info">
                    <div className="doc-recent-titre">{r.titre}</div>
                    <div className="doc-recent-sub">{r.sujet}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span className="doc-recent-date">{new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {r.fichier && (
                    <a href={r.fichier} target="_blank" rel="noreferrer">
                      <button className="table-btn view">
                        <i className="fas fa-download"></i>
                      </button>
                    </a>
                  )}
                </div>

              </div>
            ))}

            {donnees.recents.length === 0 && <div className="empty">Aucun document récent.</div>}
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="btn-primary" style={{ background: '#664df7', color: '#fff' }} onClick={() => navigate('/documents/documents')}>
                Voir tous les documents
              </button>
            </div>

          </div>


          <div className="doc-quick-actions">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '15px' }}>Actions rapides</h3>
            <button className="doc-quick-btn violet btn-primary" onClick={() => navigate('/documents/diplomes/generer')}>
              <i className="fas fa-plus"></i> Générer un diplôme
            </button>
            <button className="doc-quick-btn vert btn-primary" onClick={() => navigate('/documents/certificats/generer')}>
              <i className="fas fa-plus"></i> Générer un certificat
            </button>
            <button className="doc-quick-btn orange btn-primary" onClick={() => navigate('/documents/documents')}>
              <i className="fas fa-plus"></i> Ajouter un document
            </button>
            <button className="doc-quick-btn outline btn-primary" onClick={() => navigate('/documents/documents')}>
              <i className="fas fa-folder-open"></i> Consulter les documents
            </button>
          </div>


        </div>
      </div>
    </div>
  );
}
export default DocumentsOverview;