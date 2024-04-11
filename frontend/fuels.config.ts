import { createConfig } from 'fuels';

export default createConfig({
  contracts: ['../contract'],
  output: './src/sway-api',
  useBuiltinForc: false,
  chainConfig: './chainConfig.json',
});

/**
 * Check the docs:
 * https://fuellabs.github.io/fuels-ts/guide/cli/config-file
 */
