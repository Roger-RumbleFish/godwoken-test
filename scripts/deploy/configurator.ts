import { ethers } from 'hardhat';
import { Deployer, LendingContracts } from '../utils';

export async function deployConfigurator(deployer: Deployer) {
  console.log('Deploying configurator');

  const configuratorFactory = await ethers.getContractFactory(
    LendingContracts.Configurator,
    deployer
  );

  const deployTransaction = configuratorFactory.getDeployTransaction();

  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`Configurator deployed: ${receipt.contractAddress}`);

  return receipt.contractAddress;
}
