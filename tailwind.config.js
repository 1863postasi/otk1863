/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                stone: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524', // Hamlin Stone Dark
                    900: '#1c1917',
                },
                boun: {
                    blue: '#004795', // Official BOUN Blue
                    red: '#8a1b1b',   // Brick Red
                    green: '#2d4f1e', // Campus Green
                    gold: '#b48e43'   // Autumn/Stone Gold
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            backgroundImage: {
                'stone-texture': "url('https://www.transparenttextures.com/patterns/concrete-wall.png')",
            }
        }
    },
    plugins: [],
}
