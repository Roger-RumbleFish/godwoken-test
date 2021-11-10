import { ethers } from 'hardhat';

import { Deployer, LendingContracts } from '../utils';

export async function deployDataProvider(deployer: Deployer, addressProvider: string) {
  console.log('Deploying Data provider');

  const dataProviderFactory = await ethers.getContractFactory(
    LendingContracts.DataProvider,
    deployer
  );
  const deployTransaction = dataProviderFactory.getDeployTransaction(addressProvider);

  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`Data provider deployed: ${receipt.contractAddress}`);

  return receipt.contractAddress;
}
