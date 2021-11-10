import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';

import { default as connectPool } from './pool';
import { default as connectRegistry } from './registry';
import { default as connectAddressProvider } from './addressProvider';

export default function (signerOrProvider: Signer | Provider) {
  return {
    registry: connectRegistry(signerOrProvider),
    addressProvider: connectAddressProvider(signerOrProvider),
    pool: connectPool(signerOrProvider),
  };
}
