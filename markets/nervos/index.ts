import { oneEther, oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { INervosConfig } from '../../helpers/types';

import { hardhatArguments } from 'hardhat';

import { strategyDAI, strategyUSDC, strategyUSDT } from './reservesConfigs';
import { loadContractsConfig } from '../../scripts/filesManager';

export const getNervosConfig = (tokens?: { [key: string]: string }) => {
  let myTokens: { [key: string]: string };

  if (tokens) {
    myTokens = tokens;
  } else {
    const config = loadContractsConfig(hardhatArguments.network as string);
    myTokens = config ? (config?.tokens as unknown as { [key: string]: string }) : {};
  }

  const NervosConfig: INervosConfig = {
    MarketId: 'Nervos genesis market',
    ProviderId: 1,
    ATokenNamePrefix: 'Nervos interest bearing',
    StableDebtTokenNamePrefix: 'Nervos stable debt bearing',
    VariableDebtTokenNamePrefix: 'Nervos variable debt bearing',
    SymbolPrefix: '',
    ReservesConfig: {
      DAI: strategyDAI,
      USDC: strategyUSDC,
      // USDT: strategyUSDT,
      // DAI1: strategyDAI,
      // USDC1: strategyUSDC,
      // USDT1: strategyUSDT,
      // DAI2: strategyDAI,
      // USDC2: strategyUSDC,
      // USDT2: strategyUSDT,
      // DAI3: strategyDAI,
      // USDC3: strategyUSDC,
      // USDT3: strategyUSDT,
    },
    ReserveAssets: {
      DAI: myTokens['DAI'],
      USDC: myTokens['USDC'],
      // USDT: myTokens['USDT'],
      // DAI1: myTokens['DAI1'],
      // USDC1: myTokens['USDC1'],
      // USDT1: myTokens['USDT1'],
      // DAI2: myTokens['DAI2'],
      // USDC2: myTokens['USDC2'],
      // USDT2: myTokens['USDT2'],
      // DAI3: myTokens['DAI3'],
      // USDC3: myTokens['USDC3'],
      // USDT3: myTokens['USDT3']
    },
    ChainlinkAggregator: {
      DAI: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      // USDT: ZERO_ADDRESS,
      USD: ZERO_ADDRESS,
      // DAI1: ZERO_ADDRESS,
      // USDC1: ZERO_ADDRESS,
      // USDT1: ZERO_ADDRESS,
      // DAI2: ZERO_ADDRESS,
      // USDC2: ZERO_ADDRESS,
      // USDT2: ZERO_ADDRESS,
      // DAI3: ZERO_ADDRESS,
      // USDC3: ZERO_ADDRESS,
      // USDT3: ZERO_ADDRESS
    },
    LendingRateOracleRatesCommon: {
      DAI: {
        borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      },
      USDC: {
        borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      },
      // USDT: {
      //   borrowRate: oneRay.multipliedBy(0.035).toFixed(),
      // },
      // DAI1: {
      //   borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      // },
      // USDC1: {
      //   borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      // },
      // USDT1: {
      //   borrowRate: oneRay.multipliedBy(0.035).toFixed(),
      // },
      // DAI2: {
      //   borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      // },
      // USDC2: {
      //   borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      // },
      // USDT2: {
      //   borrowRate: oneRay.multipliedBy(0.035).toFixed(),
      // },
      // DAI3: {
      //   borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      // },
      // USDC3: {
      //   borrowRate: oneRay.multipliedBy(0.039).toFixed(),
      // },
      // USDT3: {
      //   borrowRate: oneRay.multipliedBy(0.035).toFixed(),
      // }
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

  return NervosConfig;
};
