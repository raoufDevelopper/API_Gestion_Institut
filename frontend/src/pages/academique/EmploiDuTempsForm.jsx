import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getEmploiDuTemps, creerEmploiDuTemps, modifierEmploiDuTemps,getSeances, creerSeance, modifierSeance, supprimerSeance,} from '../../api/emploisDuTemps';
import { getClasses, getMatieres, getSalles, getAnneesAcademiques } from '../../api/academique';
import { getFormateurs } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import { JOURS, TYPES_SEANCE, SEMESTRES, STATUTS_EMPLOI, detecterConflitsLocaux } from './emploiDuTempsConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/emploiDuTemps.css';



let compteurTemp = 0;
const nouvelleSeanceVide = () => ({
  cle: `temp-${compteurTemp++}`,
  existingId: null,
  matiere: '', formateur: '', salle: '', type_seance: 'CM',
  heure_debut: '08:00', heure_fin: '10:00',
});

const HEURE_MIN = 7;
const HEURE_MAX = 20;


function EmploiDuTempsForm() {
  const { id } = useParams();
  const modeEdition = !!id;
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [seancesParJour, setSeancesParJour] = useState(() =>
    JOURS.reduce((acc, j) => ({ ...acc, [j.code]: [] }), {})
  );
  const [seancesSupprimees, setSeancesSupprimees] = useState([]);
  const [chargementInitial, setChargementInitial] = useState(modeEdition);
  const [vueCalendrier, setVueCalendrier] = useState(false);
  const [conflitsLocaux, setConflitsLocaux] = useState([]);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  useEffect(() => {
    getClasses().then((res) => setClasses(res.data));
    getMatieres().then((res) => setMatieres(res.data.resultats || res.data));
    getFormateurs().then((res) => setFormateurs(res.data));
    getSalles().then((res) => setSalles(res.data.resultats || res.data));
    getAnneesAcademiques().then((res) => setAnneesAcademiques(res.data.resultats || res.data));
  }, []);

  useEffect(() => {
    if (!modeEdition) return;
    Promise.all([getEmploiDuTemps(id), getSeances(id)]).then(([resEmploi, resSeances]) => {
      const emploi = resEmploi.data;
      reset({
        classe: emploi.classe,
        semestre: emploi.semestre,
        titre: emploi.titre,
        semaine_debut: emploi.semaine_debut,
        semaine_fin: emploi.semaine_fin,
        statut: emploi.statut,
        annee_academique: emploi.annee_academique || '',
      });
      const regroupees = JOURS.reduce((acc, j) => ({ ...acc, [j.code]: [] }), {});
      resSeances.data.forEach((s) => {
        regroupees[s.jour].push({
          cle: `existing-${s.id}`,
          existingId: s.id,
          matiere: s.matiere,
          formateur: s.formateur,
          salle: s.salle,
          type_seance: s.type_seance,
          heure_debut: s.heure_debut?.slice(0, 5),
          heure_fin: s.heure_fin?.slice(0, 5),
        });
      });
      setSeancesParJour(regroupees);
      setChargementInitial(false);
    });
  }, [id, modeEdition, reset]);

  useEffect(() => {
    setConflitsLocaux(detecterConflitsLocaux(seancesParJour));
  }, [seancesParJour]);

  const ajouterSeance = (jourCode) => {
    setSeancesParJour((prev) => ({ ...prev, [jourCode]: [...prev[jourCode], nouvelleSeanceVide()] }));
  };

  const modifierSeanceChamp = (jourCode, cle, champ, valeur) => {
    setSeancesParJour((prev) => ({
      ...prev,
      [jourCode]: prev[jourCode].map((s) => (s.cle === cle ? { ...s, [champ]: valeur } : s)),
    }));
  };

  const supprimerSeanceLigne = (jourCode, seance) => {
    if (seance.existingId) {
      setSeancesSupprimees((prev) => [...prev, seance.existingId]);
    }
    setSeancesParJour((prev) => ({
      ...prev,
      [jourCode]: prev[jourCode].filter((s) => s.cle !== seance.cle),
    }));
  };

  const nomMatiere = (idVal) => matieres.find((m) => String(m.id) === String(idVal))?.nom || 'Sans matière';

  const onSubmit = async (data) => {
    
    if (conflitsLocaux.length > 0) {
      afficherErreur('Des conflits existent entre vos séances. Corrigez-les avant d\'enregistrer.');
      return;
    }

    try {
    
      let emploiId = id;
    
      if (modeEdition) {
        await modifierEmploiDuTemps(id, data);
      } else {
        const res = await creerEmploiDuTemps(data);
        emploiId = res.data.id;
      }
      
      await Promise.all(seancesSupprimees.map((sid) => supprimerSeance(sid)));
      
      
      for (const jour of JOURS) {
        for (const seance of seancesParJour[jour.code]) {
          if (!seance.matiere || !seance.salle) continue;
          const payload = {
            emploi_du_temps: emploiId,
            matiere: seance.matiere,
            formateur: seance.formateur || null,
            salle: seance.salle,
            type_seance: seance.type_seance,
            jour: jour.code,
            heure_debut: seance.heure_debut,
            heure_fin: seance.heure_fin,
          };
          if (seance.existingId) {
            await modifierSeance(seance.existingId, payload);
          } else {
            await creerSeance(payload);
          }
        }
      }

      afficherSucces(modeEdition ? 'Emploi du temps modifié avec succès.' : 'Emploi du temps créé avec succès.');
      navigate(`/academique/emplois-du-temps/${emploiId}`);
    
    } catch (err) {
      afficherErreur(
        err.response?.data?.detail ||
        "Erreur lors de l'enregistrement. Vérifiez qu'il n'y a pas de conflit d'horaire (salle, formateur ou classe déjà occupée)."
      );
    }
  };

  if (chargementInitial) {
    return <div className="container-principal"><div className="empty">Chargement...</div></div>;
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
            <span>  {modeEdition ? " > Modifier l'emploi du temps" : ' > Nouvel emploi du temps'}</span>
          </div>
        </div>

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px' }}>{modeEdition ? "Modifier l'emploi du temps" : 'Ajouter un emploi du temps'}</h3>
            <span className='sub'>Veillez à respectez les erreurs de chevauchement des programmations.</span>
          </div>
          
          <div className="edt-toggle-vue">
            <button type="button" className={!vueCalendrier ? 'active' : ''} onClick={() => setVueCalendrier(false)}>
              <i className="fas fa-list"></i> Blocs
            </button>
            <button type="button" className={vueCalendrier ? 'active' : ''} onClick={() => setVueCalendrier(true)}>
              <i className="fas fa-table-cells"></i> Calendrier
            </button>
          </div>
        </div>
        
        {conflitsLocaux.length > 0 && (
          <div className="edt-alerte-conflits">
            <i className="fas fa-triangle-exclamation"></i>
            <div>
              {conflitsLocaux.map((c, i) => <div key={i}>{c}</div>)}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="edt-form">
          
          <div className="edt-form-principal" style={{ marginBottom: "5px" }}>

            <div className="fi-grid">
              
              <div className="fi-champ">
                <div><label>Classe</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('classe', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.specialite_code} — {c.niveau_nom}</option>
                  ))}
                </select>
                {errors.classe && <div className="form-errors">Champ requis</div>}
              </div>
              

              <div className="fi-champ">
                <div><label>Semestre</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('semestre', { required: true })}>
                  {SEMESTRES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              
              
              <div className="fi-champ full">
                <label>Titre</label>
                <input type="text" placeholder="Ex: EDT Développement Web - Niveau 2" {...register('titre')} />
              </div>
              
              
              <div className="fi-champ">
                <label>Semaine du</label>
                <input type="date" {...register('semaine_debut')} />
              </div>
              
              
              <div className="fi-champ">
                <label>Au</label>
                <input type="date" {...register('semaine_fin')} />
              </div>
              
              
              <div className="fi-champ">
                <div><label>Statut</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('statut', { required: true })}>
                  {STATUTS_EMPLOI.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              
              
              <div className="fi-champ">
                <label>Année académique</label>
                <select {...register('annee_academique')}>
                  <option value="">Aucune</option>
                  {anneesAcademiques.map((a) => (
                    <option key={a.id} value={a.id}>{a.libelle}</option>
                  ))}
                </select>
              </div>
            
            </div>


            <p className='text-help' style={{ textAlign: 'center', lineHeight: '25px' }}>
              Cliquez sur le + de chaque jour de la semaine 
              pour augmenter le nombre de séances. Pour annuler 
              ou enlever une séance, Cliquez sur la croix 
              de la séance concernée. Veillez bien à ce 
              que les erreurs de chevauchements des programmations 
              soient respectées.
            </p>
          
          </div>
          
          
          
          
          
          
    

          
          
          
          
          {!vueCalendrier ? (
            <div className="edt-jours-conteneur">
              
              {JOURS.map((jour) => (
              
                <div className="edt-jour-bloc" key={jour.code}>
                
                  <div className="edt-jour-entete">
                    <span>{jour.label}</span>
                    <button type="button" className="edt-btn-ajouter" onClick={() => ajouterSeance(jour.code)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                
                
                  <div className="edt-seances-liste">
                
                    {seancesParJour[jour.code].length === 0 && (
                      <div className="edt-jour-vide">Aucune séance</div>
                    )}
                

                    {seancesParJour[jour.code].map((seance) => (
                      <div className="edt-seance-ligne" key={seance.cle}>
                
                        <select
                          value={seance.type_seance}
                          onChange={(e) => modifierSeanceChamp(jour.code, seance.cle, 'type_seance', e.target.value)}
                        >
                          {TYPES_SEANCE.map((t) => <option key={t.value} value={t.value}>{t.value}</option>)}
                        </select>
                
                        <select
                          value={seance.matiere}
                          onChange={(e) => modifierSeanceChamp(jour.code, seance.cle, 'matiere', e.target.value)}
                        >
                          <option value="">Matière...</option>
                          {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                        </select>
                
                        <select
                          value={seance.formateur}
                          onChange={(e) => modifierSeanceChamp(jour.code, seance.cle, 'formateur', e.target.value)}
                        >
                          <option value="">Formateur...</option>
                          {formateurs.map((f) => (
                            <option key={f.id} value={f.id}>{f.personnel_nom} {f.personnel_prenom}</option>
                          ))}
                        </select>
                
                        <select
                          value={seance.salle}
                          onChange={(e) => modifierSeanceChamp(jour.code, seance.cle, 'salle', e.target.value)}
                        >
                          <option value="">Salle...</option>
                          {salles.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                        </select>
                
                        <input
                          type="time"
                          value={seance.heure_debut}
                          onChange={(e) => modifierSeanceChamp(jour.code, seance.cle, 'heure_debut', e.target.value)}
                        />
                
                        <input
                          type="time"
                          value={seance.heure_fin}
                          onChange={(e) => modifierSeanceChamp(jour.code, seance.cle, 'heure_fin', e.target.value)}
                        />
                
                        <button
                          type="button"
                          className="edt-btn-supprimer"
                          onClick={() => supprimerSeanceLigne(jour.code, seance)}
                        >
                          <i className="fas fa-xmark"></i>
                        </button>
                
                      </div>
                
                    ))}
                  
                  </div>
                
                </div>
              
              ))}
            
            </div>
          
          ) : (
          
            
            <div className="edt-calendrier-wrapper">
            
              <div className="edt-calendrier">
            
                <div className="edt-calendrier-coin"></div>
            
                {JOURS.slice(0, 6).map((jour) => (
                  <div className="edt-calendrier-jour-entete" key={jour.code}>{jour.label}</div>
                ))}
            
                {Array.from({ length: HEURE_MAX - HEURE_MIN }).map((_, i) => {
                  const heure = HEURE_MIN + i;
            
                  return (
                    <div className="edt-calendrier-ligne" key={heure} style={{ display: 'contents' }}>
            
                      <div className="edt-calendrier-heure">{String(heure).padStart(2, '0')}h</div>
            
                      {JOURS.slice(0, 6).map((jour) => {
                        const seancesCase = seancesParJour[jour.code].filter((s) => {
                          const hDebut = parseInt(s.heure_debut?.split(':')[0] || 0, 10);
                          return hDebut === heure;
                        });
            
                        return (
                          <div className="edt-calendrier-case" key={jour.code}>
                            {seancesCase.map((s) => (
                              <div key={s.cle} className="edt-calendrier-seance">
                                <strong>{nomMatiere(s.matiere)}</strong>
                                <span>{s.heure_debut}-{s.heure_fin}</span>
                              </div>
                            ))}
                          </div>
            
                        );
                      
                      })}
                    
                    </div>
                  
                  );
               
                })}
              
              </div>
              
              
              <p className="edt-calendrier-note">
                <i className="fas fa-circle-info"></i> Vue en lecture — pour ajouter ou modifier une séance, basculez sur la vue « Blocs ».
              </p>
            
            </div>
          
          )}
          
          
          <hr />
          
          
          <div className="modal-footer edt-form-footer">
          
            <button type="button" className="btn-light" onClick={() => navigate('/academique/emplois-du-temps')}>
              Annuler
            </button>
          
            <button type="submit" className="btn-primary addInscr" disabled={isSubmitting || conflitsLocaux.length > 0}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          
          </div>
        
        </form>
      
      </div>
    
    </div>
  
  );

}


export default EmploiDuTempsForm;
