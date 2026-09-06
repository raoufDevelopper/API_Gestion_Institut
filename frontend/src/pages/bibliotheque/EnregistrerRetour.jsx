
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getEmprunts, retournerEmprunt } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';


function EnregistrerRetour() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const [codeRecherche, setCodeRecherche] = useState('');
  const [emprunt, setEmprunt] = useState(null);
  const [etatRetour, setEtatRetour] = useState('BON');
  const [commentaire, setCommentaire] = useState('');
  const [enCours, setEnCours] = useState(false);
  const rechercher = async () => {
    const res = await getEmprunts({ statut: 'EN_COURS', q: codeRecherche });
    setEmprunt(res.data[0] || null);
    if (!res.data[0]) afficherErreur('Aucun emprunt en cours trouvé pour ce code.');
  };
  useEffect(() => {
    const exId = searchParams.get('exemplaire');
    if (exId) {
      getEmprunts({ statut: 'EN_COURS' }).then((res) => {
        const trouve = res.data.find((e) => String(e.exemplaire) === exId);
        setEmprunt(trouve || null);
      });
    }
  }, [searchParams]);
  const enregistrer = async () => {
    setEnCours(true);
    try {
      await retournerEmprunt(emprunt.id, { etat_retour: etatRetour, observations: commentaire });
      afficherSucces('Retour enregistré avec succès.');
      navigate('/bibliotheque/emprunts');
    } catch (err) {
      afficherErreur(err.response?.data?.detail || "Erreur lors de l'enregistrement du retour.");
    } finally {
      setEnCours(false);
    }
  };




  return (
    <div className="container-principal">

      <div className="department-page">

        <div className="fi-header" style={{ marginBottom: "-25px" }}>
          <div>
            <button className="ud-retour" onClick={() => navigate('/bibliotheque/emprunts')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <span> {' > '} Retour d'un exemplairet</span>
          </div>
        </div>

        <div className="panel-head" style={{ marginBottom: '25px' }}>
          <div>
            <h3 style={{ fontSize: '20px' }}>Retour d'un exemplaire</h3>
            <span className='sub'>Retourner un emprunt...</span>
          </div>
        </div>



  
        <div className="department-card" style={{ padding: '20px'}}>

          <div className="fi-champ full" style={{ marginBottom: '16px' }}>
            <label>Scanner ou saisir le code de l'exemplaire</label>
          </div>

          {/* TOOLBAR */}
          <div className="department-toolbar" style={{ marginBottom: '25px' }}>
            <div className="toolbar-left">
              <div className="search-box" style={{ background: 'var(--bg)' }}>
                <i className="fas fa-search"></i>
                <input type="text"
                  value={codeRecherche} 
                  onChange={(e) => setCodeRecherche(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && rechercher()} 
                  placeholder="EX-2026-0001" 
                />
              </div>
            </div>
            <div className="toolbar-right">
              <button className="btn-primary addInscr" style={{ padding: '13px 20px', margin: '0' }} onClick={rechercher}>
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
    

          {emprunt && (
            <div>

              <div className="dl-group" style={{ marginBottom: '25px' }}>
                <div className="dl-row"><span className="dl-k">Ressource</span><span className="dl-v">{emprunt.ressource_str}</span></div>
                <div className="dl-row"><span className="dl-k">Emprunteur</span><span className="dl-v">{emprunt.adherent_str}</span></div>
                <div className="dl-row"><span className="dl-k">Date d'emprunt</span><span className="dl-v">{new Date(emprunt.date_emprunt).toLocaleDateString('fr-FR')}</span></div>
                <div className="dl-row"><span className="dl-k">Retour prévu</span><span className="dl-v">{new Date(emprunt.date_retour_prevue).toLocaleDateString('fr-FR')}</span></div>
                {emprunt.est_en_retard && (
                  <div className="dl-row"><span className="dl-k">Retard</span><span className="badge badge-danger">{emprunt.jours_de_retard} jour(s)</span></div>
                )}
              </div>


              <div>

                <div>

                  <label>État de l'exemplaire</label>

                  {[['BON', 'Bon'], ['ABIME', 'Abîmé'], ['TRES_ABIME', 'Très abîmé'], ['PERDU', 'Perdu']].map(([val, label]) => (
                    
                    <label className="dl-group" key={val}>
                      <div className="dl-row"><span className="dl-k">{label}</span><span className="dl-v"><input type="radio" name="etat" value={val} checked={etatRetour === val} onChange={(e) => setEtatRetour(e.target.value)}/></span></div>
                    </label>
                    
                  ))}

                </div>


                <div className="fi-champ" style={{ marginBottom: '16px' }}>
                  <label>Commentaires</label>
                  <textarea rows="2" value={commentaire} onChange={(e) => setCommentaire(e.target.value)}></textarea>
                </div>
                
                <button className="btn-primary addInscr" onClick={enregistrer} disabled={enCours}>
                  {enCours ? 'Enregistrement...' : 'Enregistrer le retour'}
                </button>

              </div>
              
            </div>
          )}

        </div>

      </div>

    </div>

  );

}


export default EnregistrerRetour;
