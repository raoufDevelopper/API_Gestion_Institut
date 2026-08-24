import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { creerEtudiantComplet } from '../../api/utilisateursComplet';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/formulaireInline.css';


const ONGLETS = ['Compte utilisateur', 'Informations personnelles'];
function EtudiantForm() {
  const [ongletActif, setOngletActif] = useState(0);
  const [ongletsValides, setOngletsValides] = useState([]);
  const [apercuPhoto, setApercuPhoto] = useState(null);
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm();
  const champsParOnglet = [
    ['username', 'email', 'password'],
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
      await creerEtudiantComplet(formData);
      afficherSucces('Étudiant créé avec succès.');
      navigate('/utilisateurs/etudiants');
    } catch (err) {
      afficherErreur(
        Object.values(err.response?.data || {})[0]?.[0] || "Erreur lors de la création de l'étudiant."
      );
    }
  };
  return (
    <div className="fi-page">
      <div className="fi-header">
        <h1>Nouvel étudiant</h1>
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
          {ongletActif === 0 && (
            <div>
              <div className="fi-champ">
                <label>Nom d'utilisateur</label>
                <input type="text" {...register('username', { required: true })} />
              </div>
              <div className="fi-champ">
                <label>Email</label>
                <input type="email" {...register('email', { required: true })} />
              </div>
              <div className="fi-champ">
                <label>Mot de passe</label>
                <input type="password" {...register('password', { required: true, minLength: 8 })} />
                {errors.password && <span className="fi-champ-erreur-msg">8 caractères minimum</span>}
              </div>
            </div>
          )}
          {ongletActif === 1 && (
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
                {isSubmitting ? 'Création...' : "Créer l'étudiant"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
export default EtudiantForm;