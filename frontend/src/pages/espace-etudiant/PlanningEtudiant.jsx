
import { useState, useEffect } from 'react';
import { getPlanningEtudiant } from '../../api/espaceEtudiant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEtudiant.css';


function PlanningEtudiant() {
  const [offset, setOffset] = useState(0);
  const [donnees, setDonnees] = useState(null);
  useEffect(() => { getPlanningEtudiant({ semaine_offset: offset }).then((res) => setDonnees(res.data)); }, [offset]);

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


  if (!donnees) return <div className="container-principal"><Loader label="Chargement du planning..." /></div>;


  return (
    
    <div className="container-principal">
      <div className="department-page">


        <div className="panel-head">

          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Mon planning</h3>
            <div className="sub">Consultez votre emploi du temps de la semaine</div>
          </div>

          <div>
            <div className="ee-planning-nav">
              <button id='btn-pre' onClick={() => setOffset((o) => o - 1)}>
                <i className="fas fa-chevron-left"></i> Précédente
              </button>
              <button id='btn-maint' onClick={() => setOffset(0)}>
                Cette semaine
              </button>
              <button id='btn-suiv' onClick={() => setOffset((o) => o + 1)}>
                Suivante <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="sub">Naviguez entre plusieurs semaines en un clique.</div>
          </div>
        
        </div>



       


        <span className='semaine-titre'>
          <h2>
            Semaine du {new Date(donnees.debut_semaine).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} <br /> 
            au {new Date(donnees.fin_semaine).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
        </span>

  
        <p className='text-help' style={{ textAlign: 'center', lineHeight: '25px' }}>
          Voici la liste des programations de la semaine. Ces programmations 
          sont regroupées en jour de la semaine. <br />
          <b>Rappel :</b> #TP = Tavaux Pratiques #CM = Cours Magistral 
          #TD = Travaux Dirigés #EX = Examen
        </p>


        <div className="edt-jours-conteneur edt-jours-lecture">

          {donnees.jours.map((j, i) => (
        
            <div className="edt-jour-bloc" key={i}>
            
              <div className="edt-jour-entete">
                <span>{j.jour}</span>
              </div>
            
              <div className="ud-grid-2">
            
                {j.seances.length === 0 && 
                  <div className="edt-jour-vide">Aucune séance</div>
                }
      
                {j.seances.map((s, i) => (
                  
                  <div className="ud-bloc" key={i}>
                    
                    <span className="edt-seance-type" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <i className="fa-solid fa-chalkboard-user"></i>
                      <b>{s.type_seance}</b>
                    </span>
                    
                    <div className="edt-seance-details">

                      <div className='ud-champ-ligne'>
                        <label className='cle'><i className="fas fa-book-open"></i>Matière</label>
                        <p className='valeur important'>{s.matiere}</p>
                      </div>

                      <div className='ud-champ-ligne'>
                        <label className='cle'> <i className="fas fa-user"></i>Formateur</label>
                        <p className='valeur'>{s.formateur || '—'}</p>
                      </div>

                      <div className='ud-champ-ligne'>
                        <label className='cle'> <i className="fas fa-door-open"></i>Salle</label>
                        <p className='valeur'>{s.salle || '—'}</p>
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

export default PlanningEtudiant;
