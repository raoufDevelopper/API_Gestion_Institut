import { useState, useEffect } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getDashboardAccueil } from '../api/statistiques';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import '../assets/css/crud.css';
import '../assets/css/dashboard.css';
import '../assets/css/accueil.css';





const COULEURS_BARRES = ['#2563eb', '#16a34a', '#be5bf7', '#f97316', '#06b6d4', '#dc2626', '#eab308'];


function BlocBarres({ titre, donnees, onVoirTout }) {
  const max = Math.max(...donnees.map((d) => d.nb), 1);
  return (
    <div className="dash-graphique-card">
      <div className="dash-graphique-titre">{titre}</div>
      <div>
        {donnees.slice(0, 6).map((d, i) => (
          <div className="stat-barre-ligne" key={i}>
            <span className="stat-barre-label" title={d.label}>{d.label}</span>
            <div className="stat-barre-track">
              <div className="stat-barre-fill" style={{ width: `${(d.nb / max) * 100}%`, background: COULEURS_BARRES[i % COULEURS_BARRES.length] }}></div>
            </div>
            <span className="stat-barre-valeur">{d.nb}</span>
          </div>
        ))}
        {donnees.length === 0 && <div className="empty">Aucune donnée.</div>}
      </div>
      {onVoirTout &&  (
        <button className="stat-barre-lien" onClick={onVoirTout}>
          Voir les spécialité par filière →
        </button>
      )}
    </div>
  );
}



