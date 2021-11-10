import { ethers } from 'hardhat';
import { tEthereumAddress } from '../../helpers/types';
import { Deployer, LendingContracts } from '../utils';
import { IDeployTokens } from './types';

const deployAToken = async (deployer: Deployer) => {
  console.log('Deploying A token');

  const aTokenFactory = await ethers.getContractFactory(LendingContracts.AToken, deployer);
  const deployTransaction = aTokenFactory.getDeployTransaction();

  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`A token deployed: ${receipt.contractAddress}`);
  return receipt.contractAddress;
};

const deployStableDebtToken = async (deployer: Deployer) => {
  console.log('Deploying Stable Debt token');

  const stableDebtFactory = await ethers.getContractFactory(
    LendingContracts.StableDebtToken,
    deployer
  );
  const deployTransaction = stableDebtFactory.getDeployTransaction();

  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`Stable Debt token deployed: ${receipt.contractAddress}`);
  return receipt.contractAddress;
};

const deployVariableDebtToken = async (deployer: Deployer) => {
  console.log('Deploying Variable Debt token');

  const variableDebtFactory = await ethers.getContractFactory(
    LendingContracts.VariableDebtToken,
    deployer
  );
  const deployTransaction = variableDebtFactory.getDeployTransaction();

  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`Variable Debt token deployed: ${receipt.contractAddress}`);
  return receipt.contractAddress;
};

export const deployATokensAndRatesHelper = async (
  deployer: Deployer,
  lendingPool: tEthereumAddress,
  addressProvider: tEthereumAddress,
  lendingPoolConfiguration: tEthereumAddress
) => {
  console.log('Deploying A tokens and rate helper');

  const variableDebtFactory = await ethers.getContractFactory(
    LendingContracts.ATokensAndRatesHelper,
    deployer
  );
  const deployTransaction = variableDebtFactory.getDeployTransaction(
    lendingPool,
    addressProvider,
    lendingPoolConfiguration
  );

  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`A tokens and rate helper deployed: ${receipt.contractAddress}`);
  return receipt.contractAddress;
};

export const deployTokens = async (
  deployer: Deployer,
  lendingPool: tEthereumAddress,
  addressProvider: tEthereumAddress,
  configurator: tEthereumAddress
): Promise<IDeployTokens> => {
  const aTokenAddress = await deployAToken(deployer);
  const stableTokenAddress = await deployStableDebtToken(deployer);
  const variableTokenAddress = await deployVariableDebtToken(deployer);
  const tokensAndRatesAddress = await deployATokensAndRatesHelper(
    deployer,
    lendingPool,
    addressProvider,
    configurator
  );

  return {
    aTokenAddress,
    stableTokenAddress,
    variableTokenAddress,
    tokensAndRatesAddress,
  };
};
