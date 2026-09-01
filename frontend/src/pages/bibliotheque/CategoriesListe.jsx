
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getCategories, creerCategorie, modifierCategorie, supprimerCategorie } from '../../api/bibliotheque';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';
function CategoriesListe() {
  const [categories, setCategories] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [categorieEnEdition, setCategorieEnEdition] = useState(null);
  const [categorieASupprimer, setCategorieASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = () => { getCategories().then((res) => setCategories(res.data)); };
  useEffect(() => { charger(); }, []);
  const filtres = categories.filter((c) => c.nom.toLowerCase().includes(recherche.toLowerCase()));
  const ouvrirCreation = () => {
    setCategorieEnEdition(null);
    reset({ nom: '', parent: '', description: '' });
    setModalOuvert(true);
  };
  const ouvrirEdition = (c) => {
    setCategorieEnEdition(c.id);
    reset({ nom: c.nom, parent: c.parent || '', description: c.description });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (categorieEnEdition) {
        await modifierCategorie(categorieEnEdition, data);
        afficherSucces('Catégorie modifiée avec succès.');
      } else {
        await creerCategorie(data);
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
      await supprimerCategorie(categorieASupprimer.id);
      afficherSucces('Catégorie supprimée.');
      setCategorieASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Catégories</h3>
            <div className="sub">{categories.length} catégorie(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i> Ajouter une catégorie
          </button>
        </div>
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher une catégorie..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des catégories</h2>
            <span>{filtres.length} résultat(s)</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Nom</th><th>Catégorie parente</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtres.map((c) => (
                  <tr className="row-link" key={c.id}>
                    <td className="cell-strong">{c.nom}</td>
                    <td>{c.parent_str || '—'}</td>
                    <td><div className="cell-sub description">{c.description || '—'}</div></td>
                    <td>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(c)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setCategorieASupprimer(c)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtres.length === 0 && (
                  <tr><td colSpan="4"><div className="empty">Aucune catégorie ne correspond à cette recherche.</div></td></tr>
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
            <button className="addInscr" onClick={() => setModalOuvert(false)}>
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
                <label>Catégorie parente</label>
                <select {...register('parent')}>
                  <option value="">Aucune (catégorie racine)</option>
                  {categories
                    .filter((c) => c.id !== categorieEnEdition)
                    .map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Description</label>
                <textarea rows="3" {...register('description')}></textarea>
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
export default CategoriesListe;