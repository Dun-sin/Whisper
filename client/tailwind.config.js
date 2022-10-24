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
            },
        },
    },
    plugins: [],
};
