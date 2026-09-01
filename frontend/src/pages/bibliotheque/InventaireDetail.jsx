import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInventaire, modifierLigneInventaire, cloturerInventaire } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_CONSTATE, BADGE_STATUT_CONSTATE } from './bibliothequeConstantes';
import '../../assets/css/crud.css';
function InventaireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inventaire, setInventaire] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const charger = () => { getInventaire(id).then((res) => setInventaire(res.data)); };
  useEffect(() => { charger(); }, [id]);
  const changerStatut = async (ligneId, statut) => {
    try {
      await modifierLigneInventaire(ligneId, { statut_constate: statut });
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la mise à jour.');
    }
  };
  const cloturer = async () => {
    try {
      await cloturerInventaire(id);
      afficherSucces('Inventaire clôturé.');
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la clôture.');
    }
  };
  if (!inventaire) return <div className="container-principal"><div className="empty">Chargement...</div></div>;
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Inventaire du {new Date(inventaire.date_inventaire).toLocaleDateString('fr-FR')}</h3>
            <div className="sub">{inventaire.zone_concernee || 'Toute la bibliothèque'}</div>
          </div>
          {inventaire.statut === 'EN_COURS' && (
            <button className="btn-primary addInscr" onClick={cloturer}>Clôturer l'inventaire</button>
          )}
        </div>
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
          <div className="department-card"><div className="kpi-icon blue"><i className="fas fa-book"></i></div><div className="count-top"><h2>{inventaire.nb_exemplaires_theoriques}</h2><span>Théoriques</span></div></div>
          <div className="department-card"><div className="kpi-icon green"><i className="fas fa-check"></i></div><div className="count-top"><h2>{inventaire.nb_exemplaires_verifies}</h2><span>Vérifiés</span></div></div>
          <div className="department-card"><div className="kpi-icon red"><i className="fas fa-triangle-exclamation"></i></div><div className="count-top"><h2>{inventaire.nb_anomalies}</h2><span>Anomalies</span></div></div>
        </div>
        <div className="department-card table-card">
          <div className="table-title"><h2>Lignes d'inventaire</h2></div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Exemplaire</th><th>Ressource</th><th>Statut constaté</th></tr></thead>
              <tbody>
                {(inventaire.lignes || []).map((l) => (
                  <tr key={l.id}>
                    <td className="mono cell-strong">{l.exemplaire_str}</td>
                    <td>{l.ressource_titre}</td>
                    <td>
                      <select
                        value={l.statut_constate}
                        onChange={(e) => changerStatut(l.id, e.target.value)}
                        disabled={inventaire.statut === 'TERMINE'}
                      >
                        {STATUTS_CONSTATE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default InventaireDetail;