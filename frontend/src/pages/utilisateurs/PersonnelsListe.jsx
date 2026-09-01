
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonnels, supprimerPersonnel } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { STATUTS_PERSONNEL, BADGE_STATUT_PERSONNEL } from './utilisateursConstantes';
import '../../assets/css/crud.css';



function PersonnelsListe() {
  const [personnels, setPersonnels] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [personnelASupprimer, setPersonnelASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const charger = async () => {
    const res = await getPersonnels();
    setPersonnels(res.data);
  };


  useEffect(() => {
    charger();
  }, []);


  const personnelsFiltres = personnels.filter((p) => {
    const texte = (p.matricule + ' ' + p.nom + ' ' + p.prenom + ' ' + (p.poste || '')).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });


  const confirmerSuppression = async () => {

    setSuppressionEnCours(true);

    try {
      await supprimerPersonnel(personnelASupprimer.id);
      afficherSucces('Personnel supprimé.');
      setPersonnelASupprimer(null);
      charger();

    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');

    } finally {
      setSuppressionEnCours(false);
    }
  };


  const kpis = STATUTS_PERSONNEL.reduce((acc, s) => {
    acc[s.value] = personnels.filter((p) => p.statut === s.value).length;
    return acc;
  }, {});










  return (
    <div className="container-principal">
      
      <div className="department-page">
      
        <div className="panel-head">
      
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion du personnel</h3>
            <div className="sub">{personnels.length} personne(s)</div>
          </div>
      
          <button className="btn-primary addInscr" onClick={() => navigate('/utilisateurs/personnel/nouveau')}>
            <i className="fas fa-plus"></i>
            Nouveau personnel
          </button>
      
        </div>
      
      
      
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
      
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-users"></i></div>
            <div className="count-top"><h2>{personnels.length}</h2><span>Total</span></div>
          </div>
      
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{kpis.ACTIF || 0}</h2><span>Actifs</span></div>
          </div>
      
          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-umbrella-beach"></i></div>
            <div className="count-top"><h2>{kpis.ENCONGE || 0}</h2><span>En congé</span></div>
          </div>
      
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{kpis.INACTIF || 0}</h2><span>Inactifs</span></div>
          </div>

          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-pause-circle"></i></div>
            <div className="count-top"><h2>{kpis.SUSPENDU || 0}</h2><span>Suspendus</span></div>
          </div>

          <div className="department-card">
            <div className="kpi-icon violet"><i className="fa-solid fa-person-cane"></i></div>
            <div className="count-top"><h2>{kpis.RETRAITE || 0}</h2><span>Retraités</span></div>
          </div>
      
        </div>
      
      
      
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher un membre du personnel..." value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
            </div>
          </div>
        </div>



        <div className="department-card table-card">
          
          <div className="table-title">
            <h2>Liste du personnel</h2>
            <span>{personnelsFiltres.length} résultats</span>
          </div>
          
          
          <div className="table-scroll">
           
            <table>
             
              <thead>
                <tr>
                  <th>Personnel</th>
                  <th>Matricule</th>
                  <th>Salaire</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              
              <tbody>
                
                {personnelsFiltres.map((p) => (
                  
                  <tr className="row-link" key={p.id}>
                    
                    <td>
                      <div className="cell-with-avatar">
                        {p.photo ? (
                          <img src={p.photo} className="avatar-mini" />
                        ) : (
                          <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>
                        )}
                        <div className="cell-strong">{p.nom} {p.prenom}</div>
                      </div>
                    </td>
                   
                    <td className="mono">{p.matricule}</td>
                    
                    <td>{p.salaire || '—'}</td>
                   
                    <td>
                      <span className={`badge ${BADGE_STATUT_PERSONNEL[p.statut]}`}>
                        <span className="dot"></span>
                        {STATUTS_PERSONNEL.find((s) => s.value === p.statut)?.label}
                      </span>
                    </td>
                  
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/utilisateurs/personnel/${p.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => navigate(`/utilisateurs/personnel/${p.id}/modifier`)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setPersonnelASupprimer(p)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>

                  </tr>

                ))}


                {personnelsFiltres.length === 0 && (
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
        ouvert={!!personnelASupprimer}
        titre="Supprimer le personnel"
        message={`Voulez-vous vraiment supprimer « ${personnelASupprimer?.nom} ${personnelASupprimer?.prenom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setPersonnelASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>

  );

}


export default PersonnelsListe;