import { ContractFactory, Wallet } from 'ethers';

import * as DataProvider_JSON from '../../artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json';

import { AaveProtocolDataProvider__factory } from '../../src/contracts';

export function protocolDataProviderFactory(deployer: Wallet) {
  const factory = new ContractFactory(
    DataProvider_JSON.abi,
    DataProvider_JSON.bytecode,
    deployer
  ) as AaveProtocolDataProvider__factory;

  return factory;
}
