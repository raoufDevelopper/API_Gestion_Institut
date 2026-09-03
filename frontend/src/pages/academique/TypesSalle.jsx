import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getTypesSalle, creerTypeSalle, modifierTypeSalle, supprimerTypeSalle } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';



function TypesSalle() {
  const [typesSalle, setTypesSalle] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [typeSalleEnEdition, setTypeSalleEnEdition] = useState(null);
  const [typeSalleASupprimer, setTypeSalleASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [typeSalleEnDetail, setTypeSalleEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getTypesSalle();
    setTypesSalle(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const typesSalleFiltres = typesSalle.filter((t) => {
    const texte = (t.code + ' ' + t.libelle).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setTypeSalleEnEdition(null);
    reset({ code: '', libelle: '', description: '' });
    setModalOuvert(true);
  };
  const ouvrirEdition = (typeSalle) => {
    setTypeSalleEnEdition(typeSalle.id);
    reset({ code: typeSalle.code, libelle: typeSalle.libelle, description: typeSalle.description });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (typeSalleEnEdition) {
        await modifierTypeSalle(typeSalleEnEdition, data);
        afficherSucces('Type de salle modifié avec succès.');
      } else {
        await creerTypeSalle(data);
        afficherSucces('Type de salle créé avec succès.');
      }
      reset();
      setModalOuvert(false);
      setTypeSalleEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || err.response?.data?.libelle?.[0] || "Erreur lors de l'enregistrement du type de salle."
      );
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerTypeSalle(typeSalleASupprimer.id);
      afficherSucces('Type de salle supprimé.');
      setTypeSalleASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des types de salle</h3>
            <div className="sub">{typesSalle.length} type(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouveau type
          </button>
        </div>
  
  
        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un type de salle..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
  
  
  
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des types de salle</h2>
            <span>{typesSalleFiltres.length} types</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libellé</th>
                  <th>Ajouté le</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {typesSalleFiltres.map((t) => (
                  <tr className="row-link" key={t.id}>
                    <td><div className="cell-strong mono">{t.code}</div></td>
                    <td>{t.libelle}</td>
                    <td>{new Date(t.date_creation).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button className="table-btn view" onClick={() => setTypeSalleEnDetail(t)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(t)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setTypeSalleASupprimer(t)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {typesSalleFiltres.length === 0 && (
                  <tr>
                    <td colSpan="4">
                      <div className="empty">Aucun type de salle ne correspond à cette recherche.</div>
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
            <h2>{typeSalleEnEdition ? 'Modifier le type de salle' : 'Nouveau type de salle'}</h2>
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
                <div className="text-help">
                  EX : S-INFO, SCL, S-TP, LAB..
                </div>
                {errors.code && <div className="form-errors">{errors.code.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Libellé</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('libelle', { required: 'Le libellé est requis' })} />
                <div className="text-help">
                  EX : salle informatique, salle de classe, laboratoire ...
                </div>
                {errors.libelle && <div className="form-errors">{errors.libelle.message}</div>}
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
      <div className="department-modal" style={{ display: typeSalleEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail du type de salle</h2>
            <button onClick={() => setTypeSalleEnDetail(null)} className='btn-primary'>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {typeSalleEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{typeSalleEnDetail.code}</p></div>
              <div className="form-group"><label>Libellé</label><p>{typeSalleEnDetail.libelle}</p></div>
              <div className="form-group"><label>Description</label><p>{typeSalleEnDetail.description || '—'}</p></div>
              <div className="form-group"><label>Ajouté le</label><p>{new Date(typeSalleEnDetail.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
          )}
        </div>
      </div>


      <ConfirmationModal
        ouvert={!!typeSalleASupprimer}
        titre="Supprimer le type de salle"
        message={`Voulez-vous vraiment supprimer le type de salle « ${typeSalleASupprimer?.libelle} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setTypeSalleASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default TypesSalle;