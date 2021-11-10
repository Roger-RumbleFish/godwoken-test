import { HardhatUserConfig } from 'hardhat/types';

import Config from './config.json';

import { extendEnvironment } from 'hardhat/config';

import { PolyjuiceJsonRpcProvider } from '@polyjuice-provider/ethers';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

const polyjuiceConfig = {
  rollupTypeHash: Config.nervos.rollup_type_hash,
  ethAccountLockCodeHash: Config.nervos.eth_account_lock_hash,
  web3Url: Config.nervos.godwoken.rpcUrl,
};

extendEnvironment(async (hre) => {
  if (hre.network.name === 'godwoken') {
    const signers = await hre.ethers.getSigners();

    const providerPolyjuiceEthers = new PolyjuiceJsonRpcProvider(
      polyjuiceConfig,
      Config.nervos.godwoken.rpcUrl
    );

    hre.ethers.getSigners = async () => {
      return signers;
    };

    hre.ethers.provider = providerPolyjuiceEthers;
  }
});

const buidlerConfig: HardhatUserConfig = {
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'istanbul',
    },
  },
  typechain: {
    outDir: 'src/contracts',
    target: 'ethers-v5',
  },

  networks: {
    godwoken: {
      accounts: ['0xd6a9667ae786bdaf6369d42d7847b0368a53a8d6b77c8a2c58f39ea2233fb3f3'],
      chainId: Number(Config.nervos.godwoken.networkId),
      url: Config.nervos.godwoken.rpcUrl,
      throwOnCallFailures: true,
    },
    rinkeby: {
      accounts: ['0xd6a9667ae786bdaf6369d42d7847b0368a53a8d6b77c8a2c58f39ea2233fb3f3'],
      chainId: 0x4,
      url: 'https://rinkeby.infura.io/v3/4a6f9e90668a411da7472f2ad8be5861', //'https://eth-rinkeby.alchemyapi.io/v2/53L9SR9zhVQku91MdTibvjqpKpmcvF7K',
      timeout: 600000000,
      gasPrice: 10000000000,
    },
    kovan: {
      accounts: ['0xd6a9667ae786bdaf6369d42d7847b0368a53a8d6b77c8a2c58f39ea2233fb3f3'],
      chainId: 0x2a,
      url: 'https://kovan.infura.io/v3/4a6f9e90668a411da7472f2ad8be5861', //'https://eth-kovan.alchemyapi.io/v2/jgzTW7gJzC9xcynV-IiADIWTkA3gSLaF',
      throwOnCallFailures: true,
      timeout: 600000000,
      gasPrice: 10000000000,
    },
  },
};

export default buidlerConfig;
