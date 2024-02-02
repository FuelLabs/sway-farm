const fuelPrettierConfig = require('@fuels/prettier-config');

/** @type {import("prettier").Config} */
module.exports = {
  ...fuelPrettierConfig,
  // trailingComma always adds comma on the end of functions params, that can cause
  // issues, when a second param can't be undefined.
  trailingComma: 'es5',
  overrides: [
    {
      files: '*.json',
      options: {
        trailingComma: 'none',
      },
    },
  ],
};
