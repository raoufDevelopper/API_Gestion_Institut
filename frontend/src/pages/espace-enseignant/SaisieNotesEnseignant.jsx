import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { getCombosPourSaisie, getContexteSaisieEnseignant, enregistrerNotesEnseignant } from '../../api/espaceEnseignant';
import { useAlert } from '../../context/AlertContext';
import ToggleVue from '../../components/ToggleVue';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';



const SEMESTRES = [{ value: 'S1', label: 'Semestre 1' }, { value: 'S2', label: 'Semestre 2' }];



function SaisieNotesEnseignant() {
  const [combos, setCombos] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [types, setTypes] = useState([]);
  const [modalContexteOuvert, setModalContexteOuvert] = useState(true);
  const [contexte, setContexte] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [notesModifiees, setNotesModifiees] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [chargementTableau, setChargementTableau] = useState(false);
  const [vue, setVue] = useState('tableau');
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const classeChoisie = watch('classe');

  useEffect(() => {
    getCombosPourSaisie().then((res) => { setCombos(res.data.combos); setAnnees(res.data.annees_academiques); setTypes(res.data.types_evaluation); });
  }, []);

  const classesUniques = [...new Map(combos.map((c) => [c.classe_id, { id: c.classe_id, nom: c.classe_str }])).values()];
  const matieresPourClasse = [...new Map(combos.filter((c) => String(c.classe_id) === classeChoisie).map((c) => [c.matiere_id, { id: c.matiere_id, nom: c.matiere_nom }])).values()];
  const nomClasse = (idVal) => combos.find((c) => String(c.classe_id) === String(idVal))?.classe_str || '';
  const nomMatiere = (idVal) => combos.find((c) => String(c.matiere_id) === String(idVal))?.matiere_nom || '';
  const nomAnnee = (idVal) => annees.find((a) => String(a.id) === String(idVal))?.libelle || '';
  const nomType = (idVal) => types.find((t) => String(t.id) === String(idVal))?.libelle || '';

  const chargerContexte = async (data) => {
    setChargementTableau(true);
    try {
      const res = await getContexteSaisieEnseignant(data);
      setEtudiants(res.data.map((e) => ({ ...e, valeurLocale: e.valeur || '' })));
      setContexte(data);
      setNotesModifiees(false);
      setModalContexteOuvert(false);
    } catch (err) {
      afficherErreur(err.response?.data?.detail || 'Erreur lors du chargement du contexte.');
    } finally {
      setChargementTableau(false);
    }
  };

  const demanderChangementContexte = () => {
    if (notesModifiees && !window.confirm('Des notes non enregistrées seront perdues. Continuer ?')) return;
    setModalContexteOuvert(true);
  };

  const modifierValeur = (etudiantId, valeur) => {
    setEtudiants((prev) => prev.map((e) => (e.etudiant_id === etudiantId ? { ...e, valeurLocale: valeur } : e)));
    setNotesModifiees(true);
  };

  const viderValeur = (etudiantId) => modifierValeur(etudiantId, '');
  const etudiantsFiltres = etudiants.filter((e) => (e.matricule + ' ' + e.nom + ' ' + e.prenom).toLowerCase().includes(recherche.toLowerCase()));
  const nbSaisies = etudiants.filter((e) => e.valeurLocale !== '' && e.valeurLocale !== null).length;

  const moyenneGroupe = useMemo(() => {
    const valeurs = etudiants.filter((e) => e.valeurLocale !== '' && e.valeurLocale !== null).map((e) => parseFloat(e.valeurLocale));
    return valeurs.length ? (valeurs.reduce((a, b) => a + b, 0) / valeurs.length).toFixed(2) : null;
  }, [etudiants]);

  const enregistrerTout = async () => {
    setEnregistrementEnCours(true);
    try {
      const payload = { ...contexte, notes: etudiants.filter((e) => !e.verrouille).map((e) => ({ etudiant_id: e.etudiant_id, valeur: e.valeurLocale === '' ? null : e.valeurLocale })) };
      const res = await enregistrerNotesEnseignant(payload);
      afficherSucces(`${res.data.nb_enregistrees} note(s) enregistrée(s) avec succès.`);
      setNotesModifiees(false);
      if (res.data.erreurs?.length > 0) afficherErreur(res.data.erreurs.join(' | '));
    } catch (err) {
      afficherErreur("Erreur lors de l'enregistrement des notes.");
    } finally {
      setEnregistrementEnCours(false);
    }
  };





  return (
    <div className="container-principal">
      <div className="department-page">
        {contexte && (
          <div className="panel-head">
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Saisie des notes</h3> 
              <span className='sub'>Consultez les notes de vos étudiants.</span>      
            </div>
            <div className="sn-bandeau-contexte">
              <div className="sn-contexte-infos">
                <span className="sn-contexte-item">{nomClasse(contexte.classe)}</span>
                <span className="sn-contexte-item">{nomMatiere(contexte.matiere)}</span>
                <span className="sn-contexte-item">{nomAnnee(contexte.annee_academique)}</span>
                <span className="sn-contexte-item">{contexte.semestre}</span>
                <span className="sn-contexte-item">{nomType(contexte.type_evaluation)}</span>
              </div>
            </div>
          </div>
        )}
        {contexte && !chargementTableau && (
          <>
            <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <div className="department-card"><div className="kpi-icon blue"><i className="fas fa-users"></i></div><div className="count-top"><h2>{etudiants.length}</h2><span>Étudiants</span></div></div>
              <div className="department-card"><div className="kpi-icon green"><i className="fas fa-user-check"></i></div><div className="count-top"><h2>{nbSaisies} / {etudiants.length}</h2><span>Notes saisies</span></div></div>
              <div className="department-card"><div className="kpi-icon violet"><i className="fas fa-chart-simple"></i></div><div className="count-top"><h2>{moyenneGroupe ?? '—'}</h2><span>Moyenne du groupe</span></div></div>
            </div>
            <div className="department-toolbar">
              <div className="toolbar-left"><div className="search-box"><i className="fas fa-search"></i><input type="text" placeholder="Rechercher un étudiant..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></div></div>
              <div className="toolbar-right"><button className="sn-btn-changer" onClick={demanderChangementContexte}><i className="fas fa-rotate"></i> Changer le contexte</button></div>
            </div>
            {vue === 'tableau' ? (
              <div className="department-card table-card">
                <div className="table-title"><h2>Liste des notes</h2><span>{etudiants.length} étudiants</span></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th className="statuSaisie">Statut</th><th>Matricule</th><th>Nom & Prénom</th><th>Note / 20</th></tr></thead>
                    <tbody>
                      {etudiantsFiltres.map((e, index) => (
                        <tr key={e.etudiant_id}>
                          <td style={{ maxWidth: '50px' }}><span className={`sn-statut-dot ${e.valeurLocale !== '' ? 'saisie' : 'vide'}`}></span></td>
                          <td className="mono">{e.matricule}</td>
                          <td className="cell-strong">{e.nom} {e.prenom}</td>
                          <td>
                            {e.verrouille ? (
                              <span className="en-verrou-badge"><i className="fas fa-lock"></i> Verrouillé (délibéré)</span>
                            ) : (
                              <div className="sn-note-input-wrapper">
                                <input type="number" step="0.25" min="0" max="20" className={`sn-note-input ${e.valeurLocale !== '' && (e.valeurLocale < 0 || e.valeurLocale > 20) ? 'hors-plage' : ''}`}
                                  value={e.valeurLocale} onChange={(evt) => modifierValeur(e.etudiant_id, evt.target.value)}
                                  onKeyDown={(evt) => { if (evt.key === 'Enter') { evt.preventDefault(); document.querySelector(`[data-idx="${index + 1}"]`)?.focus(); } }}
                                  data-idx={index}
                                />
                                {e.valeurLocale !== '' && <button className="sn-btn-vider" onClick={() => viderValeur(e.etudiant_id)} title="Vider"><i className="fas fa-xmark"></i></button>}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {etudiantsFiltres.length === 0 && <tr><td colSpan="4"><div className="empty">Aucun étudiant trouvé.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="sn-footer-sticky"><button className="btn-primary addInscr" onClick={enregistrerTout} disabled={enregistrementEnCours}><i className="fas fa-save"></i>{enregistrementEnCours ? 'Enregistrement...' : 'Enregistrer toutes les notes'}</button></div>
              </div>
            ) : (
              <>
                <div className="sn-bloc-grille">
                  {etudiantsFiltres.map((e, index) => (
                    <div className="sn-bloc-carte" key={e.etudiant_id}>
                      <div className="sn-bloc-entete">
                        <span className={`sn-statut-dot ${e.valeurLocale !== '' ? 'saisie' : 'vide'}`}></span>
                        <div><div className="sn-bloc-nom">{e.nom} {e.prenom}</div><div className="sn-bloc-matricule mono">{e.matricule}</div></div>
                      </div>
                      {e.verrouille ? (
                        <span className="en-verrou-badge"><i className="fas fa-lock"></i> Verrouillé (délibéré)</span>
                      ) : (
                        <div className="sn-note-input-wrapper">
                          <input type="number" step="0.25" min="0" max="20" className="sn-note-input" style={{ width: '100%' }}
                            value={e.valeurLocale} onChange={(evt) => modifierValeur(e.etudiant_id, evt.target.value)} />
                          {e.valeurLocale !== '' && <button className="sn-btn-vider" onClick={() => viderValeur(e.etudiant_id)}><i className="fas fa-xmark"></i></button>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="sn-footer-sticky" style={{ marginTop: '14px' }}><button className="btn-primary addInscr" onClick={enregistrerTout} disabled={enregistrementEnCours}><i className="fas fa-save"></i>{enregistrementEnCours ? 'Enregistrement...' : 'Enregistrer toutes les notes'}</button></div>
              </>
            )}
          </>
        )}
        {!contexte && !modalContexteOuvert && <div className="sn-empty-state"><i className="fas fa-clipboard-list"></i><p>Aucun contexte sélectionné.</p></div>}
        {chargementTableau && <div className="empty">Chargement des étudiants...</div>}
      </div>
      <div className="department-modal" style={{ display: modalContexteOuvert ? 'flex' : 'none' }}>
        <div className="modal-content sn-modal-contexte">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Choisir le contexte de saisie</h2>
            {contexte && <button className="btn-primary addInscr" onClick={() => setModalContexteOuvert(false)}><i className="fas fa-times"></i></button>}
          </div>
          <form onSubmit={handleSubmit(chargerContexte)} id="departmentForm">
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><div><label>Classe</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('classe', { required: true })}><option value="">Sélectionner...</option>{classesUniques.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                {errors.classe && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group"><div><label>Matière</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('matiere', { required: true })}><option value="">Sélectionner...</option>{matieresPourClasse.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}</select>
                {errors.matiere && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group"><div><label>Année académique</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('annee_academique', { required: true })}>{annees.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}</select>
              </div>
              <div className="form-group"><div><label>Semestre</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('semestre', { required: true })}>{SEMESTRES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
              </div>
              <div className="form-group"><div><label>Type d'évaluation</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('type_evaluation', { required: true })}><option value="">Sélectionner...</option>{types.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}</select>
              </div>
            </div>
            <div className="modal-footer"><button type="submit" className="btn-primary addInscr">Charger les étudiants</button></div>
          </form>

          <hr />
                    
          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
            Soumettez le formulaire si consigne respectée !
          </p>

        </div>
      </div>
    </div>
  );
}
export default SaisieNotesEnseignant;