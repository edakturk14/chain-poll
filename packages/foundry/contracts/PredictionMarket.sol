// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarket {
    bool public marketClosed;
    uint8 public winningTeam;
    mapping(address => uint8) public chosenTeam;
    address[] public participants;

    event VotePlaced(address indexed voter, uint8 indexed team);
    event MarketClosed(uint8 indexed winningTeam);

    modifier marketOpen() {
        require(!marketClosed, "Market is closed");
        _;
    }

    constructor() {
        marketClosed = false;
    }

    function placeVote(uint8 _team) external marketOpen {
        require(chosenTeam[msg.sender] == 0, "You can only vote once");
        require(_team < 32, "Invalid team index"); // Assuming a maximum of 32 teams

        participants.push(msg.sender);
        chosenTeam[msg.sender] = _team;
        emit VotePlaced(msg.sender, _team);
    }

    function closeMarket(uint8 _winningTeam) external {
        require(!marketClosed, "Market is already closed");
        require(_winningTeam < 32, "Invalid team index"); // Assuming a maximum of 32 teams
        marketClosed = true;
        winningTeam = _winningTeam;
        emit MarketClosed(winningTeam);
    }

    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    function getTeamVotes() external view returns (uint256[] memory) {
        uint256[] memory votes = new uint256[](32); // Assuming a maximum of 32 teams
        for (uint256 i = 0; i < participants.length; i++) {
            votes[chosenTeam[participants[i]]]++;
        }
        return votes;
    }

    function hasVoted(address user) external view returns (bool) {
        return chosenTeam[user] != 0;
    }

    function getWinners() external view returns (address[] memory) {
        address[] memory winners = new address[](participants.length);
        uint256 count = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            if (chosenTeam[participants[i]] == winningTeam) {
                winners[count] = participants[i];
                count++;
            }
        }
        assembly {
            mstore(winners, count)
        }
        return winners;
    }
}
