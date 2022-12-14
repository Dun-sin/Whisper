import { useContext } from 'react';

import { ThemeContext } from '../context/ThemeProvider';

const useTheme = () => {
    return useContext(ThemeContext);
};

export default useTheme;
