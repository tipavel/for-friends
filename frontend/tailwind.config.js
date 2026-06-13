/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                espresso: '#1a0f0a',
                roast: '#2d1810',
                caramel: '#c07d40',
                cream: '#f5ede0',
                milk: '#faf6f0',
                terracotta: '#c4583a',
                sage: '#7a8c6e',
                line: '#e2d5c3',
                muted: '#7a6458',
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                body: ['DM Sans', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 4px 24px rgba(26,15,10,0.10)',
                glow: '0 12px 48px rgba(26,15,10,0.18)',
            },
        },
    },
    plugins: [],
}