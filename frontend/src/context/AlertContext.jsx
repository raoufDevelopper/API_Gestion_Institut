import { createContext, useContext, useState } from 'react';
const AlertContext = createContext(null);
export function AlertProvider({ children }) {
  const [alerte, setAlerte] = useState(null); // { type: 'succes' | 'erreur', message: string }
  const afficherSucces = (message) => setAlerte({ type: 'succes', message });
  const afficherErreur = (message) => setAlerte({ type: 'erreur', message });
  const fermerAlerte = () => setAlerte(null);
  return (
    <AlertContext.Provider value={{ alerte, afficherSucces, afficherErreur, fermerAlerte }}>
      {children}
    </AlertContext.Provider>
  );
}
export function useAlert() {
  return useContext(AlertContext);
}