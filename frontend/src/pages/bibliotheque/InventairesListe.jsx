import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getInventaires, creerInventaire } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';



function InventairesListe() {
  const [inventaires, setInventaires] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const charger = () => { getInventaires().then((res) => setInventaires(res.data)); };
  useEffect(() => { charger(); }, []);

  const onSubmit = async (data) => {
    try {
      const res = await creerInventaire(data);
      afficherSucces('Inventaire lancé avec succès.');
      setModalOuvert(false);
      navigate(`/bibliotheque/inventaire/${res.data.id}`);
    } catch (err) {
      afficherErreur("Erreur lors du lancement de l'inventaire.");
    }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div><h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Inventaire</h3><div className="sub">Suivre les inventaires de la bibliothèque</div></div>
          <button className="btn-primary addInscr" onClick={() => { reset({ zone_concernee: '', observations: '' }); setModalOuvert(true); }}>
            <i className="fas fa-plus"></i> Nouvel inventaire
          </button>
        </div>

        <div className="department-card table-card">
          <div className="table-title">
            <h2>Inventaires récents</h2>
            <span>{inventaires.length} Inventaires</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Date</th><th>Zone</th><th>Théoriques</th><th>Vérifiés</th><th>Anomalies</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {inventaires.map((inv) => (
                  <tr className="row-link" key={inv.id}>
                    <td>{new Date(inv.date_inventaire).toLocaleDateString('fr-FR')}</td>
                    <td>{inv.zone_concernee || 'Toute la bibliothèque'}</td>
                    <td>{inv.nb_exemplaires_theoriques}</td>
                    <td>{inv.nb_exemplaires_verifies}</td>
                    <td><span className={`badge ${inv.nb_anomalies > 0 ? 'badge-danger' : 'badge-success'}`}><span className="dot"></span>{inv.nb_anomalies}</span></td>
                    <td><span className={`badge ${inv.statut === 'TERMINE' ? 'badge-success' : 'badge-warning'}`}><span className="dot"></span>{inv.statut === 'TERMINE' ? 'Terminé' : 'En cours'}</span></td>
                    <td><button className="table-btn view" onClick={() => navigate(`/bibliotheque/inventaire/${inv.id}`)}><i className="fas fa-eye"></i></button></td>
                  </tr>
                ))}
                {inventaires.length === 0 && <tr><td colSpan="7"><div className="empty">Aucun inventaire.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>




      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Nouvel inventaire</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm" style={{ height: '350px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Zone concernée</label>
                <input type="text" placeholder="Ex: Rayon A, ou laisser vide pour tout" {...register('zone_concernee')} />
              </div>
              <div className="form-group full">
                <label>Observations</label>
                <textarea rows="2" {...register('observations')}></textarea>
              </div>
            </div>
            <div className="modal-footer"><button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>Lancer l'inventaire</button></div>
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
export default InventairesListe;