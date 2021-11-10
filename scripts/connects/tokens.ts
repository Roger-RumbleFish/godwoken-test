import { ATokensAndRatesHelper, ERC20Test } from '../../src/contracts';
import * as ATokensAndRatesHelper_JSON from '../../artifacts/contracts/deployments/ATokensAndRatesHelper.sol/ATokensAndRatesHelper.json';
import * as ERC20_json from '../../artifacts/contracts/dependencies/openzeppelin/contracts/ERC20_test.sol/ERC20_test.json';
import { ethers } from 'ethers';

import { Deployer } from '../utils';

export function connectATokensAndRatesHelper(address: string, deployer: Deployer) {
  const contract = new ethers.Contract(address, ATokensAndRatesHelper_JSON.abi, deployer).connect(
    deployer
  ) as ATokensAndRatesHelper;

  return contract;
}

export function connectErc20(address: string, deployer: Deployer) {
  const contract = new ethers.Contract(address, ERC20_json.abi).connect(deployer) as ERC20Test;

  return contract;
}
