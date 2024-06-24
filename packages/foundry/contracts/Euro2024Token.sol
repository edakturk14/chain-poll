// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Euro2024Token is ERC20, Ownable {
    constructor(
        address initialOwner
    ) ERC20("Euro2024Token", "E24") Ownable(initialOwner) {
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function faucet(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
