import { useEffect, useState, createContext } from 'react';
import PropTypes from 'prop-types';

export const ThemeContext = createContext({
    theme: 'light',
    toggle: () => null,
});

const ThemeProvider = ({ children }) => {
    const currentTheme = localStorage.getItem('theme');
    const [theme, setTheme] = useState(currentTheme);

    useEffect(() => {
        setTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            localStorage.setItem('theme', theme);
        } else {
            setTheme('light');
            localStorage.setItem('theme', theme);
        }
    };

    const contextValues = {
        theme: theme,
        toggle: toggleTheme,
    };
    return (
        <ThemeContext.Provider value={contextValues}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.any,
};
export default ThemeProvider;
