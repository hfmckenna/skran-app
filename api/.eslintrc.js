module.exports = {
  'env': {
    'node': true,
    'browser': false,
    'es2021': true,
  },
  'extends': [
    'google',
    'prettier'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    "valid-jsdoc": 0,
  },
};
