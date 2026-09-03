import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getPaiements, creerPaiement, modifierPaiement, supprimerPaiement } from '../../api/finances';
import { getInscriptions, getTypesPaiement, getCaisses } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { MODES_PAIEMENT, STATUTS_PAIEMENT, BADGE_STATUT_PAIEMENT } from './financesConstantes';
import { formatMontant } from '../../components/formatters';
import '../../assets/css/crud.css';


function PaiementsListe() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [inscriptions, setInscriptions] = useState([]);
  const [typesPaiement, setTypesPaiement] = useState([]);
  const [caisses, setCaisses] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreMode, setFiltreMode] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [paiementEnEdition, setPaiementEnEdition] = useState(null);
  const [paiementASupprimer, setPaiementASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getPaiements();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
    getInscriptions().then((res) => setInscriptions(res.data.resultats));
    getTypesPaiement().then((res) => setTypesPaiement(res.data.resultats));
    getCaisses().then((res) => setCaisses(res.data));
  }, []);
  const paiementsFiltres = donnees.resultats.filter((p) => {
    const texte = (p.numero_recu + ' ' + p.inscription_str).toLowerCase();
    const matchRecherche = texte.includes(recherche.toLowerCase());
    const matchMode = !filtreMode || p.mode_paiement === filtreMode;
    return matchRecherche && matchMode;
  });
  const ouvrirCreation = () => {
    setPaiementEnEdition(null);
    reset({ inscription: '', type_paiement: '', montant: '', date_paiement: '', mode_paiement: '', caisse_session: '', statut: 'VALIDE' });
    setModalOuvert(true);
  };
  const ouvrirEdition = (p) => {
    setPaiementEnEdition(p.id);
    reset({
      inscription: p.inscription, type_paiement: p.type_paiement, montant: p.montant,
      date_paiement: p.date_paiement, mode_paiement: p.mode_paiement,
      caisse_session: p.caisse_session || '', statut: p.statut,
    });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (paiementEnEdition) {
        await modifierPaiement(paiementEnEdition, data);
        afficherSucces('Paiement modifié avec succès.');
      } else {
        await creerPaiement(data);
        afficherSucces('Paiement enregistré avec succès.');
      }
      reset();
      setModalOuvert(false);
      setPaiementEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.non_field_errors?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerPaiement(paiementASupprimer.id);
      afficherSucces('Paiement supprimé.');
      setPaiementASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const { total = 0, valide = 0, rembourse = 0, annule = 0 } = donnees.kpis;



  return (
    <div className="container-principal">
      <div className="personnel">
        <div className="department-page">
          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Journal des paiements</h3>
              <div className="sub">{total} paiement(s)</div>
            </div>
            <button className="btn-primary addInscr" onClick={ouvrirCreation}>
              <i className="fas fa-plus"></i>
              Nouveau paiement
            </button>
          </div>


          <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(350px,1fr))' }}>
            <div className="department-card">
              <div className="kpi-icon blue"><i className="fa-solid fa-credit-card"></i></div>
              <div className="count-top"><h2>{total}</h2><span>Paiements</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
              <div className="count-top"><h2>{valide}</h2><span>Validés</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon orange"><i className="fa-solid fa-money-bill-transfer"></i></div>
              <div className="count-top"><h2>{rembourse}</h2><span>Remboursés</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
              <div className="count-top"><h2>{annule}</h2><span>Annulés</span></div>
            </div>
          </div>
          
          
          <div className="department-toolbar">

            <div className="toolbar-left">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Rechercher un paiement..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-right">
              <select className="filter-select" value={filtreMode} onChange={(e) => setFiltreMode(e.target.value)}>
                <option value="">Mode — tous</option>
                {MODES_PAIEMENT.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

          </div>


          <div className="department-card table-card">
            <div className="table-title">
              <h2>Liste des Paiements</h2>
              <span>{paiementsFiltres.length} paiement(s)</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>N° Reçu</th>
                    <th>Type</th>
                    <th className="num">Montant</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Caisse</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paiementsFiltres.map((p) => (
                    <tr className="row-link" key={p.id}>
                      <td>{p.inscription_str}</td>
                      <td className="mono cell-strong">{p.numero_recu}</td> 
                      <td>{p.type_paiement_nom}</td>
                      <td className="cell-amount">{formatMontant(p.montant)}</td>
                      <td>
                        <span className={`badge ${BADGE_STATUT_PAIEMENT[p.statut]}`}>
                          <p className='bull'>&bull;</p>
                          {STATUTS_PAIEMENT.find((s) => s.value === p.statut)?.label}
                        </span>
                      </td>
                      <td className="mono" style={{ color: 'var(--text-600)', fontSize: '12.5px' }}>{new Date(p.date_paiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td>{MODES_PAIEMENT.find((m) => m.value === p.mode_paiement)?.label}</td>
                      <td style={{ color: 'var(--text-400)', fontSize: '12.5px' }}>{p.caisse_session_date ? new Date(p.caisse_session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }): '—'}</td>
                      <td>
                        <button className="table-btn view" onClick={() => navigate(`/finances/paiements/${p.id}`)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-btn edit" onClick={() => ouvrirEdition(p)}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="table-btn delete" onClick={() => setPaiementASupprimer(p)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paiementsFiltres.length === 0 && (
                    <tr><td colSpan="9"><div className="empty">Aucun paiement trouvé.</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{paiementEnEdition ? 'Modifier le paiement' : 'Nouveau paiement'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Inscription</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('inscription', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {inscriptions.map((i) => <option key={i.id} value={i.id}>{i.etudiant_str}</option>)}
                </select>
                {errors.inscription && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Type de frais</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('type_paiement', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {typesPaiement.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
                <div className="cell-sub">Doit correspondre à un frais déjà appliqué à l'inscription choisie.</div>
                {errors.type_paiement && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Montant</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="number" step="0.01" min="0.01" {...register('montant', { required: true })} />
                {errors.montant && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Date de paiement</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="date" {...register('date_paiement', { required: true })} />
                {errors.date_paiement && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Mode de paiement</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('mode_paiement', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {MODES_PAIEMENT.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                {errors.mode_paiement && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <label>Session de caisse</label>
                <select {...register('caisse_session')}>
                  <option value="">Aucune</option>
                  {caisses.map((c) => <option key={c.id} value={c.id}>{new Date(c.date_session).toLocaleDateString('fr-FR')} {c.statut === 'OUVERTE' ? '(ouverte)' : ''}</option>)}
                </select>
                <div className="cell-sub">Requis uniquement pour un règlement en espèces.</div>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select {...register('statut')}>
                  {STATUTS_PAIEMENT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
          <hr />
          <p id="consigne">Le remplissage des champs marqués avec (*) est obligatoire.</p>
        </div>
      </div>

      <ConfirmationModal
        ouvert={!!paiementASupprimer}
        titre="Supprimer le paiement"
        message={`Voulez-vous vraiment supprimer le paiement « ${paiementASupprimer?.numero_recu} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setPaiementASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default PaiementsListe;