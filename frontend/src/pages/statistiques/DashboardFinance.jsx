
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getDashboardFinance, getFiltresFinance } from '../../api/statistiques';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';


const ONGLETS = ['Vue générale', 'Analyses', 'Caisse & Alertes'];

const COULEURS = ['#16a34a', '#dc2626', '#fb923c', '#2563eb', '#a14fff', '#6b7280'];


function DashboardFinance() {
  const [donnees, setDonnees] = useState(null);
  const [options, setOptions] = useState({ annees_academiques: [], filieres: [], specialites: [], types_paiement: [], categories_depense: [], caisses: [], caissiers: [] });
  const [filtres, setFiltres] = useState({});
  const [ongletActif, setOngletActif] = useState(0);
  useEffect(() => { getFiltresFinance().then((res) => setOptions(res.data)); }, []);
  useEffect(() => { getDashboardFinance(filtres).then((res) => setDonnees(res.data)); }, [filtres]);
  const maj = (champ, valeur) => setFiltres((prev) => ({ ...prev, [champ]: valeur || undefined }));
  if (!donnees) return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  const { kpis, situation_caisse, alertes } = donnees;



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="dash-header"><h1>Finance</h1></div>
        
        <div className="dash-filtres-bar">
          <input type="date" onChange={(e) => maj('date_debut', e.target.value)} title="Date début" />
          <input type="date" onChange={(e) => maj('date_fin', e.target.value)} title="Date fin" />
          <select onChange={(e) => maj('annee_academique', e.target.value)}>
            <option value="">Année académique</option>
            {options.annees_academiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
          <select onChange={(e) => maj('filiere', e.target.value)}>
            <option value="">Filière</option>
            {options.filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
          <select onChange={(e) => maj('specialite', e.target.value)}>
            <option value="">Spécialité</option>
            {options.specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
          <select onChange={(e) => maj('type_frais', e.target.value)}>
            <option value="">Type de frais</option>
            {options.types_paiement.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
          </select>
          <select onChange={(e) => maj('mode_paiement', e.target.value)}>
            <option value="">Mode de paiement</option>
            <option value="ESPECES">Espèces</option>
            <option value="CHEQUE">Chèque</option>
            <option value="VIREMENT">Virement</option>
            <option value="MOBILE">Mobile Money</option>
          </select>
          <select onChange={(e) => maj('statut_paiement', e.target.value)}>
            <option value="">Statut paiement</option>
            <option value="VALIDE">Validé</option>
            <option value="ANNULE">Annulé</option>
            <option value="REMBOURSE">Remboursé</option>
          </select>
          <select onChange={(e) => maj('caisse', e.target.value)}>
            <option value="">Caisse</option>
            {options.caisses.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
          </select>
          <select onChange={(e) => maj('caissier', e.target.value)}>
            <option value="">Caissier</option>
            {options.caissiers.map((c) => <option key={c.id} value={c.id}>{c.username}</option>)}
          </select>
        </div>
        <div className="dash-kpi-row" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#16a34a' }}>{kpis.total_revenus} F</div><div className="dash-kpi-label">Revenus</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.total_depenses} F</div><div className="dash-kpi-label">Dépenses</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.solde_financier} F</div><div className="dash-kpi-label">Solde</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.excedent_deficit} F</div><div className="dash-kpi-label">Excédent/Déficit</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.total_paiements}</div><div className="dash-kpi-label">Paiements</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#dc2626' }}>{kpis.total_impayes} F</div><div className="dash-kpi-label">Impayés</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.total_remboursements} F</div><div className="dash-kpi-label">Remboursements</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur">{kpis.solde_caisse_actuel} F</div><div className="dash-kpi-label">Solde caisse</div></div>
          <div className="dash-kpi-card"><div className="dash-kpi-valeur" style={{ color: '#fb923c' }}>{kpis.nb_paiements_en_attente}</div><div className="dash-kpi-label">En attente</div></div>
        </div>
        <div className="dash-tabs">
          {ONGLETS.map((label, i) => (
            <button key={i} className={`dash-tab ${ongletActif === i ? 'active' : ''}`} onClick={() => setOngletActif(i)}>{label}</button>
          ))}
        </div>
        {ongletActif === 0 && (
          <div className="dash-contenu">
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Évolution revenus / dépenses</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donnees.evolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="revenus" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="depenses" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Revenus par type de frais</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donnees.revenus_par_type_frais} dataKey="montant" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                      {donnees.revenus_par_type_frais.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
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
              <div className="dash-graphique-titre">Dépenses par catégorie</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.depenses_par_categorie}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categorie" fontSize={9} angle={-20} textAnchor="end" height={50} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="montant" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Revenus par filière</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.revenus_par_filiere} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis type="category" dataKey="filiere" fontSize={10} width={100} />
                    <Tooltip />
                    <Bar dataKey="montant" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition des paiements</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donnees.repartition_inscriptions} dataKey="nb" nameKey="statut" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                      {donnees.repartition_inscriptions.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Évolution des impayés</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donnees.evolution_impayes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="montant" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {ongletActif === 2 && (
          <div className="dash-contenu">
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Situation de caisse</div>
              {situation_caisse ? (
                <div className="dl-group" style={{ padding: 0 }}>
                  <div className="dl-row"><span className="dl-k">Statut</span><span className="dl-v"><span className={`badge ${situation_caisse.statut === 'OUVERTE' ? 'badge-warning' : 'badge-blue'}`}><span className="dot"></span>{situation_caisse.statut}</span></span></div>
                  <div className="dl-row"><span className="dl-k">Solde théorique</span><span className="dl-v">{situation_caisse.solde_theorique} F</span></div>
                  {situation_caisse.solde_reel && <div className="dl-row"><span className="dl-k">Solde réel</span><span className="dl-v">{situation_caisse.solde_reel} F</span></div>}
                  {situation_caisse.ecart && <div className="dl-row"><span className="dl-k">Écart</span><span className="dl-v" style={{ color: parseFloat(situation_caisse.ecart) === 0 ? '#16a34a' : '#dc2626' }}>{situation_caisse.ecart} F</span></div>}
                  <div className="dl-row"><span className="dl-k">Total entrées</span><span className="dl-v" style={{ color: '#16a34a' }}>+{situation_caisse.total_entrees} F</span></div>
                  <div className="dl-row"><span className="dl-k">Total sorties</span><span className="dl-v" style={{ color: '#dc2626' }}>-{situation_caisse.total_sorties} F</span></div>
                  <div className="dl-row"><span className="dl-k">Dernière ouverture</span><span className="dl-v">{situation_caisse.date_session} {situation_caisse.heure_ouverture}</span></div>
                  <div className="dl-row"><span className="dl-k">Caissier</span><span className="dl-v">{situation_caisse.ouverte_par || '—'}</span></div>
                </div>
              ) : <div className="empty">Aucune session de caisse.</div>}
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Alertes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-triangle-exclamation"></i><div>{alertes.impayes_importants} impayé(s) important(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-scale-unbalanced"></i><div>{alertes.ecarts_caisse} écart(s) de caisse</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fef9c3', borderColor: '#fde68a', color: '#854d0e' }}><i className="fas fa-lock-open"></i><div>{alertes.caisses_non_fermees} caisse(s) non fermée(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#dbeafe', borderColor: '#bfdbfe', color: '#1e40af' }}><i className="fas fa-rotate-left"></i><div>{alertes.remboursements} remboursement(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fef9c3', borderColor: '#fde68a', color: '#854d0e' }}><i className="fas fa-money-bill-wave"></i><div>{alertes.depenses_importantes} dépense(s) importante(s)</div></div>
              </div>
            </div>
            <div className="dash-graphique-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-graphique-titre">Transactions récentes</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Type</th><th>Libellé</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
                  <tbody>
                    {donnees.transactions_recentes.map((t, i) => (
                      <tr key={i}>
                        <td><span className={`badge ${t.type === 'Paiement' ? 'badge-success' : 'badge-danger'}`}><span className="dot"></span>{t.type}</span></td>
                        <td className="cell-strong">{t.libelle}</td>
                        <td>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                        <td>{t.montant} F</td>
                        <td>{t.statut}</td>
                      </tr>
                    ))}
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
export default DashboardFinance;