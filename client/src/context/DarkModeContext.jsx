import { createContext, useContext, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { defaultThemeBasedOnSystemPreference } from "../lib/utils"

const DarkModeContext = createContext()

export function useDarkMode() {
    return useContext(DarkModeContext)
}

export function DarkModeProvider({ children }) {
    const defaultMode = defaultThemeBasedOnSystemPreference();
    const [darkMode, setDarkMode] = useState(defaultMode !== null ? defaultMode : true);

    useEffect(() => {
        window.localStorage.setItem('darkMode', JSON.stringify(darkMode))
    }, [darkMode]);

    return (
        <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    )
}

DarkModeProvider.propTypes = {
    children: PropTypes.node,
};
