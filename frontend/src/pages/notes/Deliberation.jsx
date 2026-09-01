
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getDeliberations, calculerDeliberations, toggleVerrouillageDeliberation, telechargerDeliberationPdf } from '../../api/notes';
import { getClasses, getAnneesAcademiques } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import { PERIODES, BADGE_DECISION, LABEL_DECISION } from './notesConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';
function Deliberation() {
  const [classes, setClasses] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(true);
  const [contexte, setContexte] = useState(null);
  const [resultats, setResultats] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(false);
  const [calculEnCours, setCalculEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, formState: { errors } } = useForm();
  useEffect(() => {
    getClasses().then((res) => setClasses(res.data));
    getAnneesAcademiques().then((res) => setAnneesAcademiques(res.data.resultats || res.data));
  }, []);
  const nomClasse = (idVal) => {
    const c = classes.find((c) => String(c.id) === String(idVal));
    return c ? `${c.specialite_nom} — ${c.niveau_nom}` : '';
  };
  const nomAnnee = (idVal) => anneesAcademiques.find((a) => String(a.id) === String(idVal))?.libelle || '';
  const labelPeriode = (val) => PERIODES.find((p) => p.value === val)?.label || val;
  const chargerContexte = async (data) => {
    setChargement(true);
    try {
      const res = await getDeliberations(data);
      setResultats(res.data);
      setContexte(data);
      setModalOuvert(false);
    } catch (err) {
      afficherErreur('Erreur lors du chargement des délibérations.');
    } finally {
      setChargement(false);
    }
  };
  const lancerCalcul = async () => {
    setCalculEnCours(true);
    try {
      const res = await calculerDeliberations(contexte);
      setResultats(res.data);
      afficherSucces('Délibérations calculées avec succès.');
    } catch (err) {
      afficherErreur('Erreur lors du calcul des délibérations.');
    } finally {
      setCalculEnCours(false);
    }
  };
  const toggleVerrou = async (id) => {
    try {
      const res = await toggleVerrouillageDeliberation(id);
      setResultats((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (err) {
      afficherErreur('Erreur lors du verrouillage.');
    }
  };
  const telechargerPdf = async () => {
    try {
      const res = await telechargerDeliberationPdf(contexte);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pv_deliberation.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };
  const resultatsFiltres = resultats.filter((r) => r.etudiant_str.toLowerCase().includes(recherche.toLowerCase()));
  const nbAdmis = resultats.filter((r) => r.decision === 'ADMIS').length;
  const nbRattrapage = resultats.filter((r) => r.decision === 'RATTRAPAGE').length;
  const nbRedoublant = resultats.filter((r) => r.decision === 'REDOUBLANT').length;
  const nbIncomplet = resultats.filter((r) => r.decision === 'INCOMPLET').length;
  return (
    <div className="container-principal">
      <div className="sn-page">
        <div className="sn-header">
          <h1>Délibération</h1>
          {contexte && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-light" onClick={lancerCalcul} disabled={calculEnCours}>
                <i className="fas fa-rotate"></i> {calculEnCours ? 'Calcul...' : 'Lancer / Recalculer'}
              </button>
              <button className="btn-primary addInscr" onClick={telechargerPdf}>
                <i className="fas fa-file-pdf"></i> Exporter le PV
              </button>
            </div>
          )}
        </div>
        {contexte && (
          <div className="sn-bandeau-contexte">
            <div className="sn-contexte-infos">
              <span className="sn-contexte-item">{nomClasse(contexte.classe)}</span>
              <span className="sn-contexte-item">{nomAnnee(contexte.annee_academique)}</span>
              <span className="sn-contexte-item">{labelPeriode(contexte.periode)}</span>
            </div>
            <button className="sn-btn-changer" onClick={() => setModalOuvert(true)}>
              <i className="fas fa-rotate"></i> Changer le contexte
            </button>
          </div>
        )}
        {chargement && <div className="empty">Chargement...</div>}
        {contexte && !chargement && (
          <>
            <div className="sn-resume-cards">
              <div className="sn-resume-card">
                <div className="sn-resume-icone" style={{ background: '#dcfce7', color: '#16a34a' }}><i className="fas fa-check-circle"></i></div>
                <div><div className="sn-resume-valeur">{nbAdmis}</div><div className="sn-resume-label">Admis</div></div>
              </div>
              <div className="sn-resume-card">
                <div className="sn-resume-icone" style={{ background: '#fef9c3', color: '#854d0e' }}><i className="fas fa-rotate"></i></div>
                <div><div className="sn-resume-valeur">{nbRattrapage}</div><div className="sn-resume-label">Rattrapage</div></div>
              </div>
              <div className="sn-resume-card">
                <div className="sn-resume-icone" style={{ background: '#fef2f2', color: '#dc2626' }}><i className="fas fa-repeat"></i></div>
                <div><div className="sn-resume-valeur">{nbRedoublant}</div><div className="sn-resume-label">Redoublant</div></div>
              </div>
              <div className="sn-resume-card">
                <div className="sn-resume-icone bleu"><i className="fas fa-circle-question"></i></div>
                <div><div className="sn-resume-valeur">{nbIncomplet}</div><div className="sn-resume-label">Incomplet</div></div>
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
                    <th>Étudiant</th>
                    <th>Moyenne</th>
                    <th>Crédits obtenus</th>
                    <th>Crédits requis</th>
                    <th>Décision</th>
                    <th>Verrou</th>
                  </tr>
                </thead>
                <tbody>
                  {resultatsFiltres.map((r) => (
                    <tr key={r.id}>
                      <td className="cell-strong">{r.etudiant_str}</td>
                      <td>{r.moyenne_generale ?? '—'}</td>
                      <td>{r.credits_obtenus}</td>
                      <td>{r.credits_requis}</td>
                      <td>
                        <span className={`badge ${BADGE_DECISION[r.decision]}`}>
                          <span className="dot"></span>
                          {LABEL_DECISION[r.decision]}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`dl-btn-verrou ${r.verrouillee ? 'verrouillee' : ''}`}
                          onClick={() => toggleVerrou(r.id)}
                          title={r.verrouillee ? 'Déverrouiller' : 'Verrouiller'}
                        >
                          <i className={`fas ${r.verrouillee ? 'fa-lock' : 'fa-lock-open'}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {resultatsFiltres.length === 0 && (
                    <tr><td colSpan="6"><div className="empty">Aucune délibération à afficher. Cliquez sur « Lancer / Recalculer ».</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content sn-modal-contexte">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Choisir le contexte de délibération</h2>
            {contexte && (
              <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>


          <form onSubmit={handleSubmit(chargerContexte)} id="departmentForm">
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group">
                <div><label>Classe</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('classe', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.specialite_nom} — {c.niveau_nom}</option>)}
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
              </div>
              <div className="form-group">
                <div><label>Période</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('periode', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {PERIODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {errors.periode && <div className="form-errors">Champ requis</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr">
                Charger les délibérations
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
export default Deliberation;