import { ContractFactory, Wallet } from 'ethers';

import * as BandOracle_JSON from '../../artifacts/contracts/oracle/BandOracle.sol/BandOracle.json';
import * as BandOracleProvider_JSON from '../../artifacts/contracts/bandOracle/BandOracleProvider.sol/BandOracleProvider.json';
import * as LendingRateOracle_JSON from '../../artifacts/contracts/mocks/oracle/LendingRateOracle.sol/LendingRateOracle.json';

import {
  BandOracleProvider__factory,
  BandOracle__factory,
  LendingRateOracle__factory,
} from '../../src/contracts';

export function factoryBandOracleProvider(deployer: Wallet) {
  const factory = new ContractFactory(
    BandOracleProvider_JSON.abi,
    BandOracleProvider_JSON.bytecode,
    deployer
  ) as BandOracleProvider__factory;

  return factory;
}

export function factoryBandOracle(deployer: Wallet) {
  const factory = new ContractFactory(
    BandOracle_JSON.abi,
    BandOracle_JSON.bytecode,
    deployer
  ) as BandOracle__factory;

  return factory;
}

export function factoryLendingRateOracle(deployer: Wallet) {
  const factory = new ContractFactory(
    LendingRateOracle_JSON.abi,
    LendingRateOracle_JSON.bytecode,
    deployer
  ) as LendingRateOracle__factory;

  return factory;
}
