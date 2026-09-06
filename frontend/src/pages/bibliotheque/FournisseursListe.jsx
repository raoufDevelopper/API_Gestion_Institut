
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getFournisseurs, creerFournisseur, modifierFournisseur, supprimerFournisseur } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';



function FournisseursListe() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [fournisseurEnEdition, setFournisseurEnEdition] = useState(null);
  const [fournisseurASupprimer, setFournisseurASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = () => { getFournisseurs().then((res) => setFournisseurs(res.data)); };
  useEffect(() => { charger(); }, []);
  const filtres = fournisseurs.filter((f) => f.nom.toLowerCase().includes(recherche.toLowerCase()));
  const ouvrirCreation = () => { setFournisseurEnEdition(null); reset({ nom: '', telephone: '', email: '', adresse: '', personne_contact: '' }); setModalOuvert(true); };
  const ouvrirEdition = (f) => { setFournisseurEnEdition(f.id); reset(f); setModalOuvert(true); };
  const onSubmit = async (data) => {
    try {
      if (fournisseurEnEdition) { await modifierFournisseur(fournisseurEnEdition, data); afficherSucces('Fournisseur modifié.'); }
      else { await creerFournisseur(data); afficherSucces('Fournisseur créé.'); }
      reset(); setModalOuvert(false); setFournisseurEnEdition(null); charger();
    } catch (err) {
      afficherErreur(err.response?.data?.nom?.[0] || 'Erreur.');
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try { await supprimerFournisseur(fournisseurASupprimer.id); afficherSucces('Fournisseur supprimé.'); setFournisseurASupprimer(null); charger(); }
    catch (err) { afficherErreur('Erreur lors de la suppression.'); }
    finally { setSuppressionEnCours(false); }
  };





  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Fournisseurs</h3>
            <div className="sub">Suivre les fournisseurs de ressources</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}><i className="fas fa-plus"></i> Ajouter un fournisseur</button>
        </div>
        
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box"><i className="fas fa-search"></i><input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></div>
          </div>
        </div>
        
        
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Fournisseurs</h2>
            <span>{filtres.length} Fournisseurs</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Acquisitions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((f) => (
                  <tr className="row-link" key={f.id}>
                    <td className="cell-strong">{f.nom}</td><td>{f.telephone || '—'}</td><td>{f.email || '—'}</td><td>{f.nb_acquisitions}</td>
                    <td>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(f)}><i className="fas fa-pen"></i></button>
                      <button className="table-btn delete" onClick={() => setFournisseurASupprimer(f)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {filtres.length === 0 && <tr><td colSpan="5"><div className="empty">Aucun fournisseur.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>





      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{fournisseurEnEdition ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group"><div><label>Nom</label><span className="required" style={{ color: 'red' }}>*</span></div><input type="text" {...register('nom', { required: true })} />{errors.nom && <div className="form-errors">Champ requis</div>}</div>
              <div className="form-group"><label>Téléphone</label><input type="text" {...register('telephone')} /></div>
              <div className="form-group"><label>Email</label><input type="email" {...register('email')} /></div>
              <div className="form-group"><label>Personne de contact</label><input type="text" {...register('personne_contact')} /></div>
              <div className="form-group full"><label>Adresse</label><input type="text" {...register('adresse')} /></div>
              <div className="form-group full"><label>Observations</label><textarea rows="2" {...register('observations')}></textarea></div>
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



      <ConfirmationModal ouvert={!!fournisseurASupprimer} titre="Supprimer le fournisseur" message={`Voulez-vous vraiment supprimer « ${fournisseurASupprimer?.nom} » ?`} onConfirmer={confirmerSuppression} onAnnuler={() => setFournisseurASupprimer(null)} chargement={suppressionEnCours} />
    
    </div>
  );
}
export default FournisseursListe;