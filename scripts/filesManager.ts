import fs from 'fs';
import path from 'path';

interface IContractsConfig {
  tokens: { [key: string]: string };
  registry: string;
  addressProvider: string;
  libraries: {
    reserve: string;
    generic: string;
    validation: string;
  };
  lendingPool: string;
  lendingPoolProxy: string;
  poolConfigurator: string;
  poolConfiguratorProxy: string;
  aToken: string;
  stableDebtToken: string;
  variableDebtToken: string;
  aTokenAndRateHelper: string;
  oracleBrandProvider: string;
  oracleBand: string;
  dataProvider: string;
  rateStrategy: string;
  collateralManager: string;
}

export const loadContractsConfig = (network: string): IContractsConfig | null => {
  const CONFIG_DIR = `../contracts.${network}.json`;
  const configPath = path.join(__dirname, CONFIG_DIR);

  if (!fs.existsSync(configPath)) {
    console.log('Godwoken Contracts not found');
    return null;
  }

  const configRawData = fs.readFileSync(configPath);
  const contractsConfig = JSON.parse(configRawData.toString());

  return contractsConfig as IContractsConfig;
};

export const writeToContractsConfig = (obj: Partial<IContractsConfig>, network: string) => {
  const config = loadContractsConfig(network);

  const CONFIG_DIR = `../contracts.${network}.json`;
  const configPath = path.join(__dirname, CONFIG_DIR);

  fs.writeFileSync(configPath, JSON.stringify({ ...config, ...obj }, null, 2));
};

export const formatTokens = (
  tokens: { address: string; symbol: string }[]
): { [key: string]: string } => {
  const formattedTokens: { [key: string]: string } = {};

  for (let i = 0; i < tokens.length; ++i) {
    const deployedToken = tokens[i];
    formattedTokens[deployedToken.symbol] = deployedToken.address;
  }

  return formattedTokens;
};
