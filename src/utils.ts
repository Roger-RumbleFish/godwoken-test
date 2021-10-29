import { ContractTransaction } from 'ethers';
import { EthereumNetwork } from './types';

export const waitForTx = async (tx: ContractTransaction) => await tx.wait(1);
