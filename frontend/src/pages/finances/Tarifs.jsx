
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getTarifs, creerTarif, modifierTarif, supprimerTarif, getSimulateurTarif } from '../../api/finances';
import { getTypesPaiement } from '../../api/finances';
import { getSpecialites, getNiveaux, getAnneesAcademiques } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { formatMontant } from '../../components/formatters';
import '../../assets/css/crud.css';

function Tarifs() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [typesPaiement, setTypesPaiement] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [tarifEnEdition, setTarifEnEdition] = useState(null);
  const [tarifASupprimer, setTarifASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [tarifEnDetail, setTarifEnDetail] = useState(null);
  const [modalSimulateurOuvert, setModalSimulateurOuvert] = useState(false);
  const [resultatSimulation, setResultatSimulation] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const { register: registerSim, handleSubmit: handleSubmitSim } = useForm();
  const charger = async () => {
    const res = await getTarifs();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
    getTypesPaiement().then((res) => setTypesPaiement(res.data.resultats));
    getSpecialites().then((res) => {
      const toutes = res.data.resultats || res.data;
      setSpecialites(toutes.filter((s) => s.statut === 'actif'));
    });
    getNiveaux().then((res) => setNiveaux(res.data));
    getAnneesAcademiques().then((res) => setAnneesAcademiques(res.data.resultats || res.data));
  }, []);
  const tarifsFiltres = donnees.resultats.filter((t) => {
    const texte = (t.type_paiement_nom + ' ' + t.portee).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setTarifEnEdition(null);
    reset({ type_paiement: '', specialites: [], niveaux: [], annee_academique: '', montant: '', actif: true });
    setModalOuvert(true);
  };
  const ouvrirEdition = (t) => {
    setTarifEnEdition(t.id);
    reset({
      type_paiement: t.type_paiement,
      specialites: (t.specialites || []).map(String),
      niveaux: (t.niveaux || []).map(String),
      annee_academique: t.annee_academique,
      montant: t.montant,
      actif: t.actif,
    });
    setModalOuvert(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      specialites: [].concat(data.specialites || []).map(Number),
      niveaux: [].concat(data.niveaux || []).map(Number),
    };
    try {
      let res;
      if (tarifEnEdition) {
        res = await modifierTarif(tarifEnEdition, payload);
        afficherSucces('Tarif modifié avec succès.');
      } else {
        res = await creerTarif(payload);
        afficherSucces('Tarif créé avec succès.');
      }
      if (res.data.avertissement) {
        afficherErreur(res.data.avertissement);
      }
      reset();
      setModalOuvert(false);
      setTarifEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.montant?.[0] || "Erreur lors de l'enregistrement du tarif.");
    }
  };

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerTarif(tarifASupprimer.id);
      afficherSucces('Tarif supprimé.');
      setTarifASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const lancerSimulation = async (data) => {
    try {
      const res = await getSimulateurTarif(data);
      setResultatSimulation(res.data);
    } catch (err) {
      afficherErreur('Erreur lors de la simulation.');
    }
  };

  const { total = 0, actif = 0, inactif = 0 } = donnees.kpis;





  return (
  
    <div className="container-principal">
      <div className="department-page">
    
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des tarifs</h3>
            <div className="sub">{total} tarif(s)</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-light" onClick={() => { setResultatSimulation(null); setModalSimulateurOuvert(true); }}>
              <i className="fas fa-calculator"></i> Simulateur
            </button>
            <button className="btn-primary addInscr" onClick={ouvrirCreation}>
              <i className="fas fa-plus"></i>
              Nouveau tarif
            </button>
          </div>
        </div>
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-tags"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{actif}</h2><span>Actifs</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{inactif}</h2><span>Inactifs</span></div>
          </div>
        </div>
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un tarif..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des tarifs</h2>
            <span>{tarifsFiltres.length} résultats</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Type de paiement</th>
                  <th>Portée</th>
                  <th>Année académique</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tarifsFiltres.map((t) => (
                  <tr className="row-link" key={t.id}>
                    <td><div className="cell-strong">{t.type_paiement_nom}</div></td>
                    <td>{t.portee}</td>
                    <td>{t.annee_academique_libelle || '—'}</td>
                    <td>{formatMontant(t.montant)}</td>
                    <td>
                      <span className={`badge ${t.actif ? 'badge-success' : 'badge-danger'}`}>
                        <p className='bull'>&bull;</p>
                        {t.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setTarifEnDetail(t)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(t)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setTarifASupprimer(t)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {tarifsFiltres.length === 0 && (
                  <tr><td colSpan="6"><div className="empty">Aucun tarif ne correspond à cette recherche.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* MODAL CREATION / MODIFICATION */}
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
      
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{tarifEnEdition ? 'Modifier le tarif' : 'Nouveau tarif'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
      
      
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Type de paiement</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('type_paiement', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {typesPaiement.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
                {errors.type_paiement && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Année académique</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('annee_academique', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {anneesAcademiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                </select>
                {errors.annee_academique && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Montant (FCFA)</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="number" step="0.01" min="0" {...register('montant', { required: true })} />
                {errors.montant && <div className="form-errors">Champ requis</div>}
              </div>

              <div className="form-group">
                <label className="switch-row" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0 0", borderTop: "solid 1px var(--input)" }}>
                  <span style={{ marginRight: "10px" }}>Tarif actif</span>
                  <label className="switch">
                    <input type="checkbox" {...register('actif')} style={{ width: "44px" }}/>
                    <span className="slider"></span>
                  </label>
                </label>
              </div>



              <div className="form-group">
                <label style={{ position: 'static', background: 'none', padding: 0, display: 'block', marginBottom: '8px' }}>
                  Spécialités concernées (laisser vide = toutes)
                </label>
                <div className="permissions-select">
                  {specialites.map((s) => (
                    <label key={s.id} className="permission-checkbox">
                      <input type="checkbox" value={s.id} {...register('specialites')} />
                      {s.code}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group full">
                <label style={{ position: 'static', background: 'none', padding: 0, display: 'block', marginBottom: '8px' }}>
                  Niveaux concernés (laisser vide = tous)
                </label>
                <div className="permissions-select">
                  {niveaux.map((n) => (
                    <label key={n.id} className="permission-checkbox">
                      <input type="checkbox" value={n.id} {...register('niveaux')} />
                      {n.nom}
                    </label>
                  ))}
                </div>
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



      {/* MODAL DETAIL */}
      <div className="department-modal" style={{ display: tarifEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail du tarif</h2>
            <button onClick={() => setTarifEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {tarifEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Type de paiement</label><p>{tarifEnDetail.type_paiement_nom}</p></div>
              <div className="form-group"><label>Année académique</label><p>{tarifEnDetail.annee_academique_libelle || '—'}</p></div>
              <div className="form-group"><label>Montant</label><p>{tarifEnDetail.montant} FCFA</p></div>
              <div className="form-group"><label>Portée</label><p>{tarifEnDetail.portee}</p></div>
              <div className="form-group full"><label>Spécialités</label><p>{(tarifEnDetail.specialites_codes || []).join(', ') || 'Toutes'}</p></div>
              <div className="form-group full"><label>Niveaux</label><p>{(tarifEnDetail.niveaux_noms || []).join(', ') || 'Tous'}</p></div>
              <div className="form-group"><label>Statut</label><p>{tarifEnDetail.actif ? 'Actif' : 'Inactif'}</p></div>
            </div>
          )}

        </div>
      
      </div>




      {/* MODAL SIMULATEUR */}
      <div className="department-modal" style={{ display: modalSimulateurOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
         
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Simulateur de tarif</h2>
            <button className="btn-primary addInscr" onClick={() => setModalSimulateurOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
         
          <form onSubmit={handleSubmitSim(lancerSimulation)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <label>Type de paiement</label>
                <select {...registerSim('type_paiement', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {typesPaiement.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Spécialité</label>
                <select {...registerSim('specialite', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {specialites.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Niveau</label>
                <select {...registerSim('niveau', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {niveaux.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Année académique</label>
                <select {...registerSim('annee_academique', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {anneesAcademiques.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)'}}>
                {isSubmitting ? 'simulation en cours...' : 'simuler'}
              </button>
            </div>

            {resultatSimulation && (
              <div style={{ padding: '0 20px 20px' }}>
                {resultatSimulation.trouve ? (
                  <div className="rn-moyenne-annuelle">
                    <span>Montant applicable</span>
                    <span>{formatMontant(resultatSimulation.montant)} — {resultatSimulation.portee}</span>
                  </div>
                ) : (
                  <div className="empty">Aucun tarif ne correspond à cette combinaison.</div>
                )}
              </div>
            )}

          </form>
          
          <hr />

          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
          </p>

        </div>

      </div>

      <ConfirmationModal
        ouvert={!!tarifASupprimer}
        titre="Supprimer le tarif"
        message={`Voulez-vous vraiment supprimer ce tarif ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setTarifASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>

  );

}



export default Tarifs;