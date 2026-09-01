
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getAcquisitions, creerAcquisition, receptionnerAcquisition, getFournisseurs } from '../../api/bibliotheque';
import { getRessources } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_ACQUISITION, BADGE_STATUT_ACQUISITION } from './bibliothequeConstantes';
import '../../assets/css/crud.css';
function AcquisitionsListe() {
  const [acquisitions, setAcquisitions] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [lignes, setLignes] = useState([{ ressource: '', quantite: 1, prix_unitaire: '' }]);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const charger = () => { getAcquisitions().then((res) => setAcquisitions(res.data)); };
  useEffect(() => { charger(); }, []);
  useEffect(() => {
    getFournisseurs().then((res) => setFournisseurs(res.data));
    getRessources().then((res) => setRessources(res.data));
  }, []);
  const ajouterLigne = () => setLignes([...lignes, { ressource: '', quantite: 1, prix_unitaire: '' }]);
  const modifierLigne = (i, champ, valeur) => setLignes(lignes.map((l, idx) => (idx === i ? { ...l, [champ]: valeur } : l)));
  const supprimerLigne = (i) => setLignes(lignes.filter((_, idx) => idx !== i));
  const onSubmit = async (data) => {
    try {
      await creerAcquisition({ ...data, lignes: lignes.filter((l) => l.ressource) });
      afficherSucces('Acquisition créée avec succès.');
      setModalOuvert(false); setLignes([{ ressource: '', quantite: 1, prix_unitaire: '' }]); charger();
    } catch (err) {
      afficherErreur("Erreur lors de l'enregistrement.");
    }
  };
  const receptionner = async (a) => {
    try {
      await receptionnerAcquisition(a.id);
      afficherSucces('Acquisition réceptionnée, exemplaires créés.');
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la réception.');
    }
  };
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div><h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Acquisitions</h3><div className="sub">Suivre les acquisitions de ressources</div></div>
          <button className="btn-primary addInscr" onClick={() => { reset({ date_acquisition: '', fournisseur: '', reference: '', montant: '' }); setModalOuvert(true); }}>
            <i className="fas fa-plus"></i> Nouvelle acquisition
          </button>
        </div>
        <div className="department-card table-card">
          <div className="table-title"><h2>Acquisitions</h2><span>{acquisitions.length}</span></div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Date</th><th>Fournisseur</th><th>Référence</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {acquisitions.map((a) => (
                  <tr className="row-link" key={a.id}>
                    <td>{new Date(a.date_acquisition).toLocaleDateString('fr-FR')}</td>
                    <td className="cell-strong">{a.fournisseur_str || '—'}</td>
                    <td className="mono">{a.reference || '—'}</td>
                    <td>{a.montant ? `${a.montant} FCFA` : '—'}</td>
                    <td><span className={`badge ${BADGE_STATUT_ACQUISITION[a.statut]}`}><span className="dot"></span>{STATUTS_ACQUISITION.find((s) => s.value === a.statut)?.label}</span></td>
                    <td>
                      {a.statut !== 'RECUE' && (
                        <button className="table-btn" onClick={() => receptionner(a)}><i className="fas fa-check"></i></button>
                      )}
                    </td>
                  </tr>
                ))}
                {acquisitions.length === 0 && <tr><td colSpan="6"><div className="empty">Aucune acquisition.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Nouvelle acquisition</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group"><label>Date</label><input type="date" {...register('date_acquisition')} /></div>
              <div className="form-group">
                <label>Fournisseur</label>
                <select {...register('fournisseur')}><option value="">Aucun</option>{fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}</select>
              </div>
              <div className="form-group"><label>Référence</label><input type="text" {...register('reference')} /></div>
              <div className="form-group"><label>Montant total</label><input type="number" step="0.01" {...register('montant')} /></div>
              <div className="form-group full">
                <label>Lignes de la commande</label>
                {lignes.map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select value={l.ressource} onChange={(e) => modifierLigne(i, 'ressource', e.target.value)} style={{ flex: 2 }}>
                      <option value="">Ressource...</option>
                      {ressources.map((r) => <option key={r.id} value={r.id}>{r.titre}</option>)}
                    </select>
                    <input type="number" min="1" value={l.quantite} onChange={(e) => modifierLigne(i, 'quantite', e.target.value)} style={{ width: '70px' }} />
                    <input type="number" step="0.01" placeholder="Prix unit." value={l.prix_unitaire} onChange={(e) => modifierLigne(i, 'prix_unitaire', e.target.value)} style={{ width: '100px' }} />
                    <button type="button" className="table-btn delete" onClick={() => supprimerLigne(i)}><i className="fas fa-times"></i></button>
                  </div>
                ))}
                <button type="button" className="btn-light" onClick={ajouterLigne}>+ Ajouter une ligne</button>
              </div>
            </div>
            <div className="modal-footer"><button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>Enregistrer</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AcquisitionsListe;