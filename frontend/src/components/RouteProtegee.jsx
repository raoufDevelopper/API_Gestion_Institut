import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RouteProtegee({ children, permission }) {

  const { user, aPermission, abonnementActif, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!abonnementActif) {
    return <Navigate to="/abonnement-expire" replace />;
  }

  if (permission && !aPermission(permission)) {
    return <Navigate to="/non-autorise" replace />;
  }

  return children;

}

export default RouteProtegee;