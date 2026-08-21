import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getPermissions, creerPermission, modifierPermission, supprimerPermission } from '../../api/permissions';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css'


function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [permissionASupprimer, setPermissionASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [permissionEnEdition, setPermissionEnEdition] = useState(null);
  const [permissionEnDetail, setPermissionEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const {
    register: registerEdition,
    handleSubmit: handleSubmitEdition,
    reset: resetEdition,
    formState: { isSubmitting: isSubmittingEdition },
  } = useForm();
  const charger = async () => {
    const res = await getPermissions();
    setPermissions(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const permissionsFiltrees = permissions.filter((p) => {
    const texte = (p.code + ' ' + p.nom + ' ' + (p.description || '')).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const onSubmit = async (data) => {
    try {
      await creerPermission(data);
      afficherSucces('Permission créée avec succès.');
      reset();
      setModalOuvert(false);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.code?.[0] || "Erreur lors de la création de la permission.");
    }
  };
  const ouvrirEdition = (permission) => {
    setPermissionEnEdition(permission.id);
    resetEdition(permission);
  };
  const annulerEdition = () => {
    setPermissionEnEdition(null);
  };
  const onSubmitEdition = async (data) => {
    try {
      await modifierPermission(permissionEnEdition, data);
      afficherSucces('Permission modifiée avec succès.');
      setPermissionEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.code?.[0] || "Erreur lors de la modification.");
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerPermission(permissionASupprimer.id);
      afficherSucces('Permission supprimée.');
      setPermissionASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des permissions</h3>
            <div className="sub">{permissions.length} permission(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={() => setModalOuvert(true)}>
            <i className="fas fa-plus"></i>
            Nouvelle permission
          </button>
        </div>
        
        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une permission..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des permissions</h2>
            <span>{permissionsFiltrees.length} permissions</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Ajoutée le</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {permissionsFiltrees.map((p) => (
                  <tr className="row-link" key={p.id}>
                    <td><div className="cell-strong mono">{p.code}</div></td>
                    <td>{p.nom}</td>
                    <td>{new Date(p.date_ajout).toLocaleDateString('fr-FR')}</td>
                    <td><div className="cell-sub description">{p.description || '—'}</div></td>
                    <td>
                      <button className="table-btn view" onClick={() => setPermissionEnDetail(p)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(p)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setPermissionASupprimer(p)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {permissionsFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucune permission ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>




      {/* MODAL DE CREATION */}
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        
        <div className="modal-content">
        
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7a5503, #d3b429)' }}>
            <h2>Nouvelle permission</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        
        
          <form onSubmit={handleSubmit(onSubmit)} id='departmentForm'>
           
            <div className="form-grid">
              
              <div className="form-group">
                <div>
                  <label>Code</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('code', { required: 'Le code est requis' })} />
                <div className="text-help">Identifiant technique, ex. "gerer_etudiants".</div>
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
      <div className="department-modal" style={{ display: permissionEnDetail ? 'flex' : 'none' }}>
        
        <div className="modal-content model-detail">
          
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail de la permission</h2>
            <button onClick={() => setPermissionEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {permissionEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group">
                <label>Code</label>
                <p>{permissionEnDetail.code}</p>
              </div>
              <div className="form-group">
                <label>Nom</label>
                <p>{permissionEnDetail.nom}</p>
              </div>
              <div className="form-group">
                <label>Description</label>
                <p>{permissionEnDetail.description || '—'}</p>
              </div>
              <div className="form-group">
                <label>Ajoutée le</label>
                <p>{new Date(permissionEnDetail.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* MODAL DE CONFIRMATION SUPPRESSION */}
      <ConfirmationModal
        ouvert={!!permissionASupprimer}
        titre="Supprimer la permission"
        message={`Voulez-vous vraiment supprimer la permission « ${permissionASupprimer?.nom} » ? Cette action est irréversible.`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setPermissionASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>

  );

}


export default Permissions;