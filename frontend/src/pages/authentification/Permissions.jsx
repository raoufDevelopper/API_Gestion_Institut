import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getPermissions } from '../../api/permissions';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css'


function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [permissionEnDetail, setPermissionEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

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



  return (
    <div className="container-principal">
      <div className="department-page">
        
        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des permissions</h3>
            <div className="sub">{permissions.length} permissions</div>
          </div>
          
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
                  <th style={{ minWidth: '400px' }}>Code</th>
                  <th>Nom</th>
                  <th style={{ minWidth: '150px' }}>Ajoutée le</th>
                  <th>Description</th>
                  <th style={{ minWidth: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {permissionsFiltrees.map((p) => (
                  <tr className="row-link" key={p.id}>
                    <td><div className="cell-strong mono">{p.code}</div></td>
                    <td>{p.nom}</td>
                    <td>{new Date(p.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td><div className="cell-sub description">{p.description || '—'}</div></td>
                    <td>
                      <button className="table-btn view" onClick={() => setPermissionEnDetail(p)}>
                        <i className="fas fa-eye"></i> 
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



      {/* MODAL DETAIL */}
      <div className="department-modal" style={{ display: permissionEnDetail ? 'flex' : 'none' }}>
        
        <div className="modal-content model-detail">
          
          <div className="modal-header">
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

    </div>

  );

}


export default Permissions;