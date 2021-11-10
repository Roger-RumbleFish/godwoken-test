import { ethers } from 'hardhat';
import { ValidationLogic__factory } from '../../src/contracts/factories/ValidationLogic__factory';
import { LendingPoolLibraryAddresses } from '../../src/contracts/factories/LendingPool__factory';
import { waitForTx } from '../../src/utils';
import * as ValidationLogic_JSON from '../../artifacts/contracts/protocol/libraries/logic/ValidationLogic.sol/ValidationLogic.json';

import { Deployer, LendingContracts } from '../utils';
import { ContractFactory } from 'ethers';

const deployReserveLogicLibrary = async (deployer: Deployer) => {
  console.log('Deploying Reserve Logic Library');
  const reserveLogicFactory = await ethers.getContractFactory(
    LendingContracts.LibraryReserveLogic,
    deployer
  );

  const deployTransaction = reserveLogicFactory.getDeployTransaction();
  const receipt = await waitForTx(await deployer.sendTransaction(deployTransaction));

  console.log(`Reserve Logic Library Deployed ${receipt.contractAddress}`);

  return receipt.contractAddress;
};

const deployGenericLogicLibrary = async (deployer: Deployer) => {
  console.log('Deploying Generic Logic Library');
  const genericLogicFactory = await ethers.getContractFactory(
    LendingContracts.LibraryGenericLogic,
    deployer
  );

  const deployTransaction = genericLogicFactory.getDeployTransaction();
  const receipt = await waitForTx(await deployer.sendTransaction(deployTransaction));

  console.log(`Generic Logic Library Deployed ${receipt.contractAddress}`);

  return receipt.contractAddress;
};

const deployValidationLogicLibrary = async (genericLogicAddress: string, deployer: Deployer) => {
  console.log('Deploying Validation Logic Library');

  const newByteCode = ValidationLogic__factory.linkBytecode({
    ['contracts/protocol/libraries/logic/GenericLogic.sol:GenericLogic']: genericLogicAddress,
  });

  const validationLogicFactory = new ContractFactory(
    ValidationLogic_JSON.abi,
    newByteCode,
    deployer
  ) as ValidationLogic__factory;

  const deployTransaction = validationLogicFactory.getDeployTransaction();
  const receipt = await waitForTx(await deployer.sendTransaction(deployTransaction));

  console.log(`Validation Logic Library Deployed ${receipt.contractAddress}`);

  return receipt.contractAddress;
};

export const parseLibrariesAddressToContractData = (
  reserveLogicAddress: string,
  validationLogicAddress: string
): LendingPoolLibraryAddresses => {
  return {
    ['contracts/protocol/libraries/logic/ValidationLogic.sol:ValidationLogic']:
      validationLogicAddress,
    ['contracts/protocol/libraries/logic/ReserveLogic.sol:ReserveLogic']: reserveLogicAddress,
  };
};

interface ILendingPoolLibraries {
  reserve: string;
  generic: string;
  validation: string;
}

export const deployLibraries = async (deployer: Deployer): Promise<ILendingPoolLibraries> => {
  const reserveLogicAddress = await deployReserveLogicLibrary(deployer);
  const genericLogicAddress = await deployGenericLogicLibrary(deployer);
  const validationLogicAddress = await deployValidationLogicLibrary(genericLogicAddress, deployer);

  return {
    reserve: reserveLogicAddress,
    generic: genericLogicAddress,
    validation: validationLogicAddress,
  };
};
