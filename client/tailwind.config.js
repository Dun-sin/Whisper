module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            screens: {
                mdl: { max: '768px' },
            },
            colors: {
                primary: '#011627',
                secondary: '#162938',
                highlight: '#FF9F1C',
                red: '#FF3A46',
            },
        },
    },
    plugins: [],
};
