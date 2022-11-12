module.exports = {
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  plugins: ["svelte3"],
  ignorePatterns: ["public/build/"],
  overrides: [
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3",
    },
  ],
  rules: { "no-unused-vars": "warn", "no-useless-escape": "warn" },
};
