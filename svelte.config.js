import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },

  preprocess: [
    preprocess({
      typescript: true,
    }),
  ],
};

export default config;
