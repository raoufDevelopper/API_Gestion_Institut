
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getDashboardFinance, getFiltresFinance } from '../../api/statistiques';
import '../../assets/css/crud.css';
import '../../assets/css/dashboard.css';
import { formatMontant } from '../../components/formatters';
import Loader from '../../components/Loader';



const ONGLETS = ['Vue générale', 'Analyses', 'Caisse & Alertes'];

const COULEURS = ['#16a34a', '#e63838', '#f97316', '#2563eb', '#a14fff', '#6b7280'];


function DashboardFinance() {
  const [donnees, setDonnees] = useState(null);
  const [options, setOptions] = useState({ annees_academiques: [], filieres: [], specialites: [], types_paiement: [], categories_depense: [], caisses: [], caissiers: [] });
  const [filtres, setFiltres] = useState({});
  const [ongletActif, setOngletActif] = useState(0);
  useEffect(() => { getFiltresFinance().then((res) => setOptions(res.data)); }, []);
  useEffect(() => { getDashboardFinance(filtres).then((res) => setDonnees(res.data)); }, [filtres]);
  const maj = (champ, valeur) => setFiltres((prev) => ({ ...prev, [champ]: valeur || undefined }));
  
  if (!donnees) return <Loader label="Chargement en cours..." />;
  
  const { kpis, situation_caisse, alertes } = donnees;



  return (
    <div className="container-principal">

      <div className="department-page">

        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '25px'}}>
              Tableau de board - Gestion financière
            </h3>
            <div className="sub">
              Visualisez les statistiques de la gestion 
              de vos finances
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
              {options.annees_academiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('filiere', e.target.value)}>
              <option value="">Filière</option>
              {options.filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('specialite', e.target.value)}>
              <option value="">Spécialité</option>
              {options.specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('type_frais', e.target.value)}>
              <option value="">Type de frais</option>
              {options.types_paiement.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </div>
          
        </div>





        <div className="department-toolbar">

          <div className="toolbar-left">
            <select onChange={(e) => maj('mode_paiement', e.target.value)}>
              <option value="">Mode de paiement</option>
              <option value="ESPECES">Espèces</option>
              <option value="CHEQUE">Chèque</option>
              <option value="VIREMENT">Virement</option>
              <option value="MOBILE">Mobile Money</option>
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('statut_paiement', e.target.value)}>
              <option value="">Statut paiement</option>
              <option value="VALIDE">Validé</option>
              <option value="ANNULE">Annulé</option>
              <option value="REMBOURSE">Remboursé</option>
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('caisse', e.target.value)}>
              <option value="">Caisse</option>
              {options.caisses.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select onChange={(e) => maj('caissier', e.target.value)}>
              <option value="">Caissier</option>
              {options.caissiers.map((c) => <option key={c.id} value={c.id}>{c.username}</option>)}
            </select>
          </div>
          
        </div>





        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card green border">
            <div className="kpi-icon green-icone">
              <i class="fa-solid fa-money-bill-trend-up"></i>
            </div>
            <div className="count-top">
              <span>Revenus</span>
              <h2 style={{ color: '#16a34a' }}>{formatMontant(kpis.total_revenus)}</h2>
              <p>revenus totale</p>
            </div>
          </div>

          <div className="department-card red border">
            <div className="kpi-icon red-icone">
              <i class="fa-solid fa-money-bill-transfer"></i>
            </div>
            <div className="count-top">
              <span>Dépenses</span>
              <h2 style={{ color: '#dc2626' }}>{formatMontant(kpis.total_depenses)}</h2>
              <p>exemplaires empruntés</p>
            </div>
          </div>

          {/*<div className="department-card green border">
            <div className="kpi-icon green-icone">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="count-top">
              <span>Paiements</span>
              <h2 style={{ color: '#16a34a' }}>{kpis.total_paiements}</h2>
              <p>exemplaires disponibles</p>
            </div>
          </div>*/}

        </div>


        <div className="department-kpi academique" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        
          <div className="department-card orange border">
            <div className="kpi-icon orange-icone">
              <i class="fa-solid fa-scale-balanced"></i>
            </div>
            <div className="count-top">
              <span>Solde</span>
              <h2 style={{ color: '#f97316' }}>{formatMontant(kpis.solde_financier)}</h2>
              <p>exemplaires réservés</p>
            </div>
          </div>
          
          
          <div className="department-card aqua border">
            <div className="kpi-icon aqua-icone">
              <i class="fa-solid fa-wallet"></i>
            </div>
            <div className="count-top">
              <span>Solde caisse</span>
              <h2 style={{ color: 'hsl(180, 23%, 46%)' }}>{formatMontant(kpis.solde_caisse_actuel)}</h2>
              <p>solde de la caisse actuelle</p>
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
              <div className="dash-graphique-titre">Évolution revenus / dépenses</div>
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
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
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
                    <Pie 
                      data={donnees.revenus_par_type_frais} dataKey="montant" nameKey="type" cx="50%" cy="50%" 
                      innerRadius={95} outerRadius={120}
                    >
                      {donnees.revenus_par_type_frais.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                      <Label
                        value= "*"
                        position="center"
                        style={{ fontSize: '30px', fontWeight: 800, fill: 'var(--text)' }}
                      />
                      <Label
                        value="types de frais"
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
              <div className="dash-graphique-titre">Dépenses par catégorie</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donnees.depenses_par_categorie}>
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
                    <Pie data={donnees.repartition_inscriptions} dataKey="nb" nameKey="statut" cx="50%" cy="50%" innerRadius={98} outerRadius={120}>
                      {donnees.repartition_inscriptions.map((entry, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                      <Label 
                        value= {kpis.total_paiements}
                        position="center"
                        style={{ fontSize: '30px', fontWeight: 800, fill: 'var(--text)' }}
                      />
                      <Label
                        value="Paiements enregistrés"
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
              <div className="dash-graphique-titre">Évolution des impayés</div>
              <div className="dash-graphique-zone">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donnees.evolution_impayes}>
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
              
              <div className="table-title"><h2>Situation de caisse</h2></div>
              
              {situation_caisse ? (
                
                <div className="dl-group" style={{ padding: 0 }}>

                  <div className="dl-row">
                    <span className="dl-k">Statut</span>
                    <span className="dl-v">
                      <span className={`badge ${situation_caisse.statut === 'OUVERTE' ? 'badge-success' : 'badge-orange'}`}>
                        <p className='bull'>&bull;</p>
                        {situation_caisse.statut}
                      </span>
                    </span>
                  </div>
                  
                  <div className="dl-row">
                    <span className="dl-k">Solde théorique</span>
                    <span className="dl-v">{formatMontant(situation_caisse.solde_theorique)}</span>
                  </div>
                  
                  {situation_caisse.solde_reel && 
                    <div className="dl-row">
                      <span className="dl-k">Solde réel</span>
                      <span className="dl-v">{formatMontant(situation_caisse.solde_reel)}</span>
                    </div>
                  }
                  
                  {situation_caisse.ecart && 
                    <div className="dl-row">
                      <span className="dl-k">Écart</span>
                      <span className="dl-v" style={{ color: parseFloat(situation_caisse.ecart) === 0 ? '#16a34a' : '#dc2626' }}>
                        {formatMontant(situation_caisse.ecart)}
                      </span>
                    </div>
                  }
                  
                  <div className="dl-row">
                    <span className="dl-k">Total entrées</span>
                    <span className="dl-v" style={{ color: '#16a34a' }}>
                      +{formatMontant(situation_caisse.total_entrees)}
                    </span>
                  </div>
                  
                  <div className="dl-row">
                    <span className="dl-k">Total sorties</span>
                    <span className="dl-v" style={{ color: '#dc2626' }}>
                      -{formatMontant(situation_caisse.total_sorties)}
                    </span>
                  </div>
                  
                  <div className="dl-row">
                    <span className="dl-k">Dernière ouverture</span>
                    <span className="dl-v">
                      {new Date(situation_caisse.date_session).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} 
                      <br /> 
                      <p className='sub'>{situation_caisse.heure_ouverture}</p>
                    </span>
                  </div>
                  
                  <div className="dl-row">
                    <span className="dl-k">Caissier</span>
                    <span className="dl-v">
                      <span className='badge-violet'>
                        <p className='bull'>&bull;</p>
                        {situation_caisse.ouverte_par || '—'}
                      </span>
                    </span>
                  </div>
                
                </div>

              ) : <div className="empty">Aucune session de caisse.</div>}

            </div>
            
            
            
            
            <div className="dash-graphique-card">
              <div className="table-title"><h2>Alertes</h2></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#ffc0c0' }}><i className="fas fa-lock-open"></i><div>{alertes.caisses_non_fermees} caisse(s) non fermée(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-scale-unbalanced"></i><div>{alertes.ecarts_caisse} écart(s) de caisse</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#ffc0c0' }}><i className="fas fa-rotate-left"></i><div>{alertes.remboursements} remboursement(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0 }}><i className="fas fa-triangle-exclamation"></i><div>{alertes.impayes_importants} impayé(s) important(s)</div></div>
                <div className="edt-alerte-conflits" style={{ margin: 0, background: '#ffc0c0' }}><i className="fas fa-money-bill-wave"></i><div>{alertes.depenses_importantes} dépense(s) importante(s)</div></div>
              </div>
            </div>
            
            
            
            
            <div className="dash-graphique-card" style={{ gridColumn: '1 / -1' }}>

              <div className="table-title">
                <h2>Transactions récentes</h2>
              </div>
                    
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '100px' }}>Type</th>
                      <th style={{ minWidth: '350px' }}>Libellé</th>
                      <th style={{ minWidth: '100px' }}>Date</th>
                      <th style={{ minWidth: '100px' }}>Montant</th>
                      <th style={{ minWidth: '50px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.transactions_recentes.map((t, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`badge ${t.type === 'Paiement' ? 'badge-success' : 'badge-danger'}`}>
                            <p className='bull'>&bull;</p>
                            {t.type}
                          </span>
                        </td>
                        <td className="cell-strong">{t.libelle}</td>
                        <td>{new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td>{formatMontant(t.montant)}</td>
                        <td>
                          <span className={`badge ${t.type === 'Paiement' ? 'badge-success' : 'badge-danger'}`}>
                            <p className='bull'>&bull;</p>
                            {t.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </div>

        )}





        <div className="department-kpi academique-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="count-top">
              <span>Excédent/Déficit</span>
              <h2 className='e-d'>{formatMontant(kpis.excedent_deficit)}</h2>
              <p className='e-d-t'>Excédents et/ou déficits</p>
            </div>
             <div className="kpi-icon orange">
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
          
          <div className="department-card">
            <div className="count-top">
              <span>En attente</span>
              <h2 className='p-a'>{kpis.nb_paiements_en_attente}</h2>
              <p className='p-a-t'>paiement en attente</p>
            </div>
            <div className="kpi-icon aqua">
              <i class="fa-solid fa-hourglass-half"></i>
            </div>
          </div>
          
        </div>


        <div className="department-kpi academique-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="department-card">
            <div className="count-top">
              <span>Impayés</span>
              <h2 className='f-m'>{formatMontant(kpis.total_impayes)}</h2>
              <p className='f-e'>total paiement non payés</p>
            </div>
            <div className="kpi-icon red">
              <i class="fa-solid fa-circle-exclamation"></i>
            </div>
          </div>

          <div className="department-card">
            <div className="count-top">
              <span>Remboursements</span>
              <h2 className='n-m'>{formatMontant(kpis.total_remboursements)}</h2>
              <p className='t-m'>paiements rembourcés</p>
            </div>
            <div className="kpi-icon violet">
              <i class="fa-solid fa-arrow-rotate-left"></i>
            </div>
          </div>
          
        </div>


      </div>

    </div>

  );

}




export default DashboardFinance;

