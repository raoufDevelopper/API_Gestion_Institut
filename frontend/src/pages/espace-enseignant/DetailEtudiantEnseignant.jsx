import { useState, useEffect } from 'react';

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getDetailEtudiantEnseignant } from '../../api/espaceEnseignant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';



function DetailEtudiantEnseignant() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [donnees, setDonnees] = useState(null);
  
  useEffect(() => {
    getDetailEtudiantEnseignant(id, { matiere: searchParams.get('matiere') || undefined }).then((res) => setDonnees(res.data));
  }, [id]);
  
  if (!donnees) return <div className="container-principal"><Loader label="Chargement..." /></div>;
  
  const { etudiant, matiere, moyenne_annee, resultats_semestres } = donnees;




  return (
    <div className="container-principal">

      <div className="personnel">

        <div className="department-page">
          <div className="ee-carte-profil">
            {etudiant.photo ? <img src={etudiant.photo} alt={etudiant.nom} className="ee-avatar" /> : <div className="ee-avatar ee-avatar-placeholder"><i className="fas fa-user"></i></div>}
            <div className='ud-identite'>
              <h2>{etudiant.nom} {etudiant.prenom}</h2>
              <div className="cell-sub mono">{etudiant.matricule}</div>
              <span className="badge badge-success" style={{ marginTop: '6px', width: 'fit-content' }}>
                <p className='bull'>&bull;</p>{etudiant.statut}
              </span>
            </div>
            <div className="ee-infos-formation" style={{ marginLeft: 'auto' }}>
              <div className='badge-orange'>
                <p className='bull'>&bull;</p> {etudiant.classe}
              </div>
              {matiere && 
                <div>
                  <b className='badge-violet'>{matiere}</b>
                </div>
              }
              <div>
                <b className={`badge-${moyenne_annee > 10 ? 'success' : 'danger'}`}>
                  <p className='bull'>&#9758;</p> {moyenne_annee ?? '—'}
                </b>
              </div>
            </div>
          </div>




          <div className='bloc-semestre'>

            {resultats_semestres.map((s) => (
              
              <div class="bloc-principal">
        
                <div class={`titre-bloc ${s.moyenne > 10 ? 'reuissit' : 'echouer'}`}>{s.semestre === 'S1' ? 'Semestre 1' : 'Semestre 2'}</div>
                  
                <div class="contenu">
                  
                  <p class="texte-intro">
                    Notes de l'étudiant au {s.semestre === 'S1' ? 'Semestre 1' : 'Semestre 2'}.
                  </p>
                
                  {s.evaluations.map((ev, i) => 

                    <div class="ligne-notes">
                      <span class="label">{ev.type}</span>
                      <span class="valeur" style={{ color: ev.valeur > 10 ? "#22c55e" : "#ef4444"}}>{ev.valeur} <b id='sur-20'>/20</b></span>
                    </div>

                  )}
                  
                </div>
                  
                <div class={`cercle-bas ${s.moyenne > 10 ? 'reuissit' : 'echouer'}`}>
                  <span >{s.moyenne ?? '—'}</span>
                </div>


                {s.evaluations.length === 0 &&  <span style={{ color: '#9ca3af' }}>Aucune note enregistrée.</span>}
                
              </div>

            ))}
            
          </div>

        </div>

      </div>

    </div>

  );

}


export default DetailEtudiantEnseignant;

