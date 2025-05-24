module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    // Downgrade errors to warnings
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
