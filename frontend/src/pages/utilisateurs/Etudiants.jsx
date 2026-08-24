import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  getEtudiants, creerEtudiant, modifierEtudiant, supprimerEtudiant, getUtilisateursDisponiblesEtudiant,
} from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';




const STATUTS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'ABANDON', label: 'Abandon' },
  { value: 'DIPLOME', label: 'Diplômé' },
  { value: 'SUSPENDU', label: 'Suspendu' },
];


function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [usersDisponibles, setUsersDisponibles] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [etudiantEnEdition, setEtudiantEnEdition] = useState(null);
  const [etudiantASupprimer, setEtudiantASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [etudiantEnDetail, setEtudiantEnDetail] = useState(null);
  const [apercuPhoto, setApercuPhoto] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getEtudiants();
    setEtudiants(res.data);
  };
  const chargerUsersDisponibles = async () => {
    const res = await getUtilisateursDisponiblesEtudiant();
    setUsersDisponibles(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const etudiantsFiltres = etudiants.filter((e) => {
    const texte = (e.matricule + ' ' + e.nom + ' ' + e.prenom).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setEtudiantEnEdition(null);
    setApercuPhoto(null);
    reset({
      user: '', nom: '', prenom: '', sexe: '', date_naissance: '',
      email: '', adresse: '', telephone: '', specialite: '',
      nom_tuteur: '', telephone_tuteur: '', statut: 'ACTIF',
    });
    chargerUsersDisponibles();
    setModalOuvert(true);
  };
  const ouvrirEdition = (etudiant) => {
    setEtudiantEnEdition(etudiant.id);
    setApercuPhoto(etudiant.photo);
    reset({
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      sexe: etudiant.sexe,
      date_naissance: etudiant.date_naissance,
      email: etudiant.email,
      adresse: etudiant.adresse,
      telephone: etudiant.telephone,
      specialite: etudiant.specialite,
      nom_tuteur: etudiant.nom_tuteur,
      telephone_tuteur: etudiant.telephone_tuteur,
      statut: etudiant.statut,
    });
    setModalOuvert(true);
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setApercuPhoto(URL.createObjectURL(file));
  };
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([cle, valeur]) => {
      if (cle === 'photo' || cle === 'cni' || cle === 'diplome' || cle === 'acte_naissance') {
        if (valeur instanceof FileList && valeur.length > 0) formData.append(cle, valeur[0]);
      } else if (valeur !== null && valeur !== undefined && valeur !== '') {
        formData.append(cle, valeur);
      }
    });
    try {
      if (etudiantEnEdition) {
        await modifierEtudiant(etudiantEnEdition, formData);
        afficherSucces('Étudiant modifié avec succès.');
      } else {
        await creerEtudiant(formData);
        afficherSucces('Étudiant créé avec succès.');
      }
      reset();
      setModalOuvert(false);
      setEtudiantEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.user?.[0] || "Erreur lors de l'enregistrement de l'étudiant."
      );
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerEtudiant(etudiantASupprimer.id);
      afficherSucces('Étudiant supprimé.');
      setEtudiantASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const kpis = STATUTS.reduce((acc, s) => {
    acc[s.value] = etudiants.filter((e) => e.statut === s.value).length;
    return acc;
  }, {});


  return (

    <div className="container-principal">
      <div className="department-page">
        {/* HEADER */}
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des étudiants</h3>
            <div className="sub">{etudiants.length} étudiant(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouvel étudiant
          </button>
        </div>
        
        
        
        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-user-graduate"></i></div>
            <div className="count-top"><h2>{etudiants.length}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{kpis.ACTIF || 0}</h2><span>Actifs</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon aqua"><i className="fas fa-graduation-cap"></i></div>
            <div className="count-top"><h2>{kpis.DIPLOME || 0}</h2><span>Diplômés</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{(kpis.ABANDON || 0) + (kpis.SUSPENDU || 0)}</h2><span>Abandon / Suspendus</span></div>
          </div>
        </div>
        
        
        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
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
        </div>
        
        
        {/* TABLE */}
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des étudiants</h2>
            <span>{etudiantsFiltres.length} étudiants</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Matricule</th>
                  <th>Spécialité</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {etudiantsFiltres.map((e) => (
                  <tr className="row-link" key={e.id}>
                    <td>
                      <div className="cell-with-avatar">
                        {e.photo ? (
                          <img src={e.photo} alt={e.nom} className="avatar-mini" />
                        ) : (
                          <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>
                        )}
                        <div className="cell-strong">{e.nom} {e.prenom}</div>
                      </div>
                    </td>
                    <td className="mono">{e.matricule}</td>
                    <td>{e.specialite_nom || e.specialite || '—'}</td>
                    <td>
                      <span className={`badge ${e.statut === 'ACTIF' ? 'emerald' : e.statut === 'DIPLOME' ? 'aqua' : 'brick'}`}>
                        <span className="dot"></span>
                        {STATUTS.find((s) => s.value === e.statut)?.label}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setEtudiantEnDetail(e)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(e)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setEtudiantASupprimer(e)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {etudiantsFiltres.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty">Aucun étudiant ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      <ConfirmationModal
        ouvert={!!etudiantASupprimer}
        titre="Supprimer l'étudiant"
        message={`Voulez-vous vraiment supprimer l'étudiant « ${etudiantASupprimer?.nom} ${etudiantASupprimer?.prenom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setEtudiantASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default Etudiants;