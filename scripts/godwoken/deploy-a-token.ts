import { Wallet } from '@ethersproject/wallet';
import { eContractid, IReserveParams, tEthereumAddress } from '../../helpers/types';
import {
  factoryAToken,
  factoryATokensAndRatesHelper,
  factoryGenericStableDebtToken,
  factoryGenericVariableDebtToken,
} from '../factories/tokens';

export const deployGenericATokenImpl = async (deployer: Wallet) => {
  const factory = await factoryAToken(deployer);
  const deployTransaction = factory.getDeployTransaction();

  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  const aTokenAddress = deploymentReceipt.contractAddress;

  return aTokenAddress;
};

export const deployATokenImplementations = async (reservesConfig: {
  [key: string]: IReserveParams;
}) => {
  // Obtain the different AToken implementations of all reserves inside the Market config
  const aTokenImplementations = [
    ...Object.entries(reservesConfig).reduce<Set<eContractid>>((acc, [, entry]) => {
      acc.add(entry.aTokenImpl);
      return acc;
    }, new Set<eContractid>()),
  ];

  // aTokenImplementations[0]

  console.log(aTokenImplementations);

  return null;

  //   for (let x = 0; x < aTokenImplementations.length; x++) {
  //     const aTokenAddress = getOptionalParamAddressPerNetwork(
  //       poolConfig[aTokenImplementations[x].toString()],
  //       network
  //     );
  //     if (!notFalsyOrZeroAddress(aTokenAddress)) {
  //       const deployImplementationMethod = chooseATokenDeployment(aTokenImplementations[x]);
  //       console.log(`Deploying implementation`, aTokenImplementations[x]);
  //       await deployImplementationMethod(verify);
  //     }
  //   }

  // Debt tokens, for now all Market configs follows same implementations
  //   const genericStableDebtTokenAddress = getOptionalParamAddressPerNetwork(
  //     poolConfig.StableDebtTokenImplementation,
  //     network
  //   );
  //   const geneticVariableDebtTokenAddress = getOptionalParamAddressPerNetwork(
  //     poolConfig.VariableDebtTokenImplementation,
  //     network
  //   );

  //   if (!notFalsyOrZeroAddress(genericStableDebtTokenAddress)) {
  //     await deployGenericStableDebtToken(verify);
  //   }
  //   if (!notFalsyOrZeroAddress(geneticVariableDebtTokenAddress)) {
  //     await deployGenericVariableDebtToken(verify);
  //   }
};

export const deployGenericStableDebtToken = async (deployer: Wallet) => {
  const factory = factoryGenericStableDebtToken(deployer);
  const deployTransaction = factory.getDeployTransaction();

  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  return deploymentReceipt.contractAddress;
};

export const deployGenericVariableDebtToken = async (deployer: Wallet) => {
  const factory = factoryGenericVariableDebtToken(deployer);
  const deployTransaction = factory.getDeployTransaction();

  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  return deploymentReceipt.contractAddress;
};

export const deployATokensAndRatesHelper = async (
  lendingPool: tEthereumAddress,
  addressProvider: tEthereumAddress,
  lendingPoolConfiguration: tEthereumAddress,
  deployer: Wallet
) => {
  const factory = factoryATokensAndRatesHelper(deployer);
  const deployTransaction = factory.getDeployTransaction(
    lendingPool,
    addressProvider,
    lendingPoolConfiguration
  );

  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  return deploymentReceipt.contractAddress;
};
