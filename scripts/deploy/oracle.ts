import { BigNumberish } from 'ethers';
import { ethers } from 'hardhat';
import { waitForTx } from '../../src/utils';

import { Deployer, LendingContracts } from '../utils';

export interface IOracleProps {
  baseCurrency: string;
  baseCurrencyUnit: BigNumberish;
}

export async function deployOracle(
  deployer: Deployer,
  oracleProviderAddress: string,
  { baseCurrency, baseCurrencyUnit }: IOracleProps
) {
  console.log('Deploying Oracle Band Provider');

  const oracleBandProviderFactory = await ethers.getContractFactory(
    LendingContracts.OracleBandProvider,
    deployer
  );

  const providerTransaction = oracleBandProviderFactory.getDeployTransaction(oracleProviderAddress);
  const oracleProvider = await waitForTx(await deployer.sendTransaction(providerTransaction));

  console.log(`Oracle Band Provider deployed: ${oracleProvider.contractAddress}`);

  console.log('Deploying Oracle Band');

  const oracleBandFactory = await ethers.getContractFactory(LendingContracts.OracleBand, deployer);

  const deployTransaction = oracleBandFactory.getDeployTransaction(
    oracleProvider.contractAddress,
    baseCurrency,
    baseCurrencyUnit
  );

  const oracle = await waitForTx(await deployer.sendTransaction(deployTransaction));

  console.log(`Oracle Band Provider deployed: ${oracle.contractAddress}`);

  return oracle.contractAddress;
}
