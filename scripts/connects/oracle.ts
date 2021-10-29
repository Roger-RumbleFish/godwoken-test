import { ethers, Wallet } from 'ethers';
import * as BandOracle_JSON from '../../artifacts/contracts/oracle/BandOracle.sol/BandOracle.json';
import { BandOracle } from '../../src/contracts';

export function connectOracle(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(address, BandOracle_JSON.abi, deployer.provider).connect(
    deployer
  ) as BandOracle;

  return contract;
}
