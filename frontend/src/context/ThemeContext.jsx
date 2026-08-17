import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);


export function ThemeProvider({ children }) {

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'clair');

    useEffect(() => {

        if (theme === 'sombre') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);

    }, [theme]);

    const toggleTheme = () => {
        setTheme((t) => (t === 'clair' ? 'sombre' : 'clair'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
        </ThemeContext.Provider>
    );

}


export function useTheme() {
  return useContext(ThemeContext);
}