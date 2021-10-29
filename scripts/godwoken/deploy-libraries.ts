import { Wallet } from '@ethersproject/wallet';
import { LendingPoolLibraryAddresses } from '../../src/contracts/factories/LendingPool__factory';
import { waitForTx } from '../../src/utils';
import {
  factoryGenericLogicLibrary,
  factoryReserveLogicLibrary,
  factoryValidationLogicLibrary,
} from '../factories/libraries';

const deployReserveLogicLibrary = async (deployer: Wallet) => {
  const factory = factoryReserveLogicLibrary(deployer);
  const deployTransaction = factory.getDeployTransaction();

  return await waitForTx(await deployer.sendTransaction(deployTransaction));
};

const deployGenericLogicLibrary = async (deployer: Wallet) => {
  const factory = factoryGenericLogicLibrary(deployer);
  const deployTransaction = factory.getDeployTransaction();

  return await waitForTx(await deployer.sendTransaction(deployTransaction));
};

const deployValidationLogicLibrary = async (genericLogicAddress: string, deployer: Wallet) => {
  const factory = factoryValidationLogicLibrary(genericLogicAddress, deployer);
  const deployTransaction = factory.getDeployTransaction();

  return await waitForTx(await deployer.sendTransaction(deployTransaction));
};

export const deployLibraries = async (deployer: Wallet): Promise<LendingPoolLibraryAddresses> => {
  const reserveLogic = await deployReserveLogicLibrary(deployer);
  const genericLogic = await deployGenericLogicLibrary(deployer);

  const validationLogic = await deployValidationLogicLibrary(
    genericLogic.contractAddress,
    deployer
  );

  return {
    ['contracts/protocol/libraries/logic/ValidationLogic.sol:ValidationLogic']:
      validationLogic.contractAddress,
    ['contracts/protocol/libraries/logic/ReserveLogic.sol:ReserveLogic']:
      reserveLogic.contractAddress,
  };
};
