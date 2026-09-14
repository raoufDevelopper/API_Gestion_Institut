
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,} from 'recharts';
import { getDashboardBibliotheque, getFiltresBibliotheque } from '../../api/statistiques';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';
import Loader from '../../components/Loader';


const ONGLETS = ['Vue générale', 'Analyses', 'Tableaux & Alertes'];

const COULEURS = ['#16a34a', '#d33c3c', '#f97316', '#6b7280', '#a14fff'];


function DashboardBibliotheque() {

  const [donnees, setDonnees] = useState(null);

  const [filtresOptions, setFiltresOptions] = useState({ annees_academiques: [], filieres: [], specialites: [], categories: [] });

  const [filtres, setFiltres] = useState({});

  const [ongletActif, setOngletActif] = useState(0);

  useEffect(() => { getFiltresBibliotheque().then((res) => setFiltresOptions(res.data)); }, []);

  useEffect(() => { getDashboardBibliotheque(filtres).then((res) => setDonnees(res.data)); }, [filtres]);

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
              Tableau de board - Bibliothèque
            </h3>
            <div className="sub">
              Visualisez les statistiques de la gestion 
              de votre Bibliothèque
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
            <select onChange={(e) => maj('annee_academique', e.target.value)}>
              <option value="">Année académique</option>
              {filtresOptions.annees_academiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('filiere', e.target.value)}>
              <option value="">Filière</option>
              {filtresOptions.filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('specialite', e.target.value)}>
              <option value="">Spécialité</option>
              {filtresOptions.specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
          
        </div>


        <div className="department-toolbar">

          <div className="toolbar-left">
            <select onChange={(e) => maj('type_utilisateur', e.target.value)}>
              <option value="">Type d'utilisateur</option>
              <option value="ETUDIANT">Apprenants</option>
              <option value="FORMATEUR">Formateurs</option>
              <option value="PERSONNEL">Personnels</option>
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('statut_emprunt', e.target.value)}>
              <option value="">Statut emprunt</option>
              <option value="EN_COURS">En cours</option>
              <option value="RETOURNE">Retourné</option>
              <option value="EN_RETARD">En retard</option>
              <option value="PERDU">Perdu</option>
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('categorie', e.target.value)}>
              <option value="">Catégorie de livre</option>
              {filtresOptions.categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          
        </div>





        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card blue border">
            <div className="kpi-icon blue-icone">
              <i className="fas fa-book"></i>
            </div>
            <div className="count-top">
              <span>Livres</span>
              <h2>{kpis.nb_livres}</h2>
              <p>lives enregistrés</p>
            </div>
          </div>

          <div className="department-card violet border">
            <div className="kpi-icon violet-icone">
              <i className="fas fa-copy"></i>
            </div>
            <div className="count-top">
              <span>Exemplaires</span>
              <h2>{kpis.nb_exemplaires}</h2>
              <p>nombre d'exemplaires</p>
            </div>
          </div>
          
          <div className="department-card green border">
            <div className="kpi-icon green-icone">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="count-top">
              <span>Disponibles</span>
              <h2>{kpis.exemplaires_disponibles}</h2>
              <p>exemplaires disponibles</p>
            </div>
          </div>

        </div>


        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card orange border">
            <div className="kpi-icon orange-icone">
              <i className="fas fa-bookmark"></i>
            </div>
            <div className="count-top">
              <span>Réservations</span>
              <h2>{kpis.reservations_attente}</h2>
              <p>exemplaires réservés</p>
            </div>
          </div>
          
          
          <div className="department-card aqua border">
            <div className="kpi-icon aqua-icone">
              <i className="fas fa-users"></i>
            </div>
            <div className="count-top">
              <span>Lecteurs actifs</span>
              <h2>{kpis.lecteurs_actifs}</h2>
              <p>nombre de lecteurs</p>
            </div>
          </div>

          
          <div className="department-card red border">
            <div className="kpi-icon red-icone">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="count-top">
              <span>Empruntés</span>
              <h2>{kpis.exemplaires_empruntes}</h2>
              <p>exemplaires empruntés</p>
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
              <div className="dash-graphique-titre">Évolution des emprunts</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donnees.evolution_emprunts}>
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
                    <Line type="monotone" dataKey="nb" stroke="#a14fff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
        
        
        
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition des exemplaires</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donnees.repartition_exemplaires} dataKey="nb" nameKey="statut" cx="50%" cy="50%" innerRadius={95} outerRadius={120}>
                      {donnees.repartition_exemplaires.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
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
              <div className="dash-graphique-titre">Emprunts par catégorie</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.emprunts_par_categorie}>
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
              <div className="dash-graphique-titre">Emprunts par type d'utilisateur</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.emprunts_par_type_utilisateur}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" fontSize={11} />
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
                    <Bar dataKey="nb" fill="#fb923c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>



            <div className="dash-graphique-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-graphique-titre">Top 10 livres les plus empruntés</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.top_livres} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis type="category" dataKey="titre" fontSize={9} width={110} />
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
                    <Bar dataKey="nb" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        )}
        
        
        
        {ongletActif === 2 && (
          <div className="dash-contenu">
        
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Alertes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-clock"></i><div>{alertes.nb_retards} emprunt(s) en retard</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fec3c3' }}><i className="fas fa-fire"></i><div>{alertes.livres_tres_demandes} livre(s) très demandé(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-triangle-exclamation"></i><div>{alertes.exemplaires_perdus} exemplaire(s) perdu(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fec3c3' }}><i className="fas fa-screwdriver-wrench"></i><div>{alertes.exemplaires_endommages} exemplaire(s) endommagé(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-money-bill"></i><div>{alertes.penalites_impayees} pénalité(s) impayée(s)</div></div>
              </div>
            </div>
        
    

            <div className="department-card table-card">
                  
              <div className="table-title">
                <h2>Emprunts en retard</h2>
              </div>
              
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Livre</th>
                      <th>Jours retard</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.retards.map((r, i) => (
                      <tr key={i}>
                        <td className="cell-strong">{r.utilisateur}</td>
                        <td>{r.livre}</td>
                        <td>
                          <span className="badge badge-danger">
                            <p className='bull'>&bull;</p>
                            {r.jours_retard}jours
                          </span>
                        </td>
                      </tr>
                    ))}
                    {donnees.retards.length === 0 && <tr><td colSpan="3" style={{ color: '#9ca3af' }}>Aucun retard.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
        
        
        
            <div className="department-card table-card" style={{ gridColumn: '1 / -1' }}>

              <div className="table-title">
                <h2>Réservations en attente</h2>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Ressource</th>
                      <th>Date</th>
                      <th>Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.reservations_attente.map((r, i) => (
                      <tr key={i}>
                        <td className="cell-strong">{r.utilisateur}</td>
                        <td>{r.ressource}</td>
                        <td>{r.date}</td>
                        <td>{r.position}</td>
                      </tr>
                    ))}
                    {donnees.reservations_attente.length === 0 && <tr><td colSpan="4" style={{ color: '#9ca3af' }}>Aucune réservation en attente.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        
        )}




        <div className="department-kpi academique-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="count-top">
              <span>En cours</span>
              <h2 className='m-m'>{kpis.emprunts_en_cours}</h2>
              <p className='m-e'>emprunts en cours</p>
            </div>
             <div className="kpi-icon green">
              <i className="fas fa-book-reader"></i>
            </div>
          </div>
          
          <div className="department-card">
            <div className="count-top">
              <span>En retard</span>
              <h2 className='f-m'>{kpis.emprunts_en_retard}</h2>
              <p className='f-e'>emprunts en retard</p>
            </div>
            <div className="kpi-icon red">
              <i className="fas fa-triangle-exclamation"></i>
            </div>
          </div>
          
        </div>


        <div className="department-kpi academique-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="count-top">
              <span>Pénalités</span>
              <h2 className='f-m'>{kpis.penalites_generees}</h2>
              <p className='f-e'>nombre de pénalités</p>
            </div>
            <div className="kpi-icon red">
              <i className="fas fa-gavel"></i>
            </div>
          </div>

          <div className="department-card">
            <div className="count-top">
              <span>Emprunts période</span>
              <h2 className='n-m'>{kpis.emprunts_periode}</h2>
              <p className='t-m'>périodes d'emprunt</p>
            </div>
            <div className="kpi-icon violet">
              <i className="fas fa-calendar"></i>
            </div>
          </div>
          
        </div>
      
      </div>
    
    </div>

  );

}


export default DashboardBibliotheque;

