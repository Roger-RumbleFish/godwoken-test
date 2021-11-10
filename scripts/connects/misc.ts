import { AaveProtocolDataProvider } from '../../src/contracts';
import * as AaveProtocolDataProvider_JSON from '../../artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json';
import { ethers } from 'ethers';
import { Deployer } from '../utils';

export function connectProtocolDataProvider(address: string, deployer: Deployer) {
  const contract = new ethers.Contract(
    address,
    AaveProtocolDataProvider_JSON.abi,
    deployer
  ).connect(deployer) as AaveProtocolDataProvider;

  return contract;
}
