import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { LendingPoolAddressesProvider__factory, LendingPoolAddressesProvider } from '../contracts';
import contractsJSON from '../contracts.json';
import { IContractsConfig } from '../types';

export default function (signerOrProvider: Signer | Provider): LendingPoolAddressesProvider | null {
  const json = contractsJSON as unknown as IContractsConfig;

  if (!json) {
    return null;
  }

  return LendingPoolAddressesProvider__factory.connect(json.addressProvider, signerOrProvider);
}
