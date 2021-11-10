import { ethers } from 'hardhat';

import { Deployer, LendingContracts } from '../utils';

export async function deployRegistry(deployer: Deployer) {
  console.log('Deploying registry');

  const registryFactory = await ethers.getContractFactory(LendingContracts.Registry, deployer);
  const deployerRequest = registryFactory.getDeployTransaction();

  const receipt = await (await deployer.sendTransaction(deployerRequest)).wait();

  console.log(`Registry deploy: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}
