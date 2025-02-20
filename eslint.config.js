import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "prefer-const": "error",
      "react-hooks/exhaustive-deps": ["warn", {
        "additionalHooks": "(useMyCustomHook|useMyOtherCustomHook)"
      }]
    },
    extends: [
      "plugin:react-hooks/recommended"
    ]
  }
];
