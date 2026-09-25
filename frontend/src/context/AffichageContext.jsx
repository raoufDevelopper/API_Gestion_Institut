import { createContext, useContext, useState } from 'react';


const AffichageContext = createContext();

export function AffichageProvider({ children }) {

    const [modeAffichage, setModeAffichage] = useState('tableau'); // 'tableau' | 'bloc', appliqué à toute l'app

    const toggleAffichage = () => setModeAffichage((m) => (m === 'tableau' ? 'bloc' : 'tableau'));

    return (
        <AffichageContext.Provider value={{ modeAffichage, toggleAffichage }}>
            {children}
        </AffichageContext.Provider>
    );
}


export function useAffichage() 
{
  return useContext(AffichageContext);
}
