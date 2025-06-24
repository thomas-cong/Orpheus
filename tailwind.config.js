module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx,html}",
        "./index.html",
        "./orpheus-mirror/src/**/*.{js,jsx,ts,tsx,html}",
    ],
    theme: {
        extend: {
            fontFamily: {
                body: ["Funnel Sans", "sans-serif"],
                display: ["Funnel Display", "sans-serif"],
            },
            colors: {
                violet: {
                    100: "#10002b",
                    200: "#240046",
                    300: "#3C096C",
                    400: "#5A189A",
                    500: "#7B2CBF",
                    600: "#9D4EDD",
                    800: "#C77DFF",
                    900: "#E0AAFF",
                },
                orange: {
                    100: "#FF4800",
                    200: "#FF5400",
                    300: "#FF6000",
                    400: "#FF6D00",
                    500: "#FF7900",
                    600: "#FF8500",
                    700: "#FF9100",
                    800: "#FF9E00",
                    900: "#FFAA00",
                },
                navy: {
                    100: "#000281",
                    200: "#031D9B",
                    300: "#0539B6",
                    400: "#0B5ED0",
                    500: "#1775D3",
                    600: "#1E8AD8",
                    800: "#24A1DD",
                    900: "#2BAEDD",
                },
            },
        },
    },
    plugins: [],
};
