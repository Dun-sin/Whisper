import { useEffect, useState } from 'react'

export const DARK_THEME = 'dark'
export const LIGHT_THEME = 'light'

const useAppTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || DARK_THEME)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevState) => {
        const theme = prevState === DARK_THEME ? LIGHT_THEME : DARK_THEME
        localStorage.setItem('theme', theme)
        return theme
    })
  }

  const setDarkTheme = () => {
    localStorage.setItem('theme', 'dark')
    setTheme('dark')
  }

  const setLightTheme = () => {
    localStorage.setItem('theme', 'light')
    setTheme('light')
  }

  return { activeTheme: theme, toggleTheme, setDarkTheme, setLightTheme }
}

export default useAppTheme