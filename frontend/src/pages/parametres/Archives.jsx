import { useState, useEffect } from 'react';
import { getArchives, archiverAnneeAcademique } from '../../api/parametres';
import { getAnneesAcademiques } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';


function Archives() {

  const [archives, setArchives] = useState([]);

  const [anneesActives, setAnneesActives] = useState([]);

  const [modalOuvert, setModalOuvert] = useState(false);

  const [anneeChoisie, setAnneeChoisie] = useState(null);

  const [notes, setNotes] = useState('');

  const [enCours, setEnCours] = useState(false);

  const { afficherSucces, afficherErreur } = useAlert();

  const charger = () => {
    getArchives().then((res) => setArchives(res.data));
    getAnneesAcademiques().then((res) => setAnneesActives((res.data.resultats || res.data).filter((a) => a.statut)));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirModal = (annee) => { setAnneeChoisie(annee); setNotes(''); setModalOuvert(true); };

  const confirmerArchivage = async () => {
    setEnCours(true);
    try {
      await archiverAnneeAcademique(anneeChoisie.id, { notes_archivage: notes });
      afficherSucces('Année académique archivée avec succès.');
      setModalOuvert(false);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.detail || "Erreur lors de l'archivage.");
    } finally {
      setEnCours(false);
    }
  };






  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Archives</h3>
            <div className="sub">Archiver les années académiques terminées</div>
          </div>
        </div>


        <div className="department-card table-card" style={{ marginBottom: '20px' }}>

          <div className="table-title">
            <h2>Années académiques actives</h2>
            <span>{anneesActives.length} Années académiques</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {anneesActives.map((a) => (
                  <tr key={a.id}>
                    <td className="cell-strong">{a.libelle}</td>
                    <td>{new Date(a.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>{new Date(a.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>
                      <button className="btn-light" onClick={() => ouvrirModal(a)}>
                        <i className="fas fa-box-archive"></i> Archiver
                      </button>
                    </td>
                  </tr>
                ))}
                {anneesActives.length === 0 && <tr><td colSpan="4"><div className="empty">Aucune année académique active.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>




        <div className="department-card table-card">
          <div className="table-title">
            <h2>Historique des archives</h2>
            <span>{archives.length} archives</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Année</th>
                  <th>Étudiants</th>
                  <th>Notes</th>
                  <th>Admis</th>
                  <th>Redoublants</th>
                  <th>Archivée par</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {archives.map((arc) => (
                  <tr key={arc.id}>
                    <td className="cell-strong">{arc.annee_academique_libelle}</td>
                    <td>{arc.nb_etudiants}</td>
                    <td>{arc.nb_notes}</td>
                    <td><span className="badge badge-success"><span className="dot"></span>{arc.nb_admis}</span></td>
                    <td><span className="badge badge-warning"><span className="dot"></span>{arc.nb_redoublants}</span></td>
                    <td>{arc.archivee_par_nom || '—'}</td>
                    <td>{new Date(arc.date_archivage).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                ))}
                {archives.length === 0 && <tr><td colSpan="7"><div className="empty">Aucune archive.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>




      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Archiver « {anneeChoisie?.libelle} »</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>
              Cette action fige les statistiques de l'année et la désactive. Cette opération est irréversible.
            </p>
            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-light" onClick={() => setModalOuvert(false)}>Annuler</button>
            <button className="btn-primary addInscr" onClick={confirmerArchivage} disabled={enCours}>
              {enCours ? 'Archivage...' : 'Confirmer l\'archivage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Archives;