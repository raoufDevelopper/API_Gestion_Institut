
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getReleveNotes, telechargerRelevePdf } from '../../api/notes';
import { getClasses, getAnneesAcademiques } from '../../api/academique';
import { getEtudiants } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import { PERIODES, COULEUR_MENTION } from './notesConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';



function ReleveNotes() {
  const [classes, setClasses] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [etudiantsClasse, setEtudiantsClasse] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(true);
  const [contexte, setContexte] = useState(null);
  const [releves, setReleves] = useState([]);
  const [etudiantOuvert, setEtudiantOuvert] = useState(null);
  const [chargement, setChargement] = useState(false);
  const { afficherErreur } = useAlert();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const classeSelectionnee = watch('classe');
  useEffect(() => {
    getClasses().then((res) => setClasses(res.data));
    getAnneesAcademiques().then((res) => setAnneesAcademiques(res.data.resultats || res.data));
  }, []);

  useEffect(() => {
    if (!classeSelectionnee) {
      setEtudiantsClasse([]);
      return;
    }
    getEtudiants().then((res) => {
      setEtudiantsClasse(res.data.filter((e) => String(e.classe) === String(classeSelectionnee)));
    });
  }, [classeSelectionnee]);

  const nomClasse = (idVal) => {
    const c = classes.find((c) => String(c.id) === String(idVal));
    return c ? `${c.specialite_nom} — ${c.niveau_nom}` : '';
  };

  const nomAnnee = (idVal) => anneesAcademiques.find((a) => String(a.id) === String(idVal))?.libelle || '';

  const labelPeriode = (val) => PERIODES.find((p) => p.value === val)?.label || val;

  const chargerContexte = async (data) => {
    setChargement(true);
    try {
      const params = { classe: data.classe, annee_academique: data.annee_academique, periode: data.periode };
      if (data.etudiant) params.etudiant = data.etudiant;
      const res = await getReleveNotes(params);
      setReleves(res.data);
      setContexte(params);
      setModalOuvert(false);
      if (res.data.length > 0) setEtudiantOuvert(res.data[0].etudiant_id);
    } catch (err) {
      afficherErreur('Erreur lors du chargement du relevé.');
    } finally {
      setChargement(false);
    }
  };

  const telechargerPdf = async () => {
    try {
      const res = await telechargerRelevePdf(contexte);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'releve_notes.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };




  return (
    <div className="container-principal">
      <div className="sn-page">
        <div className="sn-header">
          <h1>Relevé de notes</h1>
          {contexte && (
            <button className="btn-primary addInscr" onClick={telechargerPdf}>
              <i className="fas fa-file-pdf"></i> Exporter en PDF
            </button>
          )}
        </div>
        {contexte && (
          <div className="sn-bandeau-contexte">
            <div className="sn-contexte-infos">
              <span className="sn-contexte-item">{nomClasse(contexte.classe)}</span>
              <span className="sn-contexte-item">{nomAnnee(contexte.annee_academique)}</span>
              <span className="sn-contexte-item">{labelPeriode(contexte.periode)}</span>
              {contexte.etudiant && <span className="sn-contexte-item">Étudiant unique</span>}
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
                <div className="sn-resume-icone violet"><i className="fas fa-users"></i></div>
                <div><div className="sn-resume-valeur">{releves.length}</div><div className="sn-resume-label">Étudiants</div></div>
              </div>
            </div>
            {releves.map((r) => (
              <div className="rn-etudiant-card" key={r.etudiant_id}>
                <div className="rn-etudiant-header" onClick={() => setEtudiantOuvert(etudiantOuvert === r.etudiant_id ? null : r.etudiant_id)}>
                  <div>
                    <div className="rn-etudiant-nom">{r.nom} {r.prenom}</div>
                    <div className="rn-etudiant-matricule">{r.matricule}</div>
                  </div>
                  <div className="rn-etudiant-resume">
                    {r.moyenne_annuelle && (
                      <span className={`badge ${COULEUR_MENTION[r.mention_annuelle] || 'badge-blue'}`}>
                        {r.mention_annuelle}
                      </span>
                    )}
                    <span className="rn-etudiant-moyenne">{r.moyenne_annuelle || (r.details_semestres[0]?.moyenne_generale ?? '—')}</span>
                    <i className={`fas fa-chevron-${etudiantOuvert === r.etudiant_id ? 'up' : 'down'}`}></i>
                  </div>
                </div>
                {etudiantOuvert === r.etudiant_id && (
                  <div className="rn-etudiant-body">
                    {r.details_semestres.map((d) => (
                      <div className="rn-semestre-block" key={d.semestre}>
                        <div className="rn-semestre-titre">
                          <h4>{d.semestre === 'S1' ? 'Semestre 1' : 'Semestre 2'}</h4>
                          <span className={`badge ${COULEUR_MENTION[d.mention] || 'badge-blue'}`}>{d.mention}</span>
                        </div>
                        <table className="rn-matiere-table">
                          <thead>
                            <tr><th>Matière</th><th>Coefficient</th><th>Moyenne</th></tr>
                          </thead>
                          <tbody>
                            {d.detail_matieres.map((m, i) => (
                              <tr key={i}>
                                <td>{m.matiere}</td>
                                <td>{m.coefficient}</td>
                                <td>{m.moyenne ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: '8px', fontSize: '12.5px', fontWeight: 700, color: '#400c7c' }}>
                          Moyenne générale : {d.moyenne_generale ?? '—'}
                        </div>
                      </div>
                    ))}
                    {r.moyenne_annuelle && (
                      <div className="rn-moyenne-annuelle">
                        <span>Moyenne annuelle</span>
                        <span>{r.moyenne_annuelle} — {r.mention_annuelle}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {releves.length === 0 && <div className="empty">Aucun relevé disponible pour ce contexte.</div>}
          </>
        )}
      </div>
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content sn-modal-contexte">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Choisir le contexte du relevé</h2>
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
              <div className="form-group">
                <label>Étudiant (optionnel)</label>
                <select {...register('etudiant')}>
                  <option value="">Tout le groupe</option>
                  {etudiantsClasse.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr">
                Générer le relevé
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
export default ReleveNotes;