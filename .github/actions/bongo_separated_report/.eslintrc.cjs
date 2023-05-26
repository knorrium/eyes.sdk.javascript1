module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {},
  "plugins": ["@typescript-eslint", "prettier", "node"],
  "extends": ["plugin:@typescript-eslint/recommended", "prettier"],
  "ignorePatterns": ["node_modules/", "dist/", "types/", "logs/", "tmp/", "test/generic/", "fixtures/"],
  "rules": {
    "prettier/prettier": "error",
    // "@typescript-eslint/no-unused-vars": [
    //   "error",
    //   {"varsIgnorePattern": "^_", "args": "all", "argsIgnorePattern": "^_"}
    // ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  }
}
