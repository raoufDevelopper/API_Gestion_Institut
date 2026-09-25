import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccueilEnseignant } from '../../api/espaceEnseignant';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getResultatsMatieres } from '../../api/espaceEnseignant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEnseignant.css';
import '../../assets/css/dashboard.css';





function AccueilEnseignant() {
  const [donnees, setDonnees] = useState(null);

  const [resultats, setResultats] = useState(null);

  useEffect(() => { getResultatsMatieres().then((res) => setResultats(res.data)); }, []);

  const navigate = useNavigate();

  useEffect(() => { getAccueilEnseignant().then((res) => setDonnees(res.data)); }, []);



  if (!donnees) return <div className="container-principal"><Loader label="Chargement de votre espace..." /></div>;



  const { formateur, kpis, cours_aujourdhui } = donnees;



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Bonjour {formateur.prenom} 👋</h3>
            <div className="sub">Voici un aperçu de votre activité pédagogique.</div>
        </div>
        </div>
        
        

        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card"><div className="kpi-icon blue"><i className="fas fa-calendar-week"></i></div><div className="count-top"><h2>{kpis.seances_semaine}</h2><span>Séances cette semaine</span></div></div>
          <div className="department-card"><div className="kpi-icon violet"><i className="fas fa-users-rectangle"></i></div><div className="count-top"><h2>{kpis.nb_classes}</h2><span>Classes enseignées</span></div></div>
          <div className="department-card"><div className="kpi-icon green"><i className="fas fa-book"></i></div><div className="count-top"><h2>{kpis.nb_matieres}</h2><span>Matières enseignées</span></div></div>
        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card"><div className="kpi-icon orange"><i className="fas fa-user-graduate"></i></div><div className="count-top"><h2>{kpis.nb_etudiants}</h2><span>Étudiants</span></div></div>
          <div className="department-card"><div className="kpi-icon red"><i className="fas fa-triangle-exclamation"></i></div><div className="count-top"><h2>{kpis.notes_en_attente}</h2><span>Notes en attente</span></div></div>
          <div className="department-card"><div className="kpi-icon aqua"><i className="fas fa-chart-line"></i></div><div className="count-top"><h2>{kpis.moyenne_generale ?? '—'}/20</h2><span>Moyenne générale</span></div></div>
        </div>




        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="en-carte">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Cours d'aujourd'hui</h3>
            {cours_aujourdhui.map((c, i) => (
              <div className="accueil-agenda-item" key={i}>
                <div className="accueil-agenda-icone" style={{ background: 'rgba(188, 106, 255, 0.15)', color: '#be5bf7' }}><i className="fas fa-chalkboard"></i></div>
                <div className="accueil-agenda-corps"><div className="accueil-agenda-titre">{c.matiere} — {c.classe}</div><div className="accueil-agenda-sous">{c.heure_debut} - {c.heure_fin} · {c.salle}</div></div>
              </div>
            ))}
            {cours_aujourdhui.length === 0 && <div className="empty">Aucun cours aujourd'hui.</div>}
          </div>
        </div>


        
        {resultats && (
          <div className="dash-contenu">
              <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Résultats de mes matières</div>
              <div className="dash-graphique-zone">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultats.resultats_par_matiere}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="matiere" fontSize={10} angle={-15} textAnchor="end" height={50} />
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
                      <Bar dataKey="moyenne" fill="#400c7c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                  </ResponsiveContainer>
              </div>
              </div>
              <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Évolution des performances</div>
              <div className="dash-graphique-zone">
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="annee" type="category" allowDuplicatedCategory={false} fontSize={10} />
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
                      {resultats.evolution.map((e, i) => (
                      <Line key={i} data={e.points} dataKey="moyenne" name={e.matiere} stroke={['#400c7c', '#16a34a', '#dc2626', '#fb923c'][i % 4]} strokeWidth={2} />
                      ))}
                  </LineChart>
                  </ResponsiveContainer>
              </div>
              </div>
          </div>
        )}



        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="doc-quick-actions">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '15px' }}>Actions rapides</h3>
            <button className="doc-quick-btn violet" onClick={() => navigate('/espace-enseignant/saisie')}><i className="fas fa-pen-to-square"></i> Saisir des notes</button>
            <button className="doc-quick-btn outline" onClick={() => navigate('/espace-enseignant/planning')}><i className="fas fa-calendar-week"></i> Voir mon planning</button>
            <button className="doc-quick-btn outline" onClick={() => navigate('/espace-enseignant/etudiants')}><i className="fas fa-users"></i> Voir mes étudiants</button>
          </div>
          <p></p>
        </div>
        
      </div>
    </div>
  );
}
export default AccueilEnseignant;