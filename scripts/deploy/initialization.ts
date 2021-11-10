import { BigNumberish } from 'ethers';
import { ethers } from 'hardhat';
import { ZERO_ADDRESS } from '../../helpers/constants';
import { iMultiPoolsAssets, IReserveParams, tEthereumAddress } from '../../helpers/types';

import { LendingPoolAddressesProvider } from '../../src/contracts';
import { waitForTx } from '../../src/utils';
import {
  connectLendingPoolAddressProvider,
  connectLendingPoolConfigurator,
} from '../connects/lendingPool';
import { connectProtocolDataProvider } from '../connects/misc';
import { connectATokensAndRatesHelper } from '../connects/tokens';

import { chunk, Deployer, LendingContracts } from '../utils';
import { deployCollateralManager } from './collateralManager';
import { IConfigureReservesByHelperProps, IInitializationProps } from './types';

const deployRateStrategy = async (
  deployer: Deployer,
  args: [tEthereumAddress, string, string, string, string, string, string]
): Promise<tEthereumAddress> => {
  console.log('Deploying rate strategy', { args });

  const rateStrategyFactory = await ethers.getContractFactory(
    LendingContracts.RateStrategy,
    deployer
  );

  const deployTransaction = rateStrategyFactory.getDeployTransaction(...args);
  const receipt = await (await deployer.sendTransaction(deployTransaction)).wait();

  console.log(`Rate strategy deployed: ${receipt.contractAddress}`);

  return receipt.contractAddress;
};

export interface initReservesByHelperProps {
  addressProvider: LendingPoolAddressesProvider;
  reservesParams: iMultiPoolsAssets<IReserveParams>;
  tokenAddresses: { [symbol: string]: tEthereumAddress };
  aTokenNamePrefix: string;
  stableDebtTokenNamePrefix: string;
  variableDebtTokenNamePrefix: string;
  symbolPrefix: string;
  treasuryAddress: tEthereumAddress;
  incentivesController: tEthereumAddress;
  poolConfigAddress: tEthereumAddress;
  aTokenAddress: tEthereumAddress;
  stableTokenAddress: tEthereumAddress;
  variableTokenAddress: tEthereumAddress;
}

const initReservesByHelper = async (
  deployer: Deployer,
  {
    addressProvider,
    reservesParams,
    tokenAddresses,
    aTokenNamePrefix,
    stableDebtTokenNamePrefix,
    variableDebtTokenNamePrefix,
    symbolPrefix,
    treasuryAddress,
    incentivesController,
    poolConfigAddress,
    aTokenAddress,
    stableTokenAddress,
    variableTokenAddress,
  }: initReservesByHelperProps
) => {
  console.log('Initialization of initReservesByHelper');
  // CHUNK CONFIGURATION
  const initChunks = 1;

  // Initialize variables for future reserves initialization
  let reserveSymbols: string[] = [];

  let initInputParams: {
    aTokenImpl: string;
    stableDebtTokenImpl: string;
    variableDebtTokenImpl: string;
    underlyingAssetDecimals: BigNumberish;
    interestRateStrategyAddress: string;
    underlyingAsset: string;
    treasury: string;
    incentivesController: string;
    underlyingAssetName: string;
    aTokenName: string;
    aTokenSymbol: string;
    variableDebtTokenName: string;
    variableDebtTokenSymbol: string;
    stableDebtTokenName: string;
    stableDebtTokenSymbol: string;
    params: string;
  }[] = [];

  let strategyRates: [
    string, // addresses provider
    string,
    string,
    string,
    string,
    string,
    string
  ];
  let rateStrategies: Record<string, typeof strategyRates> = {};
  let strategyAddresses: Record<string, tEthereumAddress> = {};

  const reserves = Object.entries(reservesParams);

  console.log(`starting to deploy reserves: ${{ reserves }}`);

  for (let [symbol, params] of reserves) {
    if (!tokenAddresses[symbol]) {
      console.log(`- Skipping init of ${symbol} due token address is not set at markets config`);
      continue;
    }

    const { strategy, reserveDecimals } = params;
    const {
      optimalUtilizationRate,
      baseVariableBorrowRate,
      variableRateSlope1,
      variableRateSlope2,
      stableRateSlope1,
      stableRateSlope2,
    } = strategy;

    if (!strategyAddresses[strategy.name]) {
      // Strategy does not exist, create a new one
      rateStrategies[strategy.name] = [
        addressProvider.address,
        optimalUtilizationRate,
        baseVariableBorrowRate,
        variableRateSlope1,
        variableRateSlope2,
        stableRateSlope1,
        stableRateSlope2,
      ];

      strategyAddresses[strategy.name] = await deployRateStrategy(
        deployer,
        rateStrategies[strategy.name]
      );

      // // This causes the last strategy to be printed twice, once under "DefaultReserveInterestRateStrategy"
      // // and once under the actual `strategyASSET` key.
      // rawInsertContractAddressInDb(strategy.name, strategyAddresses[strategy.name]);
    }

    // Prepare input parameters
    reserveSymbols.push(symbol);

    initInputParams.push({
      aTokenImpl: aTokenAddress,
      stableDebtTokenImpl: stableTokenAddress,
      variableDebtTokenImpl: variableTokenAddress,
      underlyingAssetDecimals: reserveDecimals,
      interestRateStrategyAddress: strategyAddresses[strategy.name],
      underlyingAsset: tokenAddresses[symbol],
      treasury: treasuryAddress,
      incentivesController: incentivesController,
      underlyingAssetName: symbol,
      aTokenName: `${aTokenNamePrefix} ${symbol}`,
      aTokenSymbol: `a${symbolPrefix}${symbol}`,
      variableDebtTokenName: `${variableDebtTokenNamePrefix} ${symbolPrefix}${symbol}`,
      variableDebtTokenSymbol: `variableDebt${symbolPrefix}${symbol}`,
      stableDebtTokenName: `${stableDebtTokenNamePrefix} ${symbol}`,
      stableDebtTokenSymbol: `stableDebt${symbolPrefix}${symbol}`,
      params: '0x10', // was hardcoded in Aave as well but inside a method
    });
  }

  // Deploy init reserves per chunks
  const chunkedSymbols = chunk(reserveSymbols, initChunks);
  const chunkedInitInputParams = chunk(initInputParams, initChunks);

  const configurator = await connectLendingPoolConfigurator(poolConfigAddress, deployer);
  console.log('batchInitReserve Starting');

  for (let chunkIndex = 0; chunkIndex < chunkedInitInputParams.length; chunkIndex++) {
    const receipt = await waitForTx(
      await configurator.batchInitReserve(chunkedInitInputParams[chunkIndex], {
        gasLimit: 2500000,
      })
    );

    console.log(`  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(', ')}`);
    console.log('    * gasUsed', receipt.gasUsed.toString());
  }
  console.log('batchInitReserve Completed');

  console.log('Initialization of initReservesByHelper Completed');

  return strategyAddresses;
};