function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donnees, setDonnees] = useState(null);
  const [modalFilieresOuvert, setModalFilieresOuvert] = useState(false);
  const [filiereOuverte, setFiliereOuverte] = useState(null);
  useEffect(() => { getDashboardAccueil().then((res) => setDonnees(res.data)); }, []);
  if (!donnees) return <div className="container-principal"><Loader label="Chargement de votre espace..." /></div>;
  const { kpis, aujourdhui, repartition_sexe } = donnees;
  const dateAujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const renderDelta = (delta) => {
    if (delta === null || delta === undefined) return <span style={{ color: '#9ca3af' }}>—</span>;
    const positif = delta >= 0;
    return (
      <span style={{ color: positif ? '#16a34a' : '#dc2626' }}>
        <i className={`fas fa-arrow-${positif ? 'up' : 'down'}`} style={{ fontSize: '9px', marginRight: '3px' }}></i>
        {positif ? '+' : ''}{delta}% par rapport au mois dernier
      </span>
    );
  };





  return (
    <div className="container-principal">
      <div className="accueil-page">
        
        <div className="accueil-banniere">
          <div>
            <h1>Salut {user?.username} 👋</h1>
            <p>Bienvenue dans votre espace utilsateur.</p>
          </div>
          <div className="accueil-banniere-date">
            <div style={{ textTransform: 'capitalize' }}>{dateAujourdhui} <i className="fas fa-calendar"></i></div>
            <div>Bonne journée !</div>
          </div>
        </div>




        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-user-graduate"></i></div>
            <div className="count-top"><span>Apprenants</span><h2>{kpis.apprenants.valeur}</h2><p>{renderDelta(kpis.apprenants.delta)}</p></div>
          </div>

          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-book-open"></i></div>
            <div className="count-top"><span>Matières</span><h2>{kpis.matieres.valeur}</h2><p>{renderDelta(kpis.matieres.delta)}</p></div>
          </div>

        </div>

        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-sitemap"></i></div>
            <div className="count-top"><span>Filières</span><h2>{kpis.filieres.valeur}</h2><p>{renderDelta(kpis.filieres.delta)}</p></div>
          </div>

          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-diagram-project"></i></div>
            <div className="count-top"><span>Spécialités</span><h2>{kpis.specialites.valeur}</h2><p>{renderDelta(kpis.specialites.delta)}</p></div>
          </div>

        </div>


        
        
        
        <div className="accueil-grille-3">
        
          <div className="dash-graphique-card">
            <div className="dash-graphique-titre">Évolution des inscriptions</div>
            <div className="dash-graphique-zone">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donnees.evolution_inscriptions}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mois" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '10px' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e5e7eb' }} />
                  <Line type="monotone" dataKey="nb" name="Inscriptions" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
    
          <div className="dash-graphique-card">
            <div className="dash-graphique-titre">Répartition des apprenants</div>
            <div className="dash-graphique-zone">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ n: 'Garçons', v: repartition_sexe.garcons }, { n: 'Filles', v: repartition_sexe.filles }]} dataKey="v" nameKey="n" 
                  cx="50%" cy="50%" innerRadius={95} outerRadius={120} paddingAngle={2}>
                    <Cell fill="#2563eb" />
                    <Cell fill="#ec4899" />
                    <Label value={repartition_sexe.total} position="center" style={{ fontSize: '25px', fontWeight: 800, fill: 'var(--text)' }} />
                    <Label value="Apprenants" position="center" dy={20} style={{ fontSize: '10px', fill: '#9ca3af' }} />
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '10px' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
              
        </div>
        
        
        


        
        <div className="accueil-grille-3">
        
          <BlocBarres titre="Apprenants par filière" donnees={donnees.apprenants_par_filiere} onVoirTout={() => setModalFilieresOuvert(true)} />
        
          <BlocBarres titre="Apprenants par spécialité" donnees={donnees.apprenants_par_specialite} />
        
          <BlocBarres titre="Apprenants par classe" donnees={donnees.apprenants_par_classe} />
        
        </div>






        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-chalkboard-teacher"></i></div>
            <div className="count-top"><span>Formateurs</span><h2>{kpis.formateurs.valeur}</h2><p>{renderDelta(kpis.formateurs.delta)}</p></div>
          </div>

          <div className="department-card">
            <div className="kpi-icon violet"><i className="fas fa-users"></i></div>
            <div className="count-top"><span>Personnel</span><h2>{kpis.personnel.valeur}</h2><p>{renderDelta(kpis.personnel.delta)}</p></div>
          </div>

        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-users-rectangle"></i></div>
            <div className="count-top"><span>Classes</span><h2>{kpis.classes.valeur}</h2><p><span style={{ color: '#9ca3af' }}>—</span></p></div>
          </div>

          {/*<div className="department-card">
            <div className="kpi-icon violet"><i className="fas fa-file-signature"></i></div>
            <div className="count-top"><span>Inscriptions</span><h2>{kpis.inscriptions.valeur}</h2><p>{renderDelta(kpis.inscriptions.delta)}</p></div>
          </div>*/}

          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-calendar-days"></i></div>
            <div className="count-top"><span>Emplois du temps actifs</span><h2>{kpis.emplois_du_temps_actifs.valeur}</h2><p><span style={{ color: '#9ca3af' }}>—</span></p></div>
          </div>

        </div>

      
      </div>
      
      
      
      
      
      
      
      {/* MODAL — filières & spécialités */}
      <div className="department-modal" style={{ display: modalFilieresOuvert ? 'flex' : 'none' }}>
        <div className="modal-content model-detail" style={{ maxWidth: '600px' }}>
          
          <div className="modal-header">
            <h2>Filières & spécialités</h2>
            <button onClick={() => setModalFilieresOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          

          <div className='modal-filiere'>
            {donnees.filieres_specialites.map((f) => (
              <div className="modal-filiere-bloc" key={f.id}>
                <div className="modal-filiere-entete" onClick={() => setFiliereOuverte(filiereOuverte === f.id ? null : f.id)}>
                  <span id='list-fil'>
                    {f.nom}
                    <p id='nbr-spe-fil'>{f.specialites.length}</p>
                  </span>
                  <i className={`fas fa-chevron-${filiereOuverte === f.id ? 'up' : 'down'}`}></i>
                </div>
                {filiereOuverte === f.id && (
                  <div>
                    {f.specialites.map((s) => (
                      <div className="modal-specialite-item" key={s.id}>
                        <span>{s.nom}</span>
                        <span className="badge-violet">
                          <p className='bull'>&bull;</p> {s.code}
                        </span>
                      </div>
                    ))}
                    {f.specialites.length === 0 && 
                      <div className="modal-specialite-item" style={{ color: '#9ca3af' }}>
                        Aucune spécialité.
                      </div>
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr />
                    
          <p id="consigne">
            Cliquez sur la filière concernée pour voir ses spécialités. 
            Vous ne pouvez visualiser que les spacialités d'une seule 
            filière à la fois.
          </p>


        </div>

      </div>



    </div>

  );

}


export default Dashboard;

