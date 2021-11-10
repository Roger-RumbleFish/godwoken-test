export enum EthereumNetwork {
  Mainnet = '0x1',
  Ropsten = '0x3',
  Kovan = '0x2a',
  Rinkeby = '0x4',
  Goerli = '0x5',
  Dev = '0x539',
}

export interface IContractsConfig {
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
