import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getInscriptions, creerInscription, modifierInscription, supprimerInscription } from '../../api/finances';
import { getEtudiants } from '../../api/utilisateurs';
import { getClasses, getAnneesAcademiques } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { STATUTS_INSCRIPTION, BADGE_STATUT_INSCRIPTION, BADGE_STATUT_FINANCIER, LABEL_STATUT_FINANCIER } from './financesConstantes';
import '../../assets/css/crud.css';


function InscriptionsListe() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreStatutFinancier, setFiltreStatutFinancier] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [inscriptionEnEdition, setInscriptionEnEdition] = useState(null);
  const [inscriptionASupprimer, setInscriptionASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getInscriptions();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
    getEtudiants().then((res) => setEtudiants(res.data));
    getClasses().then((res) => setClasses(res.data));
    getAnneesAcademiques().then((res) => setAnneesAcademiques(res.data.resultats || res.data));
  }, []);
  const inscriptionsFiltrees = donnees.resultats.filter((i) => {
    const texte = (i.etudiant_str + ' ' + i.classe_str).toLowerCase();
    const matchRecherche = texte.includes(recherche.toLowerCase());
    const matchStatutFinancier = !filtreStatutFinancier || i.statut_paiement === filtreStatutFinancier;
    return matchRecherche && matchStatutFinancier;
  });
  const ouvrirCreation = () => {
    setInscriptionEnEdition(null);
    reset({ etudiant: '', classe: '', annee_academique: '', date_inscription: '', statut: 'EN_ATTENTE' });
    setModalOuvert(true);
  };
  const ouvrirEdition = (i) => {
    setInscriptionEnEdition(i.id);
    reset({
      etudiant: i.etudiant, classe: i.classe, annee_academique: i.annee_academique,
      date_inscription: i.date_inscription, statut: i.statut,
    });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (inscriptionEnEdition) {
        await modifierInscription(inscriptionEnEdition, data);
        afficherSucces('Inscription modifiée avec succès.');
      } else {
        await creerInscription(data);
        afficherSucces('Inscription créée avec succès.');
      }
      reset();
      setModalOuvert(false);
      setInscriptionEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.non_field_errors?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerInscription(inscriptionASupprimer.id);
      afficherSucces('Inscription supprimée.');
      setInscriptionASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const { total = 0, validee = 0, en_attente = 0, annulee = 0 } = donnees.kpis;
  return (
    <div className="container-principal">
      <div className="personnel">
        <div className="department-page">
          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Journal des inscriptions</h3>
              <div className="sub">{total} inscription(s)</div>
            </div>
            <button className="btn-primary addInscr" onClick={ouvrirCreation}>
              <i className="fas fa-plus"></i>
              Nouvelle inscription
            </button>
          </div>
          <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(350px,1fr))' }}>
            <div className="department-card">
              <div className="kpi-icon blue"><i className="fa-solid fa-user-plus"></i></div>
              <div className="count-top"><h2>{total}</h2><span>Inscriptions</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
              <div className="count-top"><h2>{validee}</h2><span>Validées</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon aqua"><i className="fa-solid fa-pause-circle"></i></div>
              <div className="count-top"><h2>{en_attente}</h2><span>En attente</span></div>
            </div>
            <div className="department-card">
              <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
              <div className="count-top"><h2>{annulee}</h2><span>Annulées</span></div>
            </div>
          </div>


          <div className="department-toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Rechercher une inscription..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-right">
                <select className="filter-select" value={filtreStatutFinancier} onChange={(e) => setFiltreStatutFinancier(e.target.value)}>
                    <option value="">Statut financier — tous</option>
                    <option value="PAYE">Payé</option>
                    <option value="PARTIEL">Partiel</option>
                    <option value="NON_PAYE">Non payé</option>
                </select>
            </div>

          </div>

          
          <div className="department-card table-card">
            <div className="table-title">
              <h2>Liste des inscriptions</h2>
              <span>{inscriptionsFiltrees.length} inscriptions</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Date</th>
                    <th className="num">Montant dû</th>
                    <th className="num">Payé</th>
                    <th>Statut financier</th>
                    <th>Statut admin</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptionsFiltrees.map((i) => (
                    <tr className="row-link" key={i.id}>
                      <td>
                        <div className="cell-strong" style={{ marginBottom: '5px' }}>{i.etudiant_str}</div>
                        <span>{i.etudiant_matricule}</span>
                      </td>
                      <td>{new Date(i.date_inscription).toLocaleDateString('fr-FR')}</td>
                      <td className="num">{i.total_du} FCFA</td>
                      <td className="num">{i.montant_paye} FCFA</td>
                      <td>
                        <span className={`badge ${BADGE_STATUT_FINANCIER[i.statut_paiement]}`}>
                          <span className="dot"></span>
                          {LABEL_STATUT_FINANCIER[i.statut_paiement]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${BADGE_STATUT_INSCRIPTION[i.statut]}`}>
                          <span className="dot"></span>
                          {STATUTS_INSCRIPTION.find((s) => s.value === i.statut)?.label}
                        </span>
                      </td>
                      <td>
                        <button className="table-btn view" onClick={() => navigate(`/finances/inscriptions/${i.id}`)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="table-btn edit" onClick={() => ouvrirEdition(i)}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="table-btn delete" onClick={() => setInscriptionASupprimer(i)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {inscriptionsFiltrees.length === 0 && (
                    <tr><td colSpan="8"><div className="empty">Aucune inscription ne correspond à cette recherche.</div></td></tr>
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
            <h2>{inscriptionEnEdition ? "Modifier l'inscription" : 'Nouvelle inscription'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Étudiant</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('etudiant', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {etudiants.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom} ({e.matricule})</option>)}
                </select>
                {errors.etudiant && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Classe</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('classe', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.specialite_code} — {c.niveau_nom}</option>)}
                </select>
                {errors.classe && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Année académique</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('annee_academique', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {anneesAcademiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                </select>
                {errors.annee_academique && <div className="form-errors">Champ requis</div>}
                <div className="cell-sub">
                  Les frais obligatoires (inscription, scolarité) seront appliqués automatiquement, selon les tarifs actifs.
                </div>
              </div>
              <div className="form-group">
                <label>Date d'inscription</label>
                <input type="date" {...register('date_inscription')} />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select {...register('statut')}>
                  {STATUTS_INSCRIPTION.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
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
        ouvert={!!inscriptionASupprimer}
        titre="Supprimer l'inscription"
        message={`Voulez-vous vraiment supprimer l'inscription de « ${inscriptionASupprimer?.etudiant_str} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setInscriptionASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default InscriptionsListe;