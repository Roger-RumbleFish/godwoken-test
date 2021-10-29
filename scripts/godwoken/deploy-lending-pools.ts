import { Wallet, Overrides } from 'ethers';
import { deployRegistry } from './deploy-lending-pools-registry';
import { deployAddressProvider } from './deploy-address-provider';
import { factoryLendingPool, factoryLendingPoolConfiguration } from '../factories/lendingPool';
import {
  connectLendingPoolAddressProvider,
  connectLendingPool,
  connectLendingPoolConfigurator,
} from '../connects/lendingPool';
import { waitForTx } from '../../src/utils';
import { deployLibraries } from './deploy-libraries';
import { LendingPoolLibraryAddresses } from '../../src/contracts/factories/LendingPool__factory';
import { NervosConfig } from '../../markets/nervos/index';
import {
  deployATokensAndRatesHelper,
  deployGenericATokenImpl,
  deployGenericStableDebtToken,
  deployGenericVariableDebtToken,
} from './deploy-a-token';
import { deployOracle } from './deploy-oracle';
import { connectOracle } from '../connects/oracle';
import { SymbolMap } from '../../helpers/types';
import { getPairsTokenAggregator } from '../utils';
import { ZERO_ADDRESS } from '../../helpers/constants';
import { deployDataProvider } from './deploy-data-provider';
import { deployInitialization } from './deploy-initialization';

export async function deployLendingPoolConfiguration(deployer: Wallet) {
  const factory = factoryLendingPoolConfiguration(deployer);
  const deployTransaction = factory.getDeployTransaction();
  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  const poolConfiguratorAddress = deploymentReceipt.contractAddress;
  return poolConfiguratorAddress;
}

export const waitFor = async (seconds: number) =>
  await new Promise((r) => setTimeout(r, seconds * 1000));

export async function deployLendingPool(
  librariesAddress: LendingPoolLibraryAddresses,
  deployer: Wallet
) {
  const factory = factoryLendingPool(librariesAddress, deployer);
  const deployTransaction = factory.getDeployTransaction();
  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  const poolAddress = deploymentReceipt.contractAddress;
  return poolAddress;
}

