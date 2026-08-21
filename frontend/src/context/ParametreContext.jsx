import { createContext, useContext, useState, useEffect } from 'react';
import { getParametreInstitut } from '../api/parametres';
import { useAuth } from './AuthContext';

const ParametreContext = createContext(null);

export function ParametreProvider({ children }) {
  const [parametre, setParametre] = useState(null);
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      getParametreInstitut()
        .then((res) => setParametre(res.data))
        .catch(() => setParametre(null));
    }
  }, [user]);
  return (
    <ParametreContext.Provider value={{ parametre }}>
      {children}
    </ParametreContext.Provider>
  );
}
export function useParametre() {
  return useContext(ParametreContext);
}