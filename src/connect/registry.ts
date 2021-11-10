import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import {
  LendingPoolAddressesProviderRegistry__factory,
  LendingPoolAddressesProviderRegistry,
} from '../contracts';

import contractsJSON from '../contracts.json';
import { IContractsConfig } from '../types';

export default function (
  signerOrProvider: Signer | Provider
): LendingPoolAddressesProviderRegistry | null {
  const json = contractsJSON as unknown as IContractsConfig;
  if (!contractsJSON || !json.registry) {
    return null;
  }

  return LendingPoolAddressesProviderRegistry__factory.connect(json.registry, signerOrProvider);
}
