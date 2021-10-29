import { ContractFactory, Wallet } from 'ethers';

import * as ReserveLogic_JSON from '../../artifacts/contracts/protocol/libraries/logic/ReserveLogic.sol/ReserveLogic.json';
import * as GenericLogic_JSON from '../../artifacts/contracts/protocol/libraries/logic/GenericLogic.sol/GenericLogic.json';
import * as ValidationLogic_JSON from '../../artifacts/contracts/protocol/libraries/logic/ValidationLogic.sol/ValidationLogic.json';

import {
  GenericLogic__factory,
  ReserveLogic__factory,
  ValidationLogic__factory,
} from '../../src/contracts';

export function factoryReserveLogicLibrary(deployer: Wallet) {
  const factory = new ContractFactory(
    ReserveLogic_JSON.abi,
    ReserveLogic_JSON.bytecode,
    deployer
  ) as ReserveLogic__factory;

  return factory;
}

export function factoryValidationLogicLibrary(genericLogicAddress: string, deployer: Wallet) {
  const newByteCode = ValidationLogic__factory.linkBytecode({
    ['contracts/protocol/libraries/logic/GenericLogic.sol:GenericLogic']: genericLogicAddress,
  });
  const factory = new ContractFactory(
    ValidationLogic_JSON.abi,
    newByteCode,
    deployer
  ) as ValidationLogic__factory;

  return factory;
}

export function factoryGenericLogicLibrary(deployer: Wallet) {
  const factory = new ContractFactory(
    GenericLogic_JSON.abi,
    GenericLogic_JSON.bytecode,
    deployer
  ) as GenericLogic__factory;

  return factory;
}
