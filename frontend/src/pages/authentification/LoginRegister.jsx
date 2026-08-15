import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';

import { login, register as registerApi } from '../../api/auth';

function LoginRegister() {
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [erreurGlobale, setErreurGlobale] = useState('');
  const [messageSucces, setMessageSucces] = useState('');
  const navigate = useNavigate();
  const { rafraichirUtilisateur } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const password1 = watch('password1');
  
  const onSubmitLogin = async (data) => {
    setErreurGlobale('');
    
    try {
      const res = await login(data.email, data.password);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      await rafraichirUtilisateur();
      navigate('/');
    } catch (err) {
      setErreurGlobale(err.response?.data?.detail || 'Une erreur est survenue.');
    }
  };
  

  const onSubmitRegister = async (data) => {
    setErreurGlobale('');
    setMessageSucces('');
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password1', data.password1);
    formData.append('password2', data.password2);
    formData.append('role', data.role);
    if (data.photo_profil?.[0]) {
      formData.append('photo_profil', data.photo_profil[0]);
    }
    try {
      await registerApi(formData);
      setMessageSucces('Compte créé avec succès ! Il sera activé par un administrateur avant que vous puissiez vous connecter.');
      reset();
      setMode('login');
    } catch (err) {
      setErreurGlobale(err.response?.data?.detail || 'Une erreur est survenue.');
    }
  };

  const basculerMode = (nouveauMode) => {
    setMode(nouveauMode);
    setErreurGlobale('');
    setMessageSucces('');
    reset();
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab flex-1 ${mode === 'login' ? 'tab-active' : ''}`}
              onClick={() => basculerMode('login')}
              type="button"
            >
              Connexion
            </button>
            <button
              className={`tab flex-1 ${mode === 'register' ? 'tab-active' : ''}`}
              onClick={() => basculerMode('register')}
              type="button"
            >
              Créer un compte
            </button>
          </div>
          {erreurGlobale && (
            <div className="alert alert-error mb-4 text-sm">{erreurGlobale}</div>
          )}
          {messageSucces && (
            <div className="alert alert-success mb-4 text-sm">{messageSucces}</div>
          )}
          {mode === 'login' ? (
            
            <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-4">
              <div>
                <label className="label"><span className="label-text">Email</span></label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  {...register('email', { required: 'Email requis' })}
                />
                {errors.email && <span className="text-error text-sm">{errors.email.message}</span>}
              </div>
              <div>
                <label className="label"><span className="label-text">Mot de passe</span></label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  {...register('password', { required: 'Mot de passe requis' })}
                />
                {errors.password && <span className="text-error text-sm">{errors.password.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
            
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmitRegister)} className="space-y-4">
              <div>
                <label className="label"><span className="label-text">Nom d'utilisateur</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  {...register('username', { required: "Nom d'utilisateur requis" })}
                />
                {errors.username && <span className="text-error text-sm">{errors.username.message}</span>}
              </div>
              <div>
                <label className="label"><span className="label-text">Email</span></label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  {...register('email', { required: 'Email requis' })}
                />
                {errors.email && <span className="text-error text-sm">{errors.email.message}</span>}
              </div>
              <div>
                <label className="label"><span className="label-text">Rôle</span></label>
                <select
                  className="select select-bordered w-full"
                  {...register('role', { required: 'Rôle requis' })}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Étudiant">Étudiant</option>
                  <option value="Formateur">Formateur</option>
                </select>
                {errors.role && <span className="text-error text-sm">{errors.role.message}</span>}
              </div>
              <div>
                <label className="label"><span className="label-text">Photo de profil (optionnel)</span></label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  {...register('photo_profil')}
                />
              </div>
              <div>
                <label className="label"><span className="label-text">Mot de passe</span></label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  {...register('password1', { required: 'Mot de passe requis', minLength: { value: 8, message: '8 caractères minimum' } })}
                />
                {errors.password1 && <span className="text-error text-sm">{errors.password1.message}</span>}
              </div>
              <div>
                <label className="label"><span className="label-text">Confirmer le mot de passe</span></label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  {...register('password2', {
                    required: 'Confirmation requise',
                    validate: (value) => value === password1 || 'Les mots de passe ne correspondent pas',
                  })}
                />
                {errors.password2 && <span className="text-error text-sm">{errors.password2.message}</span>}
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


export default LoginRegister;