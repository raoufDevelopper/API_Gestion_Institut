import { useState, useEffect } from 'react';
import { getAccueilEtudiant } from '../../api/espaceEtudiant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEtudiant.css';



function AccueilEtudiant() {
  
  const [donnees, setDonnees] = useState(null);
  
  const [erreur, setErreur] = useState(null);
  useEffect(() => {
    getAccueilEtudiant()
      .then((res) => setDonnees(res.data))
      .catch((err) => setErreur(err.response?.data?.detail || 'Erreur lors du chargement.'));
  }, []);

  if (erreur) return <div className="container-principal"><div className="department-page"><div className="empty" style={{ color: '#dc2626' }}>{erreur}</div></div></div>;
  
  if (!donnees) return <div className="container-principal"><Loader label="Chargement de votre espace..." /></div>;
  
  
  const { etudiant, formation, kpis, ma_semaine, resultats_recents, notifications_recentes } = donnees;
  
  
  
  return (
    <div className="container-principal">
      
      <div className="department-page">
  
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Bonjour {etudiant.prenom} 👋</h3>
            <div className="sub">Voici un aperçu de votre parcours et de vos activités.</div>
          </div>
        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>

          <div className="ee-carte-profil ud-identite">
            {etudiant.photo ? <img src={etudiant.photo} alt={etudiant.nom} className="ud-avatar" /> : <div className="ee-avatar ee-avatar-placeholder"><i className="fas fa-user"></i></div>}
            <div>
              <h2>{etudiant.nom} {etudiant.prenom}</h2>
              <div className="cell-sub mono">Matricule : {etudiant.matricule}</div>
              <div className="cell-sub mono">Classe : {formation.classe}</div>
            </div>
            <div className="ee-infos-formation" style={{ marginLeft: 'auto' }}>
              <div>Spécialité : <b className='badge badge-violet'><p className='bull'>&bull;</p> {formation.specialite}</b></div>
              <div>Année académique : {formation.annee_academique}</div>
              <span className="badge badge-success" style={{ width: 'fit-content' }}><p className='bull'>&bull;</p> Semestre {formation.semestre.slice(1)} — En cours</span>
            </div>
          </div>
  
        </div>



        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
  
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-book"></i></div>
            <div className="count-top"><h2>{kpis.nb_matieres}</h2><span>Matières</span></div>
          </div>
  
          <div className="department-card">
            <div className="kpi-icon violet"><i className="fas fa-chart-line"></i></div>
            <div className="count-top"><h2>{kpis.moyenne_generale ?? '—'}/20</h2><span>Moyenne générale</span></div>
          </div>
  
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{kpis.taux_reussite ?? '—'}%</h2><span>Taux de réussite</span></div>
          </div>
  
        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
  
          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-clock"></i></div>
            <div className="count-top"><h2>{kpis.cours_semaine}</h2><span>Cours cette semaine</span></div>
          </div>
  
          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-folder"></i></div>
            <div className="count-top"><h2>{kpis.documents_disponibles}</h2><span>Documents disponibles</span></div>
          </div>
  
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-money-bill-wave"></i></div>
            <div className="count-top"><h2>{kpis.paiements_en_attente}</h2><span>Paiements en attente</span></div>
          </div>
  
        </div>
  


  
  
        <div className="dash-contenu">
          <div className="dash-graphique-card">
            
            <div className="dash-graphique-titre">
              Mes résultats récents
            </div>
            
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {resultats_recents.map((r, i) => 
                    <tr key={i}>
                      <td className="cell-strong">{r.matiere}</td>
                      <td>
                        <span className={`badge-${r.moyenne < 10 ? 'danger' : 'success'}`}>
                          <p className='bull'>&#9758;</p>
                          {r.moyenne}
                        </span>
                      </td>
                    </tr>
                  )}
                  {resultats_recents.length === 0 && 
                    <tr>
                      <td colSpan="2" style={{ color: '#9ca3af' }}>Aucun résultat disponible.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

          </div>
          
          
          <div className="dash-graphique-card">
            <div className="dash-graphique-titre">Notifications récentes</div>
            {notifications_recentes.map((n, i) => (
              <div className="accueil-agenda-item" key={i}>
                <div className="accueil-agenda-icone" style={{ background: n.lue ? 'var(--input)' : 'rgba(5, 5, 233, 0.28)', color: n.lue ? '#ffffff' : '#4441ff' }}><i className="fas fa-bell"></i></div>
                <div className="accueil-agenda-corps">
                  <div className="accueil-agenda-titre">{n.titre}</div>
                  <div className="accueil-agenda-sous">{n.message}</div>
                </div>
              </div>
            ))}
            {notifications_recentes.length === 0 && <div className="empty">Aucune notification.</div>}
          </div>
        </div>

      </div>

    </div>
  );
  
}

export default AccueilEtudiant;

