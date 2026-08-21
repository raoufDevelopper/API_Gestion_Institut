import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';

import { useAuth } from '../../context/AuthContext';

import { login, register as registerApi } from '../../api/auth';

import '../../assets/css/authentification.css'


function LoginRegister() {
  
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  
  const [erreurGlobale, setErreurGlobale] = useState('');
  
  const [messageSucces, setMessageSucces] = useState('');
  
  const navigate = useNavigate();
  
  const { rafraichirUtilisateur } = useAuth();
  
  const {register, handleSubmit, watch, reset, formState: { errors, isSubmitting },} = useForm();

  const password1 = watch('password1');
  
  const onSubmitLogin = async (data) => {
    
    setErreurGlobale('');
    
    try 
    {
      const res = await login(data.email, data.password);
      
      localStorage.setItem('access_token', res.data.access);
      
      localStorage.setItem('refresh_token', res.data.refresh);
      
      await rafraichirUtilisateur();
      
      navigate('/');
    } 
    catch (err) 
    {
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
    
    try 
    {
      await registerApi(formData);
      setMessageSucces('Compte créé avec succès ! Il sera activé par un administrateur avant que vous puissiez vous connecter.');
      reset();
      setMode('login');
    } 
    catch (err) 
    {
      setErreurGlobale(err.response?.data?.detail || 'Une erreur est survenue.');
    }

  };



  const basculerMode = (nouveauMode) => 
  {
    setMode(nouveauMode);
    
    setErreurGlobale('');
    
    setMessageSucces('');
    
    reset();
  };



  return (

    <div className="auth-container">
      
      {erreurGlobale && (
        <div className="alert alert-error">{erreurGlobale}</div>
      )}

      {messageSucces && (
        <div className="alert alert-success">{messageSucces}</div>
      )}


      <div className="auth-body">

        {mode === 'login' ? (
          
          <form onSubmit={handleSubmit(onSubmitLogin)} className="form login-form" key="login">
            
            <div className='logReg-title'>
              <img src="/images/login_man.png" alt="" />
              <h1>Connexion</h1>
              <p>
                Connectez-vous à votre compte pour accéder à votre 
                espace de travail afin de consulter les ctualités de 
                l'institut
              </p>
            </div>

            <div className='logReg-container'>

              <div className='form-group'>
                
                <input type="email" {...register('email', { required: 'Email requis' })} placeholder='Entrez votre e-mail'/>
                
                {errors.email && <span className="text-error">{errors.email.message}</span>}
              
              </div>
              
              <div className='form-group'>
               
                <input type="password" {...register('password', { required: 'Mot de passe requis' })} placeholder='Entrez votre mot de passe'/>
                
                {errors.password && <span className="text-error">{errors.password.message}</span>}
              
              </div>

              <div className='forgot-remember'> 
                Avez-vous oublié votre mot de passe ? 
                Cliquez sur  
                <a href="#"> mot de passe oublié ? </a> 
                pour le recupérer.
              </div>

              <button type="submit" className="btn btn-auth" disabled={isSubmitting}>
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
          
            </div>

            <div className="tabs">

              <p>
                Avez-vous déjà un compte ? Si non, cliquez sur  
                <button className={`tab flex-1 ${mode === 'register' ? 'tab-active' : ''}`} onClick={() => basculerMode('register')} type="button">
                  créer votre compte
                </button>
                pour en créer un
              </p>

            </div>
            
          </form>

        ) : (
          
          <form onSubmit={handleSubmit(onSubmitRegister)} className="form register-form" key="register">
            
            <div className='logReg-title'>
              <h1>Créer un compte</h1>
              <p>
                Créez votre compte pour accéder à l'application. 
                Vous devez mémoriser les informations entrées ci 
                dessous car elles vous serviront plutard à vous 
                connecter à l'application.
              </p>
            </div>

            <div className='logReg-container'>

              <div className='form-group'>
               
                <input type="text" {...register('username', { required: "Nom d'utilisateur requis" })} placeholder='Entrez le nom d utilisateur'/>
                
                {errors.username && <span className="text-error">{errors.username.message}</span>}
              
              </div>
              
              <div className='form-group'>
            
                <input type="email" {...register('email', { required: 'Email requis' })} placeholder='Entrez l adresse mail'/>
                
                {errors.email && <span className="text-error">{errors.email.message}</span>}
              
              </div>
              
              <div className='form-group'>
               
                <select {...register('role', { required: 'Rôle requis' })}>
                  <option value="">Sélectionnez votre rôle</option>
                  <option value="Étudiant">Étudiant</option>
                  <option value="Formateur">Formateur</option>
                </select>
                
                {errors.role && <span className="text-error">{errors.role.message}</span>}
              
              </div>

              <div className='form-group'>
             
                <input type="password" {...register('password1', { required: 'Mot de passe requis', minLength: { value: 8, message: '8 caractères minimum' } })} placeholder='Entrez le mot de passe'/>
                
                {errors.password1 && <span className="text-error">{errors.password1.message}</span>}
              
              </div>

              <div className='form-group'>
              
                <input type="password" {...register('password2', {required: 'Confirmation requise', validate: (value) => value === password1 || 'Les mots de passe ne correspondent pas',})} placeholder='Confirmez le mot de passe'/>
                
                {errors.password2 && <span className="text-error">{errors.password2.message}</span>}
              
              </div>

              <div className='form-group'>
    
                <input type="file" accept="image/*" {...register('photo_profil')}/>
    
                <label className="label"><span className="label-text">Ajoutez une photo de profil (cette action est optionnelle)</span></label>
    
              </div>

              <button type="submit" className="btn btn-auth" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer mon compte'}
              </button>

            </div>

            <div className="tabs">

              <p>
                Avez-vous créé votre compte ? Si oui, 
                <button className={`tab ${mode === 'login' ? 'tab-active' : ''}`} onClick={() => basculerMode('login')} type="button">
                  connectez-vous
                </button>
                à votre Compte
              </p>

            </div>

          </form>
        
        )}
      
      </div>
    
    </div>
  
  );

}


export default LoginRegister;