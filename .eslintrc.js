// .eslintrc.js
module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    // Turn off the unused vars rule completely
    "@typescript-eslint/no-unused-vars": "off",
    
    // Turn off explicit any warnings
    "@typescript-eslint/no-explicit-any": "off",
    
    // Turn off react hooks exhaustive deps warnings
    "react-hooks/exhaustive-deps": "off"
  },
  // This ignores specific files or directories
  ignorePatterns: ["node_modules/", ".next/", "public/"]
}
