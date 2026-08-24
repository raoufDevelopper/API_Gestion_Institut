import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getSanctions, creerSanction, modifierSanction, supprimerSanction } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';
const TYPES = [
  { value: 'avertissement', label: 'Avertissement' },
  { value: 'blame', label: 'Blâme' },
  { value: 'exclusion_tem', label: 'Exclusion temporaire' },
  { value: 'exclusion_def', label: 'Exclusion définitive' },
];
const GRAVITES = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'grave', label: 'Grave' },
  { value: 'tres_grave', label: 'Très grave' },
];
const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'suspendu', label: 'Suspendu' },
];
const TONE_GRAVITE = {
  faible: 'emerald',
  moyen: 'amber',
  grave: 'brick',
  tres_grave: 'brick',
};
function Sanctions() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [sanctionEnEdition, setSanctionEnEdition] = useState(null);
  const [sanctionASupprimer, setSanctionASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [sanctionEnDetail, setSanctionEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getSanctions();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const sanctionsFiltrees = donnees.resultats.filter((s) => {
    const texte = (s.code + ' ' + s.nom).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setSanctionEnEdition(null);
    reset({
      code: '', nom: '', type: 'avertissement', gravite: 'grave',
      statut: 'actif', entree_en_vigueur: '', description: '',
    });
    setModalOuvert(true);
  };
  const ouvrirEdition = (sanction) => {
    setSanctionEnEdition(sanction.id);
    reset({
      code: sanction.code,
      nom: sanction.nom,
      type: sanction.type,
      gravite: sanction.gravite,
      statut: sanction.statut,
      entree_en_vigueur: sanction.entree_en_vigueur?.slice(0, 16),
      description: sanction.description,
    });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (sanctionEnEdition) {
        await modifierSanction(sanctionEnEdition, data);
        afficherSucces('Sanction modifiée avec succès.');
      } else {
        await creerSanction(data);
        afficherSucces('Sanction créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setSanctionEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement de la sanction."
      );
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerSanction(sanctionASupprimer.id);
      afficherSucces('Sanction supprimée.');
      setSanctionASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const { total = 0, actif = 0, inactif = 0, suspendu = 0 } = donnees.kpis;
  return (
    <div className="container-principal">
      <div className="department-page">
        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des sanctions</h3>
            <div className="sub">{total} sanction(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle sanction
          </button>
        </div>
        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-gavel"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{actif}</h2><span>Actives</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-pause-circle"></i></div>
            <div className="count-top"><h2>{inactif}</h2><span>Inactives</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{suspendu}</h2><span>Suspendues</span></div>
          </div>
        </div>
        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une sanction..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des sanctions</h2>
            <span>{sanctionsFiltrees.length} sanctions</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Gravité</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sanctionsFiltrees.map((s) => (
                  <tr className="row-link" key={s.id}>
                    <td><div className="cell-strong mono">{s.code}</div></td>
                    <td>{s.nom}</td>
                    <td>{TYPES.find((t) => t.value === s.type)?.label}</td>
                    <td>
                      <span className={`badge ${TONE_GRAVITE[s.gravite]}`}>
                        <span className="dot"></span>
                        {GRAVITES.find((g) => g.value === s.gravite)?.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.statut === 'actif' ? 'emerald' : s.statut === 'inactif' ? 'amber' : 'brick'}`}>
                        <span className="dot"></span>
                        {STATUTS.find((st) => st.value === s.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setSanctionEnDetail(s)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(s)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setSanctionASupprimer(s)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {sanctionsFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty">Aucune sanction ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* MODAL DE CREATION / MODIFICATION */}
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{sanctionEnEdition ? 'Modifier la sanction' : 'Nouvelle sanction'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div>
                  <label>Code</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('code', { required: 'Le code est requis' })} />
                {errors.code && <div className="form-errors">{errors.code.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Nom</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('nom', { required: 'Le nom est requis' })} />
                {errors.nom && <div className="form-errors">{errors.nom.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Type</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('type', { required: true })}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <div>
                  <label>Gravité</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('gravite', { required: true })}>
                  {GRAVITES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <div>
                  <label>Entrée en vigueur</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="datetime-local" {...register('entree_en_vigueur', { required: "L'entrée en vigueur est requise" })} />
                {errors.entree_en_vigueur && <div className="form-errors">{errors.entree_en_vigueur.message}</div>}
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select {...register('statut')}>
                  {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Description</label>
                <textarea rows="3" {...register('description')}></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
          <hr />
          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
            Soumettez le formulaire si consigne respectée !
          </p>
        </div>
      </div>
      {/* MODAL DETAIL */}
      <div className="department-modal" style={{ display: sanctionEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail de la sanction</h2>
            <button onClick={() => setSanctionEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {sanctionEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{sanctionEnDetail.code}</p></div>
              <div className="form-group"><label>Nom</label><p>{sanctionEnDetail.nom}</p></div>
              <div className="form-group"><label>Type</label><p>{TYPES.find((t) => t.value === sanctionEnDetail.type)?.label}</p></div>
              <div className="form-group"><label>Gravité</label><p>{GRAVITES.find((g) => g.value === sanctionEnDetail.gravite)?.label}</p></div>
              <div className="form-group"><label>Entrée en vigueur</label><p>{new Date(sanctionEnDetail.entree_en_vigueur).toLocaleString('fr-FR')}</p></div>
              <div className="form-group full"><label>Description</label><p>{sanctionEnDetail.description || '—'}</p></div>
              <div className="form-group"><label>Statut</label><p>{STATUTS.find((s) => s.value === sanctionEnDetail.statut)?.label}</p></div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!sanctionASupprimer}
        titre="Supprimer la sanction"
        message={`Voulez-vous vraiment supprimer la sanction « ${sanctionASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setSanctionASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default Sanctions;