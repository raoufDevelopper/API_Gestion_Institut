import { useState, useEffect } from 'react';
import { getSauvegardes, lancerSauvegarde, telechargerSauvegarde, supprimerSauvegarde } from '../../api/parametres';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { telechargerFichier } from '../finances/financesConstantes';
import '../../assets/css/crud.css';


function Sauvegardes() {
  const [sauvegardes, setSauvegardes] = useState([]);
  const [lancementEnCours, setLancementEnCours] = useState(false);
  const [sauvegardeASupprimer, setSauvegardeASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const charger = () => { getSauvegardes().then((res) => setSauvegardes(res.data)); };
  useEffect(() => { charger(); }, []);
  const lancer = async () => {
    setLancementEnCours(true);
    try {
      await lancerSauvegarde();
      afficherSucces('Sauvegarde effectuée avec succès.');
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la sauvegarde.');
    } finally {
      setLancementEnCours(false);
    }
  };
  const telecharger = async (s) => {
    try {
      const res = await telechargerSauvegarde(s.id);
      telechargerFichier(res.data, s.nom_fichier || `sauvegarde_${s.id}.sql`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement.');
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerSauvegarde(sauvegardeASupprimer.id);
      afficherSucces('Sauvegarde supprimée.');
      setSauvegardeASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const formatTaille = (octets) => {
    if (!octets) return '—';
    const mo = octets / (1024 * 1024);
    return mo >= 1 ? `${mo.toFixed(1)} Mo` : `${(octets / 1024).toFixed(1)} Ko`;
  };
  const nbReussies = sauvegardes.filter((s) => s.statut === 'reussie').length;
  const nbEchouees = sauvegardes.filter((s) => s.statut === 'echouee').length;
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Sauvegardes</h3>
            <div className="sub">Sauvegardes de la base de données</div>
          </div>
          <button className="btn-primary addInscr" onClick={lancer} disabled={lancementEnCours}>
            <i className="fas fa-download"></i> {lancementEnCours ? 'Sauvegarde en cours...' : 'Lancer une sauvegarde'}
          </button>
        </div>
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-database"></i></div>
            <div className="count-top"><h2>{sauvegardes.length}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{nbReussies}</h2><span>Réussies</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-triangle-exclamation"></i></div>
            <div className="count-top"><h2>{nbEchouees}</h2><span>Échouées</span></div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title"><h2>Historique des sauvegardes</h2><span>{sauvegardes.length}</span></div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Fichier</th><th>Type</th><th>Taille</th><th>Déclenchée par</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {sauvegardes.map((s) => (
                  <tr key={s.id}>
                    <td className="cell-strong mono">{s.nom_fichier || '—'}</td>
                    <td>{s.type_sauvegarde === 'manuelle' ? 'Manuelle' : 'Automatique'}</td>
                    <td>{formatTaille(s.taille_octets)}</td>
                    <td>{s.declenchee_par_nom || '—'}</td>
                    <td>{new Date(s.date_creation).toLocaleString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${s.statut === 'reussie' ? 'badge-success' : s.statut === 'echouee' ? 'badge-danger' : 'badge-warning'}`}>
                        <span className="dot"></span>{s.statut}
                      </span>
                    </td>
                    <td>
                      {s.fichier && (
                        <button className="table-btn" onClick={() => telecharger(s)}><i className="fas fa-download"></i></button>
                      )}
                      <button className="table-btn delete" onClick={() => setSauvegardeASupprimer(s)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {sauvegardes.length === 0 && <tr><td colSpan="7"><div className="empty">Aucune sauvegarde effectuée.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!sauvegardeASupprimer}
        titre="Supprimer la sauvegarde"
        message="Voulez-vous vraiment supprimer cette sauvegarde ?"
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setSauvegardeASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default Sauvegardes;