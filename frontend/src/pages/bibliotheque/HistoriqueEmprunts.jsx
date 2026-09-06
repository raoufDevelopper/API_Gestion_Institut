
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHistoriqueEmprunts } from '../../api/bibliotheque';
import { STATUTS_EMPRUNT, BADGE_STATUT_EMPRUNT } from './bibliothequeConstantes';
import Pagination from '../../components/Pagination';
import '../../assets/css/crud.css';


const PAR_PAGE = 15;


function HistoriqueEmprunts() {
  const [searchParams] = useSearchParams();
  const [emprunts, setEmprunts] = useState([]);
  const [recherche, setRecherche] = useState(searchParams.get('q') || '');
  const [filtrePeriode, setFiltrePeriode] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getHistoriqueEmprunts({ q: recherche || undefined, periode: filtrePeriode || undefined, statut: filtreStatut || undefined }).then((res) => setEmprunts(res.data));
  }, [recherche, filtrePeriode, filtreStatut]);

  const totalPages = Math.max(1, Math.ceil(emprunts.length / PAR_PAGE));

  const pageActuelle = emprunts.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Historique des emprunts</h3>
            <div className="sub">Visualisez l'historique des emprunts</div>
          </div>
        </div>
        
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
            </div>
          </div>
          
          <div className="toolbar-right">
            <select className="filter-select" value={filtrePeriode} onChange={(e) => setFiltrePeriode(e.target.value)}>
              <option value="">Période — toutes</option>
              <option value="mois">Ce mois-ci</option>
            </select>
          </div>
          
          <div className="toolbar-right">
            <select className="filter-select" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
              <option value="">Statut — tous</option>
              {STATUTS_EMPRUNT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        
        
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Historique des emprunts</h2>
            <span>{emprunts.length} historiques</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>N° Emprunt</th>
                  <th>Ressource</th>
                  <th>Exemplaire</th>
                  <th>Emprunteur</th>
                  <th>Date emprunt</th>
                  <th>Date retour</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {pageActuelle.map((e) => (
                  <tr key={e.id}>
                    <td className="cell-strong mono">{e.numero}</td>
                    <td>{e.ressource_str}</td>
                    <td className="mono">{e.exemplaire_str}</td>
                    <td>{e.adherent_str}</td>
                    <td>{new Date(e.date_emprunt).toLocaleDateString('fr-FR')}</td>
                    <td>{e.date_retour_reelle ? new Date(e.date_retour_reelle).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>
                      <span className={`badge ${BADGE_STATUT_EMPRUNT[e.statut]}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS_EMPRUNT.find((s) => s.value === e.statut)?.label}
                      </span>
                    </td>
                  </tr>
                ))}
                {pageActuelle.length === 0 && <tr><td colSpan="7"><div className="empty">Aucun résultat.</div></td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
export default HistoriqueEmprunts;