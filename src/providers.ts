import { providers } from 'ethers';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { EthereumNetwork } from './types';

import config from './config.json';
import { getEthereumNetworkName } from './network';

const providerConfig = {
  rollupTypeHash: config.nervos.rollup_type_hash,
  ethAccountLockCodeHash: config.nervos.eth_account_lock_hash,
  web3Url: config.nervos.godwoken.rpcUrl,
};

export const getPolyjuiceProvider = (): providers.JsonRpcProvider => {
  const httpProvider = new PolyjuiceHttpProvider(config.nervos.godwoken.rpcUrl, providerConfig);
  const web3Provider = new providers.Web3Provider(httpProvider);

  return web3Provider;
};

const SUPPORTED_ETHEREUM_NETWORKS = [EthereumNetwork.Kovan];

export const getEthereumFallbackProvider = (
  network: EthereumNetwork
): providers.JsonRpcProvider => {
  /** DEV network shouldn't be in prod bundle */
  if (network === EthereumNetwork.Dev && config.ethereum.fallback.rpcUrl) {
    const localProvider = new providers.JsonRpcProvider(config.ethereum.fallback.rpcUrl);
    return localProvider;
  }

  if (SUPPORTED_ETHEREUM_NETWORKS.includes(network)) {
    const infuraProvider = new providers.InfuraProvider(
      getEthereumNetworkName(network)?.toLowerCase() as string,
      config.ethereum.fallback.infura.apiKey
    );

    return infuraProvider;
  }

  const defaultProvider = new providers.InfuraProvider(
    getEthereumNetworkName(EthereumNetwork.Kovan)?.toLowerCase() as string,
    config.ethereum.fallback.infura.apiKey
  );

  return defaultProvider;
};
