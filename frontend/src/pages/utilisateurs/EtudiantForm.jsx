
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { creerEtudiantComplet } from '../../api/utilisateursComplet';
import { getEtudiant, modifierEtudiant } from '../../api/utilisateurs';
import { getSpecialites, getNiveaux, getClasses } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_ETUDIANT } from './utilisateursConstantes';
import { getUtilisateursDisponiblesEtudiant } from '../../api/utilisateurs';
import Loader from '../../components/Loader';
import '../../assets/css/formulaireInline.css';






function EtudiantForm() {
  const { id } = useParams();
  const modeEdition = !!id;
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const ONGLETS = modeEdition ? ['Informations personnelles'] : ['Compte utilisateur', 'Informations personnelles'];
  const [ongletActif, setOngletActif] = useState(0);
  const [ongletsValides, setOngletsValides] = useState([]);
  const [apercuPhoto, setApercuPhoto] = useState(null);
  const [specialites, setSpecialites] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [chargementInitial, setChargementInitial] = useState(modeEdition);
  const { register, handleSubmit, trigger, reset, formState: { errors, isSubmitting } } = useForm();
 
  useEffect(() => {
    getSpecialites().then((res) => {
      const toutes = res.data.resultats || res.data;
      setSpecialites(toutes.filter((s) => s.statut === 'actif'));
    }); 
    getNiveaux().then((res) => setNiveaux(res.data));
    getClasses().then((res) => setClasses(res.data));
  }, []);
 


  const [modeCompte, setModeCompte] = useState('nouveau'); // 'nouveau' | 'existant'
  const [comptesDisponibles, setComptesDisponibles] = useState([]);
  useEffect(() => {
    if (modeCompte === 'existant') {
      getUtilisateursDisponiblesEtudiant().then((res) => setComptesDisponibles(res.data));
    }
  }, [modeCompte]);



  useEffect(() => {
    if (!modeEdition) return;
    getEtudiant(id).then((res) => {
      const e = res.data;
      reset({
        nom: e.nom, prenom: e.prenom, sexe: e.sexe, date_naissance: e.date_naissance,
        email_perso: e.email, adresse: e.adresse, telephone: e.telephone,
        nom_tuteur: e.nom_tuteur, telephone_tuteur: e.telephone_tuteur,
        specialite: e.specialite || '', niveau: e.niveau || '', classe: e.classe || '',
        statut: e.statut,
      });
      setApercuPhoto(e.photo);
      setChargementInitial(false);
    });
  }, [id, modeEdition, reset]);
 
  const champsParOnglet = modeEdition
  ? [['nom', 'prenom', 'sexe', 'date_naissance']]
  : [
      modeCompte === 'nouveau' ? ['username', 'email', 'password'] : ['user_existant'],
      ['nom', 'prenom', 'sexe', 'date_naissance'],
    ];

  const allerSuivant = async () => {
    const valide = await trigger(champsParOnglet[ongletActif]);
    if (valide) {
      setOngletsValides((prev) => [...new Set([...prev, ongletActif])]);
      setOngletActif((o) => o + 1);
    }
  };
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setApercuPhoto(URL.createObjectURL(file));
  };
  
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([cle, valeur]) => {
      if (['photo', 'cni', 'diplome', 'acte_naissance'].includes(cle)) {
        if (valeur instanceof FileList && valeur.length > 0) formData.append(cle, valeur[0]);
      } else if (valeur !== null && valeur !== undefined && valeur !== '') {
        formData.append(cle, valeur);
      }
    });
    try {
      if (modeEdition) {
        await modifierEtudiant(id, formData);
        afficherSucces('Étudiant modifié avec succès.');
      } else {
        await creerEtudiantComplet(formData);
        afficherSucces('Étudiant créé avec succès.');
      }
      navigate('/utilisateurs/etudiants');
    } catch (err) {
      afficherErreur(Object.values(err.response?.data || {})[0]?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  

  
  if (chargementInitial) {
    return <Loader label="Chargement en cours..." />;
  }
  
  const indexInfosPerso = modeEdition ? 0 : 1;
  
  




  return (
    <div className='container-principal'>

      <div className="fi-page">

        <div className="fi-header">
          <div>
            <button className="ud-retour" onClick={() => navigate('/utilisateurs/etudiants')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <span>  {modeEdition ? " > Modifier l'étudiant" : ' > Nouvel étudiant'}</span>
          </div>
          <h1>{modeEdition ? "Modifier l'étudiant" : 'Nouvel étudiant'}</h1>
          <span>
            {modeEdition ? 'Modifier un étudiant. Modifiez les informations personnelles et académiques de cet étudiant.' : 'Ajouter un étudiant. Enregistrez un nouvel étudiant et renseignez ses informations personnelles et académiques.'}
          </span>
        </div>
        

        
        <div className="fi-card">
            {!modeEdition && (
            <div className="fi-tabs">
                {ONGLETS.map((label, i) => (
                <button
                    key={i}
                    type="button"
                    className={`fi-tab ${ongletActif === i ? 'active' : ''} ${ongletsValides.includes(i) ? 'complete' : ''}`}
                    onClick={() => (ongletsValides.includes(i) || i <= ongletActif) && setOngletActif(i)}
                >
                    {label}
                </button>
                ))}
            </div>
            )}


            <form onSubmit={handleSubmit(onSubmit)}>
            
            
            {!modeEdition && ongletActif === 0 && (
              <div>
                <div className="fi-champ" style={{ marginBottom: '40px', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  <div>
                    <label className='text-help'  style={{ position: 'static', background: 'none', padding: 0, display: 'block', marginBottom: '25px', lineHeight: '24px', textAlign: 'center' }}>
                      Cet étudiant possède-t-il déjà un compte utilisateur actif ? Si oui, Créez-en un nouveau. Sinon, appuyez sur 
                      l'option Utiliser un compte existant ci-dessous.
                    </label>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className={modeCompte === 'nouveau' ? 'btn-primary addInscr' : 'btn-light bascul'}
                      onClick={() => setModeCompte('nouveau')}
                    >
                      <i className="fas fa-user-plus"></i> Créer un nouveau compte
                    </button>
                    <button
                      type="button"
                      className={modeCompte === 'existant' ? 'btn-primary addInscr' : 'btn-light bascul'}
                      onClick={() => setModeCompte('existant')}
                    >
                      <i className="fas fa-user-check"></i> Utiliser un compte existant
                    </button>
                  </div>

                </div>



                {modeCompte === 'nouveau' ? (
                  <div className="fi-grid">
                    <div className="fi-champ">
                      <label>Nom d'utilisateur</label>
                      <input type="text" {...register('username', { required: modeCompte === 'nouveau' })} />
                    </div>
                    <div className="fi-champ">
                      <label>Email</label>
                      <input type="email" {...register('email', { required: modeCompte === 'nouveau' })} />
                    </div>
                    <div className="fi-champ">
                      <label>Mot de passe</label>
                      <input type="password" {...register('password', { required: modeCompte === 'nouveau', minLength: 8 })} />
                      {errors.password && <span className="fi-champ-erreur-msg">8 caractères minimum</span>}
                    </div>
                  </div>
                ) : (
                  <div className="fi-champ">
                    <label>Compte utilisateur</label>
                    <select {...register('user_existant', { required: modeCompte === 'existant' })}>
                      <option value="">Sélectionner...</option>
                      {comptesDisponibles.map((u) => (
                        <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                      ))}
                    </select>
                    {comptesDisponibles.length === 0 && (
                      <div className='text-help' style={{ color: '#9ca3af' }}>
                        Aucun compte avec un rôle Étudiant à la fois disponible et non associé à un étudiant 
                        déjà enregistré.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}


            {ongletActif === indexInfosPerso && (
                <div>
                  <div className="fi-photo-upload">
                      <div className="fi-photo-preview">
                      {apercuPhoto ? <img src={apercuPhoto} alt="Aperçu" /> : <i className="fas fa-user"></i>}
                      </div>
                      <input type="file" accept="image/*" {...register('photo', { onChange: handlePhotoChange })} />
                  </div>
                  <div className="fi-grid">
                      <div className="fi-champ">
                        <label>Nom</label>
                        <input type="text" {...register('nom', { required: true })} />
                      </div>
                      <div className="fi-champ">
                        <label>Prénom</label>
                        <input type="text" {...register('prenom', { required: true })} />
                      </div>
                      <div className="fi-champ">
                        <label>Sexe</label>
                        <select {...register('sexe', { required: true })}>
                            <option value="">Sélectionner...</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                      </div>
                      <div className="fi-champ">
                        <label>Date de naissance</label>
                        <input type="date" {...register('date_naissance', { required: true })} />
                      </div>
                      <div className="fi-champ">
                        <label>Téléphone</label>
                        <input type="text" {...register('telephone')} />
                      </div>
                      <div className="fi-champ">
                        <label>Email personnel</label>
                        <input type="email" {...register('email_perso')} />
                      </div>
                      <div className="fi-champ full">
                        <label>Adresse</label>
                        <input type="text" {...register('adresse')} />
                      </div>
                      <div className="fi-champ">
                        <label>Spécialité</label>
                        <select {...register('specialite')}>
                            <option value="">Aucune</option>
                            {specialites.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
                        </select>
                      </div>
                      <div className="fi-champ">
                        <label>Niveau</label>
                        <select {...register('niveau')}>
                            <option value="">Aucun</option>
                            {niveaux.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
                        </select>
                      </div>
                      <div className="fi-champ">
                        <label>Classe</label>
                        <select {...register('classe')}>
                            <option value="">Aucune</option>
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.specialite_code} — {c.niveau_nom}</option>)}
                        </select>
                      </div>
                      <div className="fi-champ">
                      <label>Statut</label>
                      <select {...register('statut')}>
                          {STATUTS_ETUDIANT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      </div>
                      <div className="fi-champ">
                      <label>Nom du tuteur</label>
                      <input type="text" {...register('nom_tuteur')} />
                      </div>
                      <div className="fi-champ">
                      <label>Téléphone du tuteur</label>
                      <input type="text" {...register('telephone_tuteur')} />
                      </div>
                      <div className="fi-champ fi-champ-fichier">
                      <label>CNI</label>
                      <input type="file" {...register('cni')} />
                      </div>
                      <div className="fi-champ fi-champ-fichier">
                      <label>Diplôme</label>
                      <input type="file" {...register('diplome')} />
                      </div>
                      <div className="fi-champ fi-champ-fichier full">
                      <label>Acte de naissance</label>
                      <input type="file" {...register('acte_naissance')} />
                      </div>
                  </div>
                </div>
            )}
            <div className="fi-footer">
                {!modeEdition && ongletActif > 0 && (
                <button type="button" className="fi-btn-precedent" onClick={() => setOngletActif((o) => o - 1)}>
                    Précédent
                </button>
                )}
                {!modeEdition && ongletActif < ONGLETS.length - 1 ? (
                <button type="button" className="fi-btn-continuer" onClick={allerSuivant}>
                    Continuer
                </button>
                ) : (
                <button type="submit" className="fi-btn-continuer" disabled={isSubmitting}>
                    {isSubmitting ? 'Enregistrement...' : modeEdition ? 'Enregistrer les modifications' : "Créer l'étudiant"}
                </button>
                )}
            </div>
            </form>
        </div>

      </div>

    </div>

  );

}

export default EtudiantForm;