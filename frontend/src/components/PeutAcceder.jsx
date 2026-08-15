import { useAuth } from '../context/AuthContext';
function PeutAcceder({ permission, children }) {
  const { aPermission } = useAuth();
  if (!aPermission(permission)) {
    return null;
  }
  return children;
}
export default PeutAcceder;