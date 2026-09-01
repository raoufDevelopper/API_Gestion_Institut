
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFormateurs, supprimerFormateur } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { TYPES_CONTRAT } from './utilisateursConstantes';
import '../../assets/css/crud.css';
function FormateursListe() {
  const [formateurs, setFormateurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [formateurASupprimer, setFormateurASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const charger = async () => {
    const res = await getFormateurs();
    setFormateurs(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const formateursFiltres = formateurs.filter((f) => {
    const texte = (f.personnel_nom + ' ' + f.personnel_prenom + ' ' + (f.filiere || '') + ' ' + (f.specialite || '')).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerFormateur(formateurASupprimer.id);
      afficherSucces('Formateur supprimé.');
      setFormateurASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };


  const nbPermanents = formateurs.filter((f) => f.type_contrat === 'PERMANENT').length;
  
  const nbVacataires = formateurs.filter((f) => f.type_contrat === 'VACATAIRE').length;



  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des formateurs</h3>
            <div className="sub">{formateurs.length} formateur(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={() => navigate('/utilisateurs/formateurs/nouveau')}>
            <i className="fas fa-plus"></i>
            Nouveau formateur
          </button>
        </div>
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-person-chalkboard"></i></div>
            <div className="count-top"><h2>{formateurs.length}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-briefcase"></i></div>
            <div className="count-top"><h2>{nbPermanents}</h2><span>Permanents</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-user-clock"></i></div>
            <div className="count-top"><h2>{nbVacataires}</h2><span>Vacataires</span></div>
          </div>
        </div>
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un formateur..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des formateurs</h2>
            <span>{formateursFiltres.length} résultats</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Formateur</th>
                  <th>Type de contrat</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formateursFiltres.map((f) => (
                  <tr className="row-link" key={f.id}>
                    <td><div className="cell-strong">{f.personnel_nom} {f.personnel_prenom}</div></td>
                    <td>
                      <span className={`badge ${f.type_contrat === 'PERMANENT' ? 'badge-success' : 'badge-orange'}`}>
                        <span className="dot"></span>
                        {TYPES_CONTRAT.find((t) => t.value === f.type_contrat)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/utilisateurs/formateurs/${f.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => navigate(`/utilisateurs/formateurs/${f.id}/modifier`)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setFormateurASupprimer(f)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {formateursFiltres.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucun résultat ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!formateurASupprimer}
        titre="Supprimer le formateur"
        message={`Voulez-vous vraiment supprimer « ${formateurASupprimer?.personnel_nom} ${formateurASupprimer?.personnel_prenom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setFormateurASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default FormateursListe;