import { ethers, Wallet } from 'ethers';
import { LendingPool } from '../../src/contracts/LendingPool';
import * as AddressProvider_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPoolAddressesProvider.sol/LendingPoolAddressesProvider.json';
import * as LendingPool_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json';
import * as Registry_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPoolAddressesProviderRegistry.sol/LendingPoolAddressesProviderRegistry.json';
import * as Configurator_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json';

import { LendingPoolAddressesProviderRegistry } from '../../src/contracts/LendingPoolAddressesProviderRegistry';
import { LendingPoolAddressesProvider, LendingPoolConfigurator } from '../../src/contracts';

export function connectLendingPool(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(address, LendingPool_JSON.abi, deployer.provider).connect(
    deployer
  ) as LendingPool;

  return contract;
}

export function connectLendingPoolRegistry(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(address, Registry_JSON.abi, deployer.provider).connect(
    deployer
  ) as LendingPoolAddressesProviderRegistry;

  return contract;
}

export function connectLendingPoolAddressProvider(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(
    address,
    AddressProvider_JSON.abi,
    deployer.provider
  ).connect(deployer) as LendingPoolAddressesProvider;

  return contract;
}

export function connectLendingPoolConfigurator(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(address, Configurator_JSON.abi, deployer.provider).connect(
    deployer
  ) as LendingPoolConfigurator;

  return contract;
}
