import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getFilieres, creerFiliere, modifierFiliere, supprimerFiliere } from '../../api/academique';
import { getPersonnels } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';

const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'suspendu', label: 'Suspendu' },
]; 

function Filieres() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [personnels, setPersonnels] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [filiereEnEdition, setFiliereEnEdition] = useState(null);
  const [filiereASupprimer, setFiliereASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [filiereEnDetail, setFiliereEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const charger = async () => {
    const res = await getFilieres();
    setDonnees(res.data);
  };

  useEffect(() => {
    charger();
    getPersonnels().then((res) => setPersonnels(res.data));
  }, []);

  const filieresFiltrees = donnees.resultats.filter((f) => {
    const texte = (f.code + ' ' + f.nom).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });

  const ouvrirCreation = () => {
    setFiliereEnEdition(null);
    reset({ code: '', nom: '', responsable: '', description: '', statut: 'actif' });
    setModalOuvert(true);
  };

  const ouvrirEdition = (filiere) => {
    setFiliereEnEdition(filiere.id);
    reset({
      code: filiere.code,
      nom: filiere.nom,
      responsable: filiere.responsable || '',
      description: filiere.description,
      statut: filiere.statut,
    });
    setModalOuvert(true);
  };

  const onSubmit = async (data) => {
    const payload = { ...data, responsable: data.responsable || null };
    try {
      if (filiereEnEdition) {
        await modifierFiliere(filiereEnEdition, payload);
        afficherSucces('Filière modifiée avec succès.');
      } else {
        await creerFiliere(payload);
        afficherSucces('Filière créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setFiliereEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement de la filière."
      );
    }
  };

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerFiliere(filiereASupprimer.id);
      afficherSucces('Filière supprimée.');
      setFiliereASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des filières</h3>
            <div className="sub">{total} filière(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle filière
          </button>
        </div>

        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-sitemap"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{actif}</h2><span>Actives</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{inactif}</h2><span>Inactives</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-pause-circle"></i></div>
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
                placeholder="Rechercher une filière..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des filières</h2>
            <span>{filieresFiltrees.length} filières</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Responsable</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              
              <tbody>
                {filieresFiltrees.map((f) => (
                  <tr className="row-link" key={f.id}>
                    <td><div className="cell-strong mono">{f.code}</div></td>
                    <td>{f.nom}</td>
                    <td>{f.responsable_nom || '—'}</td>
                    <td>
                      <span className={`badge-${f.statut === 'actif' ? 'success' : f.statut === 'inactif' ? 'danger' : 'orange'}`}>
                        <span className="dot"></span>
                        {STATUTS.find((s) => s.value === f.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setFiliereEnDetail(f)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(f)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setFiliereASupprimer(f)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filieresFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucune filière ne correspond à cette recherche.</div>
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
            <h2>{filiereEnEdition ? 'Modifier la filière' : 'Nouvelle filière'}</h2>
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
                <label>Responsable</label>
                <select {...register('responsable')}>
                  <option value="">Aucun</option>
                  {personnels.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                  ))}
                </select>
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
      <div className="department-modal" style={{ display: filiereEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail de la filière</h2>
            <button onClick={() => setFiliereEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {filiereEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{filiereEnDetail.code}</p></div>
              <div className="form-group"><label>Nom</label><p>{filiereEnDetail.nom}</p></div>
              <div className="form-group"><label>Responsable</label><p>{filiereEnDetail.responsable_nom || '—'}</p></div>
              <div className="form-group"><label>Description</label><p>{filiereEnDetail.description || '—'}</p></div>
              <div className="form-group"><label>Statut</label><p>{STATUTS.find((s) => s.value === filiereEnDetail.statut)?.label}</p></div>
              <div className="form-group"><label>Créée le</label><p>{new Date(filiereEnDetail.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!filiereASupprimer}
        titre="Supprimer la filière"
        message={`Voulez-vous vraiment supprimer la filière « ${filiereASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setFiliereASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default Filieres;