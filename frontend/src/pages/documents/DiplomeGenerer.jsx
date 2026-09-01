
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeliberationsEligibles, creerDiplome } from '../../api/documents';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';

function DiplomeGenerer() {
  const [etape, setEtape] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [deliberations, setDeliberations] = useState([]);
  const [selection, setSelection] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      getDeliberationsEligibles({ q: recherche }).then((res) => setDeliberations(res.data));
    }, 250);
    return () => clearTimeout(timer);
  }, [recherche]);
  const continuer = () => {
    if (!selection) {
      afficherErreur('Veuillez sélectionner un étudiant.');
      return;
    }
    setEtape(2);
  };
  const genererDiplome = async () => {
    setEnCours(true);
    try {
      const res = await creerDiplome({ etudiant: selection.etudiant, deliberation: selection.id });
      afficherSucces('Diplôme généré avec succès.');
      navigate(`/documents/diplomes/${res.data.id}`);
    } catch (err) {
      afficherErreur(err.response?.data?.deliberation?.[0] || 'Erreur lors de la génération du diplôme.');
    } finally {
      setEnCours(false);
    }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <button className="ud-retour" onClick={() => navigate('/documents/diplomes')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Générer un diplôme</h3>
              <div className="sub">{etape === 1 ? 'Sélectionner la délibération' : 'Vérification des informations'}</div>
            </div>
          </div>
        </div>
        
        <div className="doc-wizard-steps">
          <div className={`doc-wizard-step ${etape === 1 ? 'actif' : 'complete'}`}>
            <span className="num">{etape > 1 ? '✓' : '1'}</span> Sélection
          </div>
          <div className={`doc-wizard-step ${etape === 2 ? 'actif' : ''}`}>
            <span className="num">2</span> Vérification
          </div>
        </div>
        <div className="department-card" style={{ padding: '20px' }}>
          {etape === 1 && (
            <>
              <div className="search-box" style={{ marginBottom: '16px' }}>
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
              {deliberations.map((d) => (
                <div
                  key={d.id}
                  className={`doc-etudiant-card ${selection?.id === d.id ? 'selectionne' : ''}`}
                  onClick={() => setSelection(d)}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{d.etudiant_str}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {d.etudiant_formation} — Année académique : {d.annee_academique_libelle} — Décision : {d.decision}
                    </div>
                  </div>
                  <div className="check">{selection?.id === d.id && <i className="fas fa-check" style={{ fontSize: '11px' }}></i>}</div>
                </div>
              ))}
              {deliberations.length === 0 && (
                <div className="empty">Aucune délibération éligible (année complète, décision ADMIS, sans diplôme déjà généré).</div>
              )}
              <div className="modal-footer">
                <button className="btn-primary addInscr" onClick={continuer}>Continuer</button>
              </div>
            </>
          )}
          {etape === 2 && selection && (
            <>
              <div className="dl-group">
                <div className="dl-row"><span className="dl-k">Étudiant</span><span className="dl-v">{selection.etudiant_str}</span></div>
                <div className="dl-row"><span className="dl-k">Formation</span><span className="dl-v">{selection.etudiant_formation}</span></div>
                <div className="dl-row"><span className="dl-k">Année académique</span><span className="dl-v">{selection.annee_academique_libelle}</span></div>
                <div className="dl-row"><span className="dl-k">Période</span><span className="dl-v">{selection.periode}</span></div>
                <div className="dl-row"><span className="dl-k">Décision</span><span className="dl-v"><span className="badge badge-success"><span className="dot"></span>{selection.decision}</span></span></div>
                <div className="dl-row"><span className="dl-k">Mention</span><span className="dl-v">{selection.mention}</span></div>
                <div className="dl-row"><span className="dl-k">Date d'obtention</span><span className="dl-v">{new Date().toLocaleDateString('fr-FR')}</span></div>
              </div>
              <div className="modal-footer">
                <button className="btn-light" onClick={() => setEtape(1)}>Retour</button>
                <button className="btn-primary addInscr" onClick={genererDiplome} disabled={enCours}>
                  {enCours ? 'Génération...' : 'Générer le diplôme'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default DiplomeGenerer;