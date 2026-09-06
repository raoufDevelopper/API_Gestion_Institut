import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getLocalisations, creerLocalisation, modifierLocalisation, supprimerLocalisation } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';


function LocalisationsListe() {
  const [localisations, setLocalisations] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [localisationEnEdition, setLocalisationEnEdition] = useState(null);
  const [localisationASupprimer, setLocalisationASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = () => { getLocalisations().then((res) => setLocalisations(res.data)); };
  useEffect(() => { charger(); }, []);
  
  const filtres = localisations.filter((l) =>
    [l.salle, l.rayon, l.etagere].filter(Boolean).join(' ').toLowerCase().includes(recherche.toLowerCase())
  );
  
  const ouvrirCreation = () => { setLocalisationEnEdition(null); reset({ salle: '', rayon: '', etagere: '' }); setModalOuvert(true); };
  
  const ouvrirEdition = (l) => { setLocalisationEnEdition(l.id); reset({ salle: l.salle, rayon: l.rayon, etagere: l.etagere }); setModalOuvert(true); };
  
  const onSubmit = async (data) => {
    try {
      if (localisationEnEdition) { await modifierLocalisation(localisationEnEdition, data); afficherSucces('Localisation modifiée.'); }
      else { await creerLocalisation(data); afficherSucces('Localisation créée.'); }
      reset(); setModalOuvert(false); setLocalisationEnEdition(null); charger();
    } catch (err) {
      afficherErreur("Erreur lors de l'enregistrement.");
    }
  };
  
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerLocalisation(localisationASupprimer.id);
      afficherSucces('Localisation supprimée.');
      setLocalisationASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.detail || 'Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  
  
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">
  
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Localisations</h3>
            <div className="sub">Organiser physiquement la bibliothèque (salle, rayon, étagère)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i> Ajouter une localisation
          </button>
        </div>
  
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
          </div>
        </div>
  
        <div className="department-card table-card">
          <div className="table-title"><h2>Localisations</h2><span>{filtres.length} resultats</span></div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Salle</th><th>Rayon</th><th>Étagère</th><th>Exemplaires</th><th>Actions</th></tr></thead>
              <tbody>
                {filtres.map((l) => (
                  <tr className="row-link" key={l.id}>
                    <td className="cell-strong">{l.salle || '—'}</td>
                    <td>{l.rayon || '—'}</td>
                    <td>{l.etagere || '—'}</td>
                    <td>{l.exemplaires?.length ?? '—'}</td>
                    <td>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(l)}><i className="fas fa-pen"></i></button>
                      <button className="table-btn delete" onClick={() => setLocalisationASupprimer(l)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {filtres.length === 0 && <tr><td colSpan="5"><div className="empty">Aucune localisation.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
  
      </div>
  
  
  
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{localisationEnEdition ? 'Modifier la localisation' : 'Nouvelle localisation'}</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm" style={{ height: '360px' }}>
            <div className="form-grid">
              <div className="form-group"><label>Salle</label><input type="text" {...register('salle')} /></div>
              <div className="form-group"><label>Rayon</label><input type="text" {...register('rayon')} /></div>
              <div className="form-group"><label>Étagère</label><input type="text" {...register('etagere')} /></div>
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
        ouvert={!!localisationASupprimer}
        titre="Supprimer la localisation"
        message="Voulez-vous vraiment supprimer cette localisation ?"
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setLocalisationASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default LocalisationsListe;