import type { Config } from "tailwindcss";


export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#f3f7fb",
                    100: "#e6eef7",
                    200: "#c9dbee",
                    300: "#9ebfe0",
                    400: "#6da0cf",
                    500: "#4f86be", // calm medical blue
                    600: "#396aa6",
                    700: "#2f5588",
                    800: "#26446c",
                    900: "#1f3859"
                }
            },
            boxShadow: {
                soft: "0 10px 30px rgba(0,0,0,0.08)"
            }
        }
    },
    plugins: [],
} satisfies Config;