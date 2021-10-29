import { BigNumberish, Wallet } from 'ethers';
import { waitForTx } from '../../src/utils';
import { factoryBandOracle, factoryBandOracleProvider } from '../factories/oracle';

export const deployOracle = async (
  {
    baseCurrency,
    baseCurrencyUnit,
  }: {
    baseCurrency: string;
    baseCurrencyUnit: BigNumberish;
  },
  deployer: Wallet
) => {
  const providerFactory = factoryBandOracleProvider(deployer);

  const providerTransaction = providerFactory.getDeployTransaction(
    '0x633B14f58A1343Aeb43e9C68c8aFB4c866eBb649'
  );

  const oracleProvider = await waitForTx(await deployer.sendTransaction(providerTransaction));

  const factory = factoryBandOracle(deployer);

  const deployTransaction = factory.getDeployTransaction(
    oracleProvider.contractAddress,
    baseCurrency,
    baseCurrencyUnit
  );

  return await waitForTx(await deployer.sendTransaction(deployTransaction));
};
