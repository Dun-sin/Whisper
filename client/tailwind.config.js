module.exports = {
    darkMode: "class",
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            screens: {
                mdl: { max: '768px' },
            },
            colors: {
                primary: 'hsl(var(--primary) / <alpha-value>)',
                secondary: 'hsl(var(--secondary) / <alpha-value>)',
                highlight: 'hsl(var(--highlight) / <alpha-value>)',
                red: 'hsl(var(--red) / <alpha-value>)',
            },
        },
    },
    plugins: [],
};
