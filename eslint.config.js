const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [".expo/**", "dist/**", "coverage/**", "web-build/**"],
  },
  {
    files: ["tests/**/*.cjs"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
      },
    },
  },
]);
