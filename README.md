# lending-contracts
1. set up config.json from godwoken kicker config
2. yarn
3. yarn build
4. yarn deploy-dev


run and check if it is not failing at the end on params console.log.

In addition when the first issue is fixed
In contracts/protocol/LendingPoolConfigurator.sol
 
// pool.setConfiguration(asset, currentConfig.data); // TODO uncoment this to go deeper in stack

Remember to run yarn build before deploy