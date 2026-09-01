import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaiement, telechargerPaiementPdf } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import { MODES_PAIEMENT, STATUTS_PAIEMENT, BADGE_STATUT_PAIEMENT, telechargerFichier } from './financesConstantes';
import '../../assets/css/crud.css';


function PaiementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paiement, setPaiement] = useState(null);
  const { afficherErreur } = useAlert();
  useEffect(() => {
    getPaiement(id).then((res) => setPaiement(res.data));
  }, [id]);
  const telechargerPdf = async () => {
    try {
      const res = await telechargerPaiementPdf(id);
      telechargerFichier(res.data, `recu_${paiement.numero_recu}.pdf`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };

  if (!paiement) {
    return <div className="personnel"><div className="empty">Chargement...</div></div>;
  }




  return (
    <div className="container-principal">
      <div className="personnel">

        <div className="retour-link">
          <button onClick={() => navigate('/finances/paiements')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Liste des Paiements
          </button>
          <p><span>{'>'}</span>détail sur le paiement</p>
        </div>

        <div className="detail-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
          <div>
            <div className="detail-eyebrow">Reçu de paiement</div>
            <div className="detail-title">{paiement.numero_recu}</div>
            <div className="detail-sub">{new Date(paiement.date_paiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 300 }}>Statut du paiement</h3>
            <span className={`badge ${BADGE_STATUT_PAIEMENT[paiement.statut]}`}>
              <span className="dot"></span>
              {STATUTS_PAIEMENT.find((s) => s.value === paiement.statut)?.label}
            </span>
          </div>
        </div>

        <div className="detail-body">
          <div className="dl-group">
            <div className="dl-group-title">Paiement</div>
            <div className="dl-row">
              <span className="dl-k">Étudiant</span>
              <span className="dl-v">
                <button onClick={() => navigate(`/finances/inscriptions/${paiement.inscription}`)} className="etudiant-recu">
                  <i className="fas fa-eye"></i>
                  {paiement.inscription_str}
                </button>
              </span>
            </div>
            <div className="dl-row"><span className="dl-k">Type</span><span className="dl-v">{paiement.type_paiement_nom}</span></div>
            <div className="dl-row"><span className="dl-k">Montant</span><span className="dl-v mono" style={{ fontSize: '16px' }}>{paiement.montant} FCFA</span></div>
            <div className="dl-row"><span className="dl-k">Mode de paiement</span><span className="dl-v">{MODES_PAIEMENT.find((m) => m.value === paiement.mode_paiement)?.label}</span></div>
            <div className="dl-row"><span className="dl-k">Session de caisse</span><span className="dl-v">{paiement.caisse_session_date ? new Date(paiement.caisse_session_date).toLocaleDateString('fr-FR') : 'Non applicable'}</span></div>
            <div className="dl-row"><span className="dl-k">Enregistré par</span><span className="dl-v">{paiement.enregistre_par_nom || '—'}</span></div>
          </div>
        </div>
        <div className="detail-foot">
          <button className="btn btn-brass" onClick={telechargerPdf}>
            <i className="fas fa-download"></i> Télécharger le reçu (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
export default PaiementDetail;