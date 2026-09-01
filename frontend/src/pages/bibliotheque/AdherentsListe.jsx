import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getAdherents, creerAdherent, modifierAdherent, supprimerAdherent } from '../../api/bibliotheque';
import { getUtilisateursDisponiblesEtudiant, getUtilisateursDisponiblesPersonnel } from '../../api/utilisateurs';
import { getEtudiants, getPersonnels, getFormateurs } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_ADHERENT, BADGE_STATUT_ADHERENT, TYPES_ADHERENT } from './bibliothequeConstantes';

import ConfirmationModal from '../../components/ConfirmationModal';

import '../../assets/css/crud.css';


function AdherentsListe() {
  const [adherents, setAdherents] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [adherentEnEdition, setAdherentEnEdition] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, watch, formState: { isSubmitting, errors } } = useForm();
  const typeChoisi = watch('type_personne');



  const [exemplaireASupprimer, setExemplaireASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerAdherent(exemplaireASupprimer.id);
      afficherSucces('Exemplaire supprimé (ou retiré si historique existant).');
      setExemplaireASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors ffffffffffffffffff de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };


  
  const charger = () => {
    getAdherents({ q: recherche || undefined, type: filtreType || undefined, statut: filtreStatut || undefined }).then((res) => setAdherents(res.data));
  };
  
  useEffect(() => { charger(); }, [recherche, filtreType, filtreStatut]);
  
  useEffect(() => {
    getEtudiants().then((res) => setEtudiants(res.data));
    getPersonnels().then((res) => setPersonnels(res.data));
    getFormateurs().then((res) => setFormateurs(res.data));
  }, []);
  
  const ouvrirCreation = () => { reset({ type_personne: '', etudiant: '', personnel: '', formateur: '' }); setModalOuvert(true); };
  
  const ouvrirEdition = (a) => {
    setAdherentEnEdition(a.id);
    reset({ statut: a.statut, motif_suspension: a.motif_suspension });
    setModalOuvert(true);
  };
  
  const onSubmit = async (data) => {
    try {
      if (adherentEnEdition) {
        await modifierAdherent(adherentEnEdition, { statut: data.statut, motif_suspension: data.motif_suspension });
        afficherSucces('Adhérent modifié avec succès.');
      } else {
        const payload = {};
        if (data.type_personne === 'ETUDIANT') payload.etudiant = data.etudiant;
        if (data.type_personne === 'PERSONNEL') payload.personnel = data.personnel;
        if (data.type_personne === 'FORMATEUR') payload.formateur = data.formateur;
        await creerAdherent(payload);
        afficherSucces('Adhérent créé avec succès.');
      }
      reset(); setModalOuvert(false); setAdherentEnEdition(null); charger();
    } catch (err) {
      afficherErreur(err.response?.data?.non_field_errors?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  
  
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">
  
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Adhérents</h3>
            <div className="sub">Gérer les membres de la bibliothèque</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}><i className="fas fa-plus"></i> Ajouter un adhérent</button>
        </div>
  
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box"><i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher un adhérent..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
          </div>
          <select className="filter-select" value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
            <option value="">Type — tous</option>
            {TYPES_ADHERENT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="filter-select" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
            <option value="">Statut — tous</option>
            {STATUTS_ADHERENT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>


        <div className="department-card table-card">
          <div className="table-title">
            <h2>Adhérents</h2>
            <span>{adherents.length}</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>N° Adhérent</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Emprunts</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adherents.map((a) => (
                  <tr className="row-link" key={a.id}>
                    <td className="cell-strong mono">{a.numero}</td>
                    <td>{a.personne_str}</td>
                    <td>{TYPES_ADHERENT.find((t) => t.value === a.type_adherent)?.label}</td>
                    <td>{a.nb_emprunts_en_cours}</td>
                    <td><span className={`badge ${BADGE_STATUT_ADHERENT[a.statut]}`}><span className="dot"></span>{STATUTS_ADHERENT.find((s) => s.value === a.statut)?.label}</span></td>
                    <td>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(a)}><i className="fas fa-pen"></i></button>
                      <button className="table-btn delete" onClick={() => setExemplaireASupprimer(a)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {adherents.length === 0 && <tr><td colSpan="6"><div className="empty">Aucun adhérent.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{adherentEnEdition ? "Modifier l'adhérent" : 'Nouvel adhérent'}</h2>
            <button className="addInscr" onClick={() => setModalOuvert(false)}><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              {!adherentEnEdition && (
                <>
                  <div className="form-group">
                    <div><label>Type de personne</label><span className="required" style={{ color: 'red' }}>*</span></div>
                    <select {...register('type_personne', { required: true })}>
                      <option value="">Sélectionner...</option>
                      {TYPES_ADHERENT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  {typeChoisi === 'ETUDIANT' && (
                    <div className="form-group">
                      <label>Étudiant</label>
                      <select {...register('etudiant', { required: true })}>
                        <option value="">Sélectionner...</option>
                        {etudiants.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                      </select>
                    </div>
                  )}
                  {typeChoisi === 'PERSONNEL' && (
                    <div className="form-group">
                      <label>Personnel</label>
                      <select {...register('personnel', { required: true })}>
                        <option value="">Sélectionner...</option>
                        {personnels.map((p) => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                      </select>
                    </div>
                  )}
                  {typeChoisi === 'FORMATEUR' && (
                    <div className="form-group">
                      <label>Formateur</label>
                      <select {...register('formateur', { required: true })}>
                        <option value="">Sélectionner...</option>
                        {formateurs.map((f) => <option key={f.id} value={f.id}>{f.personnel_nom} {f.personnel_prenom}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}
              {adherentEnEdition && (
                <>
                  <div className="form-group">
                    <label>Statut</label>
                    <select {...register('statut')}>{STATUTS_ADHERENT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
                  </div>
                  <div className="form-group full">
                    <label>Motif (si suspension)</label>
                    <textarea rows="2" {...register('motif_suspension')}></textarea>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer"><button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>Enregistrer</button></div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        ouvert={!!exemplaireASupprimer}
        titre="Supprimer l'adhérent"
        message={`Voulez-vous vraiment supprimer « ${exemplaireASupprimer?.personne_str} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setExemplaireASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>
  );
}
export default AdherentsListe;