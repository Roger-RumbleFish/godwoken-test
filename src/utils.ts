import { ContractTransaction } from 'ethers';
import { AddressTranslator } from 'nervos-godwoken-integration';
import { EthereumNetwork } from './types';
import config from './config.json';

export const waitForTx = async (tx: ContractTransaction) => await tx.wait(1);

export const getAddressTranslator = () => {
  return new AddressTranslator({
    CKB_URL: config.nervos.ckb.url,
    RPC_URL: config.nervos.godwoken.rpcUrl,
    INDEXER_URL: config.nervos.indexer.url,
    deposit_lock_script_type_hash: config.nervos.deposit_lock_script_type_hash,
    eth_account_lock_script_type_hash: config.nervos.eth_account_lock_hash,
    rollup_type_script: {
      code_hash: config.nervos.rollup_type_script.code_hash,
      hash_type: config.nervos.rollup_type_script.hash_type,
      args: config.nervos.rollup_type_script.args,
    },
    rollup_type_hash: config.nervos.rollup_type_hash,
    portal_wallet_lock_hash: config.nervos.portal_wallet_lock_hash,
  });
};
