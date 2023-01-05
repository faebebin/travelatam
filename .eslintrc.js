module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "plugins": [
      'import',
    ],
    "ignorePatterns": ["dist/"],
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
      "import/no-unused-modules": [1, {"unusedExports": true}]
    // "no-unused-vars"
    }
}
