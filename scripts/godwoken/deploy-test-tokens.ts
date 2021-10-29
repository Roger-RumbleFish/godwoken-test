import fs from 'fs';
import path from 'path';
import { Wallet } from 'ethers';
import Config from '../../config.json';
import { connectErc20 } from '../connects/tokens';
import { factoryErc20 } from '../factories/tokens';
import { connectRPC } from '../utils';

export async function deployTestToken(
  deployer: Wallet,
  admin: string,
  symbol: string,
  decimals: number,
  initAmount: number
) {
  const factory = factoryErc20(deployer);
  const deployTransaction = factory.getDeployTransaction(symbol, symbol);
  const deploymentResult = await deployer.sendTransaction(deployTransaction);
  const deploymentReceipt = await deploymentResult.wait();

  const usdcERC = await connectErc20(deploymentReceipt.contractAddress, deployer);
  const res = await usdcERC.mint(admin, initAmount, { gasLimit: 12000000, gasPrice: 0 });
  await res.wait();
  return usdcERC.address;
}

export async function deployTestTokens() {
  const DEPLOYER_PRIVATE_KEY = Config.deployer;

  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error('Deployer private key missing in config.json');
  }
  // const network = ['godwoken', Config.env].filter((arg) => arg).join('.');
  const { deployer, translateAddress } = connectRPC(DEPLOYER_PRIVATE_KEY as string, Config);

  const admin = translateAddress(deployer.address);
  const tokens = {
    DAI: '',
    USDC: '',
    USDT: '',
  };

  const usdc = await deployTestToken(deployer, admin, 'usdc', 6, 10 * 10 ** 6);
  const dai = await deployTestToken(deployer, admin, 'dai', 18, 10 * 10 ** 6);
  const usdt = await deployTestToken(deployer, admin, 'usdt', 6, 10 * 10 ** 6);

  tokens.DAI = dai;
  tokens.USDC = usdc;
  tokens.USDT = usdt;

  console.log('usdc', usdc);
  console.log('dai', dai);
  console.log('usdt', usdt);
  const TOKENS_DIR = '../../tokens.json';
  const tokenPath = path.join(__dirname, TOKENS_DIR);
  fs.writeFileSync(tokenPath, JSON.stringify({ tokens }, null, 2));
}

deployTestTokens();
