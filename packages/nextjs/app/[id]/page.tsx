"use client";
import { useEffect, useState } from 'react';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { useAccount } from 'wagmi';

interface PollPageProps {
  params: { id: number };
}

export default function PollPage({ params }: PollPageProps) {
  const { id } = params;
  const { address: userAddress } = useAccount();
  const [poll, setPoll] = useState<{ question: string; options: string[]; isActive: boolean }>({ question: '', options: [], isActive: false });
  const [message, setMessage] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [votedIndex, setVotedIndex] = useState<number | null>(null); // Track which option was clicked

  const { data: pollData, isLoading, isError } = useScaffoldReadContract({
    contractName: "PollContract",
    functionName: "getPoll",
    args: [BigInt(id)],
  });

  const { data: userHasVoted } = useScaffoldReadContract({
    contractName: "PollContract",
    functionName: "hasUserVoted",
    args: [BigInt(id), userAddress || '0x0000000000000000000000000000000000000000'],
  });

  const { writeContractAsync: votePollContractAsync } = useScaffoldWriteContract("PollContract");

  useEffect(() => {
    if (pollData) {
      setPoll({
        question: pollData[1],
        options: Array.from(pollData[2]),
        isActive: pollData[4]
      });
    }
    if (userHasVoted !== undefined) {
      setHasVoted(userHasVoted);
    }
  }, [pollData, userHasVoted]);

  const handleVote = async (optionIndex: number) => {
    if (!poll.isActive) {
      setMessage("Voting has ended for this poll.");
      return;
    }

    try {
      const txResponse = await votePollContractAsync({
        functionName: "vote",
        args: [BigInt(id), BigInt(optionIndex)],
      });

      if (txResponse) {
        setMessage("Vote casted successfully!");
        setHasVoted(true);
        setVotedIndex(optionIndex); // Set the index of the voted option
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      setMessage("Error casting vote. Please try again.");
    }
  };

  if (isLoading) {
    return <div></div>;
  }

  if (isError || !poll.question) {
    return <div></div>;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <h1 className="text-3xl font-bold mb-5 text-black">Cast your vote:</h1>
      <h1 className="text-2xl font-bold mb-5 text-black">{poll.question}</h1>
      <div className="w-full max-w-md">
        {poll.options.map((option, index) => (
          <button
            key={index}
            className={`w-full p-2 mb-3 rounded-full text-white font-bold border ${!poll.isActive || hasVoted ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-600 border-blue-400 cursor-pointer shadow-md'} ${votedIndex === index ? 'bg-blue-600 font-bold' : ''}`}
            onClick={() => handleVote(index)}
            disabled={!poll.isActive || hasVoted}
          >
            {option}
          </button>

        ))}
      </div>
      {message && <p className="mt-5">{message}</p>}
      {!poll.isActive && <p className="mt-5 font-bold">✅ Voting has ended for this poll.</p>}
      {hasVoted && <p className="mt-2 font-bold">✅ You have voted in this poll.</p>}
    </div>
  );
}
