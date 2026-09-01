
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getCategoriesDepense, creerCategorieDepense, modifierCategorieDepense, supprimerCategorieDepense } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';

function CategoriesDepense() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [categorieEnEdition, setCategorieEnEdition] = useState(null);
  const [categorieASupprimer, setCategorieASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [categorieEnDetail, setCategorieEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getCategoriesDepense();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const categoriesFiltrees = donnees.resultats.filter((c) => c.nom.toLowerCase().includes(recherche.toLowerCase()));
  const ouvrirCreation = () => {
    setCategorieEnEdition(null);
    reset({ nom: '', est_tresorerie: false });
    setModalOuvert(true);
  };
  const ouvrirEdition = (c) => {
    setCategorieEnEdition(c.id);
    reset({ nom: c.nom, est_tresorerie: c.est_tresorerie });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (categorieEnEdition) {
        await modifierCategorieDepense(categorieEnEdition, data);
        afficherSucces('Catégorie modifiée avec succès.');
      } else {
        await creerCategorieDepense(data);
        afficherSucces('Catégorie créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setCategorieEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerCategorieDepense(categorieASupprimer.id);
      afficherSucces('Catégorie supprimée.');
      setCategorieASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const { total = 0, tresorerie = 0, operationnelle = 0 } = donnees.kpis;
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Catégories de dépense</h3>
            <div className="sub">{total} catégorie(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle catégorie
          </button>
        </div>
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-tags"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon orange"><i className="fas fa-piggy-bank"></i></div>
            <div className="count-top"><h2>{tresorerie}</h2><span>Trésorerie</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-money-bill-wave"></i></div>
            <div className="count-top"><h2>{operationnelle}</h2><span>Opérationnelles</span></div>
          </div>
        </div>
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des catégories</h2>
            <span>{categoriesFiltrees.length} résultats</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categoriesFiltrees.map((c) => (
                  <tr className="row-link" key={c.id}>
                    <td><div className="cell-strong">{c.nom}</div></td>
                    <td>
                      <span className={`badge ${c.est_tresorerie ? 'badge-orange' : 'badge-success'}`}>
                        <span className="dot"></span>
                        {c.est_tresorerie ? 'Trésorerie' : 'Opérationnelle'}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setCategorieEnDetail(c)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(c)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setCategorieASupprimer(c)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {categoriesFiltrees.length === 0 && (
                  <tr><td colSpan="3"><div className="empty">Aucune catégorie ne correspond à cette recherche.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{categorieEnEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Nom</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" {...register('nom', { required: 'Le nom est requis' })} />
                {errors.nom && <div className="form-errors">{errors.nom.message}</div>}
              </div>

              <div className="form-group">
                <label className="switch-row" style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "solid 1px var(--input)" }}>
                  <span style={{ marginRight: "10px" }}>Mouvement de trésorerie</span>
                  <label className="switch">
                    <input style={{ width: "44px" }} type="checkbox" {...register('est_tresorerie')} />
                    <span className="slider"></span>
                  </label>
                </label>
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




      <div className="department-modal" style={{ display: categorieEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail de la catégorie</h2>
            <button onClick={() => setCategorieEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {categorieEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Nom</label><p>{categorieEnDetail.nom}</p></div>
              <div className="form-group"><label>Type</label><p>{categorieEnDetail.est_tresorerie ? 'Mouvement de trésorerie' : 'Dépense opérationnelle'}</p></div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!categorieASupprimer}
        titre="Supprimer la catégorie"
        message={`Voulez-vous vraiment supprimer « ${categorieASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setCategorieASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default CategoriesDepense;