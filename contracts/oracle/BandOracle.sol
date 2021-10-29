// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {Ownable} from '../dependencies/openzeppelin/contracts/Ownable.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';
import {IPriceOracleGetter} from '../interfaces/oracle/IPriceOracleGetter.sol';
import {BandOracleProvider} from '../bandOracle/BandOracleProvider.sol';
import {SafeERC20} from '../dependencies/openzeppelin/contracts/SafeERC20.sol';

contract BandOracle is IPriceOracleGetter, Ownable {
  using SafeERC20 for IERC20;

  BandOracleProvider private _bandOracle;
  address public immutable BASE_CURRENCY;
  uint256 public immutable BASE_CURRENCY_UNIT;

  event BaseCurrencySet(address indexed baseCurrency, uint256 baseCurrencyUnit);

  constructor(
    address provider,
    address baseCurrency,
    uint256 baseCurrencyUnit

  ) public {
    _bandOracle =  BandOracleProvider(provider);
    BASE_CURRENCY = baseCurrency;
    BASE_CURRENCY_UNIT = baseCurrencyUnit;
    emit BaseCurrencySet(baseCurrency, baseCurrencyUnit);
  }



  /// @notice Gets an asset price by address
  /// @param asset The asset address
  function getAssetPrice(address asset) public view override returns (uint256) {
    if (asset == BASE_CURRENCY) {
      return BASE_CURRENCY_UNIT;
    }
      
    uint256 price = _bandOracle.getPriceUSD(asset);
    return uint256(price);
  }

  /// @notice Gets a list of prices from a list of assets addresses
  /// @param assets The list of assets addresses
  function getAssetsPrices(address[] calldata assets) external view returns (uint256[] memory) {
    uint256[] memory prices = new uint256[](assets.length);
    for (uint256 i = 0; i < assets.length; i++) {
      prices[i] = getAssetPrice(assets[i]);
    }
    return prices;
  }

}