const configureReservesByHelper = async (
  deployer: Deployer,
  {
    reservesParams,
    tokenAddresses,
    helpers,
    admin,
    addressProviderAddress,
    aTokensAndRatesHelper,
  }: IConfigureReservesByHelperProps
) => {
  console.log('Starting to configureReservesByHelper');
  const addressProvider = connectLendingPoolAddressProvider(addressProviderAddress, deployer);
  const atokenAndRatesDeployer = connectATokensAndRatesHelper(aTokensAndRatesHelper, deployer);

  const tokens: string[] = [];
  const symbols: string[] = [];

  const inputParams: {
    asset: string;
    baseLTV: BigNumberish;
    liquidationThreshold: BigNumberish;
    liquidationBonus: BigNumberish;
    reserveFactor: BigNumberish;
    stableBorrowingEnabled: boolean;
    borrowingEnabled: boolean;
  }[] = [];

  for (const [
    assetSymbol,
    {
      baseLTVAsCollateral,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
    },
  ] of Object.entries(reservesParams) as [string, IReserveParams][]) {
    if (!tokenAddresses[assetSymbol]) {
      console.log(
        `- Skipping init of ${assetSymbol} due token address is not set at markets config`
      );

      continue;
    }
    if (baseLTVAsCollateral === '-1') continue;

    const assetAddressIndex = Object.keys(tokenAddresses).findIndex(
      (value) => value === assetSymbol
    );
    const [, tokenAddress] = (Object.entries(tokenAddresses) as [string, string][])[
      assetAddressIndex
    ];
    const { usageAsCollateralEnabled: alreadyEnabled } = await helpers.getReserveConfigurationData(
      tokenAddress
    );

    if (alreadyEnabled) {
      console.log(`- Reserve ${assetSymbol} is already enabled as collateral, skipping`);
      continue;
    }

    // Push data
    inputParams.push({
      asset: tokenAddress,
      baseLTV: baseLTVAsCollateral,
      liquidationThreshold: liquidationThreshold,
      liquidationBonus: liquidationBonus,
      reserveFactor: reserveFactor,
      stableBorrowingEnabled: stableBorrowRateEnabled,
      borrowingEnabled: borrowingEnabled,
    });

    tokens.push(tokenAddress);
    symbols.push(assetSymbol);
  }

  if (tokens.length) {
    console.log('Changing pool admin for configuration purpose');
    await waitForTx(await addressProvider.setPoolAdmin(atokenAndRatesDeployer.address));

    // Deploy init per chunks
    const enableChunks = 20;
    const chunkedSymbols = chunk(symbols, enableChunks);
    const chunkedInputParams = chunk(inputParams, enableChunks);

    console.log(`- Configure reserves in ${chunkedInputParams.length} txs`);

    for (let chunkIndex = 0; chunkIndex < chunkedInputParams.length; chunkIndex++) {
      await waitForTx(
        await atokenAndRatesDeployer.configureReserves(chunkedInputParams[chunkIndex], {
          gasLimit: 500000,
        })
      );
      console.log(`  - Init for: ${chunkedSymbols[chunkIndex].join(', ')}`);
    }
    // Set deployer back as admin
    console.log('Changing pool admin back');
    await waitForTx(await addressProvider.setPoolAdmin(admin));
  }

  console.log('ConfigureReservesByHelper Completed');
};

