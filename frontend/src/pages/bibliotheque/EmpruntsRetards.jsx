
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRetards, relancerReservations } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';



function EmpruntsRetards() {
  const [retards, setRetards] = useState([]);
  const [recherche, setRecherche] = useState('');
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  useEffect(() => { getRetards({ q: recherche || undefined }).then((res) => setRetards(res.data)); }, [recherche]);
  const envoyerRappels = async () => {
    try {
      const res = await relancerReservations();
      afficherSucces(res.data.detail);
    } catch (err) {
      afficherErreur("Erreur lors de l'envoi des rappels.");
    }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Emprunts en retard</h3>
            <div className="sub">
              Visualisez la liste des emprunts en retard et envoyez 
              des rappels aux concernés.
            </div>
          </div>
        </div>

        <div className="edt-alerte-conflits" style={{ marginBottom: '0' }}>
          <i className="fas fa-triangle-exclamation"></i>
          <div>{retards.length} emprunt(s) en retard. Merci de rappeler les adhérents concernés.</div>
        </div>

        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
          </div>
        </div>


        <div className="department-card table-card">
          <div className="table-title">
            <h2>Retards</h2>
            <span>{retards.length} emprunts en reatard</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Emprunteur</th>
                  <th>Ressource</th>
                  <th>Date retour prévu</th>
                  <th>Jours de retard</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {retards.map((r) => (
                  <tr className="row-link" key={r.id}>
                    <td className="cell-strong">{r.adherent_str}</td>
                    <td>{r.ressource_str}</td>
                    <td>{new Date(r.date_retour_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>
                      <span className="badge badge-danger">
                        <p className='bull'>&bull;</p>
                        {r.jours_de_retard} jours
                      </span>
                    </td>
                    <td>
                      <button className="table-btn" onClick={() => navigate(`/bibliotheque/emprunts/retours?exemplaire=${r.exemplaire}`)}><i className="fas fa-undo"></i></button>
                    </td>
                  </tr>
                ))}
                {retards.length === 0 && <tr><td colSpan="5"><div className="empty">Aucun retard.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ marginTop: '0px' }}>
          <button className="btn-primary addInscr" onClick={envoyerRappels}>Envoyer des rappels à tous</button>
        </div>
      </div>
    </div>
  );
}
export default EmpruntsRetards;