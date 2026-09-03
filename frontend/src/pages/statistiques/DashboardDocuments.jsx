
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getDashboardDocuments, getFiltresDocuments } from '../../api/statistiques';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';
const ONGLETS = ['Vue générale', 'Analyses', 'Activité & Alertes'];
const COULEURS = ['#400c7c', '#16a34a', '#2563eb', '#fb923c', '#dc2626', '#6b7280'];
function DashboardDocuments() {
  const [donnees, setDonnees] = useState(null);
  const [options, setOptions] = useState({ categories: [], responsables: [] });
  const [filtres, setFiltres] = useState({});
  const [ongletActif, setOngletActif] = useState(0);
  useEffect(() => { getFiltresDocuments().then((res) => setOptions(res.data)); }, []);
  useEffect(() => { getDashboardDocuments(filtres).then((res) => setDonnees(res.data)); }, [filtres]);
  const maj = (champ, valeur) => setFiltres((prev) => ({ ...prev, [champ]: valeur || undefined }));
  if (!donnees) return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  const { kpis, alertes } = donnees;
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="dash-header"><h1>Gestion documentaire</h1></div>
        <div className="dash-filtres-bar">
          <input type="date" onChange={(e) => maj('date_debut', e.target.value)} title="Date début" />
          <input type="date" onChange={(e) => maj('date_fin', e.target.value)} title="Date fin" />
          <select onChange={(e) => maj('categorie', e.target.value)}>
            <option value="">Catégorie</option>
            {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select onChange={(e) => maj('concerne', e.target.value)}>
            <option value="">Concerne</option>
            <option value="etudiant">Étudiant</option>
            <option value="personnel">Personnel</option>
          </select>
          <select onChange={(e) => maj('responsable', e.target.value)}>
            <option value="">Responsable</option>
            {options.responsables.map((r) => <option key={r.id} value={r.id}>{r.username}</option>)}
          </select>
        </div>
        <div className="dash-kpi-row" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.total_documents}</div><div className="dash-kpi-label">Total</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.documents_ajoutes_periode}</div><div className="dash-kpi-label">Ajoutés (30j)</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.documents_divers}</div><div className="dash-kpi-label">Documents divers</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.diplomes_delivres}</div><div className="dash-kpi-label">Diplômes délivrés</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#16a34a' }}>{kpis.diplomes_valides}</div><div className="dash-kpi-label">Diplômes valides</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.diplomes_revoques}</div><div className="dash-kpi-label">Diplômes révoqués</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.certificats_delivres}</div><div className="dash-kpi-label">Certificats</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.documents_lies_etudiants}</div><div className="dash-kpi-label">Liés étudiants</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.documents_lies_personnel}</div><div className="dash-kpi-label">Liés personnel</div></div>
        </div>
        <div className="dash-tabs">
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
                    <Tooltip />
                    <Line type="monotone" dataKey="nb" stroke="#400c7c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition par type de document</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donnees.repartition_par_type} dataKey="nb" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                      {donnees.repartition_par_type.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
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
                    <Tooltip />
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
                    <Tooltip />
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
                    <Pie data={donnees.repartition_diplomes} dataKey="nb" nameKey="statut" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                      {donnees.repartition_diplomes.map((entry, i) => <Cell key={i} fill={i === 0 ? '#16a34a' : '#dc2626'} />)}
                    </Pie>
                    <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
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
                    <Tooltip />
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
              <div className="dash-graphique-titre">Alertes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}>
                  <i className="fas fa-ban"></i>
                  <div>{alertes.diplomes_revoques_recents} diplôme(s) révoqué(s) récemment</div>
                </div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fef9c3', borderColor: '#fde68a', color: '#854d0e' }}>
                  <i className="fas fa-tag"></i>
                  <div>{alertes.documents_sans_categorie} document(s) sans catégorie</div>
                </div>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Activité récente</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Événement</th><th>Date</th></tr></thead>
                  <tbody>
                    {donnees.activite_recente.map((a, i) => (
                      <tr key={i}><td className="cell-strong">{a.texte}</td><td>{new Date(a.date).toLocaleDateString('fr-FR')}</td></tr>
                    ))}
                    {donnees.activite_recente.length === 0 && <tr><td colSpan="2" style={{ color: '#9ca3af' }}>Aucune activité récente.</td></tr>}
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
export default DashboardDocuments;