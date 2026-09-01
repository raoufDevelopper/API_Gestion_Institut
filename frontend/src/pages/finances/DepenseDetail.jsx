import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDepense, telechargerDepensePdf } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import { MODES_DEPENSE, STATUTS_DEPENSE, BADGE_STATUT_DEPENSE, telechargerFichier } from './financesConstantes';
import '../../assets/css/crud.css';
function DepenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [depense, setDepense] = useState(null);
  const { afficherErreur } = useAlert();
  useEffect(() => {
    getDepense(id).then((res) => setDepense(res.data));
  }, [id]);
  const telechargerPdf = async () => {
    try {
      const res = await telechargerDepensePdf(id);
      telechargerFichier(res.data, `bon_depense_${id}.pdf`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };
  if (!depense) {
    return <div className="personnel"><div className="empty">Chargement...</div></div>;
  }
  return (
    <div className="container-principal">
      <div className="personnel">
        <div className="retour-link">
          <button onClick={() => navigate('/finances/depenses')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Retour à la liste
          </button>
          <p><span>{'>'}</span>détail</p>
        </div>
        <div className="department-page">
          <div className="detail-head">
            <div className="detail-text">
              <div className="detail-eyebrow">{depense.categorie_nom}</div>
              <div className="detail-title">{depense.libelle}</div>
              <div className="detail-sub">{new Date(depense.date_depense).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <span className={`badge ${BADGE_STATUT_DEPENSE[depense.statut]}`}>
              <span className="dot"></span>
              {STATUTS_DEPENSE.find((s) => s.value === depense.statut)?.label}
            </span>
          </div>
          <div className="detail-body">
            <div className="dl-group">
              <div className="dl-group-title">Dépense</div>
              <div className="dl-row">
                <span className="dl-k">Montant</span>
                <span className="dl-v mono" style={{ fontSize: '16px' }}>{depense.montant} FCFA</span>
              </div>
              <div className="dl-row">
                <span className="dl-k">Mode de paiement</span>
                <span className="dl-v">{MODES_DEPENSE.find((m) => m.value === depense.mode_paiement)?.label}</span>
              </div>
              <div className="dl-row">
                <span className="dl-k">Session de caisse</span>
                <span className="dl-v">{depense.caisse_session_date ? new Date(depense.caisse_session_date).toLocaleDateString('fr-FR') : 'Non applicable'}</span>
              </div>
              {depense.justificatif && (
                <div className="dl-row">
                  <span className="dl-k">Justificatif</span>
                  <span className="dl-v">
                    <a href={depense.justificatif} target="_blank" rel="noreferrer" className="voir-fichier">
                      <i className="fas fa-eye"></i> Voir le fichier
                    </a>
                  </span>
                </div>
              )}
            </div>
            <div className="dl-group">
              <div className="dl-group-title">Chaîne d'approbation</div>
              <div className="dl-row"><span className="dl-k">Demandé par</span><span className="dl-v">{depense.demande_par_nom || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Approuvé par</span><span className="dl-v">{depense.approuve_par_nom || '—'}</span></div>
            </div>
          </div>
          <div className="detail-foot">
            <button className="btn btn-brass" onClick={telechargerPdf}>
              <i className="fas fa-download"></i> Télécharger le bon de dépense (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DepenseDetail;