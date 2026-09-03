
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,} from 'recharts';
import { getDashboardAcademique, getFiltresAcademique } from '../../api/statistiques';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';

const ONGLETS = ['Vue générale', 'Analyses', 'Tableaux'];


function DashboardAcademique() {
  const [donnees, setDonnees] = useState(null);
  const [filtresOptions, setFiltresOptions] = useState({ annees_academiques: [], filieres: [], specialites: [], classes: [], niveaux: [], matieres: [] });
  const [filtres, setFiltres] = useState({});
  const [ongletActif, setOngletActif] = useState(0);
  useEffect(() => {
    getFiltresAcademique().then((res) => setFiltresOptions(res.data));
  }, []);
  useEffect(() => {
    getDashboardAcademique(filtres).then((res) => setDonnees(res.data));
  }, [filtres]);
 
 
  const maj = (champ, valeur) => setFiltres((prev) => ({ ...prev, [champ]: valeur || undefined }));
 
 
  if (!donnees) return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  
  
  const { kpis } = donnees;


  return (
    <div className="container-principal">
      <div className="dash-pag">
        <div className="dash-header">
          <h1>Résultats académiques</h1>
        </div>
        <div className="dash-filtres-bar">
          <select onChange={(e) => maj('annee_academique', e.target.value)}>
            <option value="">Année académique</option>
            {filtresOptions.annees_academiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
          <select onChange={(e) => maj('semestre', e.target.value)}>
            <option value="">Semestre</option>
            <option value="S1">Semestre 1</option>
            <option value="S2">Semestre 2</option>
          </select>
          <select onChange={(e) => maj('filiere', e.target.value)}>
            <option value="">Filière</option>
            {filtresOptions.filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
          <select onChange={(e) => maj('specialite', e.target.value)}>
            <option value="">Spécialité</option>
            {filtresOptions.specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
          <select onChange={(e) => maj('classe', e.target.value)}>
            <option value="">Classe</option>
            {filtresOptions.classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select onChange={(e) => maj('niveau', e.target.value)}>
            <option value="">Niveau</option>
            {filtresOptions.niveaux.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
          </select>
          <select onChange={(e) => maj('matiere', e.target.value)}>
            <option value="">Matière</option>
            {filtresOptions.matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
          <select onChange={(e) => maj('sexe', e.target.value)}>
            <option value="">Sexe</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
        <div className="dash-kpi-row">
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.apprenants_evalues}</div><div className="dash-kpi-label">Apprenants évalués</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.evaluations_realisees}</div><div className="dash-kpi-label">Évaluations réalisées</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.moyenne_generale ?? '—'}</div><div className="dash-kpi-label">Moyenne générale</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#16a34a' }}>{kpis.taux_reussite}%</div><div className="dash-kpi-label">Taux de réussite</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.taux_echec}%</div><div className="dash-kpi-label">Taux d'échec</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.meilleure_moyenne ?? '—'}</div><div className="dash-kpi-label">Meilleure moyenne</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.apprenants_en_difficulte}</div><div className="dash-kpi-label">En difficulté</div></div>
        </div>
        <div className="dash-tabs">
          {ONGLETS.map((label, i) => (
            <button key={i} className={`dash-tab ${ongletActif === i ? 'active' : ''}`} onClick={() => setOngletActif(i)}>{label}</button>
          ))}
        </div>




        {ongletActif === 0 && (
          <div className="dash-contenu">
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Évolution de la moyenne générale</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donnees.evolution_moyenne}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="annee" fontSize={11} />
                    <YAxis domain={[0, 20]} fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="moyenne" stroke="#400c7c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Taux de réussite par filière</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.taux_reussite_par_filiere} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} fontSize={11} />
                    <YAxis type="category" dataKey="filiere" fontSize={10} width={90} />
                    <Tooltip />
                    <Bar dataKey="taux_reussite" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}







        {ongletActif === 1 && (
          <div className="dash-contenu">
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition par tranche de notes</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.repartition_tranches}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tranche" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="nombre" fill="#a14fff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Moyenne par matière</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.moyenne_par_matiere}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="matiere" fontSize={9} angle={-20} textAnchor="end" height={50} />
                    <YAxis domain={[0, 20]} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="moyenne" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Performance hommes / femmes</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.comparaison_sexe}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sexe" fontSize={11} />
                    <YAxis domain={[0, 20]} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="moyenne" fill="#fb923c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Performance par classe</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.performance_par_classe} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 20]} fontSize={11} />
                    <YAxis type="category" dataKey="classe" fontSize={9} width={100} />
                    <Tooltip />
                    <Bar dataKey="moyenne" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}








        {ongletActif === 2 && (
          <div className="dash-contenu">
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Meilleurs apprenants</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Nom</th><th>Classe</th><th>Spécialité</th><th>Moyenne</th></tr></thead>
                  <tbody>
                    {donnees.top_apprenants.map((a, i) => (
                      <tr key={i}><td className="cell-strong">{a.nom}</td><td>{a.classe}</td><td>{a.specialite}</td><td><span className="badge badge-success"><span className="dot"></span>{a.moyenne}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Apprenants en difficulté</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Nom</th><th>Classe</th><th>Moyenne</th></tr></thead>
                  <tbody>
                    {donnees.apprenants_en_difficulte.map((a, i) => (
                      <tr key={i}><td className="cell-strong">{a.nom}</td><td>{a.classe}</td><td><span className="badge badge-danger"><span className="dot"></span>{a.moyenne}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dash-graphique-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-graphique-titre">Matières à fort taux d'échec</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Matière</th><th>Taux d'échec</th></tr></thead>
                  <tbody>
                    {donnees.matieres_fort_taux_echec.map((m, i) => (
                      <tr key={i}><td className="cell-strong">{m.matiere}</td><td><span className="badge badge-warning"><span className="dot"></span>{m.taux_echec}%</span></td></tr>
                    ))}
                    {donnees.matieres_fort_taux_echec.length === 0 && <tr><td colSpan="2" style={{ color: '#9ca3af' }}>Aucune matière au-dessus du seuil critique.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );

}


export default DashboardAcademique;
