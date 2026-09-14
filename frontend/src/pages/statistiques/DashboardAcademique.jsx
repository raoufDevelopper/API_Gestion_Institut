import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getDashboardAcademique, getFiltresAcademique, exporterAcademiquePdf, exporterAcademiqueExcel } from '../../api/statistiques';
import { useAlert } from '../../context/AlertContext';
import { telechargerFichier } from '../finances/financesConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';
import Loader from '../../components/Loader';





const ONGLETS = ['Vue générale', 'Analyses', 'Classements & Alertes'];

const COULEURS_DONUT = { Admis: '#16a34a', Ajournés: '#fb923c', Redoublants: '#dc2626' };


 
function DashboardAcademique() {
  const [donnees, setDonnees] = useState(null);
  const [filtresOptions, setFiltresOptions] = useState({ annees_academiques: [], filieres: [], specialites: [], classes: [], niveaux: [], matieres: [] });
  const [filtres, setFiltres] = useState({ semestre: 'ANNEE' });
  const [ongletActif, setOngletActif] = useState(0);
  const [filtresAvancesOuverts, setFiltresAvancesOuverts] = useState(false);
  const [modalOuvert, setModalOuvert] = useState(null); // 'filieres' | 'matieres' | 'classement' | null
  const { afficherErreur } = useAlert();
  
  useEffect(() => { getFiltresAcademique().then((res) => setFiltresOptions(res.data)); }, []);
  
  useEffect(() => { getDashboardAcademique(filtres).then((res) => setDonnees(res.data)); }, [filtres]);
  
  const maj = (champ, valeur) => setFiltres((prev) => ({ ...prev, [champ]: valeur || undefined }));
  
  const exporterPdf = async () => {
    try {
      const res = await exporterAcademiquePdf(filtres);
      telechargerFichier(res.data, 'dashboard_academique.pdf');
    } catch (err) { afficherErreur('Erreur lors export PDF.'); }
  };
  const exporterExcel = async () => {
    try {
      const res = await exporterAcademiqueExcel(filtres);
      telechargerFichier(res.data, 'dashboard_academique.xlsx');
    } catch (err) { afficherErreur('Erreur lors export Excel.'); }
  };

  if (!donnees) return <Loader label="Chargement en cours..." />;
  
  
  const { kpis, comparaisons, alertes } = donnees;



  const formaterDelta = (delta, hausseEstBonne = true) => {
    
    if (!delta) return <span style={{ color: '#f97316' }}>--</span>;
    
    const estHausse = delta.sens === 'hausse';
    
    const estPositif = hausseEstBonne ? estHausse : !estHausse;
    
    const couleur = delta.sens === 'stable' ? '#f97316' : (estPositif ? '#16a34a' : '#f34444');

    const bgcouleur = delta.sens === 'stable' ? 'rgba(249,115,22,.15)' : (estPositif ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)');
    
    const icone = delta.sens === 'stable' ? 'fa-equals' : (estHausse ? 'fa-arrow-up' : 'fa-arrow-down');
    
    const signe = delta.valeur > 0 ? '+' : '';
    
    return (
      <span className='comparaison-filtre' style={{ color: couleur, background: bgcouleur }}>
        <i className={`fas ${icone}`} style={{ fontSize: '13px' }}></i>
        {signe}{delta.valeur} vs S1
      </span>
    );

  };


  
  return (
    <div className="container-principal">

      <div className="department-page">

        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '25px'}}>
              Tableau de board - Résultats académiques
            </h3>
            <div className="sub">Visualisez les statistiques des resultats académiques</div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-light pdf" onClick={exporterPdf}>
                <i className="fas fa-file-pdf"></i> PDF
              </button>
              <button className="btn-light excel" onClick={exporterExcel}>
                <i className="fas fa-file-excel"></i> Excel
              </button>
            </div>
            <div className="sub">Exportez en PDF ou Excel</div>
          </div>
        </div>

        
        
        <div className="department-toolbar">

          <div className="toolbar-left">
            <div className='search-box'>
              <i className="fas fa-calendar"></i>
              <select className="select-filtre" style={{ marginLeft: '12px' }} onChange={(e) => maj('annee_academique', e.target.value)}>
                <option value="">Année académique</option>
                {filtresOptions.annees_academiques.map((a) => 
                  <option key={a.id} value={a.id}>{a.libelle}</option>
                )}
              </select>
            </div>
          </div>
          
          <div className="toolbar-left">
            <div className='search-box'>
              <i className="fas fa-filter"></i>
              <select className="select-filtre" style={{ marginLeft: '12px' }} onChange={(e) => maj('filiere', e.target.value)}>
                <option value="">Filière</option>
                {filtresOptions.filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="toolbar-left">
            <div className='search-box'>
              <i className="fas fa-filter"></i>
              <select className="select-filtre" style={{ marginLeft: '12px' }} onChange={(e) => maj('specialite', e.target.value)}>
                <option value="">Spécialité</option>
                {filtresOptions.specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="toolbar-left">
            <button onClick={() => setFiltresAvancesOuverts(!filtresAvancesOuverts)}>
              <i className="fas fa-sliders"></i> Filtres avancés
            </button>
          </div>
          
        </div>



        {filtresAvancesOuverts && (

          <div className="department-toolbar">

            <div className="toolbar-left">
              <select onChange={(e) => maj('classe', e.target.value)}>
                <option value="">Classe</option>
                {filtresOptions.classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            <div className="toolbar-left">
              <select onChange={(e) => maj('niveau', e.target.value)}>
                <option value="">Niveau</option>
                {filtresOptions.niveaux.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
              </select>
            </div>

            <div className="toolbar-left">
              <select onChange={(e) => maj('matiere', e.target.value)}>
                <option value="">Matière</option>
                {filtresOptions.matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>

            <div className="toolbar-left">
              <select onChange={(e) => maj('sexe', e.target.value)}>
                <option value="">Sexe</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

          </div>
          
        )}




        <div className="dash-segmented">
          {[
            { value: 'S1', label: 'Semestre 1' },
            { value: 'S2', label: 'Semestre 2' },
            { value: 'ANNEE', label: 'Année complète' },
          ].map((opt) => (
            <button key={opt.value} className={`dash-segmented-btn ${filtres.semestre === opt.value ? 'active' : ''}`} onClick={() => maj('semestre', opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>







        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card blue">
            <div className="kpi-icon blue-icone">
              <i className="fas fa-users"></i>
            </div>
            <div className="count-top">
              <span>Apprenants évalués</span>
              <h2>{kpis.apprenants_evalues}</h2>
              <p>{formaterDelta(comparaisons.apprenants_evalues)}</p>
            </div>
          </div>

          <div className="department-card green">
            <div className="kpi-icon green-icone">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="count-top">
              <span>Taux de réussite</span>
              <h2>{kpis.taux_reussite}%</h2>
              <p>{formaterDelta(comparaisons.taux_reussite)}</p>
            </div>
          </div>
          
          <div className="department-card red">
            <div className="kpi-icon red-icone">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="count-top">
              <span>Taux d'échec</span>
              <h2>{kpis.taux_echec}%</h2>
              <p>{formaterDelta(comparaisons.taux_echec, false)}</p>
            </div>
          </div>          
          
        </div>

        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card orange">
            <div className="kpi-icon orange-icone">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="count-top">
              <span>Moyenne générale</span>
              <h2>{kpis.moyenne_generale ?? '—'}/20</h2>
              <p>{formaterDelta(comparaisons.moyenne_generale)}</p>
            </div>
          </div>

          <div className="department-card violet">
            <div className="kpi-icon violet-icone">
              <i className="fas fa-award"></i>
            </div>
            <div className="count-top">
              <span>Mentions obtenues</span>
              <h2>{kpis.mentions}</h2>
              <p className='t-m'>{kpis.taux_mentions}% des apprenants</p>
            </div>
          </div>
        
        </div>





        


        <div className="dash-segmented" style={{ marginTop: '30px' }}>
          {ONGLETS.map((label, i) => (
            <button key={i} className={`dash-tab ${ongletActif === i ? 'active' : ''}`} onClick={() => setOngletActif(i)}>{label}</button>
          ))}
        </div>
        
        
        
        
        {ongletActif === 0 && (
          <div className="dash-contenu">

            <div className="dash-graphique-card">
              
              <div className="dash-graphique-titre">
                Répartition des résultats globaux
              </div>
              
              <div className="dash-graphique-zone">
                
                <div className="dash-donut-conteneur">

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donnees.repartition_resultats} dataKey="nb" nameKey="statut"
                        cx="50%" cy="50%" innerRadius={95} outerRadius={110} paddingAngle={3} cornerRadius={6}
                      >
                        {donnees.repartition_resultats.map((entry, i) => <Cell key={i} fill={COULEURS_DONUT[entry.statut]}/>)}
                        <Label
                          value={donnees.repartition_resultats.reduce((s, r) => s + r.nb, 0)}
                          position="center"
                          style={{ fontSize: '30px', fontWeight: 800, fill: 'var(--text)' }}
                        />
                        <Label
                          value="Apprenants"
                          position="center"
                          dy={22}
                          style={{ fontSize: '12px', fill: '#9ca3af' }}
                        />
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
                  
                  <div className="dash-donut-legende">
                    {donnees.repartition_resultats.map((r) => {
                      const total = donnees.repartition_resultats.reduce((s, x) => s + x.nb, 0);
                      const pct = total ? ((r.nb / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <div className="dash-donut-legende-item" key={r.statut}>
                          <span className="dash-donut-dot" style={{ background: COULEURS_DONUT[r.statut] }}></span>
                          <span>
                            <h2>{r.statut} </h2>
                            <h4>
                              <b>{r.nb}</b> 
                              <p>({pct}%)</p>
                            </h4>
                          </span>
                        </div>
                      );

                    })}
                  </div>

                </div>

              </div>

            </div>




            <div className="dash-graphique-card">

              <div className="dash-graphique-titre">
                Répartition des moyennes
              </div>

              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.repartition_tranches}>
                    <defs>
                      <linearGradient id="gradTranches" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a14fff" />
                        <stop offset="100%" stopColor="#400c7c" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="tranche" fontSize={11} />
                    <YAxis fontSize={11} allowDecimals={false} />
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
                    <Bar dataKey="nombre" fill="url(#gradTranches)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

          </div>
        )}




        {ongletActif === 1 && (
          <div className="dash-contenu">
            
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">
                Taux de réussite par filière (Top 5)
              </div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.top_filieres} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} fontSize={11} />
                    <YAxis type="category" dataKey="filiere" fontSize={10} width={90} />
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
                    <Bar dataKey="taux_reussite" fill="#16a34a" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <button className="dash-mini-table-lien" onClick={() => setModalOuvert('filieres')}>Voir plus →</button>
            </div>
            
            
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Moyenne par matière</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.moyenne_par_matiere}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="matiere" fontSize={9} angle={-20} textAnchor="end" height={50} />
                    <YAxis domain={[0, 20]} fontSize={11} />
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
                    <Bar dataKey="moyenne" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <button className="dash-mini-table-lien" onClick={() => setModalOuvert('matieres')}>Voir plus →</button>
            </div>
            
            
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Performance hommes / femmes</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.comparaison_sexe}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="sexe" fontSize={11} />
                    <YAxis domain={[0, 20]} fontSize={11} />
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
                    <Bar dataKey="moyenne" fill="#fb923c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            

            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Performance par classe (Top 5)</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.top_classes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 20]} fontSize={11} />
                    <YAxis type="category" dataKey="classe" fontSize={9} width={100} />
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
                    <Bar dataKey="moyenne" fill="#a14fff" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}




        {ongletActif === 2 && (
          <div className="dash-contenu">
            
            <div className="dash-graphique-card">
              <div className="table-title">
                <h2> Alertes académiques</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-user-graduate"></i><div>{alertes.apprenants_en_difficulte} apprenant(s) en redoublement</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-list"></i><div>{alertes.notes_manquantes} note(s) manquante(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-hourglass-half"></i><div>{alertes.deliberations_incompletes} délibération(s) incomplète(s)</div></div>
              </div>
            </div>



            <div className="dash-graphique-card table-card">

              <div className="table-title">
                <h2>Matières à fort taux d'échec</h2>
              </div>
                
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th>Taux d'échec</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {alertes.matieres_fort_taux_echec.map((m, i) => {
                      const couleur = m.taux_echec >= 60 ? '#dc2626' : m.taux_echec >= 45 ? '#fb923c' : '#9708ea';
                      return (
                        <tr key={i}>
                          <td>
                            <span className="badge badge-violet">
                              <p className='bull'>&bull;</p>
                              {m.matiere}
                            </span>
                          </td>
                          <td style={{ width: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="dash-progress-bar-track">
                                <div className="dash-progress-bar-fill" style={{ width: `${m.taux_echec}%`, background: couleur }}></div>
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: couleur, minWidth: '38px' }}>{m.taux_echec}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    

                    {alertes.matieres_fort_taux_echec.length === 0 && 
                      <tr>
                        <td colSpan="2" style={{ color: '#9ca3af' }}>Aucune matière au-dessus du seuil critique.</td>
                      </tr>
                    }
                  
                  </tbody>
                
                </table>
              
              </div>
            
            </div>



            {/* TABLE */}
            <div className="dash-graphique-card table-card" style={{ gridColumn: '1 / -1' }}>
                
              <div className="table-title">
                <h2>Top 10 des meilleurs apprenants</h2>
              </div>
                
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '50px' }}>N°</th>
                      <th style={{ minWidth: '320px' }}>étudiant</th>
                      <th style={{ minWidth: '100px' }}>Classe</th>
                      <th style={{ minWidth: '50px' }}>Moyenne</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.top_apprenants.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <span className="badge-orange" style={{minWidth: '20px'}}>
                            <p className='bull'>&#9813;</p>
                            {i + 1}
                          </span>
                        </td>

                        <td>
                          <div className="cell-with-avatar">
                            {a.photo ? (
                              <img src={a.photo} alt="" className="avatar-mini" />
                            ) : (
                              <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>
                            )}
                              <div className="cell-strong">{a.nom}</div>
                          </div>
                        </td>

                        <td>{a.classe}</td>
                        <td>
                          <span className="badge badge-success">
                            <p className='bull'>&bull;</p>
                            {a.moyenne}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="dash-mini-table-lien" onClick={() => setModalOuvert('classement')}>Voir plus →</button>
            
            </div>
          
          </div>
        )}




        <div className="department-kpi academique-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card" style={{ border: 'dashed 1px #22c55e' }}>
            <div className="count-top">
              <span>Meilleure moyenne</span>
              <h2 className='m-m'>{kpis.meilleure_moyenne ? `${kpis.meilleure_moyenne.moyenne}/20` : '—'}</h2>
              <p className='m-e'>{kpis.meilleure_moyenne ? `${kpis.meilleure_moyenne.nom} · ${kpis.meilleure_moyenne.matricule}` : 'Aucune donnée'}</p>
            </div>
            <div className="kpi-icon green">
              <i className="fas fa-trophy"></i>
            </div>
          </div>
          
          <div className="department-card" style={{ border: 'dashed 1px #ef4444' }}>
            <div className="count-top">
              <span>Plus faible moyenne</span>
              <h2 className='f-m'>{kpis.plus_faible_moyenne ? `${kpis.plus_faible_moyenne.moyenne}/20` : '—'}</h2>
              <p className='f-e'>{kpis.plus_faible_moyenne ? `${kpis.plus_faible_moyenne.nom} · ${kpis.plus_faible_moyenne.matricule}` : 'Aucune donnée'}</p>
            </div>
            <div className="kpi-icon red">
              <i className="fas fa-arrow-trend-down"></i>
            </div>
          </div>

        </div>

      </div>





      {/* MODAL — voir toutes les filières */}
      <div className="department-modal" style={{ display: modalOuvert === 'filieres' ? 'flex' : 'none' }}>
        
        <div className="modal-content model-detail" style={{ padding: '30px', maxWidth: '850px' }}>
        
          <div className="modal-header acd" style={{ background: 'transparent', padding: '0 0 20px 0', marginBottom: '20px' }}>
            <h2>Toutes les filières</h2>
            <button style={{ top: '-20px', right: '-15px' }} onClick={() => setModalOuvert(null)}><i className="fas fa-times"></i></button>
          </div>
                    
          <div className="table-scroll order-table">
            <table>
              <thead>
                <tr>
                  <th>Filière</th>
                  <th>Apprenants</th>
                  <th>Moyenne</th>
                  <th>Taux de réussite</th>
                </tr>
              </thead>
              <tbody>
                {donnees.toutes_filieres.map((f, i) => (
                  <tr key={i}>
                    <td className="cell-strong">{f.filiere}</td>
                    <td>
                      <span className= 'badge-orange'>
                        <p className='bull'>&#10027;</p>
                       {f.apprenants}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-${f.moyenne > 10 ? 'success' : 'danger'}`}>
                        <p className='bull'>&bull;</p>
                        {f.moyenne}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-${f.taux_reussite > 50 ? 'success' : 'danger'}`}>
                        <p className='bull'>&bull;</p>
                        {f.taux_reussite}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        
        </div>
      
      </div>






      {/* MODAL — voir toutes les matières */}
      <div className="department-modal" style={{ display: modalOuvert === 'matieres' ? 'flex' : 'none' }}>

        <div className="modal-content model-detail" style={{ padding: '30px', maxWidth: '850px' }}>
        
          <div className="modal-header acd" style={{ background: 'transparent', padding: '0 0 20px 0', marginBottom: '20px' }}>
            <h2>Toutes les matières</h2>
            <button style={{ top: '-20px', right: '-15px' }} onClick={() => setModalOuvert(null)}><i className="fas fa-times"></i></button>
          </div>
          <div className="table-scroll order-table">
            <table>
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Moyenne</th>
                </tr>
              </thead>
              <tbody>
                {donnees.moyenne_par_matiere.map((m, i) => (
                  <tr key={i}>
                    <td className="cell-strong">{m.matiere}</td>
                    <td>
                      <span className={`badge-${m.moyenne > 10 ? 'success' : 'danger'}`}>
                        <p className='bull'>&#10026;</p>
                        {m.moyenne}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>






      {/* MODAL — classement complet */}
      <div className="department-modal" style={{ display: modalOuvert === 'classement' ? 'flex' : 'none' }}>

        <div className="modal-content model-detail" style={{ padding: '30px', maxWidth: '850px' }}>
        
          <div className="modal-header acd" style={{ background: 'transparent', padding: '0 0 20px 0', marginBottom: '20px' }}>
            <h2>Classement complet</h2>
            <button style={{ top: '-20px', right: '-15px' }} onClick={() => setModalOuvert(null)}><i className="fas fa-times"></i></button>
          </div>
          
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '50px' }}>N°</th>
                  <th style={{ minWidth: '320px' }}>Nom</th>
                  <th>Classe</th>
                  <th style={{ minWidth: '70px' }}>Moyenne</th>
                  <th style={{ minWidth: '80px' }}>Mention</th>
                </tr>
              </thead>
              <tbody>
                {donnees.classement_complet.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <span className="badge-orange" style={{minWidth: '50px'}}>
                        <p className='bull'>&#9813;</p>
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <div className="cell-with-avatar">
                        {a.photo ? (
                          <img src={a.photo} alt='' className="avatar-mini" />
                        ) : (
                          <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>
                        )}
                        <div>
                          <span className="cell-strong">{a.nom}</span> <br /> 
                          <span className='mono'>{a.matricule}</span>
                        </div>
                      </div>
                    </td>
                    <td>{a.classe}</td>
                    <td>
                      <span className={`badge-${a.moyenne > 10 ? 'success' : 'danger'}`}>
                        <p className='bull'>&#10026;</p>
                        {a.moyenne}
                      </span>
                    </td>
                    <td>
                      <span className='badge-violet'>
                        <p className='bull'>&bull;</p>
                        {a.mention}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>

  );

}




export default DashboardAcademique;

          