import { Overrides, providers } from 'ethers';
import { ethers } from 'hardhat';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { PolyjuiceJsonRpcProvider, PolyjuiceWallet } from '@polyjuice-provider/ethers';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';

import Config from '../config.json';
import { tEthereumAddress } from '../helpers/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

if (!Config.deployer) {
  throw new Error('Deployer private key missing in config.json');
}

const DEPLOYER_PRIVATE_KEY = Config.deployer;

const polyjuiceConfig = {
  rollupTypeHash: Config.nervos.rollup_type_hash,
  ethAccountLockCodeHash: Config.nervos.eth_account_lock_hash,
  web3Url: Config.nervos.godwoken.rpcUrl,
};

export const providerPolyjuiceEthers = new PolyjuiceJsonRpcProvider(
  polyjuiceConfig,
  Config.nervos.godwoken.rpcUrl
);

const httpProvider = new PolyjuiceHttpProvider(Config.nervos.godwoken.rpcUrl, polyjuiceConfig);

const web3Provider = new providers.Web3Provider(httpProvider);

export const GAS_PRICE = 0;
export const GAS_LIMIT = 12000000;

export const transactionOverrides: Overrides = {
  gasPrice: GAS_PRICE,
  gasLimit: GAS_LIMIT,
};

export const provider = providerPolyjuiceEthers;

export const addressTranslator = new AddressTranslator({
  CKB_URL: Config.nervos.ckb.url,
  RPC_URL: Config.nervos.godwoken.rpcUrl,
  INDEXER_URL: Config.nervos.indexer.url,
  deposit_lock_script_type_hash: Config.nervos.deposit_lock_script_type_hash,
  eth_account_lock_script_type_hash: Config.nervos.eth_account_lock_hash,
  rollup_type_script: {
    code_hash: Config.nervos.rollup_type_script.code_hash,
    hash_type: Config.nervos.rollup_type_script.hash_type,
    args: Config.nervos.rollup_type_script.args,
  },
  rollup_type_hash: Config.nervos.rollup_type_hash,
  portal_wallet_lock_hash: Config.nervos.portal_wallet_lock_hash,
});

export const translateAddress = (address: string) =>
  addressTranslator.ethAddressToGodwokenShortAddress(address);

export const deployer = new PolyjuiceWallet(DEPLOYER_PRIVATE_KEY, polyjuiceConfig, provider);

export type Deployer = PolyjuiceWallet | SignerWithAddress;

export enum LendingContracts {
  ERC20Mint = 'ERC20_test',
  Registry = 'LendingPoolAddressesProviderRegistry',
  AddressProvider = 'LendingPoolAddressesProvider',
  LendingPool = 'LendingPool',
  Configurator = 'LendingPoolConfigurator',
  LibraryReserveLogic = 'ReserveLogic',
  LibraryGenericLogic = 'GenericLogic',
  LibraryValidationLogic = 'ValidationLogic',
  AToken = 'AToken',
  ATokensAndRatesHelper = 'ATokensAndRatesHelper',
  StableDebtToken = 'StableDebtToken',
  VariableDebtToken = 'VariableDebtToken',
  OracleBandProvider = 'BandOracleProvider',
  OracleBand = 'BandOracle',
  DataProvider = 'AaveProtocolDataProvider',
  RateStrategy = 'DefaultReserveInterestRateStrategy',
  CollateralManager = 'LendingPoolCollateralManager',
}

export const getDeployer = async (network?: string): Promise<Deployer> => {
  if (network && network === 'godwoken') {
    return deployer;
  }

  const [owner] = await ethers.getSigners();

  return owner;
};

