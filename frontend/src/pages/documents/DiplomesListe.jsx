
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDiplomes, telechargerDiplome } from '../../api/documents';
import { useAlert } from '../../context/AlertContext';
import { BADGE_STATUT_DIPLOME, STATUTS_DIPLOME, telechargerFichier } from './documentsConstantes';
import Pagination from '../../components/Pagination';
import '../../assets/css/crud.css';

const PAR_PAGE = 10;

function DiplomesListe() {
  const [diplomes, setDiplomes] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [filtreMention, setFiltreMention] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);
  const { afficherErreur } = useAlert();
  const navigate = useNavigate();
  const charger = async () => {
    const res = await getDiplomes();
    setDiplomes(res.data);
  };
  useEffect(() => { charger(); }, []);
  const annees = useMemo(() => {
    const set = new Set(diplomes.map((d) => new Date(d.date_obtention).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [diplomes]);
  const mentions = useMemo(() => Array.from(new Set(diplomes.map((d) => d.mention).filter(Boolean))), [diplomes]);
  const filtres = diplomes.filter((d) => {
    const texte = (d.numero_diplome + ' ' + d.etudiant_str).toLowerCase();
    const matchRecherche = texte.includes(recherche.toLowerCase());
    const matchAnnee = !filtreAnnee || String(new Date(d.date_obtention).getFullYear()) === filtreAnnee;
    const matchMention = !filtreMention || d.mention === filtreMention;
    const matchStatut = !filtreStatut || d.statut === filtreStatut;
    return matchRecherche && matchAnnee && matchMention && matchStatut;
  });
  const totalPages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));
  const pageActuelle = filtres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const telecharger = async (d) => {
    try {
      const res = await telechargerDiplome(d.id);
      telechargerFichier(res.data, `diplome_${d.numero_diplome}.pdf`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement.');
    }
  };


  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Diplômes</h3>
            <div className="sub">Gestion documentaire — Diplômes</div>
          </div>
          <button className="btn-primary addInscr" onClick={() => navigate('/documents/diplomes/generer')}>
            <i className="fas fa-plus"></i> Générer un diplôme
          </button>
        </div>

        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher par numéro ou étudiant..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}/>
            </div>
          </div>
        </div>



        <div className="department-toolbar">

          <div className="toolbar-left">
            <select className="filter-select" value={filtreAnnee} onChange={(e) => { setFiltreAnnee(e.target.value); setPage(1); }}>
              <option value="">Année d'obtention</option>
              {annees.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select className="filter-select" value={filtreMention} onChange={(e) => { setFiltreMention(e.target.value); setPage(1); }}>
              <option value="">Toutes les mentions</option>
              {mentions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select className="filter-select" value={filtreStatut} onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}>
              <option value="">Tous les statuts</option>
              {STATUTS_DIPLOME.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          
        </div>



        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des diplômes</h2>
            <span>{filtres.length} diplôme(s)</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>N° Diplôme</th>
                  <th>Étudiant</th>
                  <th>Mention</th>
                  <th>Date d'obtention</th>
                  {/*<th>Signé par</th>*/}
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageActuelle.map((d) => (
                  <tr className="row-link" key={d.id}>
                    <td className="cell-strong mono">{d.numero_diplome}</td>
                    <td>{d.etudiant_str}</td>
                    <td>{d.mention || '—'}</td>
                    <td>{new Date(d.date_obtention).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    {/*<td>{d.signe_par_str || '—'}</td>*/}
                    <td>
                      <span className={`badge ${BADGE_STATUT_DIPLOME[d.statut]}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS_DIPLOME.find((s) => s.value === d.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/documents/diplomes/${d.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn download" onClick={() => telecharger(d)}>
                        <i className="fas fa-download"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {pageActuelle.length === 0 && (
                  <tr><td colSpan="7"><div className="empty">Aucun diplôme ne correspond à cette recherche.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
export default DiplomesListe;