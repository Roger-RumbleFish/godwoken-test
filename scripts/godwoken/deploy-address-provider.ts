import { Wallet, Overrides } from 'ethers';
import { factoryLendingPoolAddressProvider } from '../factories/lendingPool';
import { connectLendingPoolAddressProvider } from '../connects/lendingPool';
import { waitForTx } from '../../src/utils';

export async function deployAddressProvider(
  deployer: Wallet,
  marketId: string,
  admin: string,
  transactionOverrides: Overrides
) {
  const factory = factoryLendingPoolAddressProvider(deployer);
  const deployTransaction = factory.getDeployTransaction(marketId, transactionOverrides);

  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  const addressProviderAddress = deploymentReceipt.contractAddress;

  const addressProviderContract = connectLendingPoolAddressProvider(
    addressProviderAddress,
    deployer
  );

  await waitForTx(await addressProviderContract.setPoolAdmin(admin));
  await waitForTx(await addressProviderContract.setEmergencyAdmin(admin));

  console.log('Pool Admin', await addressProviderContract.getPoolAdmin());
  console.log('Emergency Admin', await addressProviderContract.getPoolAdmin());

  return addressProviderAddress;
}
