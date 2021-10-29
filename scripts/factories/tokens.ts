import { ContractFactory, Wallet } from 'ethers';
import * as AToken_JSON from '../../artifacts/contracts/protocol/tokenization/AToken.sol/AToken.json';
import * as StableDebtToken_JSON from '../../artifacts/contracts/protocol/tokenization/StableDebtToken.sol/StableDebtToken.json';
import * as VariableDebtToken_JSON from '../../artifacts/contracts/protocol/tokenization/VariableDebtToken.sol/VariableDebtToken.json';
import * as ATokensAndRatesHelper_JSON from '../../artifacts/contracts/deployments/ATokensAndRatesHelper.sol/ATokensAndRatesHelper.json';
import * as ERC20_TEST_JSON from '../../artifacts/contracts/dependencies/openzeppelin/contracts/ERC20_test.sol/ERC20_test.json';

import {
  ATokensAndRatesHelper__factory,
  AToken__factory,
  ERC20Test__factory,
  ERC20__factory,
  StableDebtToken__factory,
  VariableDebtToken__factory,
} from '../../src/contracts';

export function factoryAToken(deployer: Wallet) {
  const factory = new ContractFactory(
    AToken_JSON.abi,
    AToken_JSON.bytecode,
    deployer
  ) as AToken__factory;

  return factory;
}

export function factoryGenericStableDebtToken(deployer: Wallet) {
  const factory = new ContractFactory(
    StableDebtToken_JSON.abi,
    StableDebtToken_JSON.bytecode,
    deployer
  ) as StableDebtToken__factory;

  return factory;
}

export function factoryGenericVariableDebtToken(deployer: Wallet) {
  const factory = new ContractFactory(
    VariableDebtToken_JSON.abi,
    VariableDebtToken_JSON.bytecode,
    deployer
  ) as VariableDebtToken__factory;

  return factory;
}

export function factoryATokensAndRatesHelper(deployer: Wallet) {
  const factory = new ContractFactory(
    ATokensAndRatesHelper_JSON.abi,
    ATokensAndRatesHelper_JSON.bytecode,
    deployer
  ) as ATokensAndRatesHelper__factory;

  return factory;
}

export function factoryErc20(deployer: Wallet) {
  const factory = new ContractFactory(
    ERC20_TEST_JSON.abi,
    ERC20_TEST_JSON.bytecode,
    deployer
  ) as ERC20Test__factory;

  return factory;
}
