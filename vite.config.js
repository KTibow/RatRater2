import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

const config = {
  plugins: [sveltekit(), tailwindcss()],
};

export default config;
