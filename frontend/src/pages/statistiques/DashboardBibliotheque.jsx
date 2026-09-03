
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getDashboardBibliotheque, getFiltresBibliotheque } from '../../api/statistiques';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';
const ONGLETS = ['Vue générale', 'Analyses', 'Tableaux & Alertes'];
const COULEURS = ['#16a34a', '#dc2626', '#fb923c', '#6b7280', '#a14fff'];
function DashboardBibliotheque() {
  const [donnees, setDonnees] = useState(null);
  const [filtresOptions, setFiltresOptions] = useState({ annees_academiques: [], filieres: [], specialites: [], categories: [] });
  const [filtres, setFiltres] = useState({});
  const [ongletActif, setOngletActif] = useState(0);
  useEffect(() => { getFiltresBibliotheque().then((res) => setFiltresOptions(res.data)); }, []);
  useEffect(() => { getDashboardBibliotheque(filtres).then((res) => setDonnees(res.data)); }, [filtres]);
  const maj = (champ, valeur) => setFiltres((prev) => ({ ...prev, [champ]: valeur || undefined }));
  if (!donnees) return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  const { kpis, alertes } = donnees;
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="dash-header"><h1>Bibliothèque</h1></div>
        <div className="dash-filtres-bar">
          <input type="date" onChange={(e) => maj('date_debut', e.target.value)} title="Date début" />
          <input type="date" onChange={(e) => maj('date_fin', e.target.value)} title="Date fin" />
          <select onChange={(e) => maj('annee_academique', e.target.value)}>
            <option value="">Année académique</option>
            {filtresOptions.annees_academiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
          <select onChange={(e) => maj('filiere', e.target.value)}>
            <option value="">Filière</option>
            {filtresOptions.filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
          <select onChange={(e) => maj('specialite', e.target.value)}>
            <option value="">Spécialité</option>
            {filtresOptions.specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
          <select onChange={(e) => maj('categorie', e.target.value)}>
            <option value="">Catégorie de livre</option>
            {filtresOptions.categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select onChange={(e) => maj('type_utilisateur', e.target.value)}>
            <option value="">Type d'utilisateur</option>
            <option value="ETUDIANT">Apprenants</option>
            <option value="FORMATEUR">Formateurs</option>
            <option value="PERSONNEL">Personnels</option>
          </select>
          <select onChange={(e) => maj('statut_emprunt', e.target.value)}>
            <option value="">Statut emprunt</option>
            <option value="EN_COURS">En cours</option>
            <option value="RETOURNE">Retourné</option>
            <option value="EN_RETARD">En retard</option>
            <option value="PERDU">Perdu</option>
          </select>
        </div>
        <div className="dash-kpi-row" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.nb_livres}</div><div className="dash-kpi-label">Livres</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.nb_exemplaires}</div><div className="dash-kpi-label">Exemplaires</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#16a34a' }}>{kpis.exemplaires_disponibles}</div><div className="dash-kpi-label">Disponibles</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.exemplaires_empruntes}</div><div className="dash-kpi-label">Empruntés</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.emprunts_en_cours}</div><div className="dash-kpi-label">En cours</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.emprunts_en_retard}</div><div className="dash-kpi-label">En retard</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.lecteurs_actifs}</div><div className="dash-kpi-label">Lecteurs actifs</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.emprunts_periode}</div><div className="dash-kpi-label">Emprunts période</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#fb923c' }}>{kpis.reservations_attente}</div><div className="dash-kpi-label">Réservations</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.penalites_generees}</div><div className="dash-kpi-label">Pénalités</div></div>
        </div>
        <div className="dash-tabs">
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
                    <Tooltip />
                    <Line type="monotone" dataKey="nb" stroke="#400c7c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition des exemplaires</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donnees.repartition_exemplaires} dataKey="nb" nameKey="statut" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                      {donnees.repartition_exemplaires.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
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
              <div className="dash-graphique-titre">Emprunts par catégorie</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.emprunts_par_categorie}>
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
              <div className="dash-graphique-titre">Top 10 livres les plus empruntés</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.top_livres} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis type="category" dataKey="titre" fontSize={9} width={110} />
                    <Tooltip />
                    <Bar dataKey="nb" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-graphique-titre">Emprunts par type d'utilisateur</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.emprunts_par_type_utilisateur}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="nb" fill="#fb923c" />
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
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fef9c3', borderColor: '#fde68a', color: '#854d0e' }}><i className="fas fa-fire"></i><div>{alertes.livres_tres_demandes} livre(s) très demandé(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-triangle-exclamation"></i><div>{alertes.exemplaires_perdus} exemplaire(s) perdu(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fef9c3', borderColor: '#fde68a', color: '#854d0e' }}><i className="fas fa-screwdriver-wrench"></i><div>{alertes.exemplaires_endommages} exemplaire(s) endommagé(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-money-bill"></i><div>{alertes.penalites_impayees} pénalité(s) impayée(s)</div></div>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Emprunts en retard</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Utilisateur</th><th>Livre</th><th>Jours retard</th></tr></thead>
                  <tbody>
                    {donnees.retards.map((r, i) => (
                      <tr key={i}><td className="cell-strong">{r.utilisateur}</td><td>{r.livre}</td><td><span className="badge badge-danger"><span className="dot"></span>{r.jours_retard}j</span></td></tr>
                    ))}
                    {donnees.retards.length === 0 && <tr><td colSpan="3" style={{ color: '#9ca3af' }}>Aucun retard.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dash-graphique-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-graphique-titre">Réservations en attente</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Utilisateur</th><th>Ressource</th><th>Date</th><th>Position</th></tr></thead>
                  <tbody>
                    {donnees.reservations_attente.map((r, i) => (
                      <tr key={i}><td className="cell-strong">{r.utilisateur}</td><td>{r.ressource}</td><td>{r.date}</td><td>{r.position}</td></tr>
                    ))}
                    {donnees.reservations_attente.length === 0 && <tr><td colSpan="4" style={{ color: '#9ca3af' }}>Aucune réservation en attente.</td></tr>}
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
export default DashboardBibliotheque;