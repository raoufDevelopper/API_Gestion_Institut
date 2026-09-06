import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enregistrerEmprunt, getAdherents, getRessources, getExemplaires } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';


function EnregistrerEmprunt() {
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const [adherents, setAdherents] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [exemplaires, setExemplaires] = useState([]);
  const [adherentId, setAdherentId] = useState('');
  const [ressourceId, setRessourceId] = useState('');
  const [exemplaireId, setExemplaireId] = useState('');
  const [observations, setObservations] = useState('');
  const [enCours, setEnCours] = useState(false);
  useEffect(() => {
    getAdherents({ statut: 'ACTIF' }).then((res) => setAdherents(res.data));
    getRessources().then((res) => setRessources(res.data));
  }, []);
  useEffect(() => {
    if (!ressourceId) { setExemplaires([]); setExemplaireId(''); return; }
    getExemplaires({ ressource: ressourceId, statut: 'DISPONIBLE' }).then((res) => setExemplaires(res.data));
    setExemplaireId('');
  }, [ressourceId]);
  const adherentChoisi = adherents.find((a) => String(a.id) === String(adherentId));
  const enregistrer = async () => {
    if (!adherentId || !exemplaireId) {
      afficherErreur('Veuillez sélectionner un adhérent et un exemplaire.');
      return;
    }
    setEnCours(true);
    try {
      await enregistrerEmprunt({ adherent: adherentId, exemplaire: exemplaireId, observations });
      afficherSucces('Emprunt enregistré avec succès.');
      navigate('/bibliotheque/emprunts');
    } catch (err) {
      afficherErreur(err.response?.data?.detail || "Erreur lors de l'enregistrement.");
    } finally {
      setEnCours(false);
    }
  };




  return (
    <div className="container-principal">
      
      <div className="fi-page">

        <div className="fi-header" style={{ marginBottom: "0px" }}>
          <div>
            <button className="ud-retour" onClick={() => navigate('/bibliotheque/emprunts')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <span> {' > '} Nouvel emprunt</span>
          </div>
        </div>

        <div className="panel-head" style={{ marginBottom: '25px' }}>
          <div>
            <h3 style={{ fontSize: '20px' }}>Nouvel emprunt</h3>
            <span className='sub'>Enregistrer un nouvel emprunt</span>
          </div>
        </div>
        

        <div className="fi-grid" style={{display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

          <div className="department-card" style={{ padding: '20px'}}>
          
            <div className="fi-champ" style={{ marginBottom: '18px' }}>
              <div><label>Adhérent</label><span className="required" style={{ color: 'red' }}>*</span></div>
              <select value={adherentId} onChange={(e) => setAdherentId(e.target.value)}>
                <option value="">Sélectionner un adhérent...</option>
                {adherents.map((a) => (
                  <option key={a.id} value={a.id}>{a.numero} — {a.personne_str}</option>
                ))}
              </select>
              {adherentChoisi && (
                <div className="badge badge-success" style={{ marginTop: '10px' }}>
                  Emprunts actifs : {adherentChoisi.nb_emprunts_en_cours}
                </div>
              )}
            </div>
          
            <div className="fi-champ" style={{ marginBottom: '18px' }}>
              <div><label>Ressource</label><span className="required" style={{ color: 'red' }}>*</span></div>
              <select value={ressourceId} onChange={(e) => setRessourceId(e.target.value)}>
                <option value="">Sélectionner une ressource...</option>
                {ressources.map((r) => (
                  <option key={r.id} value={r.id}>{r.titre} ({r.nb_exemplaires_disponibles} disponible{r.nb_exemplaires_disponibles > 1 ? 's' : ''})</option>
                ))}
              </select>
            </div>
          
            {ressourceId && (
              <div className="fi-champ" style={{ marginBottom: '18px' }}>
                <div><label>Exemplaire</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select value={exemplaireId} onChange={(e) => setExemplaireId(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {exemplaires.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.numero} — {ex.localisation_str || 'Non localisé'}</option>
                  ))}
                </select>
                {exemplaires.length === 0 && <div className="form-errors">Aucun exemplaire disponible pour cette ressource.</div>}
              </div>
            )}
          
            <div className="fi-champ" style={{ marginBottom: '18px' }}>
              <label>Observations</label>
              <textarea rows="2" value={observations} onChange={(e) => setObservations(e.target.value)}></textarea>
            </div>
          
            <button className="btn-primary addInscr" onClick={enregistrer} disabled={enCours}>
              {enCours ? 'Enregistrement...' : "Enregistrer l'emprunt"}
            </button>
          
          </div>

        </div>
      
      </div>
    
    </div>

  );

}


export default EnregistrerEmprunt;