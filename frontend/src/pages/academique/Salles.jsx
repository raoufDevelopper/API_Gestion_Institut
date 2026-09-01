import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getSalles, creerSalle, modifierSalle, supprimerSalle, getTypesSalle } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';


const STATUTS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'indisponible', label: 'Indisponible' },
  { value: 'construction', label: 'En construction' },
  { value: 'maintenance', label: 'En maintenance' },
  { value: 'fermee', label: 'Fermée' },
];

const TONE_STATUT = {
  disponible: 'success',
  indisponible: 'danger',
  construction: 'orange',
  maintenance: 'aqua',
  fermee: 'danger',
};


function Salles() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [typesSalle, setTypesSalle] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [salleEnEdition, setSalleEnEdition] = useState(null);
  const [salleASupprimer, setSalleASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [salleEnDetail, setSalleEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const charger = async () => {
    const res = await getSalles();
    setDonnees(res.data);
  };

  useEffect(() => {
    charger();
    getTypesSalle().then((res) => setTypesSalle(res.data));
  }, []);

  const sallesFiltrees = donnees.resultats.filter((s) => {
    const texte = (s.code + ' ' + s.nom + ' ' + s.localisation).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });

  const ouvrirCreation = () => {
    setSalleEnEdition(null);
    reset({ code: '', nom: '', type_salle: '', capacite: 0, localisation: '', equipements: '', statut: 'disponible' });
    setModalOuvert(true);
  };

  const ouvrirEdition = (salle) => {
    setSalleEnEdition(salle.id);
    reset({
      code: salle.code,
      nom: salle.nom,
      type_salle: salle.type_salle,
      capacite: salle.capacite,
      localisation: salle.localisation,
      equipements: salle.equipements,
      statut: salle.statut,
    });
    setModalOuvert(true);
  };

  const onSubmit = async (data) => {

    try {

      if (salleEnEdition) {
        await modifierSalle(salleEnEdition, data);
        afficherSucces('Salle modifiée avec succès.');
      } else {
        await creerSalle(data);
        afficherSucces('Salle créée avec succès.');
      }

      reset();
      setModalOuvert(false);
      setSalleEnEdition(null);
      charger();

    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || err.response?.data?.nom?.[0] || "Erreur lors de l'enregistrement de la salle."
      );
    }
  };


  const confirmerSuppression = async () => {

    setSuppressionEnCours(true);

    try {
      await supprimerSalle(salleASupprimer.id);
      afficherSucces('Salle supprimée.');
      setSalleASupprimer(null);
      charger();

    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');

    } finally {
      setSuppressionEnCours(false);
    }

  };


  const { total = 0, disponible = 0, indisponible = 0, maintenance = 0 } = donnees.kpis;



  return (
    <div className="container-principal">
      <div className="department-page">

        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des salles</h3>
            <div className="sub">{total} salle(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvelle salle
          </button>
        </div>


        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-door-open"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{disponible}</h2><span>Disponibles</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-tools"></i></div>
            <div className="count-top"><h2>{maintenance}</h2><span>En maintenance</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{indisponible}</h2><span>Indisponibles</span></div>
          </div>
        </div>


        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une salle..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>


        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des salles</h2>
            <span>{sallesFiltrees.length} salles</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Capacité</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sallesFiltrees.map((s) => (
                  <tr className="row-link" key={s.id}>
                    <td><div className="cell-strong mono">{s.code}</div></td>
                    <td>{s.nom}</td>
                    <td>{s.type_salle_libelle || '—'}</td>
                    <td>{s.capacite}</td>
                    <td>
                      <span className={`badge-${TONE_STATUT[s.statut]}`}>
                        <span className="dot"></span>
                        {STATUTS.find((st) => st.value === s.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setSalleEnDetail(s)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(s)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setSalleASupprimer(s)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {sallesFiltrees.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty">Aucune salle ne correspond à cette recherche.</div>
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

          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{salleEnEdition ? 'Modifier la salle' : 'Nouvelle salle'}</h2>
            <button className="btn-primary" onClick={() => setModalOuvert(false)}>
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
                {errors.code && <div className="form-errors">{errors.code.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Nom</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('nom', { required: 'Le nom est requis' })} />
                {errors.nom && <div className="form-errors">{errors.nom.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Type de salle</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('type_salle', { required: 'Le type de salle est requis' })}>
                  <option value="">Sélectionner...</option>
                  {typesSalle.map((t) => (
                    <option key={t.id} value={t.id}>{t.libelle}</option>
                  ))}
                </select>
                {errors.type_salle && <div className="form-errors">{errors.type_salle.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Capacité</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="number" min="0" {...register('capacite', { required: true, valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <div>
                  <label>Localisation</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <input type="text" {...register('localisation', { required: 'La localisation est requise' })} />
                {errors.localisation && <div className="form-errors">{errors.localisation.message}</div>}
              </div>
              <div className="form-group">
                <div>
                  <label>Statut</label>
                  <span className="required" style={{ color: 'red' }}>*</span>
                </div>
                <select {...register('statut', { required: true })}>
                  {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Équipements</label>
                <textarea rows="3" {...register('equipements')}></textarea>
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
      <div className="department-modal" style={{ display: salleEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail de la salle</h2>
            <button onClick={() => setSalleEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {salleEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{salleEnDetail.code}</p></div>
              <div className="form-group"><label>Nom</label><p>{salleEnDetail.nom}</p></div>
              <div className="form-group"><label>Type</label><p>{salleEnDetail.type_salle_libelle || '—'}</p></div>
              <div className="form-group"><label>Capacité</label><p>{salleEnDetail.capacite}</p></div>
              <div className="form-group"><label>Localisation</label><p>{salleEnDetail.localisation}</p></div>
              <div className="form-group"><label>Équipements</label><p>{salleEnDetail.equipements || '—'}</p></div>
              <div className="form-group"><label>Statut</label><p>{STATUTS.find((s) => s.value === salleEnDetail.statut)?.label}</p></div>
              <div className="form-group"><label>Ajoutée le</label><p>{new Date(salleEnDetail.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
          )}
        </div>
      </div>


      <ConfirmationModal
        ouvert={!!salleASupprimer}
        titre="Supprimer la salle"
        message={`Voulez-vous vraiment supprimer la salle « ${salleASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setSalleASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>

  );

}

export default Salles;