import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMesResultatsComplet, getFiltresResultatsEtudiant, getMonClassementClasse } from '../../api/espaceEtudiant';
import Loader from '../../components/Loader';
import '../../assets/css/mesResultats.css';






const COULEURS = ['#6366f1', '#22c55e', '#f97316', '#06b6d4', '#ec4899', '#eab308', '#9ca3af', '#3b82f6'];

const ICONES_MATIERE = ['fa-code', 'fa-database', 'fa-network-wired', 'fa-calculator', 'fa-language', 'fa-gears', 'fa-diagram-project', 'fa-comments'];

const LABEL_STATUT = { valide: 'Semestre validé', attention: 'Rattrapage requis', refuse: 'Semestre non validé', attente: 'En attente de délibération' };

const ICONE_STATUT = { valide: 'fa-circle-check', attention: 'fa-triangle-exclamation', refuse: 'fa-circle-xmark', attente: 'fa-hourglass-half' };

const LABEL_DECISION = { ADMIS: 'SEMESTRE VALIDÉ', RATTRAPAGE: 'RATTRAPAGE', REDOUBLANT: 'NON VALIDÉ', EN_ATTENTE: 'EN ATTENTE' };

function ResultatsEtudiant() {
  const navigate = useNavigate();
  const [annees, setAnnees] = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [periode, setPeriode] = useState('S1');
  const [donnees, setDonnees] = useState(null);
  const [toutesMatieres, setToutesMatieres] = useState(false);
  const [matiereOuverte, setMatiereOuverte] = useState(null);
  const [filtreMatiereEval, setFiltreMatiereEval] = useState('');
  const [pageEval, setPageEval] = useState(1);
  const [modalClassement, setModalClassement] = useState(null);
  const [modalDeliberation, setModalDeliberation] = useState(false);

  useEffect(() => {
    getFiltresResultatsEtudiant().then((res) => {
      setAnnees(res.data.annees_academiques);
      const active = res.data.annees_academiques[res.data.annees_academiques.length - 1];
      if (active) setAnneeId(String(active.id));
    });
  }, []);


  useEffect(() => {
    if (!anneeId) return;
    getMesResultatsComplet({ annee_academique: anneeId, periode }).then((res) => setDonnees(res.data));
  }, [anneeId, periode]);


  if (!donnees) return <div className="container-principal"><Loader label="Chargement de vos résultats..." /></div>;
  
  
  const { etudiant, kpis, statut_semestre, decision, matieres, evaluations, evolution, repartition_matieres } = donnees;
  
  const matieresAffichees = toutesMatieres ? matieres : matieres.slice(0, 5);
  
  const evaluationsFiltrees = filtreMatiereEval ? evaluations.filter((e) => e.matiere === filtreMatiereEval) : evaluations;
  
  const PAR_PAGE = 5;
  
  const totalPagesEval = Math.max(1, Math.ceil(evaluationsFiltrees.length / PAR_PAGE));
  
  const evaluationsPage = evaluationsFiltrees.slice((pageEval - 1) * PAR_PAGE, pageEval * PAR_PAGE);
  
  const ouvrirClassement = () => getMonClassementClasse({ annee_academique: anneeId, periode }).then((res) => setModalClassement(res.data));
  
  const allerAuReleve = () => navigate(`/espace-etudiant/releve?annee=${anneeId}&periode=${periode}`);
  
  
  
  return (
    <div className="container-principal">

      <div className="department-page">

        <div className="panel-head">

          <div style={{ display: 'flex', gap: '15px'}}>
            <div className="mr-header-icone">
              <i className="fas fa-file-lines"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '20px'}}>Mes résultats</h3>
              <div className="sub" style={{ marginTop: '-8px' }}>
                Consultez vos notes et performances académiques.
              </div>
            </div>
          </div>

          <div className="mr-header-actions">
            <div className="mr-select-periode">
              <select value={anneeId} onChange={(e) => setAnneeId(e.target.value)}>
                {annees.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
              </select>
              <select value={periode} onChange={(e) => setPeriode(e.target.value)}>
                <option value="S1">Semestre 1</option>
                <option value="S2">Semestre 2</option>
                <option value="ANNEE">Année complète</option>
              </select>
            </div>
            <button className="mr-btn-releve" onClick={allerAuReleve}>
              <i className="fas fa-eye"></i> 
              Voir mon relevé
            </button>
          </div>

        </div>
        
        
      

        {/* RÉSUMÉ 
        <div className="mr-summary-grid">
          <div className="mr-student-card">
            {etudiant.photo ? 
              <img src={etudiant.photo} alt={etudiant.nom} className="mr-student-avatar" /> 
              : <div className="mr-student-avatar mr-student-avatar-placeholder">
                  <i className="fas fa-user"></i>
                </div>
            }
            <div>
              <div className="mr-student-name">
                <h2>{etudiant.nom} {etudiant.prenom}</h2>
                <span className="mr-student-status">
                  <i className="fas fa-circle-check"></i> 
                  Étudiant {etudiant.statut === 'ACTIF' ? 'actif' : etudiant.statut.toLowerCase()}
                </span>
              </div>
              <div className="mr-student-details">
                <div><span>Matricule</span><strong className="mono">{etudiant.matricule}</strong></div>
                <div><span>Classe</span><strong>{etudiant.classe}</strong></div>
                <div><span>Spécialité</span><strong>{etudiant.specialite}</strong></div>
                <div><span>Filière</span><strong>{etudiant.filiere}</strong></div>
              </div>
            </div>
          </div>
          
        </div>
        */}

        
        
        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-chart-line"></i></div>
            <div className="count-top">
              <h2>
                {kpis.moyenne_generale ?? '—'} 
                <small style={{ fontWeight: 400, fontSize: '10px' }}> /20</small>
              </h2>
              <span>Moyenne générale</span></div>
          </div>
          
          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-layer-group"></i></div>
            <div className="count-top"><h2>{kpis.nb_matieres}</h2><span>Matières évaluées</span></div>
          </div>
        
        </div>

        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check"></i></div>
            <div className="count-top"><h2>{kpis.taux_reussite ?? '—'}<small style={{ fontWeight: 400, fontSize: '10px' }}>%</small></h2><span>Taux de réussite</span></div>
          </div>
          
          <div className="department-card">
            <div className="kpi-icon violet"><i className="fas fa-trophy"></i></div>
            <div className="count-top"><h2>{kpis.rang ? `${kpis.rang}/${kpis.effectif}` : '—'}</h2><span>Rang dans la classe</span></div>
          </div>

          <div className="mr-semester-summary">
            <h3>Votre situation actuelle</h3>
            <p>Décision finale pour cette pérode.</p>
            <div className={`mr-badge-statut ${statut_semestre}`}>
              <i className={`fas ${ICONE_STATUT[statut_semestre]}`}></i> 
              {LABEL_STATUT[statut_semestre]}
            </div>
          </div>
        
        </div>
        
        

        
        
        {/* MATIÈRES + ÉVOLUTION */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="mr-carte">
            
            <div className="mr-carte-entete">
              <div className="mr-carte-titre-bloc">
                <h3>Répartition des matières</h3>
              </div>
            </div>
            

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
              <div style={{ width: '230px', height: '230px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={repartition_matieres} dataKey="pourcentage" 
                      nameKey="matiere" cx="50%" cy="50%" innerRadius={65} 
                      outerRadius={85} paddingAngle={2}
                    >
                      {repartition_matieres.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1f2937',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}
                      itemStyle={{ color: '#e5e7eb', fontSize: '11.5px' }}
                      cursor={{ fill: 'rgba(64, 12, 124, 0.06)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            
              <div className="mr-donut-legende">
                {repartition_matieres.map((r, i) => (
                  <div className="mr-donut-legende-item" key={i}>
                    <span className="mr-donut-dot" style={{ background: COULEURS[i % COULEURS.length] }}></span>
                    {r.matiere} &#9758; {r.pourcentage}%
                  </div>
                ))}
                {repartition_matieres.length === 0 && <span style={{ color: '#9ca3af', fontSize: '12px' }}>Aucune donnée.</span>}
              </div>
            
            </div>
          
          </div>
        


      
          <div className="mr-carte">
            
            <div className="mr-carte-entete">
              <div className="mr-carte-titre-bloc">
                <div className="mr-carte-icone" style={{ background: 'rgba(188, 106, 255, 0.15)', color: '#be5bf7' }}><i className="fas fa-arrow-trend-up"></i></div>
                <div><h3>Évolution de mes performances</h3></div>
              </div>
            </div>
            
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={10} />
                  <YAxis domain={[0, 20]} fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '10px' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e5e7eb' }} />
                  <Line type="monotone" dataKey="valeur" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

        </div>





        {/* RÉPARTITION + POSITION */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="mr-carte">
            
            <div className="mr-carte-entete">
              <div className="mr-carte-titre-bloc">
                <i className="fas fa-trophy" style={{ background: 'rgba(249,115,22,.15)', color: '#f97316' }}></i>
                <h3 style={{ marginLeft: '8px' }}>Ma position</h3>
              </div>
            </div>
            
            <div className="mr-position-carte">
              <div className="mr-position-rang">
                {kpis.rang ?? '—'}{kpis.rang && 'e'}
              </div>
              <div className="mr-position-sur">
                sur {kpis.effectif ?? '—'} apprenants
              </div>
              <div className="rn-moyenne-annuelle">
                <span>Moyenne de la classe</span>
                <span>{kpis.moyenne_classe ?? '—'} / 20</span>
              </div>

              <button className="mr-lien-discret" style={{ marginTop: '14px' }} onClick={ouvrirClassement}>
                Voir le classement →
              </button>
            
            </div>
          
          </div>


          <div className="mr-carte" style={{ marginBottom: 0 }}>
            
            <div className="mr-carte-entete">
              <div className="mr-carte-titre-bloc">
                <div className="mr-carte-icone" style={{ background: 'rgba(34,197,94,.2)', color: '#22c55e' }}><i className="fas fa-graduation-cap"></i></div>
                <div><h3>Résultat de délibération</h3></div>
              </div>
            </div>
            
            
            <div className={`mr-badge-statut ${statut_semestre}`} style={{ marginTop: '12px', marginBottom: '12px', width: '100%' }}><i className={`fas ${ICONE_STATUT[statut_semestre]}`}></i> {LABEL_STATUT[statut_semestre]}</div>
            
            <div className="mr-deliberation-ligne"><span>Moyenne générale</span><b>{kpis.moyenne_generale ?? '—'} / 20</b></div>
            
            <div className="mr-deliberation-ligne"><span>Moyenne la plus élevée</span><b>{donnees.moyenne_plus_elevee ?? '—'} / 20</b></div>
            
            <div className="mr-deliberation-ligne"><span>Moyenne la plus faible</span><b>{donnees.moyenne_plus_faible ?? '—'} / 20</b></div>
            
            
            <button className="mr-lien-discret" style={{ width: '100%', marginTop: '14px' }} onClick={() => setModalDeliberation(true)}>Voir les détails de la délibération</button>
          </div>

        </div>



        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
 
          <div className="mr-carte">
          
            <div className="mr-carte-entete">

              <div className="mr-carte-titre-bloc">
                <div className="mr-carte-icone" style={{ background: 'rgba(239,68,68,.2)', color: '#ef4444' }}><i className="fas fa-book"></i></div>
                <div>
                  <h3>Mes résultats par matière</h3>
                  <p>Cliquaez sur la matière pour voir plus de détails.</p>
                </div>
              </div>
              
              {matieres.length > 5 && (
                <div className="ee-planning-nav" style={{ justifyContent: 'flex-end' }}>
                  <button id='btn-pre' onClick={() => setToutesMatieres(!toutesMatieres)}>
                    {toutesMatieres ? 'Réduire' : 'Voir toutes les matières'} →
                  </button>
                </div>
              )}

            </div>
            
            <div className="department-card table-card" style={{ marginBottom: '30px' }}>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th style={{ minWidth: '100px' }}>Coefficient</th>
                      <th style={{ minWidth: '100px' }}>Moyenne</th>
                      <th style={{ minWidth: '100px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matieresAffichees.map((m, i) => (
                      <tr key={m.id} onClick={() => setMatiereOuverte(m)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div className="mr-matiere-nom">
                            <div className="mr-matiere-icone" style={{ background: `${COULEURS[i % COULEURS.length]}22`, color: COULEURS[i % COULEURS.length] }}>
                              <i className={`fas ${ICONES_MATIERE[i % ICONES_MATIERE.length]}`}></i>
                            </div>
                            {m.nom}
                          </div>
                        </td>
                        <td>{m.coefficient} crédits</td>
                        <td>
                           <span className={`badge-${m.moyenne > 10 ? 'success' : 'danger'}`}>
                              <p className='bull'>&bull;</p>
                              {m.moyenne ?? '—'}
                            </span>
                        </td>
                        <td><span className={`mr-statut-pill ${m.statut}`}><i className={`fas ${m.statut === 'validee' ? 'fa-check' : m.statut === 'non_validee' ? 'fa-xmark' : 'fa-clock'}`}></i> {m.statut === 'validee' ? 'Validée' : m.statut === 'non_validee' ? 'Non validée' : 'En attente'}</span></td>
                      </tr>
                    ))}
                    {matieres.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>Aucune matière trouvée pour votre spécialité/niveau.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>



        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="mr-carte">

            <div className="mr-carte-entete">
              
              <div className="mr-carte-titre-bloc">
                <div className="mr-carte-icone" style={{ background: 'rgba(51, 153, 144, 0.2)', color: 'hsl(180, 23%, 46%)' }}><i className="fas fa-list-check"></i></div>
                <div>
                  <h3>Détail des évaluations</h3>
                  <p>Toutes vos évaluations pour cette période.</p>
                </div>
              </div>
              
              <select className="mr-select-periode" value={filtreMatiereEval} onChange={(e) => { setFiltreMatiereEval(e.target.value); setPageEval(1); }}>
                <option value="">Toutes les matières</option>
                {matieres.map((m) => <option key={m.id} value={m.nom}>{m.nom}</option>)}
              </select>
            
            </div>
            
            {/* TABLE */}
            <div className="department-card table-card">

              <div className="table-scroll">

                <table>
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th  style={{ minWidth: '100px' }}>Note / 20</th>
                      {periode === 'ANNEE' && 
                        <th>Semestre</th>
                      }
                      <th>Évaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationsPage.map((e, i) => (
                      <tr key={i}>
                        <td className="cell-strong">{e.matiere}</td>
                        <td>
                          <span className={`badge-${e.valeur > 10 ? 'success' : 'danger'}`}>
                            <p className='bull'>&bull;</p>
                            {e.valeur}
                          </span>
                        </td>
                        <td>{e.evaluation}</td>
                        {periode === 'ANNEE' && <td>{e.semestre}</td>}
                      </tr>
                    ))}
                    {evaluationsPage.length === 0 && <tr><td colSpan={periode === 'ANNEE' ? 4 : 3} style={{ color: '#9ca3af', textAlign: 'center' }}>Aucune évaluation.</td></tr>}
                  </tbody>
                </table>

              </div>

            </div>
            
            
            {totalPagesEval > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="mr-btn-oeil" disabled={pageEval === 1} onClick={() => setPageEval((p) => p - 1)}><i className="fas fa-chevron-left"></i></button>
                  <span style={{ padding: '5px 10px' }}>{pageEval} / {totalPagesEval}</span>
                  <button className="mr-btn-oeil" disabled={pageEval === totalPagesEval} onClick={() => setPageEval((p) => p + 1)}><i className="fas fa-chevron-right"></i></button>
                </div>
                <span style={{ color: '#9ca3af' }}>{evaluationsFiltrees.length} résultat(s)</span>
              </div>
            )}

          </div>



          <div className="mr-carte" style={{ marginBottom: 0 }}>

            <div className="mr-carte-entete">
              <div className="mr-carte-titre-bloc">
                <div className="mr-carte-icone" style={{ background: 'rgba(188, 106, 255, 0.15)', color: '#be5bf7' }}><i className="fas fa-bolt"></i></div>
                <div><h3>Accès rapides</h3></div>
              </div>
            </div>

            <button className="mr-acces-rapide-item" onClick={() => navigate('/espace-etudiant/planning')}><i className="fas fa-calendar-week"></i>Voir mon planning<i className="fas fa-chevron-right"></i></button>

            <button className="mr-acces-rapide-item" onClick={() => navigate('/espace-etudiant/formation')}><i className="fas fa-graduation-cap"></i>Voir ma formation<i className="fas fa-chevron-right"></i></button>

            <button className="mr-acces-rapide-item" onClick={() => navigate('/espace-etudiant/finances')}><i className="fas fa-sack-dollar"></i>Voir mes finances<i className="fas fa-chevron-right"></i></button>

            <button className="mr-acces-rapide-item" onClick={() => navigate('/espace-etudiant/documents')}><i className="fas fa-folder"></i>Voir mes documents<i className="fas fa-chevron-right"></i></button>

            <div className="mr-quote-box">
              <i className="fas fa-bullseye"></i>
              <p>Votre réussite est le fruit de votre travail et de votre persévérance.</p>
            </div>

          </div>

        </div>


      </div>
      
      
      
      
      
      {/* MODAL DÉTAIL MATIÈRE */}
      {matiereOuverte && (
        <div className="mr-modal-overlay" onClick={() => setMatiereOuverte(null)}>
          
          <div className="mr-modal-carte" onClick={(e) => e.stopPropagation()}>
          
            <div className="mr-modal-entete">
              <div className="mr-modal-entete-titre">
                <div className="mr-modal-icone"><i className="fas fa-book"></i></div>
                <div><h3>{matiereOuverte.nom}</h3><p>Détail des évaluations et calcul de la moyenne.</p></div>
              </div>
              <button onClick={() => setMatiereOuverte(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          
            <div className="mr-modal-corps">
              
              <div className="mr-modal-eval-ligne">
                <span>Enseignant</span>
                <b>{matiereOuverte.enseignant}</b>
              </div>
              <div className="mr-modal-eval-ligne"><span>Coefficient</span><b>{matiereOuverte.coefficient}</b></div>
              <div className="mr-modal-eval-ligne"><span>Crédit</span><b>{matiereOuverte.credit}</b></div>
              
              <h4 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', margin: '18px 0 6px' }}>Évaluations</h4>
              
              {matiereOuverte.evaluations.map((ev, i) => (
                <div className={`mr-modal-eval-ligne ${ev.valeur < 10 ? 'red' : 'green'}`} key={i}>
                  <span>
                    {ev.type_libelle}{periode === 'ANNEE' ? ` (${ev.semestre})` : ''}
                  </span>
                  <b>{ev.valeur} / 20</b>
                </div>
              ))}
              
              {matiereOuverte.evaluations.length === 0 && <div style={{ color: '#9ca3af', fontSize: '12.5px' }}>Aucune évaluation enregistrée.</div>}

              <div className="rn-moyenne-annuelle">
                <span>Moyenne de la matière</span>
                <span>{matiereOuverte.moyenne ?? '—'} / 20</span>
              </div>

              <div className={`mr-statut-pill ${matiereOuverte.statut}`} style={{ marginTop: '12px' }}>
                {matiereOuverte.statut === 'validee' ? '✓ Matière validée' : matiereOuverte.statut === 'non_validee' ? '✕ Matière non validée' : 'En attente'}
              </div>

            </div>

          </div>

        </div>
        
      )}



      {/* MODAL CLASSEMENT */}
      {modalClassement && (
        <div className="mr-modal-overlay" onClick={() => setModalClassement(null)}>
          
          <div className="mr-modal-carte" onClick={(e) => e.stopPropagation()}>
          
            <div className="mr-modal-entete">
              <div className="mr-modal-entete-titre"><div className="mr-modal-icone"><i className="fas fa-ranking-star"></i></div><h3>Classement de ma classe</h3></div>
              <button onClick={() => setModalClassement(null)}><i className="fas fa-times"></i></button>
            </div>
          
            <div className="mr-modal-corps">
              {modalClassement.map((c) => (
                <div className="mr-modal-eval-ligne" key={c.rang} style={{ fontWeight: c.moi ? 800 : 400, color: c.moi ? '#be5bf7' : 'var(--text)' }}>
                  <span>
                    {c.rang}. {c.nom} {c.moi && '(Moi)'}
                  </span>
                  <b>{c.moyenne} / 20</b>
                </div>
              ))}
            </div>
          
          </div>
        
        </div>
      )}
      
      
      
      {/* MODAL DÉLIBÉRATION */}
      {modalDeliberation && (
        <div className="mr-modal-overlay" onClick={() => setModalDeliberation(false)}>
          <div className="mr-modal-carte" onClick={(e) => e.stopPropagation()}>
            <div className="mr-modal-entete">
              <div className="mr-modal-entete-titre"><div className="mr-modal-icone"><i className="fas fa-scale-balanced"></i></div><h3>Détail de la délibération</h3></div>
              <button onClick={() => setModalDeliberation(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="mr-modal-corps">
              <div className={`mr-badge-statut ${statut_semestre}`} style={{ marginBottom: '14px', marginTop: 0 }}>{LABEL_DECISION[decision]}</div>
              {matieres.map((m) => (
                <div className="mr-modal-eval-ligne" key={m.id}>
                  <span>{m.nom}</span>
                  <span className={`mr-statut-pill ${m.statut}`}>{m.moyenne ?? '—'} — {m.statut === 'validee' ? 'Validée' : m.statut === 'non_validee' ? 'Non validée' : 'En attente'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>

  );

}


export default ResultatsEtudiant;

