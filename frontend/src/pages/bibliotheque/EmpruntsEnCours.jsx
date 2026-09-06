
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmprunts } from '../../api/bibliotheque';
import { TYPES_ADHERENT, BADGE_STATUT_EMPRUNT, STATUTS_EMPRUNT } from './bibliothequeConstantes';
import Pagination from '../../components/Pagination';
import '../../assets/css/crud.css';



const PAR_PAGE = 12;


function EmpruntsEnCours() {
  const [emprunts, setEmprunts] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    getEmprunts({ statut: 'EN_COURS', q: recherche || undefined, type_adherent: filtreType || undefined }).then((res) => setEmprunts(res.data));
  }, [recherche, filtreType]);
  const totalPages = Math.max(1, Math.ceil(emprunts.length / PAR_PAGE));

  const pageActuelle = emprunts.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">
  
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Emprunts en cours</h3>
            <div className="sub">Liste des emprunts actuellement actifs</div>
          </div>
          <button className="btn-primary addInscr" onClick={() => navigate('/bibliotheque/emprunts/enregistrer')}>
            <i className="fas fa-plus"></i> Nouvel emprunt
          </button>
        </div>
  
  
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher par adhérent, ressource..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div className="toolbar-right">
            <select className="filter-select" value={filtreType} onChange={(e) => { setFiltreType(e.target.value); setPage(1); }}>
              <option value="">Type adhérent — tous</option>
              {TYPES_ADHERENT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
  
  
  
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Emprunts en cours</h2>
            <span>{emprunts.length} emprunts</span>
          </div>
          <div className="table-scroll">

            <table>
            
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Exemplaire</th>
                  <th>Emprunteur</th>
                  <th>Type</th>
                  <th>Date emprunt</th>
                  <th>Retour prévu</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
            
              <tbody>
                {pageActuelle.map((e) => (
                  <tr className="row-link" key={e.id}>
                    <td className="cell-strong">{e.ressource_str}</td>
                    <td className="mono">{e.exemplaire_str}</td>
                    <td>{e.adherent_str}</td>
                    <td>
                      <span className={`badge ${TYPES_ADHERENT.find((t) => t.value === e.type_adherent)?.label === 'Étudiant' ? 'badge-orange' : 'badge-violet'}`}>
                        <p className='bull'>&bull;</p>
                        {TYPES_ADHERENT.find((t) => t.value === e.type_adherent)?.label}
                      </span>
                    </td>
                    <td>{new Date(e.date_emprunt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>{new Date(e.date_retour_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>
                      <span className={`badge ${e.est_en_retard ? 'badge-danger' : 'badge-aqua'}`}>
                        <p className='bull'>&bull;</p>
                        {e.est_en_retard ? 'En retard' : 'En cours'}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/bibliotheque/emprunts/historique?q=${e.numero}`)}><i className="fas fa-eye"></i></button>
                      <button className="table-btn download" onClick={() => navigate(`/bibliotheque/emprunts/retours?exemplaire=${e.exemplaire}`)}><i className="fas fa-undo"></i></button>
                    </td>
                  </tr>
                ))}
                {pageActuelle.length === 0 && <tr><td colSpan="8"><div className="empty">Aucun emprunt en cours.</div></td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
export default EmpruntsEnCours;