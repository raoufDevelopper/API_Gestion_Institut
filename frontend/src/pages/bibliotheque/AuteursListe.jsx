import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getAuteurs, creerAuteur, modifierAuteur, supprimerAuteur } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';


function AuteursListe() {
  const [auteurs, setAuteurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [auteurEnEdition, setAuteurEnEdition] = useState(null);
  const [auteurASupprimer, setAuteurASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = () => { getAuteurs().then((res) => setAuteurs(res.data)); };
  useEffect(() => { charger(); }, []);
  const filtres = auteurs.filter((a) => (a.nom + ' ' + (a.prenom || '')).toLowerCase().includes(recherche.toLowerCase()));
  const ouvrirCreation = () => { setAuteurEnEdition(null); reset({ nom: '', prenom: '', nationalite: '', biographie: '' }); setModalOuvert(true); };
  const ouvrirEdition = (a) => { setAuteurEnEdition(a.id); reset(a); setModalOuvert(true); };
 
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([cle, valeur]) => {
      if (cle === 'photo') {
        if (valeur instanceof FileList && valeur.length > 0) formData.append(cle, valeur[0]);
      } else if (valeur !== null && valeur !== undefined && valeur !== '') {
        formData.append(cle, valeur);
      }
    });
    try {
      if (auteurEnEdition) { 
        await modifierAuteur(auteurEnEdition, formData); 
        afficherSucces('Auteur modifié.'); }
      else { 
        await creerAuteur(formData); 
        afficherSucces('Auteur créé.'); 
      }
      reset(); 
      setModalOuvert(false); 
      setAuteurEnEdition(null); 
      charger();
    } catch (err) { 
      afficherErreur('Erreur.'); 
    }
  };

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try { await supprimerAuteur(auteurASupprimer.id); 
      afficherSucces('Auteur supprimé.'); 
      setAuteurASupprimer(null); charger(); }
    catch (err) { 
      afficherErreur('Erreur lors de la suppression.'); 
    }
    finally { setSuppressionEnCours(false); }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des Auteurs</h3>
            <div className="sub">{filtres.length} Auteurs(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}><i className="fas fa-plus"></i> Ajouter un auteur</button>
        </div>
        
        <div className="department-toolbar">
          <div className="toolbar-left"><div className="search-box"><i className="fas fa-search"></i><input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></div></div>
        </div>
        
        <div className="department-card table-card">
          <div className="table-title"><h2>Liste des Auteurs</h2><span>{filtres.length} Auteurs</span></div>
          <div className="table-scroll">
            <table>
              
              <thead>
                <tr>
                  <th>auteur</th>
                  <th>Nationalité</th>
                  <th>Ressources</th>
                  <th>Actions</th>
                </tr>
              </thead>
              
              
              <tbody>

                {filtres.map((a) => (
                  <tr className="row-link" key={a.id}>
                    <td>
                      <div className="cell-with-avatar">
                        {a.photo ? (
                          <img src={a.photo} alt="" className="avatar-mini" />
                        ) : (
                          <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>
                        )}
                        <div className="cell-strong">{a.nom || '—'} {a.prenom || '—'}</div>
                      </div>
                    </td>
                    <td>{a.nationalite || '—'}</td>
                    <td>{a.nb_ressources} ressources</td>
                    <td>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(a)}><i className="fas fa-pen"></i></button>
                      <button className="table-btn delete" onClick={() => setAuteurASupprimer(a)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}

                {filtres.length === 0 && 
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucun auteur.</div>
                    </td>
                  </tr>
                }
              
              </tbody>

            </table>
          
          </div>
        
        </div>
      
      </div>


      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{auteurEnEdition ? "Modifier l'auteur" : 'Nouvel auteur'}</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group"><div><label>Nom</label><span className="required" style={{ color: 'red' }}>*</span></div><input type="text" {...register('nom', { required: true })} />{errors.nom && <div className="form-errors">Champ requis</div>}</div>
              <div className="form-group"><label>Prénom</label><input type="text" {...register('prenom')} /></div>
              <div className="form-group"><label>Nationalité</label><input type="text" {...register('nationalite')} /></div>
              <div className="form-group full"><label>Biographie</label><textarea rows="3" {...register('biographie')}></textarea></div>
              <div className="form-group full"><label>Photo</label><input type="file" accept="image/*" {...register('photo')} /></div>
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

      <ConfirmationModal 
        ouvert={!!auteurASupprimer} 
        titre="Supprimer l'auteur" 
        message={`Voulez-vous vraiment supprimer « ${auteurASupprimer?.nom} » ?`} 
        onConfirmer={confirmerSuppression} 
        onAnnuler={() => setAuteurASupprimer(null)} 
        chargement={suppressionEnCours} 
      />
    
    </div>

  );

}

export default AuteursListe;