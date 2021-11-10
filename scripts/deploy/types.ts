import {
  iMultiPoolsAssets,
  INervosConfig,
  IReserveParams,
  tEthereumAddress,
} from '../../helpers/types';
import { AaveProtocolDataProvider } from '../../src/contracts';

export interface IInitializationProps {
  addressProviderAddress: tEthereumAddress;
  configuratorAddress: tEthereumAddress;
  aTokenAddress: tEthereumAddress;
  stableTokenAddress: tEthereumAddress;
  variableTokenAddress: tEthereumAddress;
  dataProviderAddress: tEthereumAddress;
  tokensAndRatesAddress: tEthereumAddress;
  nervosConfig: INervosConfig;
}

export interface IDeployTokens {
  aTokenAddress: tEthereumAddress;
  tokensAndRatesAddress: tEthereumAddress;
  stableTokenAddress: tEthereumAddress;
  variableTokenAddress: tEthereumAddress;
}

export interface IConfigureReservesByHelperProps {
  reservesParams: iMultiPoolsAssets<IReserveParams>;
  tokenAddresses: { [symbol: string]: tEthereumAddress };
  helpers: AaveProtocolDataProvider;
  admin: tEthereumAddress;
  addressProviderAddress: tEthereumAddress;
  aTokensAndRatesHelper: tEthereumAddress;
}
