
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enregistrerEmprunt, getAdherents, getRessources, getExemplaires } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';
function EnregistrerEmprunt() {
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const [rechercheAdherent, setRechercheAdherent] = useState('');
  const [adherents, setAdherents] = useState([]);
  const [adherentChoisi, setAdherentChoisi] = useState(null);
  const [rechercheRessource, setRechercheRessource] = useState('');
  const [ressources, setRessources] = useState([]);
  const [ressourceChoisie, setRessourceChoisie] = useState(null);
  const [exemplaires, setExemplaires] = useState([]);
  const [exemplaireChoisi, setExemplaireChoisi] = useState(null);
  const [observations, setObservations] = useState('');
  const [enCours, setEnCours] = useState(false);
  useEffect(() => {
    if (rechercheAdherent.length < 2) { setAdherents([]); return; }
    const timer = setTimeout(() => getAdherents({ q: rechercheAdherent, statut: 'ACTIF' }).then((res) => setAdherents(res.data)), 250);
    return () => clearTimeout(timer);
  }, [rechercheAdherent]);
  useEffect(() => {
    if (rechercheRessource.length < 2) { setRessources([]); return; }
    const timer = setTimeout(() => getRessources({ q: rechercheRessource }).then((res) => setRessources(res.data)), 250);
    return () => clearTimeout(timer);
  }, [rechercheRessource]);
  const choisirRessource = (r) => {
    setRessourceChoisie(r);
    setExemplaireChoisi(null);
    getExemplaires({ ressource: r.id, statut: 'DISPONIBLE' }).then((res) => setExemplaires(res.data));
  };
  const enregistrer = async () => {
    if (!adherentChoisi || !exemplaireChoisi) {
      afficherErreur('Veuillez sélectionner un adhérent et un exemplaire.');
      return;
    }
    setEnCours(true);
    try {
      await enregistrerEmprunt({ adherent: adherentChoisi.id, exemplaire: exemplaireChoisi.id, observations });
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
      <div className="department-page">
        <div className="panel-head"><h3 style={{ fontSize: '20px' }}>Nouvel emprunt</h3></div>
        <div className="department-card" style={{ padding: '20px', maxWidth: '650px' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div><label>Adhérent</label><span className="required" style={{ color: 'red' }}>*</span></div>
            {adherentChoisi ? (
              <div className="doc-etudiant-card selectionne">
                <div>
                  <div style={{ fontWeight: 700 }}>{adherentChoisi.personne_str}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {adherentChoisi.numero} — Emprunts actifs : {adherentChoisi.nb_emprunts_en_cours}
                  </div>
                </div>
                <button type="button" className="table-btn delete" onClick={() => setAdherentChoisi(null)}><i className="fas fa-times"></i></button>
              </div>
            ) : (
              <>
                <input type="text" placeholder="Rechercher un étudiant, personnel ou formateur..." value={rechercheAdherent} onChange={(e) => setRechercheAdherent(e.target.value)} />
                {adherents.map((a) => (
                  <div key={a.id} className="doc-etudiant-card" onClick={() => { setAdherentChoisi(a); setAdherents([]); setRechercheAdherent(''); }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.personne_str}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{a.numero} — {a.type_adherent}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div><label>Ressource</label><span className="required" style={{ color: 'red' }}>*</span></div>
            {ressourceChoisie ? (
              <div className="doc-etudiant-card selectionne">
                <div style={{ fontWeight: 700 }}>{ressourceChoisie.titre}</div>
                <button type="button" className="table-btn delete" onClick={() => { setRessourceChoisie(null); setExemplaireChoisi(null); }}><i className="fas fa-times"></i></button>
              </div>
            ) : (
              <>
                <input type="text" placeholder="Rechercher une ressource..." value={rechercheRessource} onChange={(e) => setRechercheRessource(e.target.value)} />
                {ressources.map((r) => (
                  <div key={r.id} className="doc-etudiant-card" onClick={() => choisirRessource(r)}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.titre}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{r.nb_exemplaires_disponibles} exemplaire(s) disponible(s)</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          {ressourceChoisie && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div><label>Exemplaire</label><span className="required" style={{ color: 'red' }}>*</span></div>
              <select value={exemplaireChoisi?.id || ''} onChange={(e) => setExemplaireChoisi(exemplaires.find((ex) => ex.id === Number(e.target.value)))}>
                <option value="">Sélectionner...</option>
                {exemplaires.map((ex) => <option key={ex.id} value={ex.id}>{ex.numero} — {ex.localisation_str || 'Non localisé'}</option>)}
              </select>
              {exemplaires.length === 0 && <div className="form-errors">Aucun exemplaire disponible pour cette ressource.</div>}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Observations</label>
            <textarea rows="2" value={observations} onChange={(e) => setObservations(e.target.value)}></textarea>
          </div>
          <div className="modal-footer" style={{ padding: 0 }}>
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