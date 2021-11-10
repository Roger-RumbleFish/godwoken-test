import { waitForTx } from '../src/utils';
import { hardhatArguments } from 'hardhat';
import {
  connectLendingPool,
  connectLendingPoolAddressProvider,
  connectLendingPoolRegistry,
} from './connects/lendingPool';
import { deployAddressProvider } from './deploy/addressProvider';
import { deployConfigurator } from './deploy/configurator';
import { deployDataProvider } from './deploy/dataProvider';
import { deployInitialization } from './deploy/initialization';
import { deployLendingPool } from './deploy/lendingPool';
import { deployLibraries, parseLibrariesAddressToContractData } from './deploy/libraries';
import { deployTestTokens } from './deploy/testTokens';
import { deployOracle } from './deploy/oracle';
import { deployRegistry } from './deploy/registry';
import { deployTokens } from './deploy/tokens';
import { getDeployer, translateAddress } from './utils';
import { formatTokens, loadContractsConfig, writeToContractsConfig } from './filesManager';
import { getNervosConfig } from '../markets/nervos';

async function main() {
  const network = hardhatArguments.network as string;
  const config = loadContractsConfig(network);

  const deployer = await getDeployer(network);
  const admin = network === 'godwoken' ? translateAddress(deployer.address) : deployer.address;

  const providerId = 1;
  const oracleBandProvider = '0x633B14f58A1343Aeb43e9C68c8aFB4c866eBb649';
  const marketId = 'Nervos'; // TODO

  const tokens = await deployTestTokens(deployer);

  const formattedTokens = formatTokens(tokens);
  writeToContractsConfig({ tokens: formattedTokens }, network);

  const nervosConfig = getNervosConfig();

  const oracleData = {
    baseCurrency: nervosConfig.OracleQuoteCurrency,
    baseCurrencyUnit: nervosConfig.OracleQuoteUnit,
  };

  const registry = await deployRegistry(deployer);

  writeToContractsConfig({ registry: registry }, network);

  const addressProviderAddress = await deployAddressProvider(deployer, marketId, admin);

  writeToContractsConfig({ addressProvider: addressProviderAddress }, network);

  const librariesAddress = await deployLibraries(deployer);

  writeToContractsConfig({ libraries: librariesAddress }, network);

  const libraries = parseLibrariesAddressToContractData(
    librariesAddress.reserve,
    librariesAddress.validation
  );

  const lendingPoolAddress = await deployLendingPool(deployer, libraries);

  writeToContractsConfig({ lendingPool: lendingPoolAddress }, network);

  const addressProvider = connectLendingPoolAddressProvider(addressProviderAddress, deployer);
  const lendingPool = connectLendingPool(lendingPoolAddress, deployer);

  await waitForTx(await lendingPool.initialize(addressProviderAddress));

  console.log(
    `Lending pool initialized, addressProvider Address: ${await lendingPool.getAddressesProvider()}`
  );

  await waitForTx(await addressProvider.setLendingPoolImpl(lendingPoolAddress));

  console.log(
    `Lending pool address provider initialized, pool address: ${await addressProvider.getLendingPool()}`
  );

  const lendingPoolProxy = await addressProvider.getLendingPool();

  writeToContractsConfig({ lendingPoolProxy: lendingPoolProxy }, network);

  const configuratorAddress = await deployConfigurator(deployer);

  writeToContractsConfig({ poolConfigurator: configuratorAddress }, network);

  await waitForTx(await addressProvider.setLendingPoolConfiguratorImpl(configuratorAddress));

  const configuratorProxy = await addressProvider.getLendingPoolConfigurator();

  writeToContractsConfig({ poolConfiguratorProxy: configuratorProxy }, network);

  console.log(`setLendingPoolConfiguratorImpl Done. Proxy configuration: ${configuratorProxy}`);

  const { variableTokenAddress, tokensAndRatesAddress, stableTokenAddress, aTokenAddress } =
    await deployTokens(deployer, lendingPoolProxy, addressProviderAddress, configuratorProxy);

  writeToContractsConfig(
    {
      variableDebtToken: variableTokenAddress,
      stableDebtToken: stableTokenAddress,
      aToken: aTokenAddress,
      aTokenAndRateHelper: tokensAndRatesAddress,
    },
    network
  );

  const oracleAddress = await deployOracle(deployer, oracleBandProvider, oracleData);

  writeToContractsConfig(
    {
      oracleBrandProvider: oracleBandProvider,
      oracleBand: oracleAddress,
    },
    network
  );

  const dataProviderAddress = await deployDataProvider(deployer, addressProviderAddress);

  writeToContractsConfig(
    {
      dataProvider: dataProviderAddress,
    },
    network
  );

  const { collateralManagerAddress, strategies } = await deployInitialization(deployer, {
    addressProviderAddress,
    configuratorAddress: configuratorProxy,
    aTokenAddress: aTokenAddress,
    stableTokenAddress,
    variableTokenAddress,
    dataProviderAddress,
    tokensAndRatesAddress: tokensAndRatesAddress,
    nervosConfig: nervosConfig,
  });

  writeToContractsConfig(
    {
      collateralManager: collateralManagerAddress,
    },
    network
  );

  const registryProvider = connectLendingPoolRegistry(registry, deployer);

  await (
    await registryProvider.registerAddressesProvider(addressProviderAddress, providerId)
  ).wait();

  console.log('Deploy completed');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
