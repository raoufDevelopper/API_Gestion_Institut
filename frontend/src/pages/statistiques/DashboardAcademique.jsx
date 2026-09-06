import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
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
function CarteKpi({ icone, couleurFond, couleurIcone, valeur, label, delta, sensPositifQuandHausse = true, sousTexte }) {
  let classeDelta = '';
  if (delta) {
    const estHausse = delta.sens === 'hausse';
    const estBon = sensPositifQuandHausse ? estHausse : !estHausse;
    classeDelta = `${estHausse ? 'hausse' : 'baisse'}-${estBon ? 'positive' : 'negative'}`;
  }
  return (
    <div className="dash-kpi-card-jolie">
      <div className="dash-kpi-corps">
        <div className="dash-kpi-valeur-j">{valeur}</div>
        <div className="dash-kpi-label-j">{label}</div>
        {sousTexte && <div className="dash-fiche-etudiant">{sousTexte}</div>}
        {delta && (
          <div className={`dash-kpi-delta ${classeDelta}`}>
            <i className={`fas fa-arrow-${delta.sens === 'hausse' ? 'up' : 'down'}`}></i>
            {delta.valeur > 0 ? '+' : ''}{delta.valeur}{typeof delta.valeur === 'number' ? '' : ''} vs période précédente
          </div>
        )}
      </div>
      <div className="dash-kpi-icone" style={{ background: couleurFond, color: couleurIcone }}>
        <i className={`fas ${icone}`}></i>
      </div>
    </div>
  );
}
function DashboardAcademique() {
  const [donnees, setDonnees] = useState(null);
  const [filtresOptions, setFiltresOptions] = useState({ annees_academiques: [], filieres: [], specialites: [], classes: [], niveaux: [], matieres: [] });
  const [filtres, setFiltres] = useState({});
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
  
  return (
    <div className="container-principal">
      <div className="dash-page">
        <div className="dash-header">
          <div>
            <h1>Résultats académiques</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="dash-btn-export" onClick={exporterPdf}><i className="fas fa-file-pdf"></i> PDF</button>
            <button className="dash-btn-export" onClick={exporterExcel}><i className="fas fa-file-excel"></i> Excel</button>
          </div>
        </div>
        <div className="dash-filtres-principaux">
          <div className="dash-pill-select">
            <i className="fas fa-calendar"></i>
            <select onChange={(e) => maj('annee_academique', e.target.value)}>
              <option value="">Année académique</option>
              {filtresOptions.annees_academiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>
          <div className="dash-pill-select">
            <i className="fas fa-star"></i>
            <select onChange={(e) => maj('semestre', e.target.value)}>
              <option value="">Semestre</option>
              <option value="S1">Semestre 1</option>
              <option value="S2">Semestre 2</option>
            </select>
          </div>
          <div className="dash-pill-select">
            <i className="fas fa-filter"></i>
            <select onChange={(e) => maj('filiere', e.target.value)}>
              <option value="">Filière</option>
              {filtresOptions.filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
          <button className="dash-btn-export" onClick={() => setFiltresAvancesOuverts(!filtresAvancesOuverts)}>
            <i className="fas fa-sliders"></i> Filtres avancés
          </button>
        </div>
        {filtresAvancesOuverts && (
          <div className="dash-filtres-avances">
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
        )}
        <div className="dash-kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <CarteKpi icone="fa-users" couleurFond="#dbeafe" couleurIcone="#1e40af" valeur={kpis.apprenants_evalues} label="Apprenants évalués" delta={comparaisons.apprenants_evalues} />
          <CarteKpi icone="fa-check-circle" couleurFond="#dcfce7" couleurIcone="#16a34a" valeur={`${kpis.taux_reussite}%`} label="Taux de réussite" delta={comparaisons.taux_reussite} />
          <CarteKpi icone="fa-times-circle" couleurFond="#fee2e2" couleurIcone="#dc2626" valeur={`${kpis.taux_echec}%`} label="Taux d'échec" delta={comparaisons.taux_echec} sensPositifQuandHausse={false} />
        </div>
        <div className="dash-kpi-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '10px' }}>
          <CarteKpi icone="fa-chart-line" couleurFond="#ffedd5" couleurIcone="#c2410c" valeur={`${kpis.moyenne_generale ?? '—'}/20`} label="Moyenne générale" delta={comparaisons.moyenne_generale} />
          <CarteKpi icone="fa-award" couleurFond="#ede4fb" couleurIcone="#400c7c" valeur={kpis.mentions} label="Mentions obtenues" sousTexte={`${kpis.taux_mentions}% des apprenants`} />
        </div>
        <div className="dash-tabs">
          {ONGLETS.map((label, i) => (
            <button key={i} className={`dash-tab ${ongletActif === i ? 'active' : ''}`} onClick={() => setOngletActif(i)}>{label}</button>
          ))}
        </div>
        {ongletActif === 0 && (
          <div className="dash-contenu">
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition des résultats globaux</div>
              <div className="dash-graphique-zone">
                <div className="dash-donut-conteneur">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={donnees.repartition_resultats} dataKey="nb" nameKey="statut"
                        cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} cornerRadius={6}
                      >
                        {donnees.repartition_resultats.map((entry, i) => <Cell key={i} fill={COULEURS_DONUT[entry.statut]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="dash-donut-legende">
                    {donnees.repartition_resultats.map((r) => {
                      const total = donnees.repartition_resultats.reduce((s, x) => s + x.nb, 0);
                      const pct = total ? ((r.nb / total) * 100).toFixed(1) : 0;
                      return (
                        <div className="dash-donut-legende-item" key={r.statut}>
                          <span className="dash-donut-dot" style={{ background: COULEURS_DONUT[r.statut] }}></span>
                          <span>{r.statut}<br /><b>{r.nb}</b> ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Répartition des moyennes</div>
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
                    <Tooltip />
                    <Bar dataKey="nombre" fill="url(#gradTranches)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Meilleure moyenne</div>
              {kpis.meilleure_moyenne ? (
                <div>
                  <div className="dash-kpi-valeur-j" style={{ color: '#16a34a' }}>{kpis.meilleure_moyenne.moyenne}/20</div>
                  <div className="dash-fiche-etudiant"><b>{kpis.meilleure_moyenne.nom}</b> — {kpis.meilleure_moyenne.matricule}</div>
                  <div className="dash-fiche-etudiant">{kpis.meilleure_moyenne.classe}</div>
                </div>
              ) : <div className="empty">Aucune donnée.</div>}
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Plus faible moyenne</div>
              {kpis.plus_faible_moyenne ? (
                <div>
                  <div className="dash-kpi-valeur-j" style={{ color: '#dc2626' }}>{kpis.plus_faible_moyenne.moyenne}/20</div>
                  <div className="dash-fiche-etudiant"><b>{kpis.plus_faible_moyenne.nom}</b> — {kpis.plus_faible_moyenne.matricule}</div>
                  <div className="dash-fiche-etudiant">{kpis.plus_faible_moyenne.classe}</div>
                </div>
              ) : <div className="empty">Aucune donnée.</div>}
            </div>
          </div>
        )}
        {ongletActif === 1 && (
          <div className="dash-contenu">
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Taux de réussite par filière (Top 5)</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.top_filieres} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} fontSize={11} />
                    <YAxis type="category" dataKey="filiere" fontSize={10} width={90} />
                    <Tooltip />
                    <Bar dataKey="taux_reussite" fill="#16a34a" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <button className="dash-mini-table-lien" onClick={() => setModalOuvert('filieres')}>Voir toutes les filières →</button>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Moyenne par matière</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.moyenne_par_matiere}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="matiere" fontSize={9} angle={-20} textAnchor="end" height={50} />
                    <YAxis domain={[0, 20]} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="moyenne" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <button className="dash-mini-table-lien" onClick={() => setModalOuvert('matieres')}>Voir toutes les matières →</button>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Performance hommes / femmes</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.comparaison_sexe}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="sexe" fontSize={11} />
                    <YAxis domain={[0, 20]} fontSize={11} />
                    <Tooltip />
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
                    <Tooltip />
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
              <div className="dash-graphique-titre">Top 10 des meilleurs apprenants</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>N°</th><th>Apprenant</th><th>Classe</th><th>Moyenne</th></tr></thead>
                  <tbody>
                    {donnees.top_apprenants.map((a, i) => (
                      <tr key={i}><td>{i + 1}</td><td className="cell-strong">{a.nom}</td><td>{a.classe}</td><td><span className="badge badge-success"><span className="dot"></span>{a.moyenne}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="dash-mini-table-lien" onClick={() => setModalOuvert('classement')}>Voir le classement complet →</button>
            </div>
            <div className="dash-graphique-card">
              <div className="dash-graphique-titre">Alertes académiques</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-user-graduate"></i><div>{alertes.apprenants_en_difficulte} apprenant(s) en redoublement</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#fef9c3', borderColor: '#fde68a', color: '#854d0e' }}><i className="fas fa-list"></i><div>{alertes.notes_manquantes} note(s) manquante(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#dbeafe', borderColor: '#bfdbfe', color: '#1e40af' }}><i className="fas fa-hourglass-half"></i><div>{alertes.deliberations_incompletes} délibération(s) incomplète(s)</div></div>
              </div>
            </div>
            <div className="dash-graphique-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-graphique-titre">Matières à fort taux d'échec</div>
              <div className="dash-table-scroll">
                <table>
                  <thead><tr><th>Matière</th><th>Taux d'échec</th></tr></thead>
                  <tbody>
                    {alertes.matieres_fort_taux_echec.map((m, i) => (
                      <tr key={i}><td className="cell-strong">{m.matiere}</td><td><span className="badge badge-warning"><span className="dot"></span>{m.taux_echec}%</span></td></tr>
                    ))}
                    {alertes.matieres_fort_taux_echec.length === 0 && <tr><td colSpan="2" style={{ color: '#9ca3af' }}>Aucune matière au-dessus du seuil critique.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* MODAL — voir toutes les filières */}
      <div className="department-modal" style={{ display: modalOuvert === 'filieres' ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Toutes les filières</h2>
            <button onClick={() => setModalOuvert(null)}><i className="fas fa-times"></i></button>
          </div>
          <div className="table-scroll" style={{ padding: '10px 20px 20px' }}>
            <table>
              <thead><tr><th>Filière</th><th>Apprenants</th><th>Moyenne</th><th>Taux de réussite</th></tr></thead>
              <tbody>
                {donnees.toutes_filieres.map((f, i) => (
                  <tr key={i}><td className="cell-strong">{f.filiere}</td><td>{f.apprenants}</td><td>{f.moyenne}</td><td>{f.taux_reussite}%</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
       {/* MODAL — voir toutes les matières */}
      <div className="department-modal" style={{ display: modalOuvert === 'matieres' ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Toutes les matières</h2>
            <button onClick={() => setModalOuvert(null)}><i className="fas fa-times"></i></button>
          </div>
          <div className="table-scroll" style={{ padding: '10px 20px 20px' }}>
            <table>
              <thead><tr><th>Matière</th><th>Moyenne</th></tr></thead>
              <tbody>
                {donnees.moyenne_par_matiere.map((m, i) => (
                  <tr key={i}><td className="cell-strong">{m.matiere}</td><td>{m.moyenne}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* MODAL — classement complet */}
      <div className="department-modal" style={{ display: modalOuvert === 'classement' ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Classement complet</h2>
            <button onClick={() => setModalOuvert(null)}><i className="fas fa-times"></i></button>
          </div>
          <div className="table-scroll" style={{ padding: '10px 20px 20px' }}>
            <table>
              <thead><tr><th>N°</th><th>Nom</th><th>Matricule</th><th>Classe</th><th>Moyenne</th><th>Mention</th></tr></thead>
              <tbody>
                {donnees.classement_complet.map((a, i) => (
                  <tr key={i}><td>{i + 1}</td><td className="cell-strong">{a.nom}</td><td className="mono">{a.matricule}</td><td>{a.classe}</td><td>{a.moyenne}</td><td>{a.mention}</td></tr>
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
          