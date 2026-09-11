
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getConsultationNotes, telechargerConsultationPdf, getTypesEvaluation } from '../../api/notes';
import { getClasses, getMatieres, getAnneesAcademiques } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import { SEMESTRES } from './notesConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';




function ConsultationNotes() {
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [typesEvaluation, setTypesEvaluation] = useState([]);
  const [modalContexteOuvert, setModalContexteOuvert] = useState(true);
  const [contexte, setContexte] = useState(null);
  const [lignes, setLignes] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [triMoyenne, setTriMoyenne] = useState(null); // 'asc' | 'desc' | null
  const [chargementTableau, setChargementTableau] = useState(false);
  const { afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
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
  const chargerContexte = async (data) => {
    setChargementTableau(true);
    try {
      const res = await getConsultationNotes(data);
      setLignes(res.data);
      setContexte(data);
      setModalContexteOuvert(false);
    } catch (err) {
      afficherErreur('Erreur lors du chargement du contexte.');
    } finally {
      setChargementTableau(false);
    }
  };
  const lignesFiltrees = useMemo(() => {
    let resultat = lignes.filter((l) => {
      const texte = (l.matricule + ' ' + l.nom + ' ' + l.prenom).toLowerCase();
      return texte.includes(recherche.toLowerCase());
    });
    if (triMoyenne) {
      resultat = [...resultat].sort((a, b) => {
        const ma = a.moyenne !== null ? parseFloat(a.moyenne) : -1;
        const mb = b.moyenne !== null ? parseFloat(b.moyenne) : -1;
        return triMoyenne === 'asc' ? ma - mb : mb - ma;
      });
    }
    return resultat;
  }, [lignes, recherche, triMoyenne]);
  const toggleTri = () => {
    setTriMoyenne((prev) => (prev === null ? 'desc' : prev === 'desc' ? 'asc' : null));
  };
  const nbEvalues = lignes.filter((l) => l.moyenne !== null).length;
  const nbNonEvalues = lignes.length - nbEvalues;
  const moyenneGenerale = useMemo(() => {
    const valeurs = lignes.filter((l) => l.moyenne !== null).map((l) => parseFloat(l.moyenne));
    if (valeurs.length === 0) return null;
    return (valeurs.reduce((a, b) => a + b, 0) / valeurs.length).toFixed(2);
  }, [lignes]);
  const nbSousLaMoyenne = lignes.filter((l) => l.moyenne !== null && parseFloat(l.moyenne) < 10).length;
  const telechargerPdf = async () => {
    try {
      const res = await telechargerConsultationPdf(contexte);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'consultation_notes.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };
  const allerVersReleve = () => {
    if (!contexte) return;
    navigate(`/notes/releve?classe=${contexte.classe}&annee_academique=${contexte.annee_academique}&periode=${contexte.semestre}`);
  };



  return (
    <div className="container-principal">

      <div className="department-page">

        {contexte && (
          <div className="panel-head">
            
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Consultation des notes</h3>
              <div className="sn-bandeau-contexte">
                <div className="sn-contexte-infos">
                  <span className="sn-contexte-item">{nomClasse(contexte.classe)}</span>
                  <span className="sn-contexte-item">{nomMatiere(contexte.matiere)}</span>
                  <span className="sn-contexte-item">{nomAnnee(contexte.annee_academique)}</span>
                  <span className="sn-contexte-item">{contexte.semestre}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-light" onClick={allerVersReleve}>
                <i className="fas fa-file-lines"></i> Voir le relevé
              </button>
              <button className="btn-primary addInscr" onClick={telechargerPdf}>
                <i className="fas fa-file-pdf"></i> Exporter en PDF
              </button>
            </div>
          
          </div>
        )}
        
        {contexte && !chargementTableau && (
          <>
            <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>

              <div className="department-card">
                <div className="kpi-icon blue"><i className="fas fa-users"></i></div>
                <div className="count-top"><h2>{lignes.length}</h2><span>Étudiants</span></div>
              </div>

              <div className="department-card">
                <div className="kpi-icon green"><i className="fas fa-check"></i></div>
                <div className="count-top"><h2>{nbEvalues}</h2><span>Évalués</span></div>
              </div>

              <div className="department-card">
                <div className="kpi-icon red"><i className="fas fa-user-clock"></i></div>
                <div className="count-top"><h2>{nbNonEvalues}</h2><span>Non évalués</span></div>
              </div>

              <div className="department-card">
                <div className="kpi-icon violet"><i className="fas fa-chart-simple"></i></div>
                <div className="count-top"><h2>{moyenneGenerale ?? '—'}</h2><span>Moyenne générale</span></div>
              </div>

              <div className="department-card">
                <div className="kpi-icon orange"><i className="fas fa-triangle-exclamation"></i></div>
                <div className="count-top"><h2>{nbSousLaMoyenne}</h2><span>Sous la moyenne</span></div>
              </div>

            </div>



            <div className="department-toolbar">

              <div className="toolbar-left">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Rechercher un étudiant..." value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
                </div>
              </div>

              <div className="toolbar-right">
                <button className="sn-btn-changer" onClick={() => setModalContexteOuvert(true)}>
                  <i className="fas fa-rotate"></i> Changer le contexte
                </button>
              </div>
              
            </div>




            <div className="department-card table-card">
                    
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom & Prénom</th>
                      {typesEvaluation.map((t) => <th key={t.id} className='statuSaisie'>{t.code}</th>)}
                      <th onClick={toggleTri} style={{ cursor: 'pointer' }}>
                        Moyenne {triMoyenne === 'desc' ? '↓' : triMoyenne === 'asc' ? '↑' : ''}
                      </th>
                      <th>À rattraper</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesFiltrees.map((l) => (
                      <tr key={l.etudiant_id}>
                        <td className="mono">{l.matricule}</td>
                        <td className="cell-strong">{l.nom} {l.prenom}</td>
                        {l.notes_par_type.map((n, i) => (
                          <td key={i}>
                            <span className={`badge ${parseFloat(n.valeur) >= 10 ? 'badge-aqua' : 'badge-orange'}`}>
                              {n.valeur ?? '—'}
                            </span>
                          </td>
                        ))}
                        <td>
                          {l.moyenne !== null ? (
                            <span className={`badge ${parseFloat(l.moyenne) >= 10 ? 'badge-success' : 'badge-danger'}`}>
                              <p className='bull'>&#9758;</p>
                              {l.moyenne}
                            </span>
                          ) : (
                            <span className="badge badge-orange"><p className='bull'>&bull;</p>Incomplet</span>
                          )}
                        </td>
                        <td>
                          {l.matieres_a_rattraper?.length > 0 ? (
                            <span style={{ fontSize: '11px', color: '#dc2626' }}>{l.matieres_a_rattraper.join(', ')}</span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {lignesFiltrees.length === 0 && (
                      <tr><td colSpan={typesEvaluation.length + 3}><div className="empty">Aucun étudiant trouvé.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </>
        )}
        
        {chargementTableau && <div className="empty">Chargement...</div>}

      </div>
  
  
  
      <div className="department-modal" style={{ display: modalContexteOuvert ? 'flex' : 'none' }}>
        <div className="modal-content sn-modal-contexte">
          <div className="modal-header">
            <h2>Choisir le contexte de consultation</h2>
            {contexte && (
              <button className="btn-primary addInscr" onClick={() => setModalContexteOuvert(false)}>
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
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr">
                Charger la consultation
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
export default ConsultationNotes;