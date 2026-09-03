
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getReleveNotes, telechargerRelevePdf } from '../../api/notes';
import { getClasses, getAnneesAcademiques } from '../../api/academique';
import { getEtudiants } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import { PERIODES, COULEUR_MENTION } from './notesConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';



function ReleveNotes() {
  const [classes, setClasses] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [etudiantsClasse, setEtudiantsClasse] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(true);
  const [contexte, setContexte] = useState(null);
  const [releves, setReleves] = useState([]);
  const [etudiantOuvert, setEtudiantOuvert] = useState(null);
  const [chargement, setChargement] = useState(false);
  const { afficherErreur } = useAlert();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const classeSelectionnee = watch('classe');
  const [typesEvaluation, setTypesEvaluation] = useState([]);
 
  useEffect(() => {
    getClasses().then((res) => setClasses(res.data));
    getAnneesAcademiques().then((res) => setAnneesAcademiques(res.data.resultats || res.data));
  }, []);

  useEffect(() => {
    if (!classeSelectionnee) {
      setEtudiantsClasse([]);
      return;
    }
    getEtudiants().then((res) => {
      setEtudiantsClasse(res.data.filter((e) => String(e.classe) === String(classeSelectionnee)));
    });
  }, [classeSelectionnee]);

  const nomClasse = (idVal) => {
    const c = classes.find((c) => String(c.id) === String(idVal));
    if (!c) return '';
    return `${c.specialite_code || '—'} — ${c.niveau_nom || '—'}`;
  };

  const nomAnnee = (idVal) => anneesAcademiques.find((a) => String(a.id) === String(idVal))?.libelle || '';

  const labelPeriode = (val) => PERIODES.find((p) => p.value === val)?.label || val;



  const chargerContexte = async (data) => {
  
    setChargement(true);
  
    try {
      const params = { classe: data.classe, annee_academique: data.annee_academique, periode: data.periode };
  
      if (data.etudiant) params.etudiant = data.etudiant;
  
      const res = await getReleveNotes(params);
  
      setReleves(res.data.releves);
  
      setTypesEvaluation(res.data.types_evaluation);
  
      setContexte(params);
  
      setModalOuvert(false);
  
      if (res.data.length > 0) setEtudiantOuvert(res.data[0].etudiant_id);
  
    } catch (err) {
      afficherErreur('Erreur lors du chargement du relevé.');
  
    } finally {
      setChargement(false);
    }
  
  };




  const telechargerPdf = async () => {
    try {
      const res = await telechargerRelevePdf(contexte);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'releve_notes.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };




  return (
    <div className="container-principal">

      <div className="department-page">

        {contexte && (
          <div className="panel-head">
            
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Relevé de notes</h3>
              <div className="sn-bandeau-contexte">
                <div className="sn-contexte-infos">
                  <span className="sn-contexte-item">{nomClasse(contexte.classe)}</span>
                  <span className="sn-contexte-item">{nomAnnee(contexte.annee_academique)}</span>
                  <span className="sn-contexte-item">{labelPeriode(contexte.periode)}</span>
                  {contexte.etudiant && <span className="sn-contexte-item">Étudiant unique</span>}
                </div>
              </div>
            </div>
          
            <div className="sn-bandeau-contexte">
              <button className="sn-btn-changer" onClick={() => setModalOuvert(true)}>
                <i className="fas fa-rotate"></i> Changer le contexte
              </button>
              <button className="btn-primary addInscr" onClick={telechargerPdf}>
                <i className="fas fa-file-pdf"></i> Exporter en PDF
              </button>
            </div>
            
          </div>
        )}
        
        
        {chargement && <div className="empty">Chargement...</div>}
        
        
        
        {contexte && !chargement && (
          <>

            {/* KPI */}
            <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <div className="department-card">
                <div className="kpi-icon blue"><i className="fas fa-users"></i></div>
                <div className="count-top"><h2>{releves.length}</h2><span>Étudiants</span></div>
              </div>
              <div className="department-card">
              </div>
            </div>

            {releves.map((r) => (
              <div className="rn-etudiant-card" key={r.etudiant_id}>
                <div className="rn-etudiant-header" onClick={() => setEtudiantOuvert(etudiantOuvert === r.etudiant_id ? null : r.etudiant_id)}>
                  
                  <div>
                    <div className="rn-etudiant-nom">{r.nom} {r.prenom}</div>
                    <div className="rn-etudiant-matricule">{r.matricule}</div>
                  </div>
                  
                  <div className="rn-etudiant-resume">
                    {r.moyenne_annuelle && (
                      <span className={`badge ${COULEUR_MENTION[r.mention_annuelle] || 'badge-blue'}`}>
                        {r.mention_annuelle}
                      </span>
                    )}
                    <span className="rn-etudiant-moyenne">{r.moyenne_annuelle || (r.details_semestres[0]?.moyenne_generale ?? '—')}</span>
                    <i className={`fas fa-chevron-${etudiantOuvert === r.etudiant_id ? 'up' : 'down'}`}></i>
                  </div>

                </div>


                {etudiantOuvert === r.etudiant_id && (
                  <div className="rn-etudiant-body">
                    
                    {r.details_semestres.map((d) => (
                      <div className="rn-semestre-block" key={d.semestre}>
                        
                        <div className="rn-semestre-titre">
                          <h4 className='badge-orange'><i className="fas fa-calendar"></i> {d.semestre === 'S1' ? 'Semestre 1' : 'Semestre 2'}</h4>
                          <span className={`badge ${COULEUR_MENTION[d.mention] || 'badge-orange'}`}><p className='bull'>&#9758;</p> {d.mention}</span>
                        </div>

                        <div className="department-card table-card" style={{ marginBottom: '30px' }}>
                    
                          <div className="table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>Matière</th>
                                  <th>Coef</th>
                                  {typesEvaluation.map((t) => <th key={t.code}>{t.code}</th>)}
                                  <th>Note finale</th>
                                </tr>
                              </thead>
                              <tbody>
                                {d.detail_matieres.map((m, i) => (
                                  <tr key={i}>
                                    <td>{m.matiere}</td>
                                    <td>{m.coefficient}</td>
                                    {m.notes.map((n, j) => <td key={j}>{n.valeur ?? '—'}</td>)}
                                    <td>{m.moyenne ?? '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                        </div>
                        
                        <div className='rn-moyenne-annuelle'>
                          <p>Moyenne générale &#9758;</p>
                          <span className={`badge ${parseFloat(d.moyenne_generale) >= 10 ? 'badge-green' : 'badge-red'}`} 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <p className='bull'>&bull;</p>
                            {d.moyenne_generale ?? '—'}
                          </span>
                        </div>

                      </div>

                    ))}


                    {r.moyenne_annuelle && (
                      <div className="rn-moyenne-annuelle">
                        <span>Moyenne annuelle</span>
                        <span>{r.moyenne_annuelle} — {r.mention_annuelle}</span>
                      </div>
                    )}
                  </div>

                )}

              </div>

            ))}


            {releves.length === 0 && <div className="empty">
              Aucun relevé disponible pour ce contexte.
            </div>}
          
          </>

        )}

      </div>



      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content sn-modal-contexte">
          <div className="modal-header">
            <h2>Choisir le contexte du relevé</h2>
            {contexte && (
              <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          

          <form onSubmit={handleSubmit(chargerContexte)} id="departmentForm">
            <div className="form-grid" style={{ padding: '20px' }}>
          
              <div className="form-group">
                <div><label>Classe</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('classe', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.specialite_code} — {c.niveau_nom}</option>)}
                </select>
                {errors.classe && <div className="form-errors">Champ requis</div>}
              </div>
          
              <div className="form-group">
                <div><label>Année académique</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('annee_academique', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {anneesAcademiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                </select>
                {errors.annee_academique && <div className="form-errors">Champ requis</div>}
              </div>
          
              <div className="form-group">
                <div><label>Période</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('periode', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {PERIODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {errors.periode && <div className="form-errors">Champ requis</div>}
              </div>
          
              <div className="form-group">
                <label>Étudiant (optionnel)</label>
                <select {...register('etudiant')}>
                  <option value="">Tout le groupe</option>
                  {etudiantsClasse.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
            </div>
          
          
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr">
                Générer le relevé
              </button>
            </div>
          
          </form>

          <hr />
          
          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
            Soumettez le formulaire si consigne respectée !
          </p>

        </div>
      </div>
    </div>
  );
}
export default ReleveNotes;