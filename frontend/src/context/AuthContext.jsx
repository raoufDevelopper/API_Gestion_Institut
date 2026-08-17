import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, getStatutAbonnement } from '../api/auth';
import { logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  
  const [user, setUser] = useState(null);
  
  const [permissions, setPermissions] = useState([]);
  
  const [abonnementActif, setAbonnementActif] = useState(true);
  
  const [chargement, setChargement] = useState(true);
  


  const chargerUtilisateur = async () => {
    
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setChargement(false);
      return;
    }
    
    try 
    {
      const resUser = await getMe();
    
      setUser(resUser.data);
    
      setPermissions(resUser.data.permissions || []);
    
      const resAbonnement = await getStatutAbonnement();
    
      setAbonnementActif(resAbonnement.data.est_actif);
    } 
    catch (err) 
    {
      // Token invalide/expiré : l'intercepteur axios gère déjà la redirection
    
      localStorage.removeItem('access_token');
    
      localStorage.removeItem('refresh_token');
    
      setUser(null);
    } 
    finally 
    {
      setChargement(false);
    }
  };
  
  useEffect(() => {chargerUtilisateur();}, []);
  

  const logout = async () => {
    
    const refreshToken = localStorage.getItem('refresh_token');
    
    try 
    {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } 
    catch (err) 
    {
      // même si l'appel échoue, on déconnecte quand même côté client
    } 
    finally 
    {
      localStorage.removeItem('access_token');
    
      localStorage.removeItem('refresh_token');
    
      setUser(null);
    
      setPermissions([]);
    
      window.location.href = '/login';
    }
  
  };
  
  const aPermission = (code) => permissions.includes(code);
  
  const value = {user, permissions, aPermission, abonnementActif, chargement, logout, rafraichirUtilisateur: chargerUtilisateur,};
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

export function useAuth() 
{
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}
