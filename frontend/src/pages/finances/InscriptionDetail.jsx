import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getInscription, ajouterFrais, getTarifSuggere, telechargerInscriptionPdf } from '../../api/finances';
import { getTypesPaiement } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import { BADGE_STATUT_INSCRIPTION, STATUTS_INSCRIPTION, BADGE_STATUT_FINANCIER, LABEL_STATUT_FINANCIER, telechargerFichier } from './financesConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/finance.css';


function InscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inscription, setInscription] = useState(null);
  const [typesPaiement, setTypesPaiement] = useState([]);
  const [modalFraisOuvert, setModalFraisOuvert] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting, errors } } = useForm();
  const typePaiementChoisi = watch('type_paiement');
  const charger = async () => {
    const res = await getInscription(id);
    setInscription(res.data);
  };
  useEffect(() => {
    charger();
  }, [id]);
  const ouvrirModalFrais = () => {
    reset({ type_paiement: '', montant_du: '' });
    getTypesPaiement().then((res) => {
      const dejaAppliques = inscription.frais.map((f) => f.type_paiement);
      setTypesPaiement(res.data.resultats.filter((t) => !t.obligatoire_a_inscription && !dejaAppliques.includes(t.id)));
    });
    setModalFraisOuvert(true);
  };
  useEffect(() => {
    if (!typePaiementChoisi || !inscription) return;
    getTarifSuggere({ type_paiement: typePaiementChoisi, inscription: id }).then((res) => {
      if (res.data.trouve) setValue('montant_du', res.data.montant);
    });
  }, [typePaiementChoisi]);
  const onSubmitFrais = async (data) => {
    try {
      await ajouterFrais(id, data);
      afficherSucces('Frais ajouté avec succès.');
      setModalFraisOuvert(false);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.detail || "Erreur lors de l'ajout du frais.");
    }
  };
  const telechargerPdf = async () => {
    try {
      const res = await telechargerInscriptionPdf(id);
      telechargerFichier(res.data, `fiche_inscription_${id}.pdf`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };
  if (!inscription) {
    return <div className="personnel"><div className="empty">Chargement...</div></div>;
  }



  return (
    <div className="container-principal">
      <div className="personnel">

        <div className="fi-header" style={{ marginBottom: "10px" }}>
          <div>
            <button style={{ fontSize: '13px' }} className="ud-retour" onClick={() => navigate('/finances/inscriptions')}>
              ← Liste des Inscriptions
            </button>
            <span> - Détail sur l'inscription</span>
          </div>
        </div>
        
        
        <div className="department-page">
          <div className="detail-head">
            <div>
              <div className="detail-eyebrow">Dossier d'inscription</div>
              <div className="detail-title">{inscription.etudiant_str}</div>
              <div className="detail-sub">{inscription.classe_str}</div>
            </div>
          </div>
          <div className="detail-body">
            <div className="dl-group">
              <div className="dl-group-title">Scolarité</div>
              <div className="dl-row"><span className="dl-k">Classe</span><span className="dl-v">{inscription.classe_str}</span></div>
              <div className="dl-row"><span className="dl-k">Date d'inscription</span><span className="dl-v mono">{new Date(inscription.date_inscription).toLocaleDateString('fr-FR')}</span></div>
              <div className="dl-row">
                <span className="dl-k">Statut administratif</span>
                <span className="dl-v">
                  <span className={`badge ${BADGE_STATUT_INSCRIPTION[inscription.statut]}`}>
                    <span className="dot"></span>
                    {STATUTS_INSCRIPTION.find((s) => s.value === inscription.statut)?.label}
                  </span>
                </span>
              </div>
            </div>
            <div className="dl-group">
              <div className="dl-group-title">Situation financière — total</div>
              <div className="dl-row"><span className="dl-k">Total dû</span><span className="dl-v mono">{inscription.total_du} FCFA</span></div>
              <div className="dl-row"><span className="dl-k">Total payé</span><span className="dl-v mono" style={{ color: '#22c55e' }}>{inscription.montant_paye} FCFA</span></div>
              <div className="dl-row"><span className="dl-k">Reste à payer</span><span className="dl-v mono">{inscription.reste_a_payer} FCFA</span></div>
              <div className="dl-row">
                <span className="dl-k">Statut financier</span>
                <span className="dl-v">
                  <span className={`badge ${BADGE_STATUT_FINANCIER[inscription.statut_paiement]}`}>
                    <span className="dot"></span>
                    {LABEL_STATUT_FINANCIER[inscription.statut_paiement]}
                  </span>
                </span>
              </div>
            </div>
            <div className="dl-group">
              <div className="department-card table-card">
                <div className="table-title">
                  <h2>Détail des frais</h2>
                  <span>{inscription.frais.length} frais appliqué(s)</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr><th>Type de frais</th><th className="num">Dû</th><th className="num">Payé</th><th>Statut</th></tr>
                    </thead>
                    <tbody>
                      {inscription.frais.map((f) => (
                        <tr key={f.id}>
                          <td>{f.type_paiement_nom}</td>
                          <td className="num">{f.montant_du} FCFA</td>
                          <td className="num" style={{ color: '#22c55e' }}>{f.montant_paye} FCFA</td>
                          <td>
                            <span className={`badge ${BADGE_STATUT_FINANCIER[f.statut_paiement]}`}>
                              <span className="dot"></span>
                              {LABEL_STATUT_FINANCIER[f.statut_paiement]}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {inscription.frais.length === 0 && (
                        <tr><td colSpan="4" style={{ color: 'var(--text-400)' }}>Aucun frais appliqué à cette inscription.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <button className="btn btn-ghost" onClick={ouvrirModalFrais}>
                  + Ajouter un frais
                </button>
              </div>
            </div>
            <div className="dl-group">
              <div className="department-card table-card">
                <div className="table-title">
                  <h2>Historique des paiements</h2>
                  <span>{inscription.paiements.length} paiement(s) effectué(s)</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr><th>Reçu</th><th>Type</th><th>Date</th><th className="num">Montant</th><th>Statut</th></tr>
                    </thead>
                    <tbody>
                      {inscription.paiements.map((p) => (
                        <tr key={p.id}>
                          <td className="mono">{p.numero_recu}</td>
                          <td>{p.type_paiement_nom}</td>
                          <td>{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</td>
                          <td className="num">{p.montant} FCFA</td>
                          <td>
                            <span className={`badge ${p.statut === 'VALIDE' ? 'badge-success' : 'badge-danger'}`}>
                              <span className="dot"></span>{p.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {inscription.paiements.length === 0 && (
                        <tr><td colSpan="5" style={{ color: 'var(--text-400)' }}>Aucun paiement enregistré.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-foot">
            <button className="btn btn-brass" onClick={telechargerPdf}>
              <i className="fas fa-download"></i> Télécharger (PDF)
            </button>
          </div>
        </div>
      </div>
      <div className="department-modal" style={{ display: modalFraisOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7a5503,#d3b429)' }}>
            <h2>Ajouter un frais</h2>
            <button className="addInscr" onClick={() => setModalFraisOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmitFrais)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Type de frais</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('type_paiement', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {typesPaiement.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
                {errors.type_paiement && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Montant du frais</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="number" step="0.01" min="0" {...register('montant_du', { required: true })} />
                <div className="cell-sub">Pré-rempli depuis le tarif applicable si disponible ; modifiable.</div>
                {errors.montant_du && <div className="form-errors">Champ requis</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Ajout...' : 'Ajouter ce frais'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default InscriptionDetail;