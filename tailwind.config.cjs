const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      keyframes: {
        wave: {
          "0%, 100%": { "background-position": "0 25%" },
          "50%": { "background-position": "0 75%" },
        },
      },
      animation: {
        wave: "wave 5s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};

module.exports = config;
