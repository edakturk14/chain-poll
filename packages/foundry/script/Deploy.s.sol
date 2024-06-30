//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/PollContract.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PollFactory
        PollContract pollContract = new PollContract();
        console.logString(
            string.concat(
                "PollFactory deployed at: ",
                vm.toString(address(pollContract))
            )
        );

        vm.stopBroadcast();
        exportDeployments();
    }

    function test() public {}
}
