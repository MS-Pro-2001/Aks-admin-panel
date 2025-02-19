const globals = require("globals");
const eslint = require("@eslint/js");
const prettier = require("eslint-plugin-prettier");

module.exports = [
  eslint.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        console: true,
        process: true,
        module: true,
        require: true,
        __dirname: true,
        __filename: true,
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "warn",
      "no-undef": "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "no-trailing-spaces": "error",
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js"],
        },
      },
    },
  },
];
