import { BigNumberish, Wallet } from "ethers";
import { ZERO_ADDRESS } from "../../helpers/constants";
import {
  iMultiPoolsAssets,
  IReserveParams,
  tEthereumAddress,
} from "../../helpers/types";
import NervosConfig from "../../markets/nervos";
import {
  AaveProtocolDataProvider,
  LendingPoolAddressesProvider,
} from "../../src/contracts";
import { waitForTx } from "../../src/utils";
import {
  connectLendingPoolAddressProvider,
  connectLendingPoolConfigurator,
} from "../connects/lendingPool";
import { connectProtocolDataProvider } from "../connects/misc";
import { connectATokensAndRatesHelper } from "../connects/tokens";
import { DefaultReserveInterestRateStrategyFactory } from "../factories/lendingPool";
import { chunk } from "../utils";
import { deployLendingPoolCollateralManager } from "./deploy-lending-pool-collateral-manager";
import { waitFor } from "./deploy-lending-pools";

const deployRateStrategy = async (
  args: [tEthereumAddress, string, string, string, string, string, string],
  deployer: Wallet
): Promise<tEthereumAddress> => {
  const factory = DefaultReserveInterestRateStrategyFactory(deployer);
  const deployTransaction = factory.getDeployTransaction(...args);
  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();
  return deploymentReceipt.contractAddress;
};

const initReservesByHelper = async (
  addressProvider: LendingPoolAddressesProvider,
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  aTokenNamePrefix: string,
  stableDebtTokenNamePrefix: string,
  variableDebtTokenNamePrefix: string,
  symbolPrefix: string,
  admin: tEthereumAddress,
  treasuryAddress: tEthereumAddress,
  incentivesController: tEthereumAddress,
  poolConfigAddress: tEthereumAddress,
  aTokenAddress: tEthereumAddress,
  stableTokenAddress: tEthereumAddress,
  variableTokenAddress: tEthereumAddress,
  deployer: Wallet
) => {
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

  for (let [symbol, params] of reserves) {
    console.log("starting to deploy reserves");

    if (!tokenAddresses[symbol]) {
      console.log(
        `- Skipping init of ${symbol} due token address is not set at markets config`
      );
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

      console.log(
        "starting to deploy reserves",
        strategy.name,
        rateStrategies[strategy.name]
      );
      strategyAddresses[strategy.name] = await deployRateStrategy(
        rateStrategies[strategy.name],
        deployer
      );

      console.log("deployed", strategyAddresses[strategy.name]);

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
      params: "0x10", // was hardcoded in Aave as well but inside a method
    });
  }

  // Deploy init reserves per chunks
  const chunkedSymbols = chunk(reserveSymbols, initChunks);
  const chunkedInitInputParams = chunk(initInputParams, initChunks);

  const configurator = await connectLendingPoolConfigurator(
    poolConfigAddress,
    deployer
  );
  console.log(`initing started`, { test: chunkedInitInputParams[0][0] });
  // console.log(`Wykonuje`);
  // const tttt = await configurator.batchInitReserve(chunkedInitInputParams[0]);
  // await tttt.wait();
  // console.log(`Poczekalem`);

  await waitFor(3);
  console.log(`starting batch`);

  // const res = await configurator.batchInitReserve(chunkedInitInputParams[0][0], {
  //   gasLimit: 12000000,
  //   gasPrice: 0,
  // });

  // console.log('ereee', res);

  // await res.wait();

  // console.log('done');
  // const tx3 = await waitForTx(
  //   await configurator.batchInitReserve({
  //     gasLimit: 12000000,
  //     gasPrice: 0,
  //   })
  // );
  // console.log(`  - Reserve ready for: ${tx3}`);
  // console.log(`- Reserves initialization in ${chunkedInitInputParams.length} txs`);

  for (
    let chunkIndex = 0;
    chunkIndex < chunkedInitInputParams.length;
    chunkIndex++
  ) {
    console.log("batch init");
    const tx3 = await waitForTx(
      await configurator.batchInitReserve(
        [chunkedInitInputParams[chunkIndex][0]],
        {
          gasPrice: 0,
          gasLimit: 12000000,
        }
      )
    );

    console.log(
      `  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(", ")}`
    );
    console.log("    * gasUsed", tx3.gasUsed.toString());
  }
};

