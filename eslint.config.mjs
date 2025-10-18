import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
    },
  },
  {
    files: ["jest.setup.js"],
    languageOptions: {
      globals: {
        global: "readonly",
        jest: "readonly",
      },
    },
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        console: "readonly",
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        URL: "readonly",
        Headers: "readonly",
        Response: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "**/*.ts",
      "**/*.tsx",
    ],
  },
];
