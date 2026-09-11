import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { creerFormateurComplet } from '../../api/utilisateursComplet';
import { getFormateur, modifierFormateur, getPersonnel, modifierPersonnel, getUtilisateursDisponiblesFormateur } from '../../api/utilisateurs';
import { getFilieres, getSpecialites } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_PERSONNEL, TYPES_CONTRAT } from './utilisateursConstantes';
import Loader from '../../components/Loader';
import '../../assets/css/formulaireInline.css';
import '../../assets/css/crud.css';




function FormateurForm() {
  const { id } = useParams();
  const modeEdition = !!id;
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const ONGLETS = ['Informations personnelles', 'Informations formateur']
  const [ongletActif, setOngletActif] = useState(0);
  const [ongletsValides, setOngletsValides] = useState([]);
  const [apercuPhoto, setApercuPhoto] = useState(null);
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [modeCompte, setModeCompte] = useState('nouveau');
  const [comptesDisponibles, setComptesDisponibles] = useState([]);
  const [personnelId, setPersonnelId] = useState(null);
  const [chargementInitial, setChargementInitial] = useState(modeEdition);
  const { register, handleSubmit, trigger, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    getFilieres().then((res) => setFilieres(res.data.resultats || res.data));
    getSpecialites().then((res) => setSpecialites(res.data.resultats || res.data));
  }, []);

  useEffect(() => {
    if (modeCompte === 'existant') {
      getUtilisateursDisponiblesFormateur().then((res) => setComptesDisponibles(res.data));
    }
  }, [modeCompte]);

  useEffect(() => {
    if (!modeEdition) return;
    getFormateur(id).then((resFormateur) => {
      const f = resFormateur.data;
      setPersonnelId(f.personnel);
      getPersonnel(f.personnel).then((resPersonnel) => {
        const p = resPersonnel.data;
        reset({
          nom: p.nom, prenom: p.prenom, sexe: p.sexe, date_naissance: p.date_naissance,
          date_embauche: p.date_embauche, email_perso: p.email, adresse: p.adresse, telephone: p.telephone,
          salaire: p.salaire, poste: p.poste, fonction: p.fonction, statut: p.statut,
          type_contrat: f.type_contrat,
          filiere: (f.filiere || []).map(String),
          specialite: (f.specialite || []).map(String),
        });
        setApercuPhoto(p.photo);
        setChargementInitial(false);
      });
    });

  }, [id, modeEdition, reset]);

  const indexInfosPerso = modeEdition ? 0 : 1;

  const indexInfosFormateur = modeEdition ? 1 : 2;

  const champsParOnglet = modeEdition
    ? [['nom', 'prenom', 'sexe', 'date_naissance', 'date_embauche'], ['type_contrat']]
    : [
        modeCompte === 'nouveau' ? ['username', 'email', 'password'] : ['user_existant'],
        ['nom', 'prenom', 'sexe', 'date_naissance', 'date_embauche'],
        ['type_contrat'],
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

    try {

      if (modeEdition) {

        const formDataPersonnel = new FormData();

        ['nom', 'prenom', 'sexe', 'date_naissance', 'date_embauche', 'adresse', 'telephone',

          'salaire', 'poste', 'fonction', 'statut'].forEach((champ) => {

            if (data[champ] !== undefined && data[champ] !== '') formDataPersonnel.append(champ, data[champ]);

          });

          if (data.email_perso) formDataPersonnel.append('email', data.email_perso);

          if (data.photo instanceof FileList && data.photo.length > 0) formDataPersonnel.append('photo', data.photo[0]);

          ['cni', 'diplome', 'motivation', 'recommandation'].forEach((champ) => {

            if (data[champ] instanceof FileList && data[champ].length > 0) formDataPersonnel.append(champ, data[champ][0]);

          });

          await modifierPersonnel(personnelId, formDataPersonnel);

          await modifierFormateur(id, {

            type_contrat: data.type_contrat,

            filiere: [].concat(data.filiere || []).map(Number),

            specialite: [].concat(data.specialite || []).map(Number),

          });

          afficherSucces('Formateur modifié avec succès.');

        } else {

          const formData = new FormData();

          Object.entries(data).forEach(([cle, valeur]) => {

            if (['photo', 'cni', 'diplome', 'motivation', 'recommandation'].includes(cle)) {

              if (valeur instanceof FileList && valeur.length > 0) formData.append(cle, valeur[0]);

            } else if (cle === 'filiere' || cle === 'specialite') {

              [].concat(valeur || []).forEach((v) => formData.append(cle, v));

            } else if (valeur !== null && valeur !== undefined && valeur !== '') {

              formData.append(cle, valeur);

            }

          });

          await creerFormateurComplet(formData);

          afficherSucces('Formateur créé avec succès.');

        }

        navigate('/utilisateurs/formateurs');

      } catch (err) {

        afficherErreur(Object.values(err.response?.data || {})[0]?.[0] || "Erreur lors de l'enregistrement.");

      }

    };




  if (chargementInitial) {

    return <Loader label="Chargement en cours..." />;

  }
  




  
  return (

    <div className='container-principal'>

      <div className="fi-page">

        <div className="fi-header">
          <div>
            <button className="ud-retour" onClick={() => navigate('/utilisateurs/formateurs')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <span>  {modeEdition ? " > Modifier l'étudiant" : ' > Nouvel étudiant'}</span>
          </div>
          <h1>{modeEdition ? 'Modifier le formateur' : 'Nouveau formateur'}</h1>
          <span>
            {modeEdition ? 'Modifier un étudiant. Modifiez les informations personnelles et académiques de cet étudiant.' : 'Ajouter un étudiant. Enregistrez un nouvel étudiant et renseignez ses informations personnelles et académiques.'}
          </span>
        </div>


        <div className="fi-card">
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


          <form onSubmit={handleSubmit(onSubmit)}>

            {!modeEdition && ongletActif === 0 && (
              <div>
                <div className="fi-champ" style={{ marginBottom: '40px', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                  <div>
                    <label className='text-help'  style={{ position: 'static', background: 'none', padding: 0, display: 'block', marginBottom: '25px', lineHeight: '24px', textAlign: 'center' }}>
                      Ce formateur possède-t-il déjà un compte utilisateur actif ? Si oui, Créez-en un nouveau. Sinon, appuyez sur 
                      l'option Utiliser un compte existant ci-dessous.
                    </label>
                  </div>
                
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
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
                        Aucun compte avec un rôle Formateur à la fois disponible et non associé à un formateur 
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
                    <label>Date d'embauche</label>
                    <input type="date" {...register('date_embauche', { required: true })} />
                  </div>
                  <div className="fi-champ">
                    <label>Téléphone</label>
                    <input type="text" {...register('telephone')} />
                  </div>
                  <div className="fi-champ">
                    <label>Email personnel</label>
                    <input type="email" {...register('email_perso')} />
                  </div>
                  <div className="fi-champ">
                    <label>Adresse</label>
                    <input type="text" {...register('adresse')} />
                  </div>
                  <div className="fi-champ">
                    <label>Salaire</label>
                    <input type="number" step="0.01" {...register('salaire')} />
                  </div>
                  <div className="fi-champ">
                    <label>Statut</label>
                    <select {...register('statut')}>
                      {STATUTS_PERSONNEL.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="fi-champ fi-champ-fichier">
                    <label>CNI</label>
                    <input type="file" {...register('cni')} />
                  </div>
                  <div className="fi-champ fi-champ-fichier">
                    <label>Diplôme</label>
                    <input type="file" {...register('diplome')} />
                  </div>
                  <div className="fi-champ fi-champ-fichier">
                    <label>Lettre de motivation</label>
                    <input type="file" {...register('motivation')} />
                  </div>
                  <div className="fi-champ fi-champ-fichier">
                    <label>Lettre de recommandation</label>
                    <input type="file" {...register('recommandation')} />
                  </div>

                  <div className="fi-champ full">
                    <label>Type de contrat</label>
                    <select {...register('type_contrat', { required: true })}>
                      <option value="">Sélectionner...</option>
                      {TYPES_CONTRAT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="fi-champ">
                    <label style={{ position: 'static', background: 'none', padding: 0, display: 'block', marginBottom: '8px' }}>
                      Filières enseignées
                    </label>
                    <div className="permissions-select">
                      {filieres.map((f) => (
                        <label key={f.id} className="permission-checkbox">
                          <input type="checkbox" value={f.id} {...register('filiere')} />
                          {f.nom}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="fi-champ">
                    <label style={{ position: 'static', background: 'none', padding: 0, display: 'block', marginBottom: '8px' }}>
                      Spécialités enseignées
                    </label>
                    <div className="permissions-select">
                      {specialites.map((s) => (
                        <label key={s.id} className="permission-checkbox">
                          <input type="checkbox" value={s.id} {...register('specialite')} />
                          {s.code}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}


            <div className="fi-footer">
              {ongletActif > 0 && (
                <button type="button" className="fi-btn-precedent" onClick={() => setOngletActif((o) => o - 1)}>
                  Précédent
                </button>
              )}
              {ongletActif < ONGLETS.length - 1 ? (
                <button type="button" className="fi-btn-continuer" onClick={allerSuivant}>
                  Continuer
                </button>
              ) : (
                <button type="submit" className="fi-btn-continuer" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : modeEdition ? 'Enregistrer les modifications' : 'Créer le formateur'}
                </button>
              )}
            </div>
          </form>
        </div>


      </div>

    </div>

  );

}


export default FormateurForm;