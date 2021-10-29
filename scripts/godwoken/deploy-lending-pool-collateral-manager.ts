import { Wallet } from '@ethersproject/wallet';
import { waitForTx } from '../../src/utils';
import { LendingPoolCollateralManagerFactory } from '../factories/lendingPool';

export const deployLendingPoolCollateralManager = async (deployer: Wallet) => {
  const factory = LendingPoolCollateralManagerFactory(deployer);
  const deployTransaction = factory.getDeployTransaction();
  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();
  return deploymentReceipt.contractAddress;
};