export async function deployAll(admin: string, deployer: Wallet, transactionOverrides: Overrides) {
  console.log('Start Deploying All Lending Pools');
  console.log('Deployer', admin);
  const marketId = 'Nervos'; // TODO

  // const configurator = await connectLendingPoolConfigurator(
  //   '0x3496355583CAe297bF5513C2A70C9b5037ca748a',
  //   deployer
  // );

  // console.log('configutaro', configurator);
  //   addressProviderAddress, 0x150cab3F1Ba661d3F5Af6b950b6bc6Eb0A6cA40f
  //   poolConfigurationAddress, 0x58ABC87C0ecDADf0B7aF0210638E2e61929944Af
  //   aTokenAddress, 0xd9dBAc630c27Dc22819EAF61BdC3b8FA5c1E77e7
  //   stableTokenAddress,0xCc786fE89E9d80460147d62667474F48356BD8b2
  //   variableTokenAddress, 0xAf4aCf30b3238663720bd2c4BB875461668eccc1
  //   dataProviderAddress, 0xC02102cE13B9dD4528B85EE49AD662Be06bee39A
  //   aTokensAndRateHelperAddress, 0xc61Fa25139C7bC8769c50350aF73Cb208e6d1cD7
  //   deployer

  //   console.log('Initialize lending pool');
  // await waitForTx(await lendingPool.initialize(addressProviderAddress));
  // console.log('Lending pool initialized');

  // console.log('deploying lending pool Configuration');
  // const poolConfigurationAddress = await deployLendingPoolConfiguration(deployer);
  // console.log('Lending pool Configuration deployed', poolConfigurationAddress);

  // const addressProvider = connectLendingPoolAddressProvider(
  //   '0x150cab3F1Ba661d3F5Af6b950b6bc6Eb0A6cA40f',
  //   deployer
  // );
  // await waitFor(3);
  // console.log('setLendingPoolConfiguratorImpl');
  // await waitForTx(
  //   await addressProvider.setLendingPoolConfiguratorImpl(poolConfigurationAddress, {
  //     gasLimit: 120000,
  //     gasPrice: 0,
  //   })
  // );
  // console.log('setLendingPoolConfiguratorImpl Done');

  // const ttest = await deployInitialization(
  //   '0x150cab3F1Ba661d3F5Af6b950b6bc6Eb0A6cA40f',
  //   poolConfigurationAddress,
  //   '0xd9dBAc630c27Dc22819EAF61BdC3b8FA5c1E77e7',
  //   '0xCc786fE89E9d80460147d62667474F48356BD8b2',
  //   '0xAf4aCf30b3238663720bd2c4BB875461668eccc1',
  //   '0xC02102cE13B9dD4528B85EE49AD662Be06bee39A',
  //   '0xc61Fa25139C7bC8769c50350aF73Cb208e6d1cD7',
  //   deployer
  // );

  console.log('Deploying registry');
  const registryAddress = await deployRegistry(deployer);
  console.log('Registry deployed', registryAddress);

  console.log('Deploying address provider');
  const addressProviderAddress = await deployAddressProvider(
    deployer,
    marketId,
    admin,
    transactionOverrides
  );
  console.log('Address provider deployed', addressProviderAddress);

  console.log('deploying libraries');
  const lendingPoolLibs = await deployLibraries(deployer);
  console.log('Libraries deployed');

  console.log('deploying lending pool');
  const lendingPoolAddress = await deployLendingPool(lendingPoolLibs, deployer);
  console.log('lending pool deployed', lendingPoolAddress);

  const addressProvider = connectLendingPoolAddressProvider(addressProviderAddress, deployer);
  const lendingPool = connectLendingPool(lendingPoolAddress, deployer);

  console.log('Initialize lending pool');
  await waitForTx(await lendingPool.initialize(addressProviderAddress));

  console.log(
    'Lending pool initialized, addressProvider Address: ',
    await lendingPool.getAddressesProvider()
  );

  console.log('Initialize lending pool address provider');
  await waitForTx(await addressProvider.setLendingPoolImpl(lendingPoolAddress));
  console.log(
    'Lending pool address provider initialized, pool address:',
    await addressProvider.getLendingPool()
  );

  const lendingPoolProxy = await addressProvider.getLendingPool();

  console.log('deploying lending pool Configuration');
  const poolConfigurationAddress = await deployLendingPoolConfiguration(deployer);
  console.log('Lending pool Configuration deployed', poolConfigurationAddress);

  console.log('setLendingPoolConfiguratorImpl');
  await waitForTx(await addressProvider.setLendingPoolConfiguratorImpl(poolConfigurationAddress));
  console.log(
    'setLendingPoolConfiguratorImpl Done. Proxy configuration:',
    await addressProvider.getLendingPoolConfigurator()
  );

  const configuratorProxy = await addressProvider.getLendingPoolConfigurator();

  console.log('deployGenericATokenImpl');
  // TODO later change on resolver between generic and delegate
  const aTokenAddress = await deployGenericATokenImpl(deployer);
  console.log('deployGenericATokenImpl Done', aTokenAddress);

  console.log('deployGenericStableDebtToken');
  const stableTokenAddress = await deployGenericStableDebtToken(deployer);
  console.log('deployGenericStableDebtToken Done', stableTokenAddress);

  console.log('deployGenericVariableDebtToken');
  const variableTokenAddress = await deployGenericVariableDebtToken(deployer);
  console.log('deployGenericVariableDebtToken Done', variableTokenAddress);

  console.log('deployATokensAndRatesHelper');
  const aTokensAndRateHelperAddress = await deployATokensAndRatesHelper(
    lendingPoolProxy,
    addressProviderAddress,
    configuratorProxy,
    deployer
  );

  console.log('deployATokensAndRatesHelper done', aTokensAndRateHelperAddress);

  const oracleData = {
    baseCurrency: NervosConfig.OracleQuoteCurrency,
    baseCurrencyUnit: NervosConfig.OracleQuoteUnit,
  };

  console.log('deployOracle', oracleData);
  const oracleTx = await deployOracle(oracleData, deployer);
  console.log('deployOracle Done', oracleTx.contractAddress);

  await waitFor(3);
  console.log('deployDataProvider');
  const dataProviderAddress = await deployDataProvider(addressProviderAddress, deployer);
  console.log('deployDataProvider Done', dataProviderAddress);

  console.log('initialization started');
  const ttest = await deployInitialization(
    addressProviderAddress,
    configuratorProxy,
    aTokenAddress,
    stableTokenAddress,
    variableTokenAddress,
    dataProviderAddress,
    aTokensAndRateHelperAddress,
    deployer
  );

  console.log('initialization done', ttest);
}
