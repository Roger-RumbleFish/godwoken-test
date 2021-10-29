import { Wallet } from 'ethers';
import { factoryLendingPoolRegistry } from '../factories/lendingPool';

export async function deployRegistry(deployer: Wallet) {
  const factory = factoryLendingPoolRegistry(deployer);
  const deployTransaction = factory.getDeployTransaction();

  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  const registryAddress = deploymentReceipt.contractAddress;

  return registryAddress;
}
