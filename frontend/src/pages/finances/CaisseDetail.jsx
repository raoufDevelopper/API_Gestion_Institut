import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getCaisseDetail, fermerCaisse, telechargerCaissePdf } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import { BADGE_STATUT_CAISSE, telechargerFichier } from './financesConstantes';
import { formatMontant } from '../../components/formatters';
import '../../assets/css/crud.css';


function CaisseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donnees, setDonnees] = useState(null);
  const [modalFermetureOuvert, setModalFermetureOuvert] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getCaisseDetail(id);
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
  }, [id]);
  
  const onSubmitFermeture = async (data) => {
    try {
      await fermerCaisse(id, data);
      afficherSucces('Session de caisse clôturée.');
      setModalFermetureOuvert(false);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.detail || 'Erreur lors de la clôture.');
    }
  };


  const telechargerPdf = async () => {
    try {
      const res = await telechargerCaissePdf(id);
      telechargerFichier(res.data, `rapport_caisse_${id}.pdf`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };
  if (!donnees) {
    return <div className="personnel"><div className="empty">Chargement...</div></div>;
  }
  const { session, mouvements_paiements, mouvements_depenses, nb_mouvements } = donnees;
  return (
    <div className="container-principal">

        <div className="retour-link" style={{ marginBottom: "20px" }}>
          <div>
            <button onClick={() => navigate('/finances/caisse')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Retour aux sessions
            </button>
            <span> - Détail sur la caisse</span>
          </div>
        </div>


        <div className="department-page">

          <div className="detail-head">
            <div className="detail-text">
              <div className="detail-eyebrow">Session de caisse</div>
              <div className="detail-title">{new Date(session.date_session).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="detail-sub">
                {session.heure_ouverture?.slice(0, 5)} → {session.heure_fermeture ? session.heure_fermeture.slice(0, 5) : 'en cours'}
              </div>
            </div>
            <span className={`badge ${BADGE_STATUT_CAISSE[session.statut]}`}>
              <p className='bull'>&bull;</p>
              {session.statut === 'OUVERTE' ? 'Ouverte' : 'Fermée'}
            </span>
          </div>


          <div className="detail-card" style={{ maxWidth: '100%'}}>
            <div className="detail-body">
              <div className="dl-group">
                <div className="dl-group-title">Calcul du solde</div>
                <div className="dl-row">
                  <span className="dl-k">Solde d'ouverture</span>
                  <b className="dl-v">{formatMontant(session.solde_ouverture)}</b>
                </div>
                <div className="dl-row">
                  <span className="dl-k">+ Paiements espèces ({mouvements_paiements.length})</span>
                  <b className="amt green dl-v">+{formatMontant(session.total_paiements_especes)}</b>
                </div>
                <div className="dl-row">
                  <span className="dl-k">− Dépenses espèces ({mouvements_depenses.length})</span>
                  <b className="amt red dl-v">−{formatMontant(session.total_depenses_especes)}</b>
                </div>
                <div className="dl-row total">
                  <span className="dl-k">Solde théorique</span>
                  <b className="dl-v">{formatMontant(session.solde_theorique)}</b>
                </div>
                {session.statut === 'FERMEE' && (
                  <div style={{ marginTop: '10px' }}>
                    <div className="dl-row">
                      <span className="dl-k">Solde réel compté à la fermeture</span>
                      <b className="dl-v">{formatMontant(session.solde_reel_fermeture)}</b>
                    </div>
                    <div className="dl-row total">
                      <span className="dl-k">Écart</span>
                      <b className={`dl-v amt ${parseFloat(session.ecart) === 0 ? 'green' : 'red'}`}>
                        {parseFloat(session.ecart) === 0 ? 'Aucun écart' : `${formatMontant(session.ecart)}`}
                      </b>
                    </div>
                  </div>
                )}
                {session.observation && <div className="observation-box">{session.observation}</div>}
              </div>
              <div className="dl-group">
                <div className="department-card table-card">
                  <div className="table-title">
                    <h2>Mouvements en espèces</h2>
                    <span>({nb_mouvements}) opération(s)</span>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Nature</th>
                          <th>Détail</th>
                          <th className="num">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mouvements_paiements.map((p) => (
                          <tr key={`p-${p.id}`}>
                            <td><span className="badge badge-success">&bull; Paiement</span></td>
                            <td>{p.inscription_str}</td>
                            <td className="num" style={{ color: '#22c55e' }}>+{formatMontant(p.montant)}</td>
                          </tr>
                        ))}
                        {mouvements_depenses.map((d) => (
                          <tr key={`d-${d.id}`}>
                            <td><span className="badge badge-danger">&bull; Dépense</span></td>
                            <td>{d.libelle}</td>
                            <td className="num" style={{ color: '#e46464' }}>−{formatMontant(d.montant)}</td>
                          </tr>
                        ))}
                        {mouvements_paiements.length === 0 && mouvements_depenses.length === 0 && (
                          <tr><td colSpan="3" style={{ color: 'var(--text-400)' }}>Aucun mouvement en espèces pour cette session.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="dl-group">
                <div className="dl-group-title">Responsables</div>
                <div className="dl-row"><span className="dl-k">Ouverte par</span><span className="dl-v">{session.ouverte_par_nom || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Fermée par</span><span className="dl-v">{session.fermee_par_nom || '—'}</span></div>
              </div>
              {session.statut === 'OUVERTE' && (
                <div className="dl-group">
                  <button className="btn btn-brass" onClick={() => setModalFermetureOuvert(true)}>
                    Veuillez cliquer ici pour clôturer cette session
                  </button>
                </div>
              )}
            </div>

            <div className="detail-foot">
              {session.statut === 'FERMEE' ? (
                <button className="btn btn-brass" onClick={telechargerPdf}>
                  <i className="fas fa-download"></i> Télécharger le rapport de caisse (PDF)
                </button>
              ) : (
                <button className="btn btn-ghost btn-full btn-disabled" disabled>
                  Rapport PDF disponible après clôture
                </button>
              )}
            </div>
          </div>

        </div>





      <div className="department-modal" style={{ display: modalFermetureOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7a5503,#d3b429)' }}>
            <h2>Clôturer la session</h2>
            <button className="btn-primary addInscr" onClick={() => setModalFermetureOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmitFermeture)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <label>Solde réel compté</label>
                <input type="number" step="0.01" min="0" {...register('solde_reel_fermeture', { required: true })} />
                <div className="cell-sub">
                  Ce solde représente le montant réel en caisse (montant en espèces dans la caisse physique) au moment de la clôture de celle-ci.
                </div>
                {errors.solde_reel_fermeture && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <label>Observation</label>
                <textarea rows="3" {...register('observation')}></textarea>
                <div className="cell-sub">
                  Ce champ est optionnel, mais il est important de le renseigner s'il y a un écart entre le montant en caisse et celui dans l'application.
                </div>
              </div>
              <button type="submit" className="btn btn-brass" disabled={isSubmitting}>
                {isSubmitting ? 'Clôture...' : 'Clôturer la caisse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default CaisseDetail;