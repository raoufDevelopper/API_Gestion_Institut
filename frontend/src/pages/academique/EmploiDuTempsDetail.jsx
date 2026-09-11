import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmploiDuTemps, getSeances, telechargerEmploiDuTempsPdf, dupliquerEmploiDuTemps } from '../../api/emploisDuTemps';
import { useAlert } from '../../context/AlertContext';
import { JOURS, TYPES_SEANCE, STATUTS_EMPLOI, CLASSE_BADGE_STATUT, SEMESTRES } from './emploiDuTempsConstantes';
import Loader from '../../components/Loader';
import '../../assets/css/emploiDuTemps.css';





function EmploiDuTempsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const [emploi, setEmploi] = useState(null);
  const [seancesParJour, setSeancesParJour] = useState({});
  const charger = () => {
    Promise.all([getEmploiDuTemps(id), getSeances(id)]).then(([resEmploi, resSeances]) => {
      setEmploi(resEmploi.data);
      const regroupees = JOURS.reduce((acc, j) => ({ ...acc, [j.code]: [] }), {});
      resSeances.data.forEach((s) => regroupees[s.jour].push(s));
      setSeancesParJour(regroupees);
    });
  };

  useEffect(() => {
    charger();
  }, [id]);

  const telechargerPdf = async () => {
    try {
      const res = await telechargerEmploiDuTempsPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emploi_du_temps_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };

  const dupliquer = async () => {
    try {
      const res = await dupliquerEmploiDuTemps(id);
      afficherSucces('Dupliqué vers la semaine suivante.');
      navigate(`/academique/emplois-du-temps/${res.data.id}`);
    } catch (err) {
      afficherErreur('Erreur lors de la duplication.');
    }
  };


  if (!emploi) {
    return <Loader label="Chargement en cours..." />;
  }





  return (
    <div className="container-principal">

      <div className="department-page">
       
       
        <div className="fi-header" style={{ marginBottom: "-15px" }}>
          <div>
            <button className="ud-retour" onClick={() => navigate('/academique/emplois-du-temps')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <span> - Détail sur l'emploi du temps</span>
          </div>
        </div>

       
        <div className="panel-head">
          
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{emploi.nom_affiche}</h3>
            <div className="sub">{emploi.classe_str} — {SEMESTRES.find(s => s.value === emploi.semestre)?.label}</div>
          </div>


          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        
            <button className="btn-light" onClick={dupliquer}>
              <i className="fas fa-copy"></i> Dupliquer
            </button>
          
            <button className="btn-light" onClick={() => navigate(`/academique/emplois-du-temps/${id}/modifier`)}>
              <i className="fas fa-pen"></i> Modifier
            </button>
          
            <button className="btn-primary addInscr" onClick={telechargerPdf}>
              <i className="fas fa-file-pdf"></i> Télécharger le PDF
            </button>
          
          </div>
        
        </div>



        
        <div className="ud-grid-2">
        
          <div className="ud-bloc fill">
        
            <div className="ud-champ-ligne">
              <label className='cle'><i class = 'fa-solid fa-circle-info'></i> Statut</label>
              <p>
                <span className={`badge ${CLASSE_BADGE_STATUT[emploi.statut]}`}>
                  <p className='bull'>&bull;</p>
                  {STATUTS_EMPLOI.find((s) => s.value === emploi.statut)?.label}
                </span>
              </p>
            </div>

            <div className="ud-champ-ligne">
              <label className='cle'><i class = 'fa-solid fa-chalkboard'></i> Classe</label>
              <p className='valeur'>{emploi.classe_str || '—'}</p>
            </div>
        
            <div className="ud-champ-ligne">
              <label className='cle'><i class = 'fa-solid fa-calendar-days'></i>Année académique</label>
              <p className='valeur'>{emploi.annee_academique_libelle || '—'}</p>
            </div>
        
            <div className="ud-champ-ligne">
              <label className='cle'><i class = 'fa-solid fa-calendar-week'></i>Semaine</label>
              <p className='valeur'>{emploi.semaine_debut ? `${emploi.semaine_debut} au ${emploi.semaine_fin}` : '—'}</p>
            </div>
        
          </div>
        
        </div>


        <p className='text-help' style={{ textAlign: 'center', lineHeight: '25px' }}>
          Voici la liste des programations de la semaine. Ces programmations 
          sont regroupées en jour de la semaine exactement comme c'était le  
          cas lors de la création de cet emploi du temps.
        </p>


        <div className="edt-jours-conteneur edt-jours-lecture">

          {JOURS.map((jour) => (
        
            <div className="edt-jour-bloc" key={jour.code}>
            
              <div className="edt-jour-entete">
                <span>{jour.label}</span>
              </div>
            
              <div className="ud-grid-2">
            
                {seancesParJour[jour.code]?.length === 0 && (
                  <div className="edt-jour-vide">Aucune séance</div>
                )}
            
                {seancesParJour[jour.code]?.map((s) => (
                  
                  <div className="ud-bloc" key={s.id}>
                    
                    <span className="edt-seance-type">
                      {TYPES_SEANCE.find((t) => t.value === s.type_seance)?.label}
                    </span>
                    
                    <div className="edt-seance-details">

                      <div className='ud-champ-ligne'>
                        <label className='cle'><i className="fas fa-book-open"></i>Matière</label>
                        <p className='valeur important'>{s.matiere_nom}</p>
                      </div>

                      <div className='ud-champ-ligne'>
                        <label className='cle'> <i className="fas fa-user"></i>Formateur</label>
                        <p className='valeur'>{s.formateur_str || '—'}</p>
                      </div>

                      <div className='ud-champ-ligne'>
                        <label className='cle'> <i className="fas fa-door-open"></i>Salle</label>
                        <p className='valeur'>{s.salle_nom || '—'}</p>
                      </div>

                      <div className='ud-champ-ligne'>
                        <label className='cle'><i className="fas fa-clock"></i>Horaire</label>
                        <p className='valeur important'>{s.heure_debut?.slice(0, 5)} - {s.heure_fin?.slice(0, 5)}</p>
                      </div>

                    </div>
                  
                  </div>
                
                ))}

              </div>

            </div>

          ))}
        
        </div>


      </div>
    
    </div>
  
  );

}


export default EmploiDuTempsDetail;