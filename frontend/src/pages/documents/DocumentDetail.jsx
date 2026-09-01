import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, supprimerDocument } from '../../api/documents';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';


function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [modalSuppressionOuvert, setModalSuppressionOuvert] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  useEffect(() => {
    getDocument(id).then((res) => setDocument(res.data));
  }, [id]);
  const imprimer = () => {
    if (document.fichier) window.open(document.fichier, '_blank');
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerDocument(id);
      afficherSucces('Document supprimé.');
      navigate('/documents/documents');
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };

  if (!document) return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  

  
  return (
    <div className="container-principal">
      <div className="personnel">
        <div className="retour-link">
          <button onClick={() => navigate('/documents/documents')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Retour aux documents
          </button>
        </div>
        <div className="department-page">
          <div className="detail-head">
            <div>
              <div className="detail-eyebrow">{document.categorie || 'Document'}</div>
              <div className="detail-title">{document.titre}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href={document.fichier} download className="btn-light">
                <i className="fas fa-download"></i> Télécharger
              </a>
              <button className="btn-light" onClick={imprimer}><i className="fas fa-print"></i> Imprimer</button>
              <button className="btn-light" style={{ color: '#dc2626' }} onClick={() => setModalSuppressionOuvert(true)}>
                <i className="fas fa-trash"></i> Supprimer
              </button>
            </div>
          </div>
          <div className="doc-detail-grid">
            <div className="dl-group">
              <div className="dl-group-title">Informations du document</div>
              <div className="dl-row"><span className="dl-k">Titre</span><span className="dl-v">{document.titre}</span></div>
              <div className="dl-row"><span className="dl-k">Catégorie</span><span className="dl-v">{document.categorie || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Concerne</span><span className="dl-v">{document.concerne_str || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Ajouté par</span><span className="dl-v">{document.ajoute_par_nom || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Date d'ajout</span><span className="dl-v">{new Date(document.date_ajout).toLocaleString('fr-FR')}</span></div>
            </div>
            <div className="doc-preview-panel">
              <h4 style={{ fontSize: '12.5px', color: '#9ca3af', marginBottom: '10px' }}>Aperçu du document</h4>
              {document.fichier ? (
                <iframe src={document.fichier} title="Aperçu document"></iframe>
              ) : (
                <div className="empty">Aucun fichier disponible.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        ouvert={modalSuppressionOuvert}
        titre="Supprimer le document"
        message={`Voulez-vous vraiment supprimer « ${document.titre} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setModalSuppressionOuvert(false)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default DocumentDetail;