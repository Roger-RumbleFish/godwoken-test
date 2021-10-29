import { ContractFactory, Wallet } from 'ethers';

import * as Registry_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPoolAddressesProviderRegistry.sol/LendingPoolAddressesProviderRegistry.json';
import * as AddressProvider_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPoolAddressesProvider.sol/LendingPoolAddressesProvider.json';
import * as LendingPool_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json';
import * as Configurator_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json';
import * as DefaultReserveInterestRateStrategy_JSON from '../../artifacts/contracts/protocol/lendingpool/DefaultReserveInterestRateStrategy.sol/DefaultReserveInterestRateStrategy.json';
import * as LendingPoolCollateralManager_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPoolCollateralManager.sol/LendingPoolCollateralManager.json';

import {
  DefaultReserveInterestRateStrategy__factory,
  LendingPoolAddressesProviderRegistry__factory,
  LendingPoolAddressesProvider__factory,
  LendingPoolCollateralManager__factory,
  LendingPoolConfigurator__factory,
  LendingPool__factory,
} from '../../src/contracts';
import { LendingPoolLibraryAddresses } from '../../src/contracts/factories/LendingPool__factory';

export function factoryLendingPoolAddressProvider(deployer: Wallet) {
  const factory = new ContractFactory(
    AddressProvider_JSON.abi,
    AddressProvider_JSON.bytecode,
    deployer
  ) as LendingPoolAddressesProvider__factory;

  return factory;
}

export function factoryLendingPoolRegistry(deployer: Wallet) {
  const factory = new ContractFactory(
    Registry_JSON.abi,
    Registry_JSON.bytecode,
    deployer
  ) as LendingPoolAddressesProviderRegistry__factory;

  return factory;
}

export function factoryLendingPool(
  lendingPoolAddress: LendingPoolLibraryAddresses,
  deployer: Wallet
) {
  const newBytecode = LendingPool__factory.linkBytecode(lendingPoolAddress);

  const factory = new ContractFactory(
    LendingPool_JSON.abi,
    newBytecode,
    deployer
  ) as LendingPool__factory;

  return factory;
}

export function factoryLendingPoolConfiguration(deployer: Wallet) {
  const factory = new ContractFactory(
    Configurator_JSON.abi,
    Configurator_JSON.bytecode,
    deployer
  ) as LendingPoolConfigurator__factory;

  return factory;
}

export function DefaultReserveInterestRateStrategyFactory(deployer: Wallet) {
  const factory = new ContractFactory(
    DefaultReserveInterestRateStrategy_JSON.abi,
    DefaultReserveInterestRateStrategy_JSON.bytecode,
    deployer
  ) as DefaultReserveInterestRateStrategy__factory;

  return factory;
}

export function LendingPoolCollateralManagerFactory(deployer: Wallet) {
  const factory = new ContractFactory(
    LendingPoolCollateralManager_JSON.abi,
    LendingPoolCollateralManager_JSON.bytecode,
    deployer
  ) as LendingPoolCollateralManager__factory;

  return factory;
}
