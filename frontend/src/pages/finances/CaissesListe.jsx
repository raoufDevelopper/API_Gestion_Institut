import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getCaisses, ouvrirCaisse } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import { BADGE_STATUT_CAISSE } from './financesConstantes';
import { formatMontant } from '../../components/formatters';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';





function CaissesListe() {
  const [sessions, setSessions] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  
  const charger = async () => {
    const res = await getCaisses();
    setSessions(res.data);
  };
  
  useEffect(() => {
    charger();
  }, []);
  
  const sessionOuverte = sessions.some((s) => s.statut === 'OUVERTE');
  
  const ouvrirModal = () => {
    const derniere = sessions.find((s) => s.solde_reel_fermeture !== null);
    reset({ solde_ouverture: derniere ? derniere.solde_reel_fermeture : 0 });
    setModalOuvert(true);
  };
  
  
  const onSubmit = async (data) => {
    try {
      const res = await ouvrirCaisse(data);
      afficherSucces('Session de caisse ouverte.');
      setModalOuvert(false);
      navigate(`/finances/caisse/${res.data.id}`);
    } catch (err) {
      afficherErreur(err.response?.data?.detail || "Erreur lors de l'ouverture de la session.");
    }
  };




  
  return (
    <div className="container-principal">

      <div className="personnel">

        <div className="department-page">

          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Sessions de caisse journalière</h3>
              <div className="sub">Ouverture / fermeture journalière avec calcul automatique de l'écart</div>
            </div>
            {!sessionOuverte && (
              <button className="btn btn-brass" onClick={ouvrirModal}>
                + Ouvrir une session
              </button>
            )}
          </div>



          <div className="caisse-grid">
            
            {sessions.map((s) => (
              <div className={`caisse-card ${s.statut === 'OUVERTE' ? 'open' : ''}`} key={s.id} onClick={() => navigate(`/finances/caisse/${s.id}`)} style={{ cursor: 'pointer' }}>
                
                <div className="cc-top">
                 
                  <div>
                    <div className="cc-date">{new Date(s.date_session).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="cc-hours">
                      {s.heure_ouverture?.slice(0, 5)} → {s.heure_fermeture ? s.heure_fermeture.slice(0, 5) : 'en cours'}
                    </div>
                  </div>
                  
                  <span className={`badge ${BADGE_STATUT_CAISSE[s.statut]}`}>
                    <p className='bull'>&bull;</p>
                    {s.statut === 'OUVERTE' ? 'Ouverte' : 'Fermée'}
                  </span>

                </div>



                <div className="cc-rows">

                  <div className="cc-row">
                    <span>Solde d'ouverture</span>
                    <b>{formatMontant(s.solde_ouverture)}</b>
                  </div>
                  
                  <div className="cc-row">
                    <span>{s.statut === 'OUVERTE' ? 'Solde théorique (temps réel)' : 'Solde théorique'}</span>
                    <b>{formatMontant(s.solde_theorique)}</b>
                  </div>

                  {s.statut === 'FERMEE' && (
                    <div className="cc-row">
                      <span>Solde réel compté</span>
                      <b>{formatMontant(s.solde_reel_fermeture)}</b>
                    </div>
                  )}

                </div>


                <div className="cc-ecart">
                  {s.statut === 'OUVERTE' ? (
                    <>
                      <span style={{ fontSize: '12px', color: 'var(--text-400)' }}>Session en cours d'exercice</span>
                      <span className="amt" style={{ color: 'var(--brass-600)' }}>—</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '12px', color: 'var(--text-400)' }}>Écart de caisse</span>
                      <span className={`amt ${parseFloat(s.ecart) === 0 ? 'green' : 'red'}`}>
                        {parseFloat(s.ecart) === 0 ? 'Aucun écart' : `${formatMontant(s.ecart)}`}
                      </span>
                    </>
                  )}
                </div>

              </div>

            ))}

            {sessions.length === 0 && 
              <div className="empty">
                <Loader label="la liste est vide ..." />
              </div>
            }
          
          </div>

        </div>
      
      </div>
      
      
      
      
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7a5503, #d3b429)' }}>
            <h2>Ouvrir une session de caisse</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm" style={{ height: '245px' }}>
            <div className="form-grid">
              <div className="form-group" style={{ gap: '15px' }}>
                <label style={{ marginTop: '0', lineHeight: '20px' }}>Solde d'ouverture compté</label>
                <input type="number" step="0.01" min="0" {...register('solde_ouverture', { required: true })} />
                <div className="cell-sub">
                  Pré-rempli avec le solde réel constaté à la dernière fermeture.
                </div>
                {errors.solde_ouverture && <div className="form-errors">Champ requis</div>}
              </div>
              <button type="submit" className="btn btn-brass" disabled={isSubmitting}>
                {isSubmitting ? 'Ouverture...' : 'Ouvrir la session'}
              </button>
            </div>
          </form>

        </div>

      </div>
      
    </div>
  );
}
export default CaissesListe;
