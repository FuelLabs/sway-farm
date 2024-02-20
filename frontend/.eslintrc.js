module.exports = {
  root: true,
  extends: [
    'plugin:@fuels/typescript',
    'plugin:@fuels/jest',
    'plugin:@fuels/react',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  settings: {
    'import/resolver': {
      [require.resolve('eslint-import-resolver-node')]: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      [require.resolve('eslint-import-resolver-typescript')]: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/namespace': 'off',
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external', 'internal'],
          ['parent'],
          ['sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
    'no-html-link-for-pages': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        shorthandFirst: true,
        noSortAlphabetically: true,
        reservedFirst: true,
        multiline: 'last',
      },
    ],
  },
};
