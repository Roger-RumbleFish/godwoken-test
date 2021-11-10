import { EthereumNetwork } from './types';

export const EthereumNetworkName = {
  '0x1': 'Mainnet',
  '0x2a': 'Kovan',
  '0x4': 'Rinkeby',
  '0x5': 'Goerli',
  '0x539': 'Dev',
  '0x3': 'Godwoken',
};

export const getEthereumNetworkName = (chainId: string): string | null => {
  if (chainId === null) return null;

  const name = EthereumNetworkName[chainId as EthereumNetwork];
  if (!name) return 'Name missing';

  return name;
};

export const getEthereumNetwork = (chainId: string): EthereumNetwork | null => {
  if (chainId === null) return null;

  switch (chainId) {
    case EthereumNetwork.Mainnet:
      return EthereumNetwork.Mainnet;
    case EthereumNetwork.Ropsten:
      return EthereumNetwork.Ropsten;
    case EthereumNetwork.Rinkeby:
      return EthereumNetwork.Rinkeby;
    case EthereumNetwork.Goerli:
      return EthereumNetwork.Goerli;
    case EthereumNetwork.Dev:
      return EthereumNetwork.Dev;
  }

  return null;
};
