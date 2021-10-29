import { AaveProtocolDataProvider } from '../../src/contracts';
import * as AaveProtocolDataProvider_JSON from '../../artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json';
import { ethers, Wallet } from 'ethers';

export function connectProtocolDataProvider(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(
    address,
    AaveProtocolDataProvider_JSON.abi,
    deployer.provider
  ).connect(deployer) as AaveProtocolDataProvider;

  return contract;
}
