import Config from '../../config.json';
import { deployAll as deployAllLendingPools } from './deploy-lending-pools';
import { connectRPC, transactionOverrides } from '../utils';

async function deploy() {
  const DEPLOYER_PRIVATE_KEY = Config.deployer;

  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error('Deployer private key missing in config.json');
  }
  // const network = ['godwoken', Config.env].filter((arg) => arg).join('.');
  const { deployer, translateAddress } = connectRPC(DEPLOYER_PRIVATE_KEY as string, Config);

  const admin = translateAddress(deployer.address);

  await deployAllLendingPools(admin, deployer, transactionOverrides);
}

deploy();
