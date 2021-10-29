// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./IStdReference.sol";

contract BandOracleProvider {
    IStdReference ref;
    mapping(address => string) private symbolMapping;

    constructor(IStdReference _ref) public {
        ref = _ref;
        symbolMapping[0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE] = "ETH";
        symbolMapping[address(0)] = "CKB";
        symbolMapping[0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB] = "BTC";
         
    }

    function getPriceUSD(address base) external view returns (uint256){
        IStdReference.ReferenceData memory data = ref.getReferenceData(symbolMapping[base], "USD");
        return data.rate;
    }

}