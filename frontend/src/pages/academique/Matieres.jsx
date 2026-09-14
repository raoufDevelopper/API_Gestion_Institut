import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getMatieres, creerMatiere, modifierMatiere, supprimerMatiere, getSpecialites, getNiveaux } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';



const SEMESTRES = [
  { value: 'S1', label: 'Semestre 1' },
  { value: 'S2', label: 'Semestre 2' },
];


const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'suspendu', label: 'Suspendu' },
];




function Matieres() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [specialites, setSpecialites] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [matiereEnEdition, setMatiereEnEdition] = useState(null);
  const [matiereASupprimer, setMatiereASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [matiereEnDetail, setMatiereEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const charger = async () => {
    const res = await getMatieres();
    setDonnees(res.data);
  };


  useEffect(() => {
    charger();
    getSpecialites().then((res) => setSpecialites(res.data.resultats || res.data));
    getNiveaux().then((res) => setNiveaux(res.data));
  }, []);


  const matieresFiltrees = donnees.resultats.filter((m) => {
    const texte = (m.code + ' ' + m.nom).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });


  const ouvrirCreation = () => {
    setMatiereEnEdition(null);
    reset({
      code: '', nom: '', specialite: [], niveau: [], description: '',
      coefficient: 1, volume_horaire: 1, credit: 1, semestre: 'S1', statut: 'actif',
    });
    setModalOuvert(true);
  };


  const ouvrirEdition = (matiere) => {
    setMatiereEnEdition(matiere.id);
    reset({
      code: matiere.code,
      nom: matiere.nom,
      specialite: (matiere.specialite || []).map(String),
      niveau: (matiere.niveau || []).map(String),
      description: matiere.description,
      coefficient: matiere.coefficient,
      volume_horaire: matiere.volume_horaire,
      credit: matiere.credit,
      semestre: matiere.semestre,
      statut: matiere.statut,
    });
    setModalOuvert(true);
  };


  const onSubmit = async (data) => {
    const payload = {
      ...data,
      specialite: (data.specialite || []).map(Number),
      niveau: (data.niveau || []).map(Number),
    };


    try {

      if (matiereEnEdition) {
        await modifierMatiere(matiereEnEdition, payload);
        afficherSucces('Matière modifiée avec succès.');
      } else {
        await creerMatiere(payload);
        afficherSucces('Matière créée avec succès.');
      }

      reset();
      setModalOuvert(false);
      setMatiereEnEdition(null);
      charger();

    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement de la matière."
      );
    }
  };


  const confirmerSuppression = async () => {

    setSuppressionEnCours(true);

    try {
      await supprimerMatiere(matiereASupprimer.id);
      afficherSucces('Matière supprimée.');
      setMatiereASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des matières</h3>
            <div className="sub">{total} matière(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle matière
          </button>
        </div>


        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-book-open"></i></div>
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
              <input type="text" placeholder="Rechercher une matière..." value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
            </div>
          </div>
        </div>


        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des matières</h2>
            <span>{matieresFiltrees.length} matières</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Coefficient</th>
                  <th>Statut</th>
                  <th>Semestre</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {matieresFiltrees.map((m) => (
                  <tr className="row-link" key={m.id}>
                    <td><div className="cell-strong mono">{m.code}</div></td>
                    <td>{m.nom}</td>
                    <td>{m.coefficient} (crédits)</td>
                     <td>
                      <span className={`badge-${m.statut === 'actif' ? 'success' : m.statut === 'inactif' ? 'danger' : 'orange'}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS.find((s) => s.value === m.statut)?.label}
                      </span>
                    </td>
                    <td>{SEMESTRES.find((s) => s.value === m.semestre)?.label}</td>
                    <td>
                      <button className="table-btn view" onClick={() => setMatiereEnDetail(m)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(m)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setMatiereASupprimer(m)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {matieresFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty">Aucune matière ne correspond à cette recherche.</div>
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
          <div className="modal-header">
            <h2>{matiereEnEdition ? 'Modifier la matière' : 'Nouvelle matière'}</h2>
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
                  <label>Coefficient</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="number" min="1" {...register('coefficient', { required: true, valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <div>
                  <label>Volume horaire</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="number" min="1" {...register('volume_horaire', { required: true, valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <div>
                  <label>Crédit</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="number" min="1" {...register('credit', { required: true, valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <div>
                  <label>Semestre</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('semestre', { required: true })}>
                  {SEMESTRES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select {...register('statut')}>
                  {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="form-group full">
                <label>Spécialités concernées</label>
                <div className="permissions-select">
                  {specialites.map((s) => (
                    <label key={s.id} className="permission-checkbox">
                      <input type="checkbox" value={s.id} {...register('specialite')} />
                      {s.nom}
                    </label>
                  ))}
                </div>
              
              </div>
              
              <div className="form-group full">
                <label>Niveaux concernés</label>
                <div className="permissions-select">
                  {niveaux.map((n) => (
                    <label key={n.id} className="permission-checkbox">
                      <input type="checkbox" value={n.id} {...register('niveau')} />
                      {n.nom}
                    </label>
                  ))}
                </div>
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
      <div className="department-modal" style={{ display: matiereEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail de la matière</h2>
            <button onClick={() => setMatiereEnDetail(null)} className='btn-primary'>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {matiereEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{matiereEnDetail.code}</p></div>
              <div className="form-group"><label>Nom</label><p>{matiereEnDetail.nom}</p></div>
              <div className="form-group"><label>Coefficient</label><p>{matiereEnDetail.coefficient}</p></div>
              <div className="form-group"><label>Volume horaire</label><p>{matiereEnDetail.volume_horaire}h</p></div>
              <div className="form-group"><label>Crédit</label><p>{matiereEnDetail.credit}</p></div>
              <div className="form-group"><label>Semestre</label><p>{SEMESTRES.find((s) => s.value === matiereEnDetail.semestre)?.label}</p></div>
              <div className="form-group full"><label>Spécialités</label><p>{(matiereEnDetail.specialite_noms || []).join(', ') || '—'}</p></div>
              <div className="form-group full"><label>Niveaux</label><p>{(matiereEnDetail.niveau_noms || []).join(', ') || '—'}</p></div>
              <div className="form-group full"><label>Description</label><p>{matiereEnDetail.description || '—'}</p></div>
              <div className="form-group"><label>Statut</label><p>{STATUTS.find((s) => s.value === matiereEnDetail.statut)?.label}</p></div>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        ouvert={!!matiereASupprimer}
        titre="Supprimer la matière"
        message={`Voulez-vous vraiment supprimer la matière « ${matiereASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setMatiereASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  
  );

}


export default Matieres;