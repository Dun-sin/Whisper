import { createContext, useContext, useEffect, useState } from "react"
import PropTypes from "prop-types"

const DarkModeContext = createContext()

export function useDarkMode() {
    return useContext(DarkModeContext)
}

export function DarkModeProvider({ children }) {
	  const defaultMode = JSON.parse(window.localStorage.getItem("darkMode");
	  const [darkMode, setDarkMode] = useState(() => (defaultMode === undefined || defaultMode === null) ? true : defaultMode );    

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
