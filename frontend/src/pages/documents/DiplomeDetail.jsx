import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiplome, telechargerDiplome, revoquerDiplome } from '../../api/documents';
import { useAlert } from '../../context/AlertContext';
import { BADGE_STATUT_DIPLOME, STATUTS_DIPLOME, telechargerFichier } from './documentsConstantes';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';


function DiplomeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diplome, setDiplome] = useState(null);
  const [modalRevocationOuvert, setModalRevocationOuvert] = useState(false);
  const [motif, setMotif] = useState('');
  const [revocationEnCours, setRevocationEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();

  const charger = async () => {
    const res = await getDiplome(id);
    setDiplome(res.data);
  };

  useEffect(() => { charger(); }, [id]);

  const telecharger = async () => {
    try {
      const res = await telechargerDiplome(id);
      telechargerFichier(res.data, `diplome_${diplome.numero_diplome}.pdf`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement.');
    }
  };

  const imprimer = () => {
    if (diplome.fichier) window.open(diplome.fichier, '_blank');
  };

  const confirmerRevocation = async () => {
    if (!motif.trim()) {
      afficherErreur('Un motif de révocation est requis.');
      return;
    }
    setRevocationEnCours(true);
    try {
      await revoquerDiplome(id, { motif_revocation: motif });
      afficherSucces('Diplôme révoqué.');
      setModalRevocationOuvert(false);
      setMotif('');
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la révocation.');
    } finally {
      setRevocationEnCours(false);
    }
  };



  if (!diplome) return <Loader label="Chargement en cours..." />;




  return (
    <div className="container-principal">
      <div className="personnel">
        <div className="retour-link">
          <button onClick={() => navigate('/documents/diplomes')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Retour aux diplômes
          </button>
        </div>
        <div className="department-page">
          <div className="detail-head">
            <div>
              <div className="detail-eyebrow">Diplôme</div>
              <div className="detail-title">{diplome.numero_diplome}</div>
              <div className="detail-sub">{diplome.etudiant_str}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn-light" onClick={telecharger}><i className="fas fa-download"></i> Télécharger</button>
              <button className="btn-light" onClick={imprimer}><i className="fas fa-print"></i> Imprimer</button>
              {diplome.statut === 'valide' && (
                <button className="btn-light" style={{ color: '#f06363' }} onClick={() => setModalRevocationOuvert(true)}>
                  <i className="fas fa-ban"></i> Révoquer
                </button>
              )}
            </div>
          </div>
          <div className="doc-detail-grid">
            <div className="dl-group">
              <div className="dl-group-title">Informations du diplôme</div>
              <div className="dl-row">
                <span className="dl-k">N° Diplôme</span>
                <span className="badge badge-orange">{diplome.numero_diplome}</span>
              </div>
              <div className="dl-row">
                <span className="dl-k">Étudiant</span>
                <span className="dl-v etu">{diplome.etudiant_str}</span>
              </div>
              
              {/*<div className="dl-row"><span className="dl-k">Signé par</span><span className="dl-v">{diplome.signe_par_str || '—'}</span></div>*/}
              <div className="dl-row">
                <span className="dl-k">Statut</span>
                <span className="dl-v">
                  <span className={`badge ${BADGE_STATUT_DIPLOME[diplome.statut]}`}>
                    <p className='bull'>&bull;</p>
                    {STATUTS_DIPLOME.find((s) => s.value === diplome.statut)?.label}
                  </span>
                </span>
              </div>
              <div className="dl-row">
                <span className="dl-k">Mention</span>
                <span className="badge badge-violet">
                  <p className='bull'>&bull;</p>
                  {diplome.mention || '—'}
                </span>
              </div>
              {diplome.statut === 'revoque' && (
                <div className="dl-row"><span className="dl-k">Motif de révocation</span><span className="adge badge-danger">{diplome.motif_revocation}</span></div>
              )}
              <div className="dl-row"><span className="dl-k">Date d'obtention</span><span className="dl-v">{new Date(diplome.date_obtention).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div className="dl-row"><span className="dl-k">Généré par</span><span className="dl-v">{diplome.genere_par_nom || '—'}</span></div>
            </div>
            <div className="doc-preview-panel">
              <h4 style={{ fontSize: '12.5px', color: '#9ca3af', marginBottom: '10px' }}>Aperçu du document</h4>
              {diplome.fichier ? (
                <iframe src={diplome.fichier} title="Aperçu diplôme"></iframe>
              ) : (
                <div className="empty">Aucun fichier disponible.</div>
              )}
            </div>
          </div>
        </div>
      </div>





      <div className="department-modal" style={{ display: modalRevocationOuvert ? 'flex' : 'none' }}>
            
        <div className="modal-content confirmation-modal" style={{ animation: 'pop .3s ease'}}>
        
          <div className="confirme-header">
            <h2>Révoquer le diplôme</h2>
          </div>
        
          <div className="confirmation-body">
            <p>êtes-vous sur le point de Révoquer un ce diplôme</p>
              <div>
                <p id="attention">
                  <i className="fas fa-triangle-exclamation confirmation-icon"></i>
                  Attention
                </p>
                <p style={{ marginBottom: '10px', fontSize: '13px', color: 'var(--text)' }}>
                  Vous êtes sur le point de Révoquer un ce diplôme. Cette action est irreversible.
                </p>
              </div>
              <textarea
                rows="4"
                placeholder='Veillez entrer le motif de la revocation ici'
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
              ></textarea>
          </div>
        
          <div className="modal-footer" style={{ justifyContent: "center" }}>
            <button className="btn-light" onClick={() => setModalRevocationOuvert(false)}>Annuler</button>
            <button className="btn-danger" onClick={confirmerRevocation} disabled={revocationEnCours}>
              {revocationEnCours ? 'Révocation...' : 'Confirmer la révocation'}
            </button>
          </div>
        
        </div>
        
      </div>



    </div>

  );

}



export default DiplomeDetail;