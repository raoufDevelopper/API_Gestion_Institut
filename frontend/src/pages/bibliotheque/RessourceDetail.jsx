
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRessource, creerExemplairesEnMasse, getLocalisations } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import { TYPES_RESSOURCE, BADGE_STATUT_EXEMPLAIRE, STATUTS_EXEMPLAIRE, ETATS_PHYSIQUE } from './bibliothequeConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';
function RessourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ressource, setRessource] = useState(null);
  const [modalExOuvert, setModalExOuvert] = useState(false);
  const [localisations, setLocalisations] = useState([]);
  const [quantite, setQuantite] = useState(1);
  const [localisationChoisie, setLocalisationChoisie] = useState('');
  const [etatChoisi, setEtatChoisi] = useState('BON');
  const [enCours, setEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const charger = () => { getRessource(id).then((res) => setRessource(res.data)); };
  useEffect(() => { charger(); }, [id]);
  const ouvrirModalExemplaires = () => {
    getLocalisations().then((res) => setLocalisations(res.data));
    setModalExOuvert(true);
  };
  const ajouterExemplaires = async () => {
    setEnCours(true);
    try {
      await creerExemplairesEnMasse({ ressource: id, quantite, localisation: localisationChoisie || null, etat: etatChoisi });
      afficherSucces(`${quantite} exemplaire(s) ajouté(s).`);
      setModalExOuvert(false);
      charger();
    } catch (err) {
      afficherErreur("Erreur lors de l'ajout des exemplaires.");
    } finally {
      setEnCours(false);
    }
  };
  if (!ressource) return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  return (
    <div className="container-principal">
      <div className="personnel">
        <div className="retour-link">
          <button onClick={() => navigate('/bibliotheque/catalogue')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>← Retour au catalogue</button>
        </div>
        <div className="department-page">
          <div className="detail-head">
            <div>
              <div className="detail-eyebrow">{TYPES_RESSOURCE.find((t) => t.value === ressource.type_ressource)?.label}</div>
              <div className="detail-title">{ressource.titre}</div>
              <div className="detail-sub">{ressource.auteurs_str?.join(', ') || 'Auteur non renseigné'}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-light" onClick={() => navigate(`/bibliotheque/catalogue/${id}/modifier`)}><i className="fas fa-pen"></i> Modifier</button>
              <button className="btn-primary addInscr" onClick={ouvrirModalExemplaires}><i className="fas fa-plus"></i> Ajouter exemplaire</button>
            </div>
          </div>
          <div className="doc-detail-grid">
            <div>
              <div className="dl-group">
                <div className="dl-group-title">Informations bibliographiques</div>
                <div className="dl-row"><span className="dl-k">Sous-titre</span><span className="dl-v">{ressource.sous_titre || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">ISBN / ISSN</span><span className="dl-v mono">{ressource.isbn_issn || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Éditeur</span><span className="dl-v">{ressource.editeur_str || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Année de publication</span><span className="dl-v">{ressource.annee_publication || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Édition</span><span className="dl-v">{ressource.edition || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Langue</span><span className="dl-v">{ressource.langue || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Catégorie</span><span className="dl-v">{ressource.categorie_str || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Filière</span><span className="dl-v">{ressource.filiere_str || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Mots-clés</span><span className="dl-v">{ressource.mots_cles || '—'}</span></div>
                <div className="dl-row"><span className="dl-k">Description</span><span className="dl-v">{ressource.description || '—'}</span></div>
              </div>
              <div className="department-card table-card">
                <div className="table-title"><h2>Exemplaires</h2><span>{ressource.exemplaires?.length || 0}</span></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Code</th><th>Localisation</th><th>État</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody>
                      {(ressource.exemplaires || []).map((ex) => (
                        <tr key={ex.id}>
                          <td className="cell-strong mono">{ex.numero}</td>
                          <td>{ex.localisation_str || '—'}</td>
                          <td>{ETATS_PHYSIQUE.find((e) => e.value === ex.etat)?.label}</td>
                          <td><span className={`badge ${BADGE_STATUT_EXEMPLAIRE[ex.statut]}`}><span className="dot"></span>{STATUTS_EXEMPLAIRE.find((s) => s.value === ex.statut)?.label}</span></td>
                          <td>
                            <button className="table-btn edit" onClick={() => navigate(`/bibliotheque/exemplaires?ressource=${id}`)}><i className="fas fa-pen"></i></button>
                          </td>
                        </tr>
                      ))}
                      {(!ressource.exemplaires || ressource.exemplaires.length === 0) && <tr><td colSpan="5"><div className="empty">Aucun exemplaire.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              {ressource.couverture && (
                <div className="doc-preview-panel" style={{ marginBottom: '16px' }}>
                  <img src={ressource.couverture} alt={ressource.titre} style={{ width: '100%', borderRadius: '8px' }} />
                </div>
              )}
              <div className="dl-group">
                <div className="dl-group-title">Statistiques</div>
                <div className="dl-row"><span className="dl-k">Exemplaires totaux</span><span className="dl-v">{ressource.nb_exemplaires_total}</span></div>
                <div className="dl-row"><span className="dl-k">Disponibles</span><span className="dl-v" style={{ color: '#16a34a' }}>{ressource.nb_exemplaires_disponibles}</span></div>
                <div className="dl-row"><span className="dl-k">Empruntés</span><span className="dl-v" style={{ color: '#dc2626' }}>{ressource.nb_exemplaires_empruntes}</span></div>
                <div className="dl-row"><span className="dl-k">Réservés</span><span className="dl-v">{ressource.nb_exemplaires_reserves}</span></div>
                <div className="dl-row"><span className="dl-k">Perdus / Endommagés</span><span className="dl-v">{ressource.nb_exemplaires_perdus + ressource.nb_exemplaires_endommages}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="department-modal" style={{ display: modalExOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Ajouter des exemplaires</h2>
            <button className="addInscr" onClick={() => setModalExOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <div className="form-grid" style={{ padding: '20px' }}>
            <div className="form-group">
              <label>Quantité</label>
              <input type="number" min="1" max="100" value={quantite} onChange={(e) => setQuantite(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Localisation</label>
              <select value={localisationChoisie} onChange={(e) => setLocalisationChoisie(e.target.value)}>
                <option value="">Non localisé</option>
                {localisations.map((l) => <option key={l.id} value={l.id}>{[l.salle, l.rayon, l.etagere].filter(Boolean).join(' → ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>État initial</label>
              <select value={etatChoisi} onChange={(e) => setEtatChoisi(e.target.value)}>
                {ETATS_PHYSIQUE.map((et) => <option key={et.value} value={et.value}>{et.label}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-primary addInscr" onClick={ajouterExemplaires} disabled={enCours}>{enCours ? 'Ajout...' : 'Ajouter'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RessourceDetail;