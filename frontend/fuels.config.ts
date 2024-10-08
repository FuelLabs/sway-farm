import { createConfig } from 'fuels';

export default createConfig({
  // workspace: "../",
  contracts: ['../contract'],
  output: './src/sway-api',
});

/**
 * Check the docs:
 * https://fuellabs.github.io/fuels-ts/guide/cli/config-file
 */
