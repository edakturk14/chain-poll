//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/PredictionMarket.sol";
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

        // Deploy PredictionMarket
        PredictionMarket predictionMarket = new PredictionMarket();
        console.logString(
            string.concat(
                "PredictionMarket deployed at: ",
                vm.toString(address(predictionMarket))
            )
        );

        vm.stopBroadcast();
        exportDeployments();
    }

    function test() public {}
}
