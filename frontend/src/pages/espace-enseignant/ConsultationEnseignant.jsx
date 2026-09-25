import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getCombosPourConsultation, getConsultationEnseignant } from '../../api/espaceEnseignant';
import { useAlert } from '../../context/AlertContext';
import ToggleVue from '../../components/ToggleVue';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';



const SEMESTRES = [{ value: 'S1', label: 'Semestre 1' }, { value: 'S2', label: 'Semestre 2' }];


function ConsultationEnseignant() {
  
  const [combos, setCombos] = useState([]);
  
  const [annees, setAnnees] = useState([]);
  
  const [modalContexteOuvert, setModalContexteOuvert] = useState(true);
  
  const [contexte, setContexte] = useState(null);
  
  const [lignes, setLignes] = useState([]);
  
  const [typesEvaluation, setTypesEvaluation] = useState([]);
  
  const [recherche, setRecherche] = useState('');
  
  const [triMoyenne, setTriMoyenne] = useState(null);
  
  const [chargementTableau, setChargementTableau] = useState(false);
  
  const [vue, setVue] = useState('tableau');
  
  const { afficherErreur } = useAlert();
  
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const classeChoisie = watch('classe');
  
  useEffect(() => { getCombosPourConsultation().then((res) => { setCombos(res.data.combos); setAnnees(res.data.annees_academiques); }); }, []);
  
  const classesUniques = [...new Map(combos.map((c) => [c.classe_id, { id: c.classe_id, nom: c.classe_str }])).values()];
  
  const matieresPourClasse = [...new Map(combos.filter((c) => String(c.classe_id) === classeChoisie).map((c) => [c.matiere_id, { id: c.matiere_id, nom: c.matiere_nom }])).values()];
  
  const nomClasse = (idVal) => combos.find((c) => String(c.classe_id) === String(idVal))?.classe_str || '';
  
  const nomMatiere = (idVal) => combos.find((c) => String(c.matiere_id) === String(idVal))?.matiere_nom || '';
  
  const nomAnnee = (idVal) => annees.find((a) => String(a.id) === String(idVal))?.libelle || '';
  
  const chargerContexte = async (data) => {
    setChargementTableau(true);
    try {
      const res = await getConsultationEnseignant(data);
      setLignes(res.data.lignes);
      setTypesEvaluation(res.data.types_evaluation);
      setContexte(data);
      setModalContexteOuvert(false);
    } catch (err) {
      afficherErreur(err.response?.data?.detail || 'Erreur lors du chargement.');
    } finally {
      setChargementTableau(false);
    }
  };
  
  
  const lignesFiltrees = useMemo(() => {
    let resultat = lignes.filter((l) => (l.matricule + ' ' + l.nom + ' ' + l.prenom).toLowerCase().includes(recherche.toLowerCase()));
    if (triMoyenne) resultat = [...resultat].sort((a, b) => ((a.moyenne ?? -1) - (b.moyenne ?? -1)) * (triMoyenne === 'asc' ? 1 : -1));
    return resultat;
  }, [lignes, recherche, triMoyenne]);
  
  
  const toggleTri = () => setTriMoyenne((prev) => (prev === null ? 'desc' : prev === 'desc' ? 'asc' : null));
  
  const nbEvalues = lignes.filter((l) => l.moyenne !== null).length;
  
  const nbNonEvalues = lignes.length - nbEvalues;
  
  const moyenneGenerale = useMemo(() => {
    const valeurs = lignes.filter((l) => l.moyenne !== null).map((l) => l.moyenne);
    return valeurs.length ? (valeurs.reduce((a, b) => a + b, 0) / valeurs.length).toFixed(2) : null;
  }, [lignes]);
  
  const nbSousLaMoyenne = lignes.filter((l) => l.moyenne !== null && l.moyenne < 10).length;
  
  const allerAuProfil = (etudiantId) => navigate(`/espace-enseignant/etudiants/${etudiantId}?matiere=${contexte.matiere}`);
  
  
  
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="sn-btn-changer" onClick={() => setModalContexteOuvert(true)}><i className="fas fa-rotate"></i> Changer le contexte</button>
            </div>
          </div>
        )}
        {contexte && !chargementTableau && (
          <>
            <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <div className="department-card"><div className="kpi-icon blue"><i className="fas fa-users"></i></div><div className="count-top"><h2>{lignes.length}</h2><span>Étudiants</span></div></div>
              <div className="department-card"><div className="kpi-icon green"><i className="fas fa-check"></i></div><div className="count-top"><h2>{nbEvalues}</h2><span>Évalués</span></div></div>
              <div className="department-card"><div className="kpi-icon red"><i className="fas fa-user-clock"></i></div><div className="count-top"><h2>{nbNonEvalues}</h2><span>Non évalués</span></div></div>
            </div>


            <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <div className="department-card"><div className="kpi-icon violet"><i className="fas fa-chart-simple"></i></div><div className="count-top"><h2>{moyenneGenerale ?? '—'}</h2><span>Moyenne générale</span></div></div>
              <div className="department-card"><div className="kpi-icon orange"><i className="fas fa-triangle-exclamation"></i></div><div className="count-top"><h2>{nbSousLaMoyenne}</h2><span>Sous la moyenne</span></div></div>
            </div>



            <div className="department-toolbar">
              <div className="toolbar-left">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Rechercher un étudiant..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
                </div></div>
            </div>

            {vue === 'tableau' ? (
              <div className="department-card table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Matricule</th>
                        <th>Nom & Prénom</th>
                        {typesEvaluation.map((t) => 
                          <th key={t.code} className="statuSaisie">{t.code}</th>
                        )}
                        <th onClick={toggleTri} style={{ cursor: 'pointer' }}>Moyenne {triMoyenne === 'desc' ? '↓' : triMoyenne === 'asc' ? '↑' : ''}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignesFiltrees.map((l) => (
                        <tr key={l.etudiant_id} onClick={() => allerAuProfil(l.etudiant_id)} style={{ cursor: 'pointer' }}>
                          <td className="mono">{l.matricule}</td>
                          <td className="cell-strong">{l.nom} {l.prenom}</td>
                          {l.notes_par_type.map((n, i) => <td key={i}><span className={`badge ${n.valeur >= 10 ? 'badge-aqua' : 'badge-orange'}`}>{n.valeur ?? '—'}</span></td>)}
                          <td>{l.moyenne !== null ? <span className={`badge ${l.moyenne >= 10 ? 'badge-success' : 'badge-danger'}`}>{l.moyenne}</span> : <span className="badge badge-orange">Incomplet</span>}</td>
                        </tr>
                      ))}
                      {lignesFiltrees.length === 0 && <tr><td colSpan={typesEvaluation.length + 4}><div className="empty">Aucun étudiant trouvé.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="sn-bloc-grille">
                {lignesFiltrees.map((l) => (
                  <div className="sn-bloc-carte" key={l.etudiant_id} onClick={() => allerAuProfil(l.etudiant_id)} style={{ cursor: 'pointer' }}>
                    <div className="sn-bloc-entete"><div><div className="sn-bloc-nom">{l.nom} {l.prenom}</div><div className="sn-bloc-matricule mono">{l.matricule}</div></div></div>
                    {l.notes_par_type.map((n, i) => <div className="sn-bloc-ligne" key={i}><span>{typesEvaluation[i]?.code}</span><b>{n.valeur ?? '—'}</b></div>)}
                    <div className="sn-bloc-ligne"><span>Moyenne</span><b style={{ color: l.moyenne >= 10 ? '#16a34a' : '#dc2626' }}>{l.moyenne ?? 'Incomplet'}</b></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {chargementTableau && <div className="empty">Chargement...</div>}
      </div>
      <div className="department-modal" style={{ display: modalContexteOuvert ? 'flex' : 'none' }}>
        <div className="modal-content sn-modal-contexte">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>Choisir le contexte de consultation</h2>
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
            </div>
            <div className="modal-footer"><button type="submit" className="btn-primary addInscr">Charger la consultation</button></div>
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
export default ConsultationEnseignant;