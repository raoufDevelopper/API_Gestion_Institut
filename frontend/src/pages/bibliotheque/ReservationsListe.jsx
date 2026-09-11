 
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getReservations, creerReservation, annulerReservation, getAdherents, getRessources } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_RESERVATION, BADGE_STATUT_RESERVATION } from './bibliothequeConstantes';
import '../../assets/css/crud.css';


function ReservationsListe() {
  const [reservations, setReservations] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = () => { getReservations({ q: recherche || undefined }).then((res) => setReservations(res.data)); };
  useEffect(() => { charger(); }, [recherche]);
  useEffect(() => {
    getAdherents({ statut: 'ACTIF' }).then((res) => setAdherents(res.data));
    getRessources().then((res) => setRessources(res.data));
  }, []);

  const ouvrirCreation = () => { reset({ adherent: '', ressource: '' }); setModalOuvert(true); };

  const onSubmit = async (data) => {
    try {
      await creerReservation(data);
      afficherSucces('Réservation créée avec succès.');
      setModalOuvert(false);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.detail || 'Erreur lors de la création.');
    }
  };

  const annuler = async (r) => {
    try {
      await annulerReservation(r.id);
      afficherSucces('Réservation annulée.');
      charger();
    } catch (err) {
      afficherErreur("Erreur lors de l'annulation.");
    }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Liste des réservations</h3>
            <div className="sub">Gérer les réservations des ressources non disponibles</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}><i className="fas fa-plus"></i> Nouvelle réservation</button>
        </div>

        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box"><i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="department-card table-card">
          <div className="table-title">
            <h2>Réservations</h2>
            <span>{reservations.length} réservations</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Demandeur</th>
                  <th>Date</th>
                  <th>Position</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr className="row-link" key={r.id}>
                    <td className="cell-strong">{r.ressource_str}</td>
                    <td>{r.adherent_str}</td>
                    <td>{new Date(r.date_reservation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>{r.position_file || '—'}</td>
                    <td>
                      <span className={`badge ${BADGE_STATUT_RESERVATION[r.statut]}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS_RESERVATION.find((s) => s.value === r.statut)?.label}
                      </span>
                    </td>
                    <td>
                      {['EN_ATTENTE', 'DISPONIBLE'].includes(r.statut) && (
                        <button className="table-btn delete" onClick={() => annuler(r)}><i className="fas fa-times"></i></button>
                      )}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && <tr><td colSpan="6"><div className="empty">Aucune réservation.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>




      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Nouvelle réservation</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>


          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm" style={{ height: '270px' }}>
            <div className="form-grid">
              <div className="form-group">
                <div><label>Adhérent</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('adherent', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {adherents.map((a) => <option key={a.id} value={a.id}>{a.personne_str}</option>)}
                </select>
                {errors.adherent && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Ressource</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('ressource', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {ressources.map((r) => <option key={r.id} value={r.id}>{r.titre}</option>)}
                </select>
                {errors.ressource && <div className="form-errors">Champ requis</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>{isSubmitting ? 'Création...' : 'Réserver'}</button>
            </div>
          </form>

          <hr />
                    
          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
            Soumettez le formulaire si consigne respectée !
          </p>

        </div>

      </div>

    </div>

  );

}


export default ReservationsListe;