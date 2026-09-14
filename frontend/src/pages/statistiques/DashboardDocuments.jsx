
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Label, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,} from 'recharts';
import { getDashboardDocuments, getFiltresDocuments } from '../../api/statistiques';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';
import Loader from '../../components/Loader';



const ONGLETS = ['Vue générale', 'Analyses', 'Activité & Alertes'];

const COULEURS = ['#9152d8', '#16a34a', '#2563eb', '#fb923c', '#dc2626', '#6b7280'];



function DashboardDocuments() {

  const [donnees, setDonnees] = useState(null);

  const [options, setOptions] = useState({ categories: [], responsables: [] });

  const [filtres, setFiltres] = useState({});

  const [ongletActif, setOngletActif] = useState(0);

  useEffect(() => { getFiltresDocuments().then((res) => setOptions(res.data)); }, []);

  useEffect(() => { getDashboardDocuments(filtres).then((res) => setDonnees(res.data)); }, [filtres]);

  const maj = (champ, valeur) => setFiltres((prev) => ({ ...prev, [champ]: valeur || undefined }));


  if (!donnees) return <Loader label="Chargement en cours..." />;

  const { kpis, alertes } = donnees;





  return (
    <div className="container-principal">

      <div className="department-page">


        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '25px'}}>
              Tableau de board - Gestion documentaire
            </h3>
            <div className="sub">
              Visualisez les statistiques de la gestion 
              de vos ducuments
            </div>
          </div>

          <div>
            <div className='date-filter'>
              <input type="date" onChange={(e) => maj('date_debut', e.target.value)} title="Date début" />
              <input type="date" onChange={(e) => maj('date_fin', e.target.value)} title="Date fin" />
            </div>
          </div>
        </div>



        
        <div className="department-toolbar">

          <div className="toolbar-left">
            <select onChange={(e) => maj('categorie', e.target.value)}>
              <option value="">Catégorie</option>
              {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('concerne', e.target.value)}>
              <option value="">Concerne</option>
              <option value="etudiant">Étudiant</option>
              <option value="personnel">Personnel</option>
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('responsable', e.target.value)}>
              <option value="">Responsable</option>
              {options.responsables.map((r) => <option key={r.id} value={r.id}>{r.username}</option>)}
            </select>
          </div>
          
        </div>






        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card blue border">
            <div className="kpi-icon blue-icone">
              <i class="fa-solid fa-folder-open"></i>
            </div>
            <div className="count-top">
              <span>Total</span>
              <h2>{kpis.total_documents}</h2>
              <p>total des documents</p>
            </div>
          </div>


          <div className="department-card orange border">
            <div className="kpi-icon orange-icone">
             <i class="fa-solid fa-file-circle-plus"></i>
            </div>
            <div className="count-top">
              <span>Ajoutés (30j)</span>
              <h2>{kpis.documents_ajoutes_periode}</h2>
              <p>30 jours ou moins</p>
            </div>
          </div>
          

          <div className="department-card green border">
            <div className="kpi-icon green-icone">
              <i class="fa-solid fa-file-lines"></i>
            </div>
            <div className="count-top">
              <span>Documents divers</span>
              <h2>{kpis.documents_divers}</h2>
              <p>autre type de documents</p>
            </div>
          </div>

        </div>



        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card violet border">
            <div className="kpi-icon violet-icone">
              <i class="fa-solid fa-certificate"></i>
            </div>
            <div className="count-top">
              <span>Certificats</span>
              <h2>{kpis.certificats_delivres}</h2>
              <p>certificats divers</p>
            </div>
          </div>
          
          
          <div className="department-card red border">
            <div className="kpi-icon red-icone">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="count-top">
              <span>Liés étudiants</span>
              <h2>{kpis.documents_lies_etudiants}</h2>
              <p>liés aux étudiants</p>
            </div>
          </div>

          
          <div className="department-card aqua border">
            <div className="kpi-icon aqua-icone">
              <i class="fa-solid fa-users"></i>
            </div>
            <div className="count-top">
              <span>Liés personnel</span>
              <h2>{kpis.documents_lies_personnel}</h2>
              <p>liés au personnel</p>
            </div>
          </div>

        </div>

        
        



        <div className="dash-segmented" style={{ marginTop: '20px' }}>
          {ONGLETS.map((label, i) => (
            <button key={i} className={`dash-tab ${ongletActif === i ? 'active' : ''}`} onClick={() => setOngletActif(i)}>{label}</button>
          ))}
        </div>




        {ongletActif === 0 && (
          <div className="dash-contenu">
            
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Évolution du volume de documents</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donnees.evolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" fontSize={11} />
                    <YAxis fontSize={11} />
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
                    <Line type="monotone" dataKey="nb" stroke="#9152d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            
            
            
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition par type de document</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donnees.repartition_par_type} dataKey="nb" nameKey="type" cx="50%" cy="50%" innerRadius={98} outerRadius={120}>
                      {donnees.repartition_par_type.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                      <Label
                        value={kpis.total_documents}
                        position="center"
                        style={{ fontSize: '30px', fontWeight: 800, fill: 'var(--text)' }}
                      />
                      <Label
                        value="Total des documents"
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
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        )}





        
        {ongletActif === 1 && (
          <div className="dash-contenu">
        
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Documents par catégorie</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.documents_par_categorie}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categorie" fontSize={9} angle={-20} textAnchor="end" height={50} />
                    <YAxis fontSize={11} />
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
                    <Bar dataKey="nb" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        
        
        
        
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Documents par responsable</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.documents_par_responsable} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis type="category" dataKey="utilisateur" fontSize={10} width={100} />
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
                    <Bar dataKey="nb" fill="#fb923c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        
        
        
        
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Statut des diplômes</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donnees.repartition_diplomes} dataKey="nb" nameKey="statut" cx="50%" cy="50%" innerRadius={98} outerRadius={120}>
                      {donnees.repartition_diplomes.map((entry, i) => <Cell key={i} fill={i === 0 ? '#16a34a' : '#dc2626'} />)}
                      <Label
                        value={kpis.diplomes_delivres}
                        position="center"
                        style={{ fontSize: '30px', fontWeight: 800, fill: 'var(--text)' }}
                      />
                      <Label
                        value="Total des diplômes"
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
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
        
        
        
        
        
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Certificats par type</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.certificats_par_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" fontSize={9} angle={-20} textAnchor="end" height={50} />
                    <YAxis fontSize={11} />
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
                    <Bar dataKey="nb" fill="#a14fff" />
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
                <h2>Alertes</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}>
                  <i className="fas fa-ban"></i>
                  <div>{alertes.diplomes_revoques_recents} diplôme(s) révoqué(s) récemment</div>
                </div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#ffb3b3' }}>
                  <i className="fas fa-tag"></i>
                  <div>{alertes.documents_sans_categorie} document(s) sans catégorie</div>
                </div>
              </div>
            </div>
        
        
        
        
            <div className="dash-graphique-card">

              <div className="table-title">
                <h2>Activité récente</h2>
              </div>
              
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '650px' }}>Événement</th>
                      <th style={{ minWidth: '100px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.activite_recente.map((a, i) => (
                      <tr key={i}>
                        <td className="cell-strong">{a.texte}</td>
                        <td>{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                    ))}
                    {donnees.activite_recente.length === 0 && <tr><td colSpan="2" style={{ color: '#9ca3af' }}>Aucune activité récente.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
        
          </div>
        
        )}





        <div className="department-kpi academique-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="count-top">
              <span>Diplômes délivrés</span>
              <h2 className='n-m'>{kpis.diplomes_delivres}</h2>
              <p className='t-m'>nombre délivrés</p>
            </div>
            <div className="kpi-icon violet">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
          </div>

          <div className="department-card">
            <div className="count-top">
              <span>Diplômes valides</span>
              <h2 className='m-m'>{kpis.diplomes_valides}</h2>
              <p className='m-e'>ceux validés</p>
            </div>
            <div className="kpi-icon green">
              <i class="fa-solid fa-file-circle-check"></i>
            </div>
          </div>
          
          <div className="department-card">
            <div className="count-top">
              <span>Diplômes révoqués</span>
              <h2 className='f-m'>{kpis.diplomes_revoques}</h2>
              <p className='f-e'>ceux révoqués</p>
            </div>
            <div className="kpi-icon red">
              <i class="fa-solid fa-file-circle-xmark"></i>
            </div>
          </div>
          
        </div>
      
      </div>
    
    </div>

  );

}



export default DashboardDocuments;

