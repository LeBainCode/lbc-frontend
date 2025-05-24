module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    // Downgrade these specific errors to warnings
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