const configureReservesByHelper = async (
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  helpers: AaveProtocolDataProvider,
  admin: tEthereumAddress,
  addressProviderAddress: tEthereumAddress,
  aTokensAndRatesHelper: tEthereumAddress,
  poolCOnfig: tEthereumAddress,
  deployer: Wallet
) => {
  console.log("config reserve by helpers zaczynam");
  const addressProvider = connectLendingPoolAddressProvider(
    addressProviderAddress,
    deployer
  );
  const atokenAndRatesDeployer = connectATokensAndRatesHelper(
    aTokensAndRatesHelper,
    deployer
  );

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
    if (baseLTVAsCollateral === "-1") continue;

    const assetAddressIndex = Object.keys(tokenAddresses).findIndex(
      (value) => value === assetSymbol
    );
    const [, tokenAddress] = (
      Object.entries(tokenAddresses) as [string, string][]
    )[assetAddressIndex];
    const { usageAsCollateralEnabled: alreadyEnabled } =
      await helpers.getReserveConfigurationData(tokenAddress);

    if (alreadyEnabled) {
      console.log(
        `- Reserve ${assetSymbol} is already enabled as collateral, skipping`
      );
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
    console.log("addressProvider.setPoolAdmin");
    // Set aTokenAndRatesDeployer as temporal admin
    await waitForTx(
      await addressProvider.setPoolAdmin(atokenAndRatesDeployer.address)
    );
    // TODO rmeove
    const confggggg = await connectLendingPoolConfigurator(
      poolCOnfig,
      deployer
    );
    console.log(
      "sprawdzam czy zadzialalao",
      await addressProvider.callStatic.getPoolAdmin(),
      atokenAndRatesDeployer.address,
      poolCOnfig,
      await confggggg.callStatic.getPoolAdmin()
    );
    console.log("addressProvider.setPoolAdmin DONE");
    // Deploy init per chunks
    const enableChunks = 20;
    const chunkedSymbols = chunk(symbols, enableChunks);
    const chunkedInputParams = chunk(inputParams, enableChunks);

    console.log(`- Configure reserves in ${chunkedInputParams.length} txs`);
    console.log("params", inputParams[0]);
    for (
      let chunkIndex = 0;
      chunkIndex < chunkedInputParams.length;
      chunkIndex++
    ) {
      // const res = await atokenAndRatesDeployer.callStatic.configureReserves(
      //   chunkedInputParams[chunkIndex],
      //   {
      //     gasLimit: 12000000,
      //     gasPrice: 0,
      //   }
      // );

      //console.log('messanger', res);
      await waitForTx(
        await atokenAndRatesDeployer.configureReserves(
          chunkedInputParams[chunkIndex],
          {
            gasLimit: 1200000000,
            gasPrice: 0,
          }
        )
      );
      console.log(`  - Init for: ${chunkedSymbols[chunkIndex].join(", ")}`);
    }
    // Set deployer back as admin
    await waitForTx(await addressProvider.setPoolAdmin(admin));
  }
};

export async function deployInitialization(
  addressProvider: string,
  poolConfigAddress: tEthereumAddress,
  aTokenAddress: tEthereumAddress,
  stableTokenAddress: tEthereumAddress,
  variableTokenAddress: tEthereumAddress,
  protocolDataProviderAddress: tEthereumAddress,
  tokensAndRatesAddress: tEthereumAddress,
  deployer: Wallet
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
  } = NervosConfig;

  const addressProviderContract = connectLendingPoolAddressProvider(
    addressProvider,
    deployer
  );
  const testHelpers = await connectProtocolDataProvider(
    protocolDataProviderAddress,
    deployer
  );

  const admin = await addressProviderContract.getPoolAdmin();
  const oracle = await addressProviderContract.getPriceOracle();

  if (!ReserveAssets) {
    throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
  }

  const treasuryAddress = ReserveFactorTreasuryAddress;
  console.log("initReservesByHelper");
  await initReservesByHelper(
    addressProviderContract,
    ReservesConfig,
    ReserveAssets,
    ATokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    admin,
    treasuryAddress,
    IncentivesController,
    poolConfigAddress,
    aTokenAddress,
    stableTokenAddress,
    variableTokenAddress,
    deployer
  );
  console.log("initReservesByHelper Done");

  console.log("configureReservesByHelper");

  await configureReservesByHelper(
    ReservesConfig,
    ReserveAssets,
    testHelpers,
    admin,
    addressProvider,
    tokensAndRatesAddress,
    poolConfigAddress,
    deployer
  );

  console.log("configureReservesByHelper Done");

  let collateralManagerAddress = LendingPoolCollateralManager;

  if (!collateralManagerAddress || collateralManagerAddress === ZERO_ADDRESS) {
    collateralManagerAddress = await deployLendingPoolCollateralManager(
      deployer
    );
  }
  // Seems unnecessary to register the collateral manager in the JSON db

  console.log(
    "\tSetting lending pool collateral manager implementation with address",
    collateralManagerAddress
  );

  await waitForTx(
    await addressProviderContract.setLendingPoolCollateralManager(
      collateralManagerAddress
    )
  );

  console.log(
    "\tSetting AaveProtocolDataProvider at AddressesProvider at id: 0x01",
    collateralManagerAddress
  );

  const protocolDataProvider = await connectProtocolDataProvider(
    protocolDataProviderAddress,
    deployer
  );

  await waitForTx(
    await addressProviderContract.setAddress(
      "0x0100000000000000000000000000000000000000000000000000000000000000",
      protocolDataProvider.address
    )
  );

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
