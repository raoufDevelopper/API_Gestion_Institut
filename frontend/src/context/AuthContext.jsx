import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, getStatutAbonnement, logout as logoutApi } from '../api/auth';
import api from '../api/axiosConfig';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [abonnementActif, setAbonnementActif] = useState(true);
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);
  const [chargement, setChargement] = useState(true);
  const chargerUtilisateur = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setChargement(false);
      return;
    }
    try {
      const resUser = await getMe();
      setUser(resUser.data);
      setPermissions(resUser.data.permissions || []);
      const resAbonnement = await getStatutAbonnement();
      setAbonnementActif(resAbonnement.data.est_actif);
      await rafraichirNotifications();
    } catch (err) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setChargement(false);
    }
  };
  const rafraichirNotifications = async () => {
    try {
      const res = await api.get('parametres/notifications/');
      const nonLues = res.data.filter((n) => !n.lue).length;
      setNotificationsNonLues(nonLues);
    } catch (err) {
      // silencieux : pas bloquant si ça échoue
    }
  };
  useEffect(() => {
    chargerUtilisateur();
  }, []);
  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (err) {
      // déconnexion côté client même si l'appel échoue
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setPermissions([]);
      window.location.href = '/login';
    }
  };
  const aPermission = (code) => permissions.includes(code);
  const value = {
    user,
    permissions,
    aPermission,
    abonnementActif,
    notificationsNonLues,
    rafraichirNotifications,
    chargement,
    logout,
    rafraichirUtilisateur: chargerUtilisateur,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}