export async function deployInitialization(
  deployer: Deployer,
  {
    addressProviderAddress,
    dataProviderAddress,
    configuratorAddress,
    aTokenAddress,
    stableTokenAddress,
    variableTokenAddress,
    tokensAndRatesAddress,
    nervosConfig,
  }: IInitializationProps
) {
  const {
    ATokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    ReserveAssets,
    ReservesConfig,
    LendingPoolCollateralManager,
    ReserveFactorTreasuryAddress,
    IncentivesController,
  } = nervosConfig;

  const addressProviderContract = connectLendingPoolAddressProvider(
    addressProviderAddress,
    deployer
  );
  const testHelpers = await connectProtocolDataProvider(dataProviderAddress, deployer);

  const admin = await addressProviderContract.getPoolAdmin();
  const oracle = await addressProviderContract.getPriceOracle();

  if (!ReserveAssets) {
    throw 'Reserve assets is undefined. Check ReserveAssets configuration at config directory';
  }

  const treasuryAddress = ReserveFactorTreasuryAddress;

  const strategies = await initReservesByHelper(deployer, {
    addressProvider: addressProviderContract,
    aTokenNamePrefix: ATokenNamePrefix,
    incentivesController: IncentivesController,
    poolConfigAddress: configuratorAddress,
    variableDebtTokenNamePrefix: VariableDebtTokenNamePrefix,
    stableDebtTokenNamePrefix: StableDebtTokenNamePrefix,
    symbolPrefix: SymbolPrefix,
    tokenAddresses: ReserveAssets,
    reservesParams: ReservesConfig,
    treasuryAddress,
    aTokenAddress,
    stableTokenAddress,
    variableTokenAddress,
  });

  await configureReservesByHelper(deployer, {
    reservesParams: ReservesConfig,
    tokenAddresses: ReserveAssets,
    aTokensAndRatesHelper: tokensAndRatesAddress,
    addressProviderAddress: addressProviderContract.address,
    helpers: testHelpers,
    admin,
  });

  let collateralManagerAddress = LendingPoolCollateralManager;

  if (!collateralManagerAddress || collateralManagerAddress === ZERO_ADDRESS) {
    collateralManagerAddress = await deployCollateralManager(deployer);
  }

  console.log(
    `Setting lending pool collateral manager implementation with address: ${collateralManagerAddress}`
  );

  await waitForTx(
    await addressProviderContract.setLendingPoolCollateralManager(collateralManagerAddress)
  );

  console.log('Setting lending pool collateral manager implementation Completed');

  console.log('Setting AaveProtocolDataProvider at AddressesProvider at id: 0x01');

  // const dataProvider = await connectProtocolDataProvider(dataProviderAddress, deployer);

  await waitForTx(
    await addressProviderContract.setAddress(
      '0x0100000000000000000000000000000000000000000000000000000000000000',
      dataProviderAddress
    )
  );

  console.log('Setting AaveProtocolDataProvider at AddressesProvider at id: 0x01 Completed');

  return {
    strategies,
    collateralManagerAddress,
  };

  // Implements a logic of getting multiple tokens balance for one user address
  //   await deployWalletBalancerProvider(verify);

  // Might be usefull
  //   const uiPoolDataProvider = await deployUiPoolDataProvider([incentivesController, oracle], verify);
  //   console.log('UiPoolDataProvider deployed at:', uiPoolDataProvider.address);

  // WETH getway ? No need right now
  // const lendingPoolAddress = await addressesProvider.getLendingPool();
  // let gateWay = getParamPerNetwork(WethGateway, network);
  // if (!notFalsyOrZeroAddress(gateWay)) {
  //   gateWay = (await getWETHGateway()).address;
  // }
  // console.log('GATEWAY', gateWay);
  // await authorizeWETHGateway(gateWay, lendingPoolAddress);
}
