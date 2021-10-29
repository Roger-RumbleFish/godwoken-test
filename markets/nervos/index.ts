import { oneEther, oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { INervosConfig } from '../../helpers/types';
import { tokens } from '../../tokens.json';
import { strategyDAI, strategyUSDC, strategyUSDT } from './reservesConfigs';

export const NervosConfig: INervosConfig = {
  MarketId: 'Nervos genesis market',
  ProviderId: 1,
  ATokenNamePrefix: 'Nervos interest bearing',
  StableDebtTokenNamePrefix: 'Nervos stable debt bearing',
  VariableDebtTokenNamePrefix: 'Nervos variable debt bearing',
  SymbolPrefix: '',
  ReservesConfig: {
    DAI: strategyDAI,
    USDC: strategyUSDC,
    USDT: strategyUSDT,
  },
  ReserveAssets: {
    USDC: tokens.USDC,
    DAI: tokens.DAI,
    USDT: tokens.USDT,
  },
  ChainlinkAggregator: {
    DAI: ZERO_ADDRESS,
    USDC: ZERO_ADDRESS,
    USDT: ZERO_ADDRESS,
    USD: ZERO_ADDRESS,
  },
  LendingRateOracleRatesCommon: {
    DAI: {
      borrowRate: oneRay.multipliedBy(0.039).toFixed(),
    },
    USDC: {
      borrowRate: oneRay.multipliedBy(0.039).toFixed(),
    },
    USDT: {
      borrowRate: oneRay.multipliedBy(0.035).toFixed(),
    },
  },

  OracleQuoteUnit: oneEther.toString(),
  OracleQuoteCurrency: '0x0000000000000000000000000000000000000000',

  ProtocolGlobalParams: {
    TokenDistributorPercentageBase: '10000',
    MockUsdPriceInWei: '5848466240000000',
    UsdAddress: '0x10F7Fc1F91Ba351f9C629c5947AD69bD03C05b96',
    NilAddress: ZERO_ADDRESS,
    OneAddress: '0x0000000000000000000000000000000000000001',
    AaveReferral: '0',
  },

  PoolAdmin: undefined,
  PoolAdminIndex: 0,
  EmergencyAdmin: undefined,
  EmergencyAdminIndex: 1,
  ProviderRegistry: ZERO_ADDRESS,
  ProviderRegistryOwner: ZERO_ADDRESS,
  LendingRateOracle: ZERO_ADDRESS,
  LendingPoolCollateralManager: ZERO_ADDRESS,
  LendingPoolConfigurator: ZERO_ADDRESS,
  LendingPool: ZERO_ADDRESS,
  TokenDistributor: ZERO_ADDRESS,
  AaveOracle: ZERO_ADDRESS,
  FallbackOracle: ZERO_ADDRESS,
  ATokenDomainSeparator: '',
  WETH: '',
  WethGateway: '',
  WrappedNativeToken: '',
  ReserveFactorTreasuryAddress: ZERO_ADDRESS,
  IncentivesController: ZERO_ADDRESS,
};

export default NervosConfig;
