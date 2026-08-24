import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getAnneesAcademiques, creerAnneeAcademique, modifierAnneeAcademique, supprimerAnneeAcademique } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';
function AnneesAcademiques() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [anneeEnEdition, setAnneeEnEdition] = useState(null);
  const [anneeASupprimer, setAnneeASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [anneeEnDetail, setAnneeEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getAnneesAcademiques();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const anneesFiltrees = donnees.resultats.filter((a) => {
    return a.libelle.toLowerCase().includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setAnneeEnEdition(null);
    reset({ libelle: '', date_debut: '', date_fin: '', statut: true });
    setModalOuvert(true);
  };
  const ouvrirEdition = (annee) => {
    setAnneeEnEdition(annee.id);
    reset({
      libelle: annee.libelle,
      date_debut: annee.date_debut,
      date_fin: annee.date_fin,
      statut: annee.statut,
    });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (anneeEnEdition) {
        await modifierAnneeAcademique(anneeEnEdition, data);
        afficherSucces('Année académique modifiée avec succès.');
      } else {
        await creerAnneeAcademique(data);
        afficherSucces('Année académique créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setAnneeEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.libelle?.[0] || err.response?.data?.non_field_errors?.[0] || "Erreur lors de l'enregistrement."
      );
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerAnneeAcademique(anneeASupprimer.id);
      afficherSucces('Année académique supprimée.');
      setAnneeASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const { total = 0, active = 0, archivee = 0 } = donnees.kpis;
  return (
    <div className="container-principal">
      <div className="department-page">
        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des années académiques</h3>
            <div className="sub">{total} année(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle année académique
          </button>
        </div>
        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-calendar-days"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{active}</h2><span>Active(s)</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-box-archive"></i></div>
            <div className="count-top"><h2>{archivee}</h2><span>Archivée(s)</span></div>
          </div>
        </div>
        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une année académique..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des années académiques</h2>
            <span>{anneesFiltrees.length} années</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {anneesFiltrees.map((a) => (
                  <tr className="row-link" key={a.id}>
                    <td><div className="cell-strong">{a.libelle}</div></td>
                    <td>{new Date(a.date_debut).toLocaleDateString('fr-FR')}</td>
                    <td>{new Date(a.date_fin).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${a.statut ? 'emerald' : 'slate'}`}>
                        <span className="dot"></span>
                        {a.statut ? 'Active' : 'Archivée'}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setAnneeEnDetail(a)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(a)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setAnneeASupprimer(a)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {anneesFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucune année académique ne correspond à cette recherche.</div>
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
            <h2>{anneeEnEdition ? "Modifier l'année académique" : 'Nouvelle année académique'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div>
                  <label>Libellé</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" placeholder="Ex: 2025-2026" {...register('libelle', { required: 'Le libellé est requis' })} />
                {errors.libelle && <div className="form-errors">{errors.libelle.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Date de début</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="date" {...register('date_debut', { required: 'La date de début est requise' })} />
                {errors.date_debut && <div className="form-errors">{errors.date_debut.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Date de fin</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="date" {...register('date_fin', { required: 'La date de fin est requise' })} />
                {errors.date_fin && <div className="form-errors">{errors.date_fin.message}</div>}
              </div>
              <div className="form-group">
                <label className="switch-row">
                  <span>Année active</span>
                  <label className="switch">
                    <input type="checkbox" {...register('statut')} />
                    <span className="slider"></span>
                  </label>
                </label>
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
      <div className="department-modal" style={{ display: anneeEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail de l'année académique</h2>
            <button onClick={() => setAnneeEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {anneeEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Libellé</label><p>{anneeEnDetail.libelle}</p></div>
              <div className="form-group"><label>Date de début</label><p>{new Date(anneeEnDetail.date_debut).toLocaleDateString('fr-FR')}</p></div>
              <div className="form-group"><label>Date de fin</label><p>{new Date(anneeEnDetail.date_fin).toLocaleDateString('fr-FR')}</p></div>
              <div className="form-group"><label>Statut</label><p>{anneeEnDetail.statut ? 'Active' : 'Archivée'}</p></div>
              <div className="form-group"><label>Créée le</label><p>{new Date(anneeEnDetail.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!anneeASupprimer}
        titre="Supprimer l'année académique"
        message={`Voulez-vous vraiment supprimer l'année académique « ${anneeASupprimer?.libelle} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setAnneeASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default AnneesAcademiques;