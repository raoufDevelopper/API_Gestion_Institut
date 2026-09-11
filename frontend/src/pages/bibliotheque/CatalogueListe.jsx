import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRessources, getCategories } from '../../api/bibliotheque';
import { getFilieres, getSpecialites } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import { TYPES_RESSOURCE } from './bibliothequeConstantes';
import Pagination from '../../components/Pagination';

import { supprimerRessource } from '../../api/bibliotheque';
import ConfirmationModal from '../../components/ConfirmationModal';

import '../../assets/css/crud.css';

const PAR_PAGE = 10;
function CatalogueListe() {
  const [ressources, setRessources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [filtreFiliere, setFiltreFiliere] = useState('');
  const [filtreDispo, setFiltreDispo] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();


  const [ressourceASupprimer, setRessourceASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerRessource(ressourceASupprimer.id);
      afficherSucces('Ressource supprimée (ou retirée si historique existant).');
      setRessourceASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };


  const charger = () => {
    getRessources({
      q: recherche || undefined, type: filtreType || undefined, categorie: filtreCategorie || undefined,
      filiere: filtreFiliere || undefined, disponibilite: filtreDispo || undefined,
    }).then((res) => setRessources(res.data));
  };

  useEffect(() => { charger(); }, [recherche, filtreType, filtreCategorie, filtreFiliere, filtreDispo]);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    getFilieres().then((res) => setFilieres(res.data.resultats || res.data));
  }, []);

  const reinitialiser = () => {
    setRecherche(''); setFiltreType(''); setFiltreCategorie(''); setFiltreFiliere(''); setFiltreDispo(''); setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(ressources.length / PAR_PAGE));

  const pageActuelle = ressources.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);




  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Catalogue</h3>
            <div className="sub">Rechercher et consulter les ressources disponibles</div>
          </div>
          <button className="btn-primary addInscr" onClick={() => navigate('/bibliotheque/catalogue/nouvelle')}>
            <i className="fas fa-plus"></i> Ajouter une ressource
          </button>
        </div>
        
        <div className="department-toolbar">
          
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher par titre, auteur, ISBN..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div className="toolbar-right">
            <button className="btn-light" onClick={reinitialiser}>Réinitialiser</button>
          </div>
        </div>


        <div className="department-toolbar">
          
          <div className="toolbar-left">
            <select className="filter-select" value={filtreType} onChange={(e) => { setFiltreType(e.target.value); setPage(1); }}>
              <option value="">Type — tous</option>
              {TYPES_RESSOURCE.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select className="filter-select" value={filtreCategorie} onChange={(e) => { setFiltreCategorie(e.target.value); setPage(1); }}>
              <option value="">Catégorie — toutes</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select className="filter-select" value={filtreFiliere} onChange={(e) => { setFiltreFiliere(e.target.value); setPage(1); }}>
              <option value="">Filière — toutes</option>
              {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select className="filter-select" value={filtreDispo} onChange={(e) => { setFiltreDispo(e.target.value); setPage(1); }}>
              <option value="">Disponibilité — tous</option>
              <option value="disponible">Disponible</option>
              <option value="indisponible">Indisponible</option>
            </select>
          </div>
          
        </div>
        
        
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Ressources</h2>
            <span>{ressources.length} résultat(s)</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Auteur</th>
                  <th>Catégorie</th>
                  <th>Exemplaires</th>
                  <th>Disponibles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageActuelle.map((r) => (
                  <tr className="row-link" key={r.id}>
                    <td className="cell-strong">{r.titre}</td>
                    <td>{TYPES_RESSOURCE.find((t) => t.value === r.type_ressource)?.label}</td>
                    <td>{r.auteurs_str?.join(', ') || '—'}</td>
                    <td>{r.categorie_str || '—'}</td>
                    <td>{r.nb_exemplaires_total}</td>
                    <td>
                      <span className={`badge ${r.nb_exemplaires_disponibles > 0 ? 'badge-success' : 'badge-danger'}`}>
                        <p className='bull'>&bull;</p>
                        {r.nb_exemplaires_disponibles}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/bibliotheque/catalogue/${r.id}`)}><i className="fas fa-eye"></i></button>
                      <button className="table-btn edit" onClick={() => navigate(`/bibliotheque/catalogue/${r.id}/modifier`)}><i className="fas fa-pen"></i></button>
                      <button className="table-btn delete" onClick={() => setRessourceASupprimer(r)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {pageActuelle.length === 0 && <tr><td colSpan="7"><div className="empty">Aucune ressource trouvée.</div></td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      <ConfirmationModal
        ouvert={!!ressourceASupprimer}
        titre="Supprimer la ressource"
        message={`Voulez-vous vraiment supprimer « ${ressourceASupprimer?.titre} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setRessourceASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>
  );
}
export default CatalogueListe;