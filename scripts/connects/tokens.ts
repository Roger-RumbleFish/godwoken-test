import { ATokensAndRatesHelper, ERC20Test } from '../../src/contracts';
import * as ATokensAndRatesHelper_JSON from '../../artifacts/contracts/deployments/ATokensAndRatesHelper.sol/ATokensAndRatesHelper.json';
import * as ERC20_json from '../../artifacts/contracts/dependencies/openzeppelin/contracts/ERC20_test.sol/ERC20_test.json';
import { ethers, Wallet } from 'ethers';

export function connectATokensAndRatesHelper(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(
    address,
    ATokensAndRatesHelper_JSON.abi,
    deployer.provider
  ).connect(deployer) as ATokensAndRatesHelper;

  return contract;
}

export function connectErc20(address: string, deployer: Wallet) {
  const contract = new ethers.Contract(address, ERC20_json.abi, deployer.provider).connect(
    deployer
  ) as ERC20Test;

  return contract;
}
