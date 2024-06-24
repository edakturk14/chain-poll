// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarket {
    bool public marketClosed;
    uint8 public winningTeam;
    mapping(address => uint8) public chosenTeam;
    address[] public participants;
    mapping(uint8 => uint256) public teamBets; // Mapping to track bets per team
    mapping(address => uint256) public winners; // Mapping to track the winners' bets
    uint256 public totalWinnerBets;
    uint256 public constant BET_AMOUNT = 1 ether;

    event BetPlaced(address indexed bettor, uint8 indexed team);
    event MarketClosed(uint8 indexed winningTeam);
    event Payout(address indexed winner, uint256 amount);

    modifier marketOpen() {
        require(!marketClosed, "Market is closed");
        _;
    }

    constructor() {
        marketClosed = false;
    }

    function placeBet(uint8 _team) external payable marketOpen {
        require(msg.value == BET_AMOUNT, "Bet amount must be exactly 1 ETH");
        require(chosenTeam[msg.sender] == 0, "You can only place one bet");
        require(_team < 32, "Invalid team index"); // Assuming a maximum of 32 teams

        participants.push(msg.sender);
        chosenTeam[msg.sender] = _team;
        teamBets[_team] += 1; // Increment the bet count for the selected team
        emit BetPlaced(msg.sender, _team);
    }

    function closeMarket(uint8 _winningTeam) external {
        require(!marketClosed, "Market is already closed");
        require(_winningTeam < 32, "Invalid team index"); // Assuming a maximum of 32 teams
        marketClosed = true;
        winningTeam = _winningTeam;

        // Calculate total bets on the winning team
        for (uint256 i = 0; i < participants.length; i++) {
            if (chosenTeam[participants[i]] == winningTeam) {
                winners[participants[i]] = BET_AMOUNT;
                totalWinnerBets += BET_AMOUNT;
            }
        }

        emit MarketClosed(winningTeam);
    }

    function withdraw() external {
        require(marketClosed, "Market is not closed yet");
        require(
            chosenTeam[msg.sender] == winningTeam,
            "You did not bet on the winning team"
        );

        uint256 payout = (address(this).balance * winners[msg.sender]) /
            totalWinnerBets;
        winners[msg.sender] = 0; // Prevent reentrancy

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");
        emit Payout(msg.sender, payout);
    }

    function getTotalFunds() external view returns (uint256) {
        return address(this).balance;
    }

    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    function getTeamBets() external view returns (uint256[] memory) {
        uint256[] memory bets = new uint256[](32); // Assuming a maximum of 32 teams
        for (uint8 i = 0; i < 32; i++) {
            bets[i] = teamBets[i];
        }
        return bets;
    }

    function hasPlacedBet(address user) external view returns (bool) {
        return chosenTeam[user] != 0;
    }
}
