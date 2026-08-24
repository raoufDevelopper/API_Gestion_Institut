import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getSpecialites, creerSpecialite, modifierSpecialite, supprimerSpecialite, getFilieres } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';
const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'suspendu', label: 'Suspendu' },
];
function Specialites() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [filieres, setFilieres] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [specialiteEnEdition, setSpecialiteEnEdition] = useState(null);
  const [specialiteASupprimer, setSpecialiteASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [specialiteEnDetail, setSpecialiteEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getSpecialites();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
    getFilieres().then((res) => setFilieres(res.data.resultats || res.data));
  }, []);
  const specialitesFiltrees = donnees.resultats.filter((s) => {
    const texte = (s.code + ' ' + s.nom).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setSpecialiteEnEdition(null);
    reset({ code: '', nom: '', filiere: '', description: '', statut: 'actif' });
    setModalOuvert(true);
  };
  const ouvrirEdition = (specialite) => {
    setSpecialiteEnEdition(specialite.id);
    reset({
      code: specialite.code,
      nom: specialite.nom,
      filiere: specialite.filiere,
      description: specialite.description,
      statut: specialite.statut,
    });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (specialiteEnEdition) {
        await modifierSpecialite(specialiteEnEdition, data);
        afficherSucces('Spécialité modifiée avec succès.');
      } else {
        await creerSpecialite(data);
        afficherSucces('Spécialité créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setSpecialiteEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement de la spécialité."
      );
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerSpecialite(specialiteASupprimer.id);
      afficherSucces('Spécialité supprimée.');
      setSpecialiteASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des spécialités</h3>
            <div className="sub">{total} spécialité(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle spécialité
          </button>
        </div>
        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-diagram-project"></i></div>
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
                placeholder="Rechercher une spécialité..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des spécialités</h2>
            <span>{specialitesFiltrees.length} spécialités</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Filière</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {specialitesFiltrees.map((s) => (
                  <tr className="row-link" key={s.id}>
                    <td><div className="cell-strong mono">{s.code}</div></td>
                    <td>{s.nom}</td>
                    <td>{s.filiere_nom || '—'}</td>
                    <td>
                      <span className={`badge ${s.statut === 'actif' ? 'emerald' : s.statut === 'inactif' ? 'amber' : 'brick'}`}>
                        <span className="dot"></span>
                        {STATUTS.find((st) => st.value === s.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setSpecialiteEnDetail(s)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(s)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setSpecialiteASupprimer(s)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {specialitesFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucune spécialité ne correspond à cette recherche.</div>
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
            <h2>{specialiteEnEdition ? 'Modifier la spécialité' : 'Nouvelle spécialité'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div>
                  <label>Filière</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('filiere', { required: 'La filière est requise' })}>
                  <option value="">Sélectionner...</option>
                  {filieres.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
                {errors.filiere && <div className="form-errors">{errors.filiere.message}</div>}
              </div>
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
                  <label>Statut</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('statut', { required: true })}>
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
      <div className="department-modal" style={{ display: specialiteEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail de la spécialité</h2>
            <button onClick={() => setSpecialiteEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {specialiteEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{specialiteEnDetail.code}</p></div>
              <div className="form-group"><label>Nom</label><p>{specialiteEnDetail.nom}</p></div>
              <div className="form-group"><label>Filière</label><p>{specialiteEnDetail.filiere_nom || '—'}</p></div>
              <div className="form-group"><label>Description</label><p>{specialiteEnDetail.description || '—'}</p></div>
              <div className="form-group"><label>Statut</label><p>{STATUTS.find((s) => s.value === specialiteEnDetail.statut)?.label}</p></div>
              <div className="form-group"><label>Créée le</label><p>{new Date(specialiteEnDetail.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!specialiteASupprimer}
        titre="Supprimer la spécialité"
        message={`Voulez-vous vraiment supprimer la spécialité « ${specialiteASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setSpecialiteASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default Specialites;