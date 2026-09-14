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
      <div className="rel-page">
        <button className="rel-retour" onClick={() => navigate(-1)}><i className="fas fa-arrow-left"></i> Retour à mes résultats</button>
        <div className="rel-grid">
          <div>
            <div className="rel-identite-card">
              {etudiant.photo ? <img src={etudiant.photo} alt={etudiant.nom} className="rel-avatar" /> : <div className="rel-avatar rel-avatar-placeholder"><i className="fas fa-user"></i></div>}
              <div className="rel-identite-nom">
                <h2>{etudiant.nom} {etudiant.prenom}</h2>
                <span><i className="fas fa-circle-check"></i> Étudiant actif</span>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
                  <div>Matricule : <b style={{ color: '#374151' }}>{etudiant.matricule}</b></div>
                  <div>Classe : <b style={{ color: '#374151' }}>{etudiant.classe}</b></div>
                  <div>Spécialité : <b style={{ color: '#374151' }}>{etudiant.specialite}</b></div>
                </div>
              </div>
              <div className="rel-identite-champs">
                <div><i className="fas fa-calendar"></i>Date de naissance :<b>{etudiant.date_naissance ? new Date(etudiant.date_naissance).toLocaleDateString('fr-FR') : '—'}</b></div>
                <div><i className="fas fa-venus-mars"></i>Sexe :<b>{etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}</b></div>
                <div><i className="fas fa-phone"></i>Téléphone :<b>{etudiant.telephone || '—'}</b></div>
                <div><i className="fas fa-envelope"></i>Email :<b>{etudiant.email || '—'}</b></div>
                <div><i className="fas fa-location-dot"></i>Adresse :<b>{etudiant.adresse || '—'}</b></div>
              </div>
            </div>
            <div className="rel-doc-card">
              <div className="rel-doc-entete">
                <div className="rel-doc-institut">
                  {parametre?.logo && <img src={parametre.logo} alt="logo" />}
                  <div><h4>{parametre?.nom || 'Institut de formation'}</h4><p>{parametre?.sigle || ''}</p></div>
                </div>
                <div className="rel-doc-titre-centre">
                  <h2>RELEVÉ DE NOTES</h2>
                  <p>{labelPeriode} — {donnees.annee_academique}</p>
                </div>
                <div className="rel-doc-meta">
                  <div>Le {dateGeneration}</div>
                  <div>N° : {donnees.numero_releve}</div>
                </div>
              </div>
              <div className="rel-info-grid">
                <div className="rel-info-bloc">
                  <h5>Informations de l'étudiant</h5>
                  <div className="rel-info-ligne"><span>Nom et prénom</span><span>{etudiant.nom} {etudiant.prenom}</span></div>
                  <div className="rel-info-ligne"><span>Matricule</span><span>{etudiant.matricule}</span></div>
                  <div className="rel-info-ligne"><span>Classe</span><span>{etudiant.classe}</span></div>
                  <div className="rel-info-ligne"><span>Spécialité</span><span>{etudiant.specialite}</span></div>
                </div>
                <div className="rel-info-bloc">
                  <h5>Informations de la formation</h5>
                  <div className="rel-info-ligne"><span>Filière</span><span>{etudiant.filiere}</span></div>
                  <div className="rel-info-ligne"><span>Niveau</span><span>{etudiant.niveau}</span></div>
                  <div className="rel-info-ligne"><span>Année académique</span><span>{donnees.annee_academique}</span></div>
                  <div className="rel-info-ligne"><span>Période</span><span>{labelPeriode}</span></div>
                </div>
              </div>
              <table className="rel-table">
                <thead><tr><th>N°</th><th>Matière</th><th>Coefficient</th><th>Moyenne</th><th>Statut</th></tr></thead>
                <tbody>
                  {matieres.map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td><td className="cell-strong">{m.matiere}</td><td>{m.coefficient}</td><td>{m.moyenne ?? '—'}</td>
                      <td><span className={`mr-statut-pill ${m.statut}`}>{m.statut === 'validee' ? '✓ Validée' : m.statut === 'non_validee' ? '✕ Non validée' : 'En attente'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="rel-footer-grid">
                <div className="rel-footer-box bleu"><span>Moyenne générale</span><strong>{kpis.moyenne_generale ?? '—'} / 20</strong></div>
                <div className="rel-footer-box bleu"><span>Moyenne la plus élevée</span><strong>{donnees.moyenne_plus_elevee ?? '—'} / 20</strong></div>
                <div className="rel-footer-box bleu"><span>Moyenne la plus faible</span><strong>{donnees.moyenne_plus_faible ?? '—'} / 20</strong></div>
                <div className="rel-footer-box vert"><span>Décision</span><strong>{decision_label}</strong><p>{decision_sous_texte}</p></div>
              </div>
            </div>
          </div>
          <div>
            <div className="rel-banniere">
              {/* Emplacement prévu pour une image personnalisée */}
              <div className="rel-banniere-slot" style={{ backgroundImage: "url('')" }}></div>
              <div className="rel-banniere-citation">« L'excellence est une habitude, pas un acte. »</div>
            </div>
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
    </div>
  );
}
export default MonReleve;