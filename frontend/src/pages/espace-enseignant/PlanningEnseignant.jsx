import { useState, useEffect } from 'react';
import { getMesEmploisDuTemps, telechargerMonPlanningEnseignant, getPlanningEnseignant } from '../../api/espaceEnseignant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEnseignant.css';





function PlanningEnseignant() {
  
  const [offset, setOffset] = useState(0);
  
  const [donnees, setDonnees] = useState(null);


  const [mesEdt, setMesEdt] = useState([]);
  const [modalTelechargementOuvert, setModalTelechargementOuvert] = useState(false);
  useEffect(() => { getMesEmploisDuTemps().then((res) => setMesEdt(res.data)); }, []);
  const telecharger = (edtId) => {
    telechargerMonPlanningEnseignant(edtId).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', 'mon_emploi_du_temps.pdf');
      document.body.appendChild(link); link.click(); link.remove();
    });
  };
  const ouvrirTelechargement = () => {
    if (mesEdt.length === 1) telecharger(mesEdt[0].id);
    else setModalTelechargementOuvert(true);
  };

  
  useEffect(() => { getPlanningEnseignant({ semaine_offset: offset }).then((res) => setDonnees(res.data)); }, [offset]);
  
  if (!donnees) return <div className="container-principal"><Loader label="Chargement du planning..." /></div>;
  
  
  
  return (

    <div className="container-principal">

      <div className="department-page">

        <div className="panel-head">

          <div>
            <h3 style={{ fontSize: '20px' }}>Mon planning</h3>
            <div className="sub">
              Consultez votre planning de la semaine et naviguez entre les 
              semaines pour <br /> voir les prochaines et anciennes programmations.
            </div>
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

              <button id="btn-download" onClick={ouvrirTelechargement}>
                <i className="fas fa-download"></i> Télécharger
              </button>
            
            </div>

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
                <span>{new Date(j.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
              

              <div className="ud-grid-2">

                {j.seances.length === 0 && 
                  <div className="edt-jour-vide">Aucune séance</div>
                }

                {j.seances.map((s, k) => (
                  <div className="ud-bloc" key={k}>

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
                        <label className='cle'> <i className="fas fa-door-open"></i>Salle</label>
                        <p className='valeur'>{s.salle || '—'}</p>
                      </div>

                      <div className='ud-champ-ligne'>
                        <label className='cle'><i className="fas fa-clock"></i>Horaire</label>
                        <p className='valeur important'>{s.heure_debut?.slice(0, 5)} - {s.heure_fin?.slice(0, 5)}</p>
                      </div>

                      <div className='ud-champ-ligne'>
                        <label className='cle'> <i className="fas fa-users-rectangle"></i>Classe</label>
                        <p className='badge-orange'>
                          <p className='bull'>&bull;</p> {s.classe || '—'}
                        </p>
                      </div>
                     

                    </div>

                  </div>

                ))}
                
              </div>
            
            </div>
          
          ))}

        </div>

      </div>




      <div className="department-modal" style={{ display: modalTelechargementOuvert ? 'flex' : 'none' }}>
        
        <div className="modal-content">
          
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Quel emploi du temps télécharger ?</h2>
            <button className="addInscr" onClick={() => setModalTelechargementOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', height: '400px', overflow: 'hidden', overflowY: 'auto', scrollbarWidth: 'none' }}>
            {mesEdt.map((e) => (
              <button key={e.id} className="btn-edt-dwl" onClick={() => { telecharger(e.id); setModalTelechargementOuvert(false); }}>
                <div className='title-classe'>
                  <span style={{ color: 'var(--text)' }}>{e.titre}</span>
                  <span className='sub'>{e.classe}</span>
                </div>
              </button>
            ))}
          </div>

          <hr />
                    
          <p id="consigne">
            Cliquez sur l'emploi du temps que vous souhaitez télécharger.
          </p>

        </div>

      </div>

    </div>

  );



  

}

export default PlanningEnseignant;
