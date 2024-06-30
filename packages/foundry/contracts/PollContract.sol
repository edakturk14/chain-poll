// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PollContract {
    struct Poll {
        address creator;
        string question;
        string[] options;
        mapping(uint256 => uint256) votes;
        bool isActive;
        mapping(address => bool) hasVoted;
    }

    Poll[] public polls;

    event PollCreated(
        uint256 pollId,
        address creator,
        string question,
        string[] options
    );
    event VoteCast(uint256 pollId, uint256 optionIndex);
    event PollEnded(uint256 pollId);

    function createPoll(
        string memory question,
        string[] memory options
    ) public returns (uint256) {
        Poll storage newPoll = polls.push();
        newPoll.creator = msg.sender;
        newPoll.question = question;
        newPoll.options = options;
        newPoll.isActive = true;

        uint256 pollId = polls.length - 1;
        emit PollCreated(pollId, msg.sender, question, options);
        return pollId;
    }

    function vote(uint256 pollId, uint256 optionIndex) public {
        Poll storage poll = polls[pollId];
        require(poll.isActive, "Voting has ended for this poll.");
        require(optionIndex < poll.options.length, "Invalid option.");
        require(!polls[pollId].hasVoted[msg.sender], "Already voted.");

        poll.votes[optionIndex]++;
        polls[pollId].hasVoted[msg.sender] = true;
        emit VoteCast(pollId, optionIndex);
    }

    function hasUserVoted(
        uint256 pollId,
        address user
    ) public view returns (bool) {
        require(pollId < polls.length, "Poll does not exist.");
        return polls[pollId].hasVoted[user];
    }

    function endPoll(uint256 pollId) public {
        Poll storage poll = polls[pollId];
        require(
            msg.sender == poll.creator,
            "Only the creator can end the poll."
        );
        poll.isActive = false;

        emit PollEnded(pollId);
    }

    function getPoll(
        uint256 pollId
    )
        public
        view
        returns (
            address creator,
            string memory question,
            string[] memory options,
            uint256[] memory votes,
            bool isActive
        )
    {
        Poll storage poll = polls[pollId];
        uint256[] memory voteCounts = new uint256[](poll.options.length);

        for (uint256 i = 0; i < poll.options.length; i++) {
            voteCounts[i] = poll.votes[i];
        }

        return (
            poll.creator,
            poll.question,
            poll.options,
            voteCounts,
            poll.isActive
        );
    }

    function getPolls()
        public
        view
        returns (
            address[] memory creators,
            string[] memory questions,
            string[][] memory optionsArray,
            uint256[][] memory votesArray,
            bool[] memory isActiveArray
        )
    {
        uint256 pollCount = polls.length;
        creators = new address[](pollCount);
        questions = new string[](pollCount);
        optionsArray = new string[][](pollCount);
        votesArray = new uint256[][](pollCount);
        isActiveArray = new bool[](pollCount);

        for (uint256 i = 0; i < pollCount; i++) {
            Poll storage poll = polls[i];
            creators[i] = poll.creator;
            questions[i] = poll.question;
            optionsArray[i] = poll.options;
            isActiveArray[i] = poll.isActive;

            uint256[] memory voteCounts = new uint256[](poll.options.length);
            for (uint256 j = 0; j < poll.options.length; j++) {
                voteCounts[j] = poll.votes[j];
            }
            votesArray[i] = voteCounts;
        }
    }

    function getPollCount() public view returns (uint256) {
        require(polls.length > 0, "No polls created yet.");
        return polls.length - 1;
    }
}
