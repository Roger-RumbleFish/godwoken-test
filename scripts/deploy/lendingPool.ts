import { ContractFactory } from 'ethers';

import {
  LendingPoolLibraryAddresses,
  LendingPool__factory,
} from '../../src/contracts/factories/LendingPool__factory';

import { Deployer } from '../utils';
import * as LendingPool_JSON from '../../artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json';

export async function deployLendingPool(
  deployer: Deployer,
  librariesAddress: LendingPoolLibraryAddresses
) {
  console.log('Deploying Lending Pool');

  const newBytecode = LendingPool__factory.linkBytecode(librariesAddress);

  const LendingPoolFactory = new ContractFactory(
    LendingPool_JSON.abi,
    newBytecode,
    deployer
  ) as LendingPool__factory;

  const deployerRequest = LendingPoolFactory.getDeployTransaction();

  const receipt = await (await deployer.sendTransaction(deployerRequest)).wait();

  console.log(`Lending Pool deployed: ${receipt.contractAddress}`);

  return receipt.contractAddress;
}
