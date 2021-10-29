import { Wallet } from 'ethers';
import Config from '../../config.json';
import { NervosConfig } from '../../markets/nervos/index';
import { waitForTx } from '../../src/utils';
import { connectErc20 } from '../connects/tokens';
import { factoryErc20 } from '../factories/tokens';
import { connectRPC } from '../utils';

export async function mintTokens() {
  const DEPLOYER_PRIVATE_KEY = Config.deployer;

  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error('Deployer private key missing in config.json');
  }

  // const network = ['godwoken', Config.env].filter((arg) => arg).join('.');
  const { deployer, translateAddress } = connectRPC(DEPLOYER_PRIVATE_KEY as string, Config);

  const admin = translateAddress(deployer.address);

  const tokenAddresses = Object.values(NervosConfig.ReserveAssets);

  for (let i = 0; i < tokenAddresses.length; ++i) {
    const erc20 = await connectErc20(tokenAddresses[i], deployer);
    await waitForTx(await erc20.mint(admin, 1000000));
  }
}

mintTokens();
