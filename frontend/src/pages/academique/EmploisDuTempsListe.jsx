import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmploisDuTemps, supprimerEmploiDuTemps, telechargerEmploiDuTempsPdf, dupliquerEmploiDuTemps } from '../../api/emploisDuTemps';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { STATUTS_EMPLOI, CLASSE_BADGE_STATUT, SEMESTRES } from './emploiDuTempsConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/emploiDuTemps.css';




function EmploisDuTempsListe() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [recherche, setRecherche] = useState('');
  const [emploiASupprimer, setEmploiASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const charger = async () => {
    const res = await getEmploisDuTemps();
    setDonnees(res.data);
  };

  useEffect(() => {
    charger();
  }, []);

  const emploisFiltres = donnees.resultats.filter((e) => {
    const texte = (e.nom_affiche + ' ' + e.classe_str).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });


  const confirmerSuppression = async () => {

    setSuppressionEnCours(true);

    try {
      await supprimerEmploiDuTemps(emploiASupprimer.id);
      afficherSucces('Emploi du temps supprimé.');
      setEmploiASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  
  
  const telechargerPdf = async (emploi) => {
  
    try {
      const res = await telechargerEmploiDuTempsPdf(emploi.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emploi_du_temps_${emploi.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };
  
  
  const dupliquer = async (emploi) => {
    try {
      await dupliquerEmploiDuTemps(emploi.id);
      afficherSucces('Emploi du temps dupliqué vers la semaine suivante.');
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la duplication.');
    }
  };
  
  
  const { total = 0, brouillon = 0, publie = 0, archive = 0 } = donnees.kpis;
  
  
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des emplois du temps</h3>
            <div className="sub">{total} emploi(s) du temps</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-light" onClick={() => navigate('/academique/emplois-du-temps/blocs')}>
              <i className="fas fa-calendar-days"></i> Aperçu
            </button>
            <button className="btn-primary addInscr" onClick={() => navigate('/academique/emplois-du-temps/nouveau')}>
              <i className="fas fa-plus"></i>
              Nouvel emploi du temps
            </button>
          </div>
        </div>


        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-calendar-days"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{publie}</h2><span>Publiés</span></div>
          </div>
        </div>

        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-pen"></i></div>
            <div className="count-top"><h2>{brouillon}</h2><span>Brouillons</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-box-archive"></i></div>
            <div className="count-top"><h2>{archive}</h2><span>Archivés</span></div>
          </div>
        </div>



        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un emploi du temps..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des emplois du temps</h2>
            <span>{emploisFiltres.length} résultats</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Année</th>
                  <th>Semestre</th>
                  <th>Séances</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {emploisFiltres.map((e) => (
                  <tr className="row-link" key={e.id}>
                    <td>
                      {e.classe_str} <br /> 
                      <span className='mono'>{e.titre}</span>
                    </td>
                    <td>{e.annee_academique_libelle}</td>
                    <td>{SEMESTRES.find(s => s.value === e.semestre)?.label}</td>
                    <td>{e.nb_seances} séances</td>
                    <td>
                      <span className={`badge ${CLASSE_BADGE_STATUT[e.statut]}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS_EMPLOI.find((s) => s.value === e.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/academique/emplois-du-temps/${e.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => navigate(`/academique/emplois-du-temps/${e.id}/modifier`)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      {/*
                      <button className="table-btn" onClick={() => dupliquer(e)} title="Dupliquer vers la semaine suivante">
                        <i className="fas fa-copy"></i>
                      </button>
                      <button className="table-btn" onClick={() => telechargerPdf(e)} title="Télécharger le PDF">
                        <i className="fas fa-file-pdf"></i>
                      </button>
                      */}
                      <button className="table-btn delete" onClick={() => setEmploiASupprimer(e)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {emploisFiltres.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty">Aucun emploi du temps ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        ouvert={!!emploiASupprimer}
        titre="Supprimer l'emploi du temps"
        message={`Voulez-vous vraiment supprimer « ${emploiASupprimer?.nom_affiche} » ? Toutes ses séances seront également supprimées.`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setEmploiASupprimer(null)}
        chargement={suppressionEnCours}
      />
      
    </div>
  );
}
export default EmploisDuTempsListe;