export const connectRPC = (privateKey: string, config: typeof Config) => {
  const polyjuiceConfig = {
    rollupTypeHash: config.nervos.rollup_type_hash,
    ethAccountLockCodeHash: config.nervos.eth_account_lock_hash,
    web3Url: config.nervos.godwoken.rpcUrl,
  };

  const providerPolyjuiceEthers = new PolyjuiceJsonRpcProvider(
    polyjuiceConfig,
    config.nervos.godwoken.rpcUrl
  );

  const httpProvider = new PolyjuiceHttpProvider(config.nervos.godwoken.rpcUrl, polyjuiceConfig);
  const web3Provider = new providers.Web3Provider(httpProvider);

  const provider = providerPolyjuiceEthers;

  const addressTranslator = new AddressTranslator({
    CKB_URL: config.nervos.ckb.url,
    RPC_URL: Config.nervos.godwoken.rpcUrl,
    INDEXER_URL: config.nervos.indexer.url,
    deposit_lock_script_type_hash: config.nervos.deposit_lock_script_type_hash,
    eth_account_lock_script_type_hash: config.nervos.eth_account_lock_hash,
    rollup_type_script: {
      code_hash: config.nervos.rollup_type_script.code_hash,
      hash_type: config.nervos.rollup_type_script.hash_type,
      args: config.nervos.rollup_type_script.args,
    },
    rollup_type_hash: config.nervos.rollup_type_hash,
    portal_wallet_lock_hash: config.nervos.portal_wallet_lock_hash,
  });

  const translateAddress = (address: string) =>
    addressTranslator.ethAddressToGodwokenShortAddress(address);

  const deployer = new PolyjuiceWallet(privateKey, polyjuiceConfig, provider);

  return {
    deployer,
    provider,
    translateAddress,
  };
};

export const getQuoteCurrencies = (oracleQuoteCurrency: string): string[] => {
  switch (oracleQuoteCurrency) {
    case 'USD':
      return ['USD'];
    case 'ETH':
    case 'WETH':
    default:
      return ['ETH', 'WETH'];
  }
};

export const omit = <T, U extends keyof T>(obj: T, keys: U[]): Omit<T, U> =>
  (Object.keys(obj) as U[]).reduce(
    (acc, curr) => (keys.includes(curr) ? acc : { ...acc, [curr]: obj[curr] }),
    {} as Omit<T, U>
  );

export const getPairsTokenAggregator = (
  allAssetsAddresses: {
    [tokenSymbol: string]: tEthereumAddress;
  },
  aggregatorsAddresses: { [tokenSymbol: string]: tEthereumAddress },
  oracleQuoteCurrency: string
): [string[], string[]] => {
  console.log(allAssetsAddresses, aggregatorsAddresses, oracleQuoteCurrency);
  const assetsWithoutQuoteCurrency = omit(
    allAssetsAddresses,
    getQuoteCurrencies(oracleQuoteCurrency)
  );

  const pairs = Object.entries(assetsWithoutQuoteCurrency).map(([tokenSymbol, tokenAddress]) => {
    //if (true/*tokenSymbol !== 'WETH' && tokenSymbol !== 'ETH' && tokenSymbol !== 'LpWETH'*/) {
    const aggregatorAddressIndex = Object.keys(aggregatorsAddresses).findIndex(
      (value) => value === tokenSymbol
    );
    const [, aggregatorAddress] = (
      Object.entries(aggregatorsAddresses) as [string, tEthereumAddress][]
    )[aggregatorAddressIndex];
    return [tokenAddress, aggregatorAddress];
    //}
  }) as [string, string][];

  const mappedPairs = pairs.map(([asset]) => asset);
  const mappedAggregators = pairs.map(([, source]) => source);

  return [mappedPairs, mappedAggregators];
};

export const chunk = <T>(arr: Array<T>, chunkSize: number): Array<Array<T>> => {
  return arr.reduce(
    (prevVal: any, currVal: any, currIndx: number, array: Array<T>) =>
      !(currIndx % chunkSize)
        ? prevVal.concat([array.slice(currIndx, currIndx + chunkSize)])
        : prevVal,
    []
  );
};
