
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
        <div className="panel-head"><h3 style={{ fontSize: '20px' }}>Retour d'un exemplaire</h3></div>
        <div className="department-card" style={{ padding: '20px', maxWidth: '600px' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Scanner ou saisir le code de l'exemplaire</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={codeRecherche} onChange={(e) => setCodeRecherche(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && rechercher()} placeholder="EX-2026-0001" />
              <button className="btn-light" onClick={rechercher}><i className="fas fa-search"></i></button>
            </div>
          </div>
          {emprunt && (
            <>
              <div className="dl-group" style={{ marginBottom: '16px' }}>
                <div className="dl-row"><span className="dl-k">Ressource</span><span className="dl-v">{emprunt.ressource_str}</span></div>
                <div className="dl-row"><span className="dl-k">Emprunteur</span><span className="dl-v">{emprunt.adherent_str}</span></div>
                <div className="dl-row"><span className="dl-k">Date d'emprunt</span><span className="dl-v">{new Date(emprunt.date_emprunt).toLocaleDateString('fr-FR')}</span></div>
                <div className="dl-row"><span className="dl-k">Retour prévu</span><span className="dl-v">{new Date(emprunt.date_retour_prevue).toLocaleDateString('fr-FR')}</span></div>
                {emprunt.est_en_retard && (
                  <div className="dl-row"><span className="dl-k">Retard</span><span className="dl-v" style={{ color: '#dc2626' }}>{emprunt.jours_de_retard} jour(s)</span></div>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>État de l'exemplaire</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[['BON', 'Bon'], ['ABIME', 'Abîmé'], ['TRES_ABIME', 'Très abîmé'], ['PERDU', 'Perdu']].map(([val, label]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="radio" name="etat" value={val} checked={etatRetour === val} onChange={(e) => setEtatRetour(e.target.value)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Commentaires</label>
                <textarea rows="2" value={commentaire} onChange={(e) => setCommentaire(e.target.value)}></textarea>
              </div>
              <button className="btn-primary addInscr" onClick={enregistrer} disabled={enCours} style={{ width: '100%' }}>
                {enCours ? 'Enregistrement...' : 'Enregistrer le retour'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default EnregistrerRetour;