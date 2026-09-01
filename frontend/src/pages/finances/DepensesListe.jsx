import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getDepenses, creerDepense, modifierDepense, supprimerDepense, getCategoriesDepense, getCaisses } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { MODES_DEPENSE, STATUTS_DEPENSE, BADGE_STATUT_DEPENSE } from './financesConstantes';
import '../../assets/css/crud.css';
function DepensesListe() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [categories, setCategories] = useState([]);
  const [caisses, setCaisses] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [depenseEnEdition, setDepenseEnEdition] = useState(null);
  const [depenseASupprimer, setDepenseASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getDepenses();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
    getCategoriesDepense().then((res) => setCategories(res.data.resultats));
    getCaisses().then((res) => setCaisses(res.data));
  }, []);
  const depensesFiltrees = donnees.resultats.filter((d) => {
    const texte = (d.libelle + ' ' + d.categorie_nom).toLowerCase();
    const matchRecherche = texte.includes(recherche.toLowerCase());
    const matchCategorie = !filtreCategorie || String(d.categorie) === filtreCategorie;
    return matchRecherche && matchCategorie;
  });
  const ouvrirCreation = () => {
    setDepenseEnEdition(null);
    reset({ categorie: '', libelle: '', montant: '', date_depense: '', mode_paiement: '', caisse_session: '', statut: 'EN_ATTENTE' });
    setModalOuvert(true);
  };
  const ouvrirEdition = (d) => {
    setDepenseEnEdition(d.id);
    reset({
      categorie: d.categorie, libelle: d.libelle, montant: d.montant,
      date_depense: d.date_depense, mode_paiement: d.mode_paiement,
      caisse_session: d.caisse_session || '', statut: d.statut,
    });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([cle, valeur]) => {
      if (cle === 'justificatif') {
        if (valeur instanceof FileList && valeur.length > 0) formData.append(cle, valeur[0]);
      } else if (valeur !== null && valeur !== undefined && valeur !== '') {
        formData.append(cle, valeur);
      }
    });
    try {
      if (depenseEnEdition) {
        await modifierDepense(depenseEnEdition, formData);
        afficherSucces('Dépense modifiée avec succès.');
      } else {
        await creerDepense(formData);
        afficherSucces('Dépense créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setDepenseEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.non_field_errors?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerDepense(depenseASupprimer.id);
      afficherSucces('Dépense supprimée.');
      setDepenseASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const { total = 0, payee = 0, approuvee = 0, en_attente = 0, rejetee = 0 } = donnees.kpis;



  return (
    <div className="container-principal">
      <div className="personnel">
        <div className="department-page">

          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Journal des dépenses</h3>
              <div className="sub">{total} dépense(s)</div>
            </div>
            <button className="btn-primary addInscr" onClick={ouvrirCreation}>
              <i className="fas fa-plus"></i>
              Nouvelle dépense
            </button>
          </div>


          <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
            <div className="department-card">
              <div className="kpi-icon blue"><i className="fa-solid fa-money-bill-wave"></i></div>
              <div className="count-top"><h2>{total}</h2><span>Dépenses</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
              <div className="count-top"><h2>{payee}</h2><span>Payées</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon violet"><i className="fas fa-check-circle"></i></div>
              <div className="count-top"><h2>{approuvee}</h2><span>Approuvées</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon aqua"><i className="fa-solid fa-pause-circle"></i></div>
              <div className="count-top"><h2>{en_attente}</h2><span>En attente</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
              <div className="count-top"><h2>{rejetee}</h2><span>Rejetées</span></div>
            </div>
          </div>


          <div className="department-toolbar">

            <div className="toolbar-left">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Rechercher une dépense..." value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
              </div>
            </div>

            <div className="toolbar-right">
              <select className="filter-select" value={filtreCategorie} onChange={(e) => setFiltreCategorie(e.target.value)}>
                <option value="">Catégorie — toutes</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

          </div>

          
          <div className="department-card table-card">
            <div className="table-title">
              <h2>Liste des dépenses</h2>
              <span>{depensesFiltrees.length} dépense(s)</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Libellé</th>
                    <th>Date</th>
                    <th>Mode</th>
                    <th className="num">Montant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depensesFiltrees.map((d) => (
                    <tr className="row-link" key={d.id}>
                      <td>
                        <span className={`badge ${d.categorie_est_tresorerie ? 'badge-warning' : 'badge-danger'}`}>
                          <span className="dot"></span>
                          {d.categorie_nom}
                        </span>
                      </td>
                      <td className="cell-strong">{d.libelle}</td>
                      <td className="mono" style={{ color: 'var(--text-600)', fontSize: '12.5px' }}>{new Date(d.date_depense).toLocaleDateString('fr-FR')}</td>
                      <td>{MODES_DEPENSE.find((m) => m.value === d.mode_paiement)?.label}</td>
                      <td className="cell-amount">{d.montant} FCFA</td>
                      <td>
                        <span className={`badge ${BADGE_STATUT_DEPENSE[d.statut]}`}>
                          <span className="dot"></span>
                          {STATUTS_DEPENSE.find((s) => s.value === d.statut)?.label}
                        </span>
                      </td>
                      <td>
                        <button className="table-btn view" onClick={() => navigate(`/finances/depenses/${d.id}`)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-btn edit" onClick={() => ouvrirEdition(d)}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="table-btn delete" onClick={() => setDepenseASupprimer(d)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {depensesFiltrees.length === 0 && (
                    <tr><td colSpan="7"><div className="empty">Aucune dépense trouvée.</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7a5503,#d3b429)' }}>
            <h2>{depenseEnEdition ? 'Modifier la dépense' : 'Nouvelle dépense'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm" encType="multipart/form-data">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Catégorie</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('categorie', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
                {errors.categorie && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Libellé</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" {...register('libelle', { required: true })} />
                {errors.libelle && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Montant</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="number" step="0.01" min="0.01" {...register('montant', { required: true })} />
                {errors.montant && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Date de dépense</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="date" {...register('date_depense', { required: true })} />
                {errors.date_depense && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Mode de paiement</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('mode_paiement', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {MODES_DEPENSE.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                {errors.mode_paiement && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <label>Session de caisse</label>
                <select {...register('caisse_session')}>
                  <option value="">Aucune</option>
                  {caisses.map((c) => <option key={c.id} value={c.id}>{new Date(c.date_session).toLocaleDateString('fr-FR')} {c.statut === 'OUVERTE' ? '(ouverte)' : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select {...register('statut')}>
                  {STATUTS_DEPENSE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Justificatif</label>
                <input type="file" {...register('justificatif')} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
          <hr />
          <p id="consigne">Le remplissage des champs marqués avec (*) est obligatoire.</p>
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!depenseASupprimer}
        titre="Supprimer la dépense"
        message={`Voulez-vous vraiment supprimer « ${depenseASupprimer?.libelle} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setDepenseASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default DepensesListe;