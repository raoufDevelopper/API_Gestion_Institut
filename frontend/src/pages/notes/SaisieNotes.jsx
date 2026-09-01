import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { getContexteSaisie, saisirNotes, getTypesEvaluation } from '../../api/notes';
import { getClasses, getMatieres, getAnneesAcademiques } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import { SEMESTRES } from './notesConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';




function SaisieNotes() {
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [typesEvaluation, setTypesEvaluation] = useState([]);
  const [modalContexteOuvert, setModalContexteOuvert] = useState(true);
  const [contexte, setContexte] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [notesModifiees, setNotesModifiees] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [chargementTableau, setChargementTableau] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset: resetContexteForm, formState: { errors } } = useForm();
  useEffect(() => {
    getClasses().then((res) => setClasses(res.data));
    getMatieres().then((res) => setMatieres(res.data.resultats || res.data));
    getAnneesAcademiques().then((res) => setAnneesAcademiques(res.data.resultats || res.data));
    getTypesEvaluation().then((res) => setTypesEvaluation(res.data.resultats.filter((t) => t.actif)));
  }, []);

  const nomClasse = (idVal) => {
    const c = classes.find((c) => String(c.id) === String(idVal));
    return c ? `${c.specialite_code} — ${c.niveau_nom}` : '';
  };

  const nomMatiere = (idVal) => matieres.find((m) => String(m.id) === String(idVal))?.nom || '';

  const nomAnnee = (idVal) => anneesAcademiques.find((a) => String(a.id) === String(idVal))?.libelle || '';

  const nomType = (idVal) => typesEvaluation.find((t) => String(t.id) === String(idVal))?.libelle || '';

  const chargerContexte = async (data) => {
    setChargementTableau(true);
    try {
      const res = await getContexteSaisie(data);
      setEtudiants(res.data.map((e) => ({ ...e, valeurLocale: e.valeur || '' })));
      setContexte(data);
      setNotesModifiees(false);
      setModalContexteOuvert(false);
    } catch (err) {
      afficherErreur('Erreur lors du chargement du contexte.');
    } finally {
      setChargementTableau(false);
    }
  };

  const demanderChangementContexte = () => {
    if (notesModifiees) {
      if (!window.confirm('Des notes non enregistrées seront perdues. Continuer ?')) return;
    }
    setModalContexteOuvert(true);
  };

  const modifierValeur = (etudiantId, valeur) => {
    setEtudiants((prev) =>
      prev.map((e) => (e.etudiant_id === etudiantId ? { ...e, valeurLocale: valeur } : e))
    );
    setNotesModifiees(true);
  };

  const viderValeur = (etudiantId) => {
    modifierValeur(etudiantId, '');
  };

  const etudiantsFiltres = etudiants.filter((e) => {
    const texte = (e.matricule + ' ' + e.nom + ' ' + e.prenom).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });

  const nbSaisies = etudiants.filter((e) => e.valeurLocale !== '' && e.valeurLocale !== null).length;

  const moyenneGroupe = useMemo(() => {
    const valeurs = etudiants.filter((e) => e.valeurLocale !== '' && e.valeurLocale !== null).map((e) => parseFloat(e.valeurLocale));
    if (valeurs.length === 0) return null;
    return (valeurs.reduce((a, b) => a + b, 0) / valeurs.length).toFixed(2);
  }, [etudiants]);

  const enregistrerTout = async () => {
    setEnregistrementEnCours(true);
    try {
      const payload = {
        ...contexte,
        notes: etudiants.map((e) => ({
          etudiant_id: e.etudiant_id,
          valeur: e.valeurLocale === '' ? null : e.valeurLocale,
        })),
      };
      const res = await saisirNotes(payload);
      afficherSucces(`${res.data.nb_enregistrees} note(s) enregistrée(s) avec succès.`);
      setNotesModifiees(false);
      if (res.data.erreurs?.length > 0) {
        afficherErreur(res.data.erreurs.join(' | '));
      }
    } catch (err) {
      afficherErreur("Erreur lors de l'enregistrement des notes.");
    } finally {
      setEnregistrementEnCours(false);
    }
  };

  const onSubmitContexte = (data) => {
    chargerContexte(data);
  };





  return (
    <div className="container-principal">
      
      <div className="sn-page">
        <div className="sn-header">
          <h1>Saisie des notes</h1>
        </div>
        {contexte && (
          <div className="sn-bandeau-contexte">
            <div className="sn-contexte-infos">
              <span className="sn-contexte-item">{nomClasse(contexte.classe)}</span>
              <span className="sn-contexte-item">{nomMatiere(contexte.matiere)}</span>
              <span className="sn-contexte-item">{nomAnnee(contexte.annee_academique)}</span>
              <span className="sn-contexte-item">{contexte.semestre}</span>
              <span className="sn-contexte-item">{nomType(contexte.type_evaluation)}</span>
            </div>
            <button className="sn-btn-changer" onClick={demanderChangementContexte}>
              <i className="fas fa-rotate"></i> Changer le contexte
            </button>
          </div>
        )}
        {contexte && !chargementTableau && (
          <>
            <div className="sn-resume-cards">
              <div className="sn-resume-card">
                <div className="sn-resume-icone violet"><i className="fas fa-users"></i></div>
                <div>
                  <div className="sn-resume-valeur">{etudiants.length}</div>
                  <div className="sn-resume-label">Étudiants</div>
                </div>
              </div>
              <div className="sn-resume-card">
                <div className="sn-resume-icone vert"><i className="fas fa-check"></i></div>
                <div>
                  <div className="sn-resume-valeur">{nbSaisies} / {etudiants.length}</div>
                  <div className="sn-resume-label">Notes saisies</div>
                </div>
              </div>
              <div className="sn-resume-card">
                <div className="sn-resume-icone bleu"><i className="fas fa-chart-simple"></i></div>
                <div>
                  <div className="sn-resume-valeur">{moyenneGroupe ?? '—'}</div>
                  <div className="sn-resume-label">Moyenne du groupe</div>
                </div>
              </div>
            </div>
            <div className="sn-table-card">
              <div className="sn-table-toolbar">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                  />
                </div>
              </div>
              <table className="sn-table">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Matricule</th>
                    <th>Nom & Prénom</th>
                    <th>Note / 20</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiantsFiltres.map((e, index) => (
                    <tr key={e.etudiant_id}>
                      <td>
                        <span className={`sn-statut-dot ${e.valeurLocale !== '' ? 'saisie' : 'vide'}`}></span>
                      </td>
                      <td className="mono">{e.matricule}</td>
                      <td className="cell-strong">{e.nom} {e.prenom}</td>
                      <td>
                        <div className="sn-note-input-wrapper">
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="20"
                            className={`sn-note-input ${e.valeurLocale !== '' && (e.valeurLocale < 0 || e.valeurLocale > 20) ? 'hors-plage' : ''}`}
                            value={e.valeurLocale}
                            onChange={(evt) => modifierValeur(e.etudiant_id, evt.target.value)}
                            onKeyDown={(evt) => {
                              if (evt.key === 'Enter') {
                                evt.preventDefault();
                                const suivant = document.querySelector(`[data-idx="${index + 1}"]`);
                                suivant?.focus();
                              }
                            }}
                            data-idx={index}
                          />
                          {e.valeurLocale !== '' && (
                            <button className="sn-btn-vider" onClick={() => viderValeur(e.etudiant_id)} title="Vider">
                              <i className="fas fa-xmark"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {etudiantsFiltres.length === 0 && (
                    <tr><td colSpan="4"><div className="empty">Aucun étudiant trouvé.</div></td></tr>
                  )}
                </tbody>
              </table>
              <div className="sn-footer-sticky">
                <button className="btn-primary addInscr" onClick={enregistrerTout} disabled={enregistrementEnCours}>
                  <i className="fas fa-save"></i>
                  {enregistrementEnCours ? 'Enregistrement...' : 'Enregistrer toutes les notes'}
                </button>
              </div>
            </div>
          </>
        )}
        {!contexte && !modalContexteOuvert && (
          <div className="sn-empty-state">
            <i className="fas fa-clipboard-list"></i>
            <p>Aucun contexte sélectionné.</p>
          </div>
        )}
        {chargementTableau && <div className="empty">Chargement des étudiants...</div>}
      </div>



      {/* MODAL CONTEXTE */}
      <div className="department-modal" style={{ display: modalContexteOuvert ? 'flex' : 'none' }}>
        <div className="modal-content sn-modal-contexte">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Choisir le contexte de saisie</h2>
            {contexte && (
              <button className="btn-primary addInscr" onClick={() => setModalContexteOuvert(false)}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>



          
          <form onSubmit={handleSubmit(onSubmitContexte)} id="departmentForm">

            <div className="form-grid" style={{ padding: '20px' }}>

              <div className="form-group">
                <div><label>Classe</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('classe', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.specialite_code} — {c.niveau_nom}</option>)}
                </select>
                {errors.classe && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Matière</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('matiere', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
                {errors.matiere && <div className="form-errors">Champ requis</div>}
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
                <div><label>Semestre</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('semestre', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {SEMESTRES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                {errors.semestre && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <div><label>Type d'évaluation</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('type_evaluation', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {typesEvaluation.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                </select>
                {errors.type_evaluation && <div className="form-errors">Champ requis</div>}
              </div>

            </div>


            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr">
                Charger les étudiants
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
    
    </div>
  
  );

}



export default SaisieNotes;