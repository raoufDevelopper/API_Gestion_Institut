
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEtudiants, supprimerEtudiant } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { STATUTS_ETUDIANT, BADGE_STATUT_ETUDIANT } from './utilisateursConstantes';
import '../../assets/css/crud.css';


function EtudiantsListe() {
  const [etudiants, setEtudiants] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [etudiantASupprimer, setEtudiantASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const charger = async () => {
    const res = await getEtudiants();
    setEtudiants(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const etudiantsFiltres = etudiants.filter((e) => {
    const texte = (e.matricule + ' ' + e.nom + ' ' + e.prenom).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerEtudiant(etudiantASupprimer.id);
      afficherSucces('Étudiant supprimé.');
      setEtudiantASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const nbActif = etudiants.filter((e) => e.statut === 'ACTIF').length;
  const nbAbandon = etudiants.filter((e) => e.statut === 'ABANDON').length;
  const nbDiplome = etudiants.filter((e) => e.statut === 'DIPLOME').length;
  const nbExclu = etudiants.filter((e) => e.statut === 'EXCLU').length;
  const nbDemissionnaire = etudiants.filter((e) => e.statut === 'DEMISSIONNAIRE').length;


  return (
    <div className="container-principal">
      
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des étudiants</h3>
            <div className="sub">{etudiants.length} étudiant(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={() => navigate('/utilisateurs/etudiants/nouveau')}>
            <i className="fas fa-plus"></i>
            Nouvel étudiant 
          </button>
        </div>
        
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
            <div className="department-card">
                <div className="kpi-icon blue"><i className="fas fa-user-graduate"></i></div>
                <div className="count-top"><h2>{etudiants.length}</h2><span>Total</span></div>
            </div>
            <div className="department-card">
                <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
                <div className="count-top"><h2>{nbActif}</h2><span>Actifs</span></div>
            </div>
            <div className="department-card">
                <div className="kpi-icon violet"><i className="fas fa-pause-circle"></i></div>
                <div className="count-top"><h2>{nbAbandon}</h2><span>Abandon</span></div>
            </div>
            <div className="department-card">
                <div className="kpi-icon aqua"><i className="fas fa-graduation-cap"></i></div>
                <div className="count-top"><h2>{nbDiplome}</h2><span>Diplômés</span></div>
            </div>
            <div className="department-card">
                <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
                <div className="count-top"><h2>{nbExclu}</h2><span>Exclus</span></div>
            </div>
            <div className="department-card">
                <div className="kpi-icon orange"><i className="fas fa-door-closed"></i></div>
                <div className="count-top"><h2>{nbDemissionnaire}</h2><span>Démissionnaires</span></div>
            </div>
        </div>

        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un étudiant..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des étudiants</h2>
            <span>{etudiantsFiltres.length} étudiants</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Matricule</th>
                  <th>Spécialité</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {etudiantsFiltres.map((e) => (
                  <tr className="row-link" key={e.id}>
                    <td>
                      <div className="cell-with-avatar">
                        {e.photo ? (
                          <img src={e.photo} alt='' className="avatar-mini" />
                        ) : (
                          <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>
                        )}
                        <div className="cell-strong">{e.nom} <br /> {e.prenom}</div>
                      </div>
                    </td>
                    <td className="mono">{e.matricule}</td>
                    <td>{e.specialite_code || '—'}</td>
                    <td>
                      <span className={`badge ${BADGE_STATUT_ETUDIANT[e.statut]}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS_ETUDIANT.find((s) => s.value === e.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/utilisateurs/etudiants/${e.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => navigate(`/utilisateurs/etudiants/${e.id}/modifier`)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setEtudiantASupprimer(e)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {etudiantsFiltres.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucun étudiant ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        ouvert={!!etudiantASupprimer}
        titre="Supprimer l'étudiant"
        message={`Voulez-vous vraiment supprimer « ${etudiantASupprimer?.nom} ${etudiantASupprimer?.prenom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setEtudiantASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>

  );

}

export default EtudiantsListe;