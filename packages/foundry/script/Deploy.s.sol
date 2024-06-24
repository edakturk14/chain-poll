//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/Euro2024Token.sol";
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

        // Deploy Token
        Euro2024Token euro2024Token = new Euro2024Token(
            0x260F8cD82D85431789D04470E9AA94fe4EB45406
        );
        console.logString(
            string.concat(
                "Token deployed at: ",
                vm.toString(address(euro2024Token))
            )
        );

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
