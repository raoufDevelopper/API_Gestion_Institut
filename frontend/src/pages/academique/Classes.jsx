import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getClasses, creerClasse, modifierClasse, supprimerClasse, getSpecialites, getNiveaux, getFilieres } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';


function Classes() {
  const [classes, setClasses] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [classeEnEdition, setClasseEnEdition] = useState(null);
  const [classeASupprimer, setClasseASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [classeEnDetail, setClasseEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getClasses();
    setClasses(res.data);
  };
  useEffect(() => {
    charger();
    getSpecialites().then((res) => setSpecialites(res.data.resultats || res.data));
    getNiveaux().then((res) => setNiveaux(res.data));
    getFilieres().then((res) => setFilieres(res.data.resultats || res.data));
  }, []);
  const classesFiltrees = classes.filter((c) => {
    const texte = ((c.specialite_code || '') + ' ' + (c.niveau_nom || '') + ' ' + (c.filiere_nom || '')).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setClasseEnEdition(null);
    reset({ specialite: '', niveau: '', filiere: '', effectif: 0 });
    setModalOuvert(true);
  };
  const ouvrirEdition = (classe) => {
    setClasseEnEdition(classe.id);
    reset({
      specialite: classe.specialite,
      niveau: classe.niveau,
      filiere: classe.filiere,
      effectif: classe.effectif,
    });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (classeEnEdition) {
        await modifierClasse(classeEnEdition, data);
        afficherSucces('Classe modifiée avec succès.');
      } else {
        await creerClasse(data);
        afficherSucces('Classe créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setClasseEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.specialite?.[0] || "Erreur lors de l'enregistrement de la classe."
      );
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerClasse(classeASupprimer.id);
      afficherSucces('Classe supprimée.');
      setClasseASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des classes</h3>
            <div className="sub">{classes.length} classe(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle classe
          </button>
        </div>
        
        
        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une classe..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>



        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des classes</h2>
            <span>{classesFiltrees.length} classes</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Spécialité</th>
                  <th>Niveau</th>
                  <th>Filière</th>
                  <th>Effectif</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {classesFiltrees.map((c) => (
                  <tr className="row-link" key={c.id}>
                    <td><div className="cell-strong">{c.specialite_code || '—'}</div></td>
                    <td>{c.niveau_nom || '—'}</td>
                    <td>{c.filiere_nom || '—'}</td>
                    <td>{c.effectif} étudiants</td>
                    <td>
                      <button className="table-btn view" onClick={() => setClasseEnDetail(c)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(c)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setClasseASupprimer(c)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {classesFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucune classe ne correspond à cette recherche.</div>
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
            <h2>{classeEnEdition ? 'Modifier la classe' : 'Nouvelle classe'}</h2>
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
                  <label>Spécialité</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('specialite', { required: 'La spécialité est requise' })}>
                  <option value="">Sélectionner...</option>
                  {specialites.map((s) => (
                    <option key={s.id} value={s.id}>{s.code}</option>
                  ))}
                </select>
                {errors.specialite && <div className="form-errors">{errors.specialite.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Niveau</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('niveau', { required: 'Le niveau est requis' })}>
                  <option value="">Sélectionner...</option>
                  {niveaux.map((n) => (
                    <option key={n.id} value={n.id}>{n.nom}</option>
                  ))}
                </select>
                {errors.niveau && <div className="form-errors">{errors.niveau.message}</div>}
              </div>
              <div className="form-group">
                <label>Effectif</label>
                <input type="number" min="0" {...register('effectif', { valueAsNumber: true })} />
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
      <div className="department-modal" style={{ display: classeEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail de la classe</h2>
            <button onClick={() => setClasseEnDetail(null)} className='btn-primary'>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {classeEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Filière</label><p>{classeEnDetail.filiere_nom || '—'}</p></div>
              <div className="form-group"><label>Spécialité</label><p>{classeEnDetail.specialite_code || '—'}</p></div>
              <div className="form-group"><label>Niveau</label><p>{classeEnDetail.niveau_nom || '—'}</p></div>
              <div className="form-group"><label>Effectif</label><p>{classeEnDetail.effectif} étudiants</p></div>
            </div>
          )}
        </div>
      </div>


      <ConfirmationModal
        ouvert={!!classeASupprimer}
        titre="Supprimer la classe"
        message={`Voulez-vous vraiment supprimer cette classe ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setClasseASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>
  );
}
export default Classes;