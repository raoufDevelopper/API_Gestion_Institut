import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMonReleveComplet } from '../../api/espaceEtudiant';
import { useParametre } from '../../context/ParametreContext';
import Loader from '../../components/Loader';
import '../../assets/css/monReleve.css';




function MonReleve() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { parametre } = useParametre();
  const [donnees, setDonnees] = useState(null);
  const anneeId = searchParams.get('annee');
  const periode = searchParams.get('periode') || 'S1';

  useEffect(() => {
    getMonReleveComplet({ annee_academique: anneeId, periode }).then((res) => setDonnees(res.data));
  }, [anneeId, periode]);

  if (!donnees) return <div className="container-principal"><Loader label="Chargement du relevé..." /></div>;


  const { etudiant, kpis, matieres, decision_label, decision_sous_texte } = donnees;

  const labelPeriode = periode === 'S1' ? 'Semestre 1' : periode === 'S2' ? 'Semestre 2' : 'Année complète';

  const dateGeneration = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });


  return (
    <div className="container-principal">
      <div className="department-page">
        
        {/*
        <button className="rel-retour" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> 
          Retour à mes résultats
        </button>
        */}



        <div className="rel-doc-institut">
          {parametre?.logo && <img src={parametre.logo} alt="logo" />}
          <div><h4>{parametre?.nom || 'Institut de formation'}</h4><p>{parametre?.sigle || ''}</p></div>
        </div>




        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="rel-doc-entete">

            <div className="rel-doc-titre-centre">
              <h2>RELEVÉ DE NOTES</h2>
              <p>{labelPeriode} — {donnees.annee_academique}</p>
            </div>
            
            <div className="rel-doc-meta">
              <div>Le {dateGeneration}</div>
              <div>N° : {donnees.numero_releve}</div>
            </div>
            
          </div>

        </div>






        {/* info-perso */}
        <div className="info-perso">

          <div class="card-perso-mere">

            <div class="card-perso">
              <div class="card-img">
                {etudiant.photo ? <img src={etudiant.photo} alt={etudiant.nom} /> : <div className="rel-avatar-placeholder"><i className="fas fa-user"></i></div>}
              </div>
              
              <div class="card-content-perso">
                <h3>{etudiant.nom} {etudiant.prenom}</h3>
                <p>{etudiant.matricule}</p>
                <span className='badge-success'>
                  <i className="fas fa-circle-check"></i> 
                  Étudiant actif
                </span>
              </div>
            </div>


            <div className="dl-group" style={{ width: '100%' }}>

              <h3>Informations Personnelles</h3>

              <div className="dl-row">
                <span className="dl-k"><i className="fas fa-id-card"></i> Matricule</span>
                <span className="dl-v">{etudiant.matricule}</span>
              </div>

              <div className="dl-row">
                <span className="dl-k"><i className="fas fa-calendar"></i> Date de naissance</span>
                <span className="dl-v">{etudiant.date_naissance ? new Date(etudiant.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
              </div>

              <div className="dl-row">
                <span className="dl-k"><i className="fas fa-venus-mars"></i> Sexe</span>
                <span className="dl-v">{etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>

              <div className="dl-row">
                <span className="dl-k"><i className="fas fa-phone"></i> Téléphone</span>
                <span className="dl-v">{etudiant.telephone || '—'}</span>
              </div>

              <div className="dl-row">
                <span className="dl-k"><i className="fas fa-envelope"></i> Email</span>
                <span className="dl-v">{etudiant.email || '—'}</span>
              </div>

              <div className="dl-row" style={{ marginBottom: '20px' }}>
                <span className="dl-k">
                  <i className="fas fa-location-dot"></i> Adresse
                </span>
                <span className="dl-v">{etudiant.adresse || '—'}</span>
              </div>

            </div>

          </div>


          <div className="dl-group" style={{ padding: '0 20px', marginTop: '-10px' }}>

            <h3>Informations Académiques</h3>

            <div className="dl-row">
              <span className="dl-k">
                <i className="fas fa-calendar-days"></i> Année académique
              </span>
              <span className="dl-v">{donnees.annee_academique}</span>
            </div>

            <div className="dl-row">
              <span className="dl-k">
                <i className="fas fa-users-rectangle"></i> Classe
              </span>
              <span className="dl-v">{etudiant.classe}</span>
            </div>

            <div className="dl-row">
              <span className="dl-k">
                <i className="fas fa-diagram-project"></i> Spécialité
              </span>
              <span className="dl-v">{etudiant.specialite}</span>
            </div>

            <div className="dl-row">
              <span className="dl-k">
                <i className="fas fa-sitemap"></i> Filière
              </span>
              <span className="dl-v">{etudiant.filiere}</span>
            </div>

            <div className="dl-row">
              <span className="dl-k">
                <i className="fas fa-layer-group"></i> Niveau
              </span>
              <span className="dl-v">{etudiant.niveau}</span>
            </div>

            <div className="dl-row">
              <span className="dl-k">
                <i className="fas fa-calendar-days"></i> Période
              </span>
              <span className="dl-v">{labelPeriode}</span>
            </div>

          </div>

        </div>

        
        





        {/* TABLE */}
        <div className="department-card table-card">
            
          <div className="table-title">
            <h2>Liste des notes</h2>
            <span>{kpis.nb_matieres} matières évauées</span>
          </div>
          
          <div className="table-scroll">

            <table className="rel-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '100px' }}>N°</th>
                  <th style={{ minWidth: '300px' }}>Matière</th>
                  <th style={{ minWidth: '100px' }}>Coef</th>
                  <th style={{ minWidth: '100px' }}>Note</th>
                  <th style={{ minWidth: '100px' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {matieres.map((m, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="cell-strong">{m.matiere}</td>
                    <td>{m.coefficient} crédit</td>
                    <td>
                      <span className={`mr-statut-pill ${m.statut}`}>
                        {m.moyenne ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`mr-statut-pill ${m.statut}`}>
                        {m.statut === 'validee' ? '✓ Validée' : m.statut === 'non_validee' ? '✕ Non validée' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

        </div>
          
      



        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="department-card">
            <div className="count-top"><h2>{kpis.moyenne_generale ?? '—'} / 20</h2><span>Moyenne générale</span></div>
          </div>
          <div className="department-card">
            <div className="count-top"><h2>{donnees.moyenne_plus_elevee ?? '—'} / 20</h2><span>Moyenne la plus élevée</span></div>
          </div>
          <div className="department-card">
            <div className="count-top"><h2>{donnees.moyenne_plus_faible ?? '—'} / 20</h2><span>Moyenne la plus faible</span></div>
          </div>
          <div className={`department-card ${decision_label === 'VALIDÉ' ? 'valide' : decision_label === 'NON VALIDÉ' ? 'nonvalide' : decision_label === 'EN ATTENTE' ? 'attente' : 'rattrapage'}`} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ color: '#fff', textAlign: 'center' }}>
              {decision_label}
            </h2>
          </div>

        </div>
          
          

          
        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          
          <div className="rel-side-card">
            <div className="rel-side-titre"><i className="fas fa-chart-simple" style={{ color: '#6366f1' }}></i>Aperçu rapide</div>
            <div className="rel-side-ligne"><span>Moyenne générale</span><b>{kpis.moyenne_generale ?? '—'} / 20</b></div>
            <div className="rel-side-ligne"><span>Matières évaluées</span><b>{kpis.nb_matieres}</b></div>
            <div className="rel-side-ligne"><span>Taux de réussite</span><b>{kpis.taux_reussite ?? '—'}%</b></div>
            <div className="rel-side-ligne"><span>Rang dans la classe</span><b>{kpis.rang ? `${kpis.rang}/${kpis.effectif}` : '—'}</b></div>
          </div>
          
          <div className="rel-side-card">
            <div className="rel-side-titre"><i className="fas fa-bolt" style={{ color: '#6366f1' }}></i>Actions</div>
            <button className="rel-action-btn" onClick={() => navigate('/espace-etudiant/resultats')}><i className="fas fa-eye"></i> Voir les détails des évaluations</button>
            <button className="rel-action-btn" onClick={() => navigate('/espace-etudiant/resultats')}><i className="fas fa-trophy"></i> Voir mon classement</button>
          </div>
          
          <div className="rel-side-card">
            <div className="rel-info-box">
              <i className="fas fa-circle-info"></i>
              <p>Ce relevé de notes est un document consultable en ligne et reflète votre situation académique officielle enregistrée par l'institut.</p>
            </div>
          </div>

        </div>

      </div>

    </div>

  );

}



export default MonReleve;

