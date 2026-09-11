import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getRoles, creerRole, modifierRole, supprimerRole } from '../../api/roles';
import { getPermissions } from '../../api/permissions';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';



function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissionsDisponibles, setPermissionsDisponibles] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [roleEnEdition, setRoleEnEdition] = useState(null);
  const [roleASupprimer, setRoleASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [roleEnDetail, setRoleEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  
  const charger = async () => {
    const res = await getRoles();
    setRoles(res.data);
  };
  
  useEffect(() => {
    charger();
    getPermissions().then((res) => setPermissionsDisponibles(res.data));
  }, []);
  
  const rolesFiltres = roles.filter((r) => {
    const texte = (r.nom + ' ' + (r.description || '')).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  
  const ouvrirCreation = () => {
    setRoleEnEdition(null);
    reset({ nom: '', description: '', permission_ids: [] });
    setModalOuvert(true);
  };
  
  const ouvrirEdition = (role) => {
    setRoleEnEdition(role.id);
    reset({
      nom: role.nom,
      description: role.description,
      permission_ids: role.permissions.map((p) => String(p.id)),
    });
    setModalOuvert(true);
  };
  
  const onSubmit = async (data) => {
    const payload = {
      nom: data.nom,
      description: data.description,
      permission_ids: (data.permission_ids || []).map(Number),
    };
    try {
      if (roleEnEdition) {
        await modifierRole(roleEnEdition, payload);
        afficherSucces('Rôle modifié avec succès.');
      } else {
        await creerRole(payload);
        afficherSucces('Rôle créé avec succès.');
      }
      reset();
      setModalOuvert(false);
      setRoleEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement du rôle.");
    }
  };

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerRole(roleASupprimer.id);
      afficherSucces('Rôle supprimé.');
      setRoleASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des rôles</h3>
            <div className="sub">{roles.length} rôles</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouveau rôle
          </button>
        </div>
        
        
        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un rôle..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des rôles</h2>
            <span>{rolesFiltres.length} rôles</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Permissions</th>
                  <th>Ajouté le</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rolesFiltres.map((r) => (
                  <tr className="row-link" key={r.id}>
                    <td><div className="cell-strong">{r.nom}</div></td>
                    <td>{r.permissions.length} permission{r.permissions.length > 1 ? 's' : ''}</td>
                    <td>{new Date(r.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td><div className="cell-sub description">{r.description || '—'}</div></td>
                    <td>
                      <button className="table-btn view" onClick={() => setRoleEnDetail(r)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(r)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setRoleASupprimer(r)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {rolesFiltres.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucun rôle ne correspond à cette recherche.</div>
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
            <h2>{roleEnEdition ? 'Modifier le rôle' : 'Nouveau rôle'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div>
                  <label>Nom</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('nom', { required: 'Le nom est requis' })} placeholder='Entrez le nom du rôle'/>
                {errors.nom && <div className="text-error form-error">{errors.nom.message}</div>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" {...register('description')} placeholder='Entrez la description'></textarea>
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-select">
                  {permissionsDisponibles.map((permission) => (
                    <label key={permission.id} className="permission-checkbox">
                      <input type="checkbox" value={permission.id} {...register('permission_ids')}/>
                      {permission.nom}
                    </label>
                  ))}
                </div>
                <div className="text-help">
                  Selectionnez la ou les permissions liées à ce rôle.
                </div>
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
      <div className="department-modal" style={{ display: roleEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail du rôle</h2>
            <button onClick={() => setRoleEnDetail(null)} className='btn-primary'>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {roleEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group">
                <label>Nom</label>
                <p>{roleEnDetail.nom}</p>
              </div>
              <div className="form-group">
                <label>Description</label>
                <p>{roleEnDetail.description || '—'}</p>
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <p>
                  {roleEnDetail.permissions.length > 0
                    ? roleEnDetail.permissions.map((p) => p.nom).join(' ** ')
                    : 'Aucune permission attribuée'}
                </p>
              </div>
              <div className="form-group">
                <label>Ajouté le</label>
                <p>{new Date(roleEnDetail.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* MODAL DE CONFIRMATION SUPPRESSION */}
      <ConfirmationModal
        ouvert={!!roleASupprimer}
        titre="Supprimer le rôle"
        message={`Voulez-vous vraiment supprimer le rôle « ${roleASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setRoleASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default Roles;