import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getMonCompte, modifierMonCompte, changerMotDePasse } from '../../api/espaceEtudiant';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEtudiant.css';




function CompteEtudiant() {
  const [onglet, setOnglet] = useState('personnelles');
  const [photoPreview, setPhotoPreview] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const { register: registerPwd, handleSubmit: handleSubmitPwd, reset: resetPwd, formState: { isSubmitting: pwdEnCours } } = useForm();
  
  
  useEffect(() => {
    getMonCompte().then((res) => { reset({ username: res.data.username, email: res.data.email }); setPhotoPreview(res.data.photo_profil); });
  }, [reset]);
  
  
  const handlePhoto = (e) => { const f = e.target.files[0]; if (f) setPhotoPreview(URL.createObjectURL(f)); };
  
  const onSubmitCompte = async (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    if (data.photo_profil instanceof FileList && data.photo_profil.length > 0) formData.append('photo_profil', data.photo_profil[0]);
    try {
      await modifierMonCompte(formData);
      afficherSucces('Informations mises à jour avec succès.');
    } catch (err) {
      afficherErreur("Erreur lors de la mise à jour.");
    }
  };
  
  const onSubmitPwd = async (data) => {
    try {
      await changerMotDePasse(data);
      afficherSucces('Mot de passe modifié avec succès.');
      resetPwd();
    } catch (err) {
      afficherErreur(err.response?.data?.detail || 'Erreur lors du changement de mot de passe.');
    }
  };
  
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">
  
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Mon compte</h3>
            <div className="sub">Gérez vos informations de compte et de sécurité</div>
          </div>
        </div>
  
        <div className="ee-onglets">
          <button className={`ee-onglet ${onglet === 'personnelles' ? 'active' : ''}`} onClick={() => setOnglet('personnelles')}>Informations personnelles</button>
          <button className={`ee-onglet ${onglet === 'securite' ? 'active' : ''}`} onClick={() => setOnglet('securite')}>Sécurité</button>
        </div>
  
  
        <div className='per-secu'>
          {onglet === 'personnelles' && (
            <div className="department-card" style={{ padding: '20px', justifyContent: 'center' }}>
              <form onSubmit={handleSubmit(onSubmitCompte)}>
                <div className="ee-form-avatar">
                  {photoPreview ? <img src={photoPreview} alt="Aperçu" className="ee-avatar" /> : <div className="ee-avatar ee-avatar-placeholder"><i className="fas fa-user"></i></div>}
                  <input type="file" accept="image/*" {...register('photo_profil', { onChange: handlePhoto })} />
                </div>
                <div className="form-group"><label>Nom d'utilisateur</label><input type="text" {...register('username')} /></div>
                <div className="form-group"><label>Email</label><input type="email" {...register('email')} /></div>
                <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</button>
              </form>
            </div>
          )}


          {onglet === 'securite' && (
            <div className="department-card" style={{ padding: '20px' }}>
              <form onSubmit={handleSubmitPwd(onSubmitPwd)}>
                <div className="form-group"><label>Ancien mot de passe</label><input type="password" {...registerPwd('ancien_mot_de_passe', { required: true })} /></div>
                <div className="form-group"><label>Nouveau mot de passe</label><input type="password" {...registerPwd('nouveau_mot_de_passe', { required: true, minLength: 8 })} /></div>
                <button type="submit" className="btn-primary addInscr" disabled={pwdEnCours}>{pwdEnCours ? 'Modification...' : 'Changer le mot de passe'}</button>
              </form>
            </div>
          )}
        </div>

      </div>
  
    </div>
  
  );


}


export default CompteEtudiant;



