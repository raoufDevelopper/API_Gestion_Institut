import { useState, useEffect } from 'react';
import { getFinancesEtudiant } from '../../api/espaceEtudiant';
import Loader from '../../components/Loader';
import { formatMontant } from '../../components/formatters';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEtudiant.css';



function FinancesEtudiant() {
  const [anneeId, setAnneeId] = useState('');
  const [donnees, setDonnees] = useState(null);

  useEffect(() => { getFinancesEtudiant({ annee_academique: anneeId || undefined }).then((res) => setDonnees(res.data)); }, [anneeId]);

  if (!donnees) return <div className="container-principal"><Loader label="Chargement..." /></div>;



  return (
    <div className="container-principal">
      
      <div className="department-page">
      
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Mes finances</h3>
            <div className="sub">Suivez vos paiements et votre situation financière</div>
          </div>
          <div>
            <select value={anneeId} onChange={(e) => setAnneeId(e.target.value)}>
              <option value="toutes">Toutes les années confondues</option>
              {donnees.annees_disponibles.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>
        </div>
      
      
      
        {donnees.inscriptions.length === 0 && <div className="empty">Aucune inscription trouvée.</div>}
      
        {donnees.inscriptions.map((inscription, idx) => {
      
          const pct = parseFloat(inscription.total_du) > 0 ? Math.round((parseFloat(inscription.montant_paye) / parseFloat(inscription.total_du)) * 100) : 0;

          return (
            <div key={idx} style={{ marginBottom: '28px' }}>
              
              <h2 className="badge badge-violet anneeAca">
                <i className="fas fa-calendar"></i> {inscription.annee_academique}
              </h2>
              
              <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', marginBottom: '25px'}}>
                <div className="department-card">
                  <div className="kpi-icon violet">
                    <i className="fas fa-file-invoice"></i>
                  </div>
                  <div className="count-top">
                    <h2>{formatMontant(inscription.total_du)}</h2>
                    <span>Frais de formation</span>
                  </div>
                </div>

                <div className="department-card">
                  <div className="kpi-icon green">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="count-top">
                    <h2>{formatMontant(inscription.montant_paye)}</h2>
                    <span>Déjà payé</span>
                  </div>
                </div>
              </div>

              
              <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
                <div className="department-card">
                  <div className="kpi-icon red">
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <div className="count-top">
                    <h2>{formatMontant(inscription.reste_a_payer)}</h2>
                    <span>Reste à payer</span>
                  </div>
                </div>
                <p></p>
              </div>

              



              <div className="dash-graphique-card" style={{ margin: '25px 0' }}>
                <div className="dash-graphique-titre">Progression du paiement</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="ee-progress-track"><div className="ee-progress-fill" style={{ width: `${pct}%` }}></div></div>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{pct}%</span>
                </div>
              </div>



              <div className="department-card table-card" style={{ marginBottom: '25px' }}>
                <div className="table-title"><h2>Détail des frais</h2></div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Dû</th>
                        <th>Payé</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>{inscription.frais.map((f, i) => 
                      <tr key={i}>
                        <td className="cell-strong">{f.type}</td>
                        <td>{formatMontant(f.du)}</td>
                        <td>{formatMontant(f.paye)}</td>
                        <td>
                        <span className={`badge-${f.statut === 'PARTIEL' ? 'aqua' : f.statut === 'NON_PAYE' ? 'danger' : 'success'}`}>
                          <p className='bull'>&bull;</p>
                          {f.statut === 'PARTIEL' ? 'Partiel' : f.statut === 'NON_PAYE' ? 'Non payé' : 'Payé'}
                        </span>
                        </td>
                      </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              


              
              <div className="department-card table-card">
                <div className="table-title">
                  <h2>Historique des paiements</h2>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Reçu</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscription.paiements.map((p, i) => 
                        <tr key={i}>
                          <td className="mono">{p.numero_recu}</td>
                          <td>{p.type}</td>
                          <td> {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                          <td>{formatMontant(p.montant)}</td>
                          <td>{p.mode}</td>
                        </tr>
                      )}
                      {inscription.paiements.length === 0 && 
                        <tr>
                          <td colSpan="5" style={{ color: '#9ca3af' }}>
                            Aucun paiement enregistré.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>


            </div>

          );

        })}

      </div>

    </div>

  );

}


export default FinancesEtudiant;



