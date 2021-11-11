import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'hardhat';
import { connectErc20 } from '../connects/tokens';
import { Deployer, LendingContracts } from '../utils';

export async function deployTestToken(
  deployer: Deployer,
  name: string,
  symbol: string,
  initialAmount: BigNumber
) {
  const tokenFactory = await ethers.getContractFactory(LendingContracts.ERC20Mint, deployer);
  const deployerRequest = tokenFactory.getDeployTransaction(name, symbol);
  const receipt = await (await deployer.sendTransaction(deployerRequest)).wait();
  const contractAddress = receipt.contractAddress;
  const erc20Contract = connectErc20(contractAddress, deployer);

  await (await erc20Contract.mint(deployer.address, initialAmount)).wait();

  console.log(
    'Deployed Token',
    symbol,
    BigNumber.from(await erc20Contract.balanceOf(deployer.address)).toString()
  );

  return { symbol: symbol, address: contractAddress };
}

export async function deployTestTokens(deployer: Deployer) {
  console.log('Deploying Test Tokens');

  const tokens = [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      initialValue: BigNumber.from('10000000000000'),
    },
    {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      initialValue: BigNumber.from('10000000000000'),
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      initialValue: BigNumber.from('100000000000000000000000000'),
    },
    {
      name: 'USD1 Coin',
      symbol: 'USDC1',
      decimals: 6,
      initialValue: BigNumber.from('10000000000000'),
    },
    {
      name: 'Tether USD',
      symbol: 'USDT1',
      decimals: 6,
      initialValue: BigNumber.from('10000000000000'),
    },
    {
      name: 'Dai',
      symbol: 'DAI1',
      decimals: 18,
      initialValue: BigNumber.from('100000000000000000000000000'),
    }
  ];

  const deployedTokens: { symbol: string; address: string }[] = [];

  for (let i = 0; i < tokens.length; ++i) {
    const token = tokens[i];
    const deploy = await deployTestToken(deployer, token.name, token.symbol, token.initialValue);
    deployedTokens.push(deploy);
  }

  console.log('Deploying Test Tokens completed');
  return deployedTokens;
}
