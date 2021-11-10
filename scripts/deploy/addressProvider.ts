import { ethers } from 'hardhat';
import { waitForTx } from '../../src/utils';
import { connectLendingPoolAddressProvider } from '../connects/lendingPool';
import { Deployer, LendingContracts } from '../utils';

export async function deployAddressProvider(deployer: Deployer, marketId: string, admin: string) {
  console.log('Deploying Address provider');

  const addressProviderFactory = await ethers.getContractFactory(
    LendingContracts.AddressProvider,
    deployer
  );

  const deployerRequest = addressProviderFactory.getDeployTransaction(marketId);

  const receipt = await (await deployer.sendTransaction(deployerRequest)).wait();

  const addressProviderAddress = receipt.contractAddress;

  const addressProviderContract = connectLendingPoolAddressProvider(
    addressProviderAddress,
    deployer
  );

  console.log(`Address provider deployed: ${addressProviderAddress}`);

  await waitForTx(await addressProviderContract.setPoolAdmin(admin));
  await waitForTx(await addressProviderContract.setEmergencyAdmin(admin));

  console.log('Pool Admin', await addressProviderContract.getPoolAdmin());
  console.log('Emergency Admin', await addressProviderContract.getPoolAdmin());

  return addressProviderAddress;
}
