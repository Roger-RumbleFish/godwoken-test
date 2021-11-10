import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { LendingPool, LendingPool__factory } from '../contracts';

export default function (
  signerOrProvider: Signer | Provider
): (poolAddress: string) => LendingPool {
  return (poolAddress: string) => {
    return LendingPool__factory.connect(poolAddress, signerOrProvider);
  };
}
