import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getNiveaux, creerNiveau, modifierNiveau, supprimerNiveau } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';


const CYCLES = [
  { value: 'bts', label: 'BTS' },
  { value: 'licence', label: 'Licence' },
  { value: 'master', label: 'Master' },
  { value: 'doctorat', label: 'Doctorat' },
  { value: 'plus', label: 'Plus' },
];

function Niveaux() {
  const [niveaux, setNiveaux] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [niveauEnEdition, setNiveauEnEdition] = useState(null);
  const [niveauASupprimer, setNiveauASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [niveauEnDetail, setNiveauEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const charger = async () => {
    const res = await getNiveaux();
    setNiveaux(res.data);
  };

  useEffect(() => {
    charger();
  }, []);

  const niveauxFiltres = niveaux.filter((n) => {
    const texte = (n.code + ' ' + n.nom + ' ' + n.cycle).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });

  const ouvrirCreation = () => {
    setNiveauEnEdition(null);
    reset({ code: '', nom: '', cycle: '' });
    setModalOuvert(true);
  };

  const ouvrirEdition = (niveau) => {
    setNiveauEnEdition(niveau.id);
    reset({ code: niveau.code, nom: niveau.nom, cycle: niveau.cycle });
    setModalOuvert(true);
  };

  const onSubmit = async (data) => {
    try {
      if (niveauEnEdition) {
        await modifierNiveau(niveauEnEdition, data);
        afficherSucces('Niveau modifié avec succès.');
      } else {
        await creerNiveau(data);
        afficherSucces('Niveau créé avec succès.');
      }
      reset();
      setModalOuvert(false);
      setNiveauEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement du niveau."
      );
    }
  };

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerNiveau(niveauASupprimer.id);
      afficherSucces('Niveau supprimé.');
      setNiveauASupprimer(null);
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


        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des niveaux</h3>
            <div className="sub">{niveaux.length} niveau(x)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouveau niveau
          </button>
        </div>


        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un niveau..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>


        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des niveaux</h2>
            <span>{niveauxFiltres.length} niveaux</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Cycle</th>
                  <th>Ajouté le</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {niveauxFiltres.map((n) => (
                  <tr className="row-link" key={n.id}>
                    <td><div className="cell-strong mono">{n.code}</div></td>
                    <td>{n.nom}</td>
                    <td>{CYCLES.find((c) => c.value === n.cycle)?.label || n.cycle}</td>
                    <td>{new Date(n.date_creation).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button className="table-btn view" onClick={() => setNiveauEnDetail(n)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(n)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setNiveauASupprimer(n)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {niveauxFiltres.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucun niveau ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* MODAL DE CREATION / MODIFICATION */}
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{niveauEnEdition ? 'Modifier le niveau' : 'Nouveau niveau'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div>
                  <label>Code</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('code', { required: 'Le code est requis' })} />
                <div className="text-help">
                  EX : NIV1, NIV2, NIV3... L1, L2, L3... 1A, 2A, 3A... 
                  <br /> Selon le système de nomenclature 
                  utilisé dans votre institu (Licence, Niveau, Année ...)
                </div>
                {errors.code && <div className="form-errors">{errors.code.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Nom</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('nom', { required: 'Le nom est requis' })} />
                <div className="text-help">
                  EX : Niveau 1... Licence2... Première année... 
                  <br /> Selon le système de nomenclature 
                  utilisé dans votre institu (Licence, Niveau, Année ...)
                </div>
                {errors.nom && <div className="form-errors">{errors.nom.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Cycle</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('cycle', { required: 'Le cycle est requis' })}>
                  <option value="">Sélectionner...</option>
                  {CYCLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.cycle && <div className="form-errors">{errors.cycle.message}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
          <hr />
          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
            Soumettez le formulaire si consigne respectée !
          </p>
        </div>
      </div>



      {/* MODAL DETAIL */}
      <div className="department-modal" style={{ display: niveauEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail du niveau</h2>
            <button onClick={() => setNiveauEnDetail(null)} className='btn-primary'>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {niveauEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{niveauEnDetail.code}</p></div>
              <div className="form-group"><label>Nom</label><p>{niveauEnDetail.nom}</p></div>
              <div className="form-group"><label>Cycle</label><p>{CYCLES.find((c) => c.value === niveauEnDetail.cycle)?.label}</p></div>
              <div className="form-group"><label>Ajouté le</label><p>{new Date(niveauEnDetail.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
          )}
        </div>
      </div>


      <ConfirmationModal
        ouvert={!!niveauASupprimer}
        titre="Supprimer le niveau"
        message={`Voulez-vous vraiment supprimer le niveau « ${niveauASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setNiveauASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default Niveaux;