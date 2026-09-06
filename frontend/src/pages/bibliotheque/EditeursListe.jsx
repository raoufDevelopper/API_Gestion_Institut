
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getEditeurs, creerEditeur, modifierEditeur, supprimerEditeur } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';


function EditeursListe() {
  const [editeurs, setEditeurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [editeurEnEdition, setEditeurEnEdition] = useState(null);
  const [editeurASupprimer, setEditeurASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = () => { getEditeurs().then((res) => setEditeurs(res.data)); };
  useEffect(() => { charger(); }, []);
  const filtres = editeurs.filter((e) => e.nom.toLowerCase().includes(recherche.toLowerCase()));
  const ouvrirCreation = () => { setEditeurEnEdition(null); reset({ nom: '', adresse: '', telephone: '', email: '', site_web: '' }); setModalOuvert(true); };
  const ouvrirEdition = (e) => { setEditeurEnEdition(e.id); reset(e); setModalOuvert(true); };
  const onSubmit = async (data) => {
    try {
      if (editeurEnEdition) { await modifierEditeur(editeurEnEdition, data); afficherSucces('Éditeur modifié.'); }
      else { await creerEditeur(data); afficherSucces('Éditeur créé.'); }
      reset(); setModalOuvert(false); setEditeurEnEdition(null); charger();
    } catch (err) { afficherErreur(err.response?.data?.nom?.[0] || 'Erreur.'); }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try { await supprimerEditeur(editeurASupprimer.id); afficherSucces('Éditeur supprimé.'); setEditeurASupprimer(null); charger(); }
    catch (err) { afficherErreur('Erreur.'); }
    finally { setSuppressionEnCours(false); }
  };





  return (
    <div className="container-principal">
      <div className="department-page">
        
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Éditeurs</h3>
            <div className="sub">Gérez les éditeurs ici ...</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}><i className="fas fa-plus"></i> Ajouter un éditeur</button>
        </div>
        
        <div className="department-toolbar">
          <div className="toolbar-left"><div className="search-box"><i className="fas fa-search"></i><input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></div></div>
        </div>
        
        
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Éditeurs</h2>
            <span>{filtres.length} Éditeurs</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Nom</th><th>Téléphone</th><th>Email</th><th>Ressources</th><th>Actions</th></tr></thead>
              <tbody>
                {filtres.map((e) => (
                  <tr className="row-link" key={e.id}>
                    <td className="cell-strong">{e.nom}</td><td>{e.telephone || '—'}</td><td>{e.email || '—'}</td><td>{e.nb_ressources}</td>
                    <td>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(e)}><i className="fas fa-pen"></i></button>
                      <button className="table-btn delete" onClick={() => setEditeurASupprimer(e)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {filtres.length === 0 && <tr><td colSpan="5"><div className="empty">Aucun éditeur.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      
      
      
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{editeurEnEdition ? "Modifier l'éditeur" : 'Nouvel éditeur'}</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group"><div><label>Nom</label><span className="required" style={{ color: 'red' }}>*</span></div><input type="text" {...register('nom', { required: true })} />{errors.nom && <div className="form-errors">Champ requis</div>}</div>
              <div className="form-group"><label>Téléphone</label><input type="text" {...register('telephone')} /></div>
              <div className="form-group"><label>Email</label><input type="email" {...register('email')} /></div>
              <div className="form-group"><label>Site web</label><input type="url" {...register('site_web')} /></div>
              <div className="form-group full"><label>Adresse</label><input type="text" {...register('adresse')} /></div>
              <div className="form-group full"><label>Description</label><textarea rows="2" {...register('description')}></textarea></div>
            </div>
            <div className="modal-footer"><button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>Enregistrer</button></div>
          </form>

          <hr />
                    
          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
            Soumettez le formulaire si consigne respectée !
          </p>

        </div>
      </div>

      <ConfirmationModal ouvert={!!editeurASupprimer} titre="Supprimer l'éditeur" message={`Voulez-vous vraiment supprimer « ${editeurASupprimer?.nom} » ?`} onConfirmer={confirmerSuppression} onAnnuler={() => setEditeurASupprimer(null)} chargement={suppressionEnCours} />
    
    </div>

  );

}


export default EditeursListe;