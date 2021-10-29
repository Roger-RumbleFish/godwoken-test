import { Wallet } from 'ethers';
import { protocolDataProviderFactory } from '../factories/providers';

export async function deployDataProvider(addressProvider: string, deployer: Wallet) {
  const factory = protocolDataProviderFactory(deployer);
  const deployTransaction = factory.getDeployTransaction(addressProvider);

  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  const dataProviderAddress = deploymentReceipt.contractAddress;

  return dataProviderAddress;
}
