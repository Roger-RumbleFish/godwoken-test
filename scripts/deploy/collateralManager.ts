import { ethers } from 'hardhat';
import { Deployer, LendingContracts } from '../utils';

export async function deployCollateralManager(deployer: Deployer) {
  console.log('Deploying Collateral Manager');
  const collateralManagerFactory = await ethers.getContractFactory(
    LendingContracts.CollateralManager,
    deployer
  );

  const deployTransaction = collateralManagerFactory.getDeployTransaction();

  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`Collateral Manager deployed: ${receipt.contractAddress}`);

  return receipt.contractAddress;
}
