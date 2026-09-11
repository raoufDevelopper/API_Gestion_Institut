import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getExemplaires, modifierExemplaire, getRessources, getLocalisations, supprimerExemplaire } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_EXEMPLAIRE, BADGE_STATUT_EXEMPLAIRE, ETATS_PHYSIQUE } from './bibliothequeConstantes';
import ConfirmationModal from '../../components/ConfirmationModal';

import Pagination from '../../components/Pagination';
import '../../assets/css/crud.css';

const PAR_PAGE = 15;

function ExemplairesListe() {
  const [searchParams] = useSearchParams();
  const [exemplaires, setExemplaires] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [localisations, setLocalisations] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreLocalisation, setFiltreLocalisation] = useState('');
  const [filtreEtat, setFiltreEtat] = useState('');
  const [page, setPage] = useState(1);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [exemplaireEnEdition, setExemplaireEnEdition] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const [exemplaireASupprimer, setExemplaireASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerExemplaire(exemplaireASupprimer.id);
      afficherSucces('Exemplaire supprimé (ou retiré si historique existant).');
      setExemplaireASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const charger = () => {
    getExemplaires({
      q: recherche || undefined, statut: filtreStatut || undefined,
      localisation: filtreLocalisation || undefined, etat: filtreEtat || undefined,
      ressource: searchParams.get('ressource') || undefined,
    }).then((res) => setExemplaires(res.data));
  };

  useEffect(() => { charger(); }, [recherche, filtreStatut, filtreLocalisation, filtreEtat]);

  useEffect(() => {
    getRessources().then((res) => setRessources(res.data));
    getLocalisations().then((res) => setLocalisations(res.data));
  }, []);

  const ouvrirEdition = (ex) => {
    setExemplaireEnEdition(ex.id);
    reset({ localisation: ex.localisation || '', etat: ex.etat, statut: ex.statut });
    setModalOuvert(true);
  };


  const onSubmit = async (data) => {
    try {
      await modifierExemplaire(exemplaireEnEdition, data);
      afficherSucces('Exemplaire modifié avec succès.');
      setModalOuvert(false);
      charger();
    } catch (err) {
      afficherErreur("Erreur lors de la modification.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(exemplaires.length / PAR_PAGE));

  const pageActuelle = exemplaires.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);




  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Exemplaires</h3>
            <div className="sub">Gérer tous les exemplaires physiques de la bibliothèque</div>
          </div>
        </div>


        <div className="department-toolbar">

          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher par code, ressource..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
            </div>
          </div>
          
        </div>


        <div className="department-toolbar">

          <div className="toolbar-left">
            <select className="filter-select" value={filtreStatut} onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}>
              <option value="">Statut — tous</option>
              {STATUTS_EXEMPLAIRE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select className="filter-select" value={filtreLocalisation} onChange={(e) => { setFiltreLocalisation(e.target.value); setPage(1); }}>
              <option value="">Localisation — toutes</option>
              {localisations.map((l) => <option key={l.id} value={l.id}>{[l.salle, l.rayon, l.etagere].filter(Boolean).join(' → ')}</option>)}
            </select>
          </div>

          <div className="toolbar-left">
            <select className="filter-select" value={filtreEtat} onChange={(e) => { setFiltreEtat(e.target.value); setPage(1); }}>
              <option value="">État — tous</option>
              {ETATS_PHYSIQUE.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          
        </div>


        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des exemplaires</h2>
            <span>{exemplaires.length} exemplaire(s)</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Ressource</th>
                  <th>Localisation</th>
                  <th>État</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageActuelle.map((ex) => (
                  <tr className="row-link" key={ex.id}>
                    <td className="cell-strong mono">{ex.numero}</td>
                    <td>{ex.ressource_titre}</td>
                    <td>{ex.localisation_str || '—'}</td>
                    <td>
                      <span className={`badge badge-${ETATS_PHYSIQUE.find((e) => e.value === ex.etat)?.label === "Bon" ? 'success' : 'orange'}`}>
                        <p className='bull'>&bull;</p>
                        {ETATS_PHYSIQUE.find((e) => e.value === ex.etat)?.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${BADGE_STATUT_EXEMPLAIRE[ex.statut]}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS_EXEMPLAIRE.find((s) => s.value === ex.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/bibliotheque/catalogue/${ex.ressource}`)}><i className="fas fa-eye"></i></button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(ex)}><i className="fas fa-pen"></i></button>
                      <button className="table-btn delete" onClick={() => setExemplaireASupprimer(ex)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {pageActuelle.length === 0 && <tr><td colSpan="6"><div className="empty">Aucun exemplaire trouvé.</div></td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Modifier l'exemplaire</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <label>Localisation</label>
                <select {...register('localisation')}>
                  <option value="">Non localisé</option>
                  {localisations.map((l) => <option key={l.id} value={l.id}>{[l.salle, l.rayon, l.etagere].filter(Boolean).join(' → ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>État</label>
                <select {...register('etat')}>{ETATS_PHYSIQUE.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}</select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select {...register('statut')}>{STATUTS_EXEMPLAIRE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
              </div>
            </div>
            <div className="modal-footer"><button type="submit" className="btn-primary addInscr">Enregistrer</button></div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        ouvert={!!exemplaireASupprimer}
        titre="Supprimer l'exemplaire"
        message={`Voulez-vous vraiment supprimer « ${exemplaireASupprimer?.numero} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setExemplaireASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>
  );
}
export default ExemplairesListe;