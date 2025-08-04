// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestUSDT
 * @dev Simple ERC20 token for testing purposes
 */
contract TestUSDT is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, 1000000 * 10**decimals_); // Mint 1M tokens
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}