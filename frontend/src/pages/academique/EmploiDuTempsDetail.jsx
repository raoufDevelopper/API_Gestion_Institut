import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmploiDuTemps, getSeances, telechargerEmploiDuTempsPdf, dupliquerEmploiDuTemps } from '../../api/emploisDuTemps';
import { useAlert } from '../../context/AlertContext';
import { JOURS, TYPES_SEANCE, STATUTS_EMPLOI, CLASSE_BADGE_STATUT } from './emploiDuTempsConstantes';
import '../../assets/css/emploiDuTemps.css';
function EmploiDuTempsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const [emploi, setEmploi] = useState(null);
  const [seancesParJour, setSeancesParJour] = useState({});
  const charger = () => {
    Promise.all([getEmploiDuTemps(id), getSeances(id)]).then(([resEmploi, resSeances]) => {
      setEmploi(resEmploi.data);
      const regroupees = JOURS.reduce((acc, j) => ({ ...acc, [j.code]: [] }), {});
      resSeances.data.forEach((s) => regroupees[s.jour].push(s));
      setSeancesParJour(regroupees);
    });
  };
  useEffect(() => {
    charger();
  }, [id]);
  const telechargerPdf = async () => {
    try {
      const res = await telechargerEmploiDuTempsPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emploi_du_temps_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };
  const dupliquer = async () => {
    try {
      const res = await dupliquerEmploiDuTemps(id);
      afficherSucces('Dupliqué vers la semaine suivante.');
      navigate(`/academique/emplois-du-temps/${res.data.id}`);
    } catch (err) {
      afficherErreur('Erreur lors de la duplication.');
    }
  };
  if (!emploi) {
    return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  }
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{emploi.nom_affiche}</h3>
            <div className="sub">{emploi.classe_str} — {emploi.semestre}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-light" onClick={dupliquer}>
              <i className="fas fa-copy"></i> Dupliquer
            </button>
            <button className="btn-light" onClick={() => navigate(`/academique/emplois-du-temps/${id}/modifier`)}>
              <i className="fas fa-pen"></i> Modifier
            </button>
            <button className="btn-primary addInscr" onClick={telechargerPdf}>
              <i className="fas fa-file-pdf"></i> Télécharger le PDF
            </button>
          </div>
        </div>
        <div className="department-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div className="form-grid">
            <div className="form-group"><label>Statut</label>
              <p>
                <span className={`badge ${CLASSE_BADGE_STATUT[emploi.statut]}`}>
                  <span className="dot"></span>
                  {STATUTS_EMPLOI.find((s) => s.value === emploi.statut)?.label}
                </span>
              </p>
            </div>
            <div className="form-group"><label>Année académique</label><p>{emploi.annee_academique_libelle || '—'}</p></div>
            <div className="form-group"><label>Semaine</label>
              <p>{emploi.semaine_debut ? `${emploi.semaine_debut} au ${emploi.semaine_fin}` : '—'}</p>
            </div>
          </div>
        </div>
        <div className="edt-jours-conteneur edt-jours-lecture">
          {JOURS.map((jour) => (
            <div className="edt-jour-bloc" key={jour.code}>
              <div className="edt-jour-entete edt-jour-entete-lecture">
                <span>{jour.label}</span>
              </div>
              <div className="edt-seances-liste">
                {seancesParJour[jour.code]?.length === 0 && (
                  <div className="edt-jour-vide">Aucune séance</div>
                )}
                {seancesParJour[jour.code]?.map((s) => (
                  <div className="edt-seance-carte-lecture" key={s.id}>
                    <span className="edt-seance-type">{TYPES_SEANCE.find((t) => t.value === s.type_seance)?.label}</span>
                    <div className="edt-seance-matiere">{s.matiere_nom}</div>
                    <div className="edt-seance-details">
                      <span><i className="fas fa-user"></i> {s.formateur_str || '—'}</span>
                      <span><i className="fas fa-door-open"></i> {s.salle_nom || '—'}</span>
                      <span><i className="fas fa-clock"></i> {s.heure_debut?.slice(0, 5)} - {s.heure_fin?.slice(0, 5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default EmploiDuTempsDetail;