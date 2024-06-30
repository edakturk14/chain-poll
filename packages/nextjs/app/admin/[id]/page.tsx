"use client"
import { useEffect, useState } from 'react';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { useAccount } from 'wagmi';

interface PollPageProps {
    params: { id: number };
}

export default function PollAdminPage({ params }: PollPageProps) {
    const { id } = params;
    const { address: userAddress } = useAccount();
    const [poll, setPoll] = useState<{ question: string; options: string[]; votes: number[]; isActive: boolean; creator: string }>({ question: '', options: [], votes: [], isActive: false, creator: '' });
    const [message, setMessage] = useState('');

    const { data: pollData, isLoading, isError } = useScaffoldReadContract({
        contractName: "PollContract",
        functionName: "getPoll",
        args: [BigInt(id)],
    });

    const { writeContractAsync: endPollContractAsync } = useScaffoldWriteContract("PollContract");

    useEffect(() => {
        if (pollData) {
            setPoll({
                creator: pollData[0],
                question: pollData[1],
                options: Array.from(pollData[2]),
                votes: Array.from(pollData[3].map((vote: BigInt) => Number(vote))),
                isActive: pollData[4]
            });
        }
    }, [pollData]);

    const handleEndPoll = async () => {
        try {
            const txResponse = await endPollContractAsync({
                functionName: "endPoll",
                args: [BigInt(id)],
            });

            if (txResponse) {
                setMessage("Poll ended successfully!");
                setPoll(prevPoll => ({ ...prevPoll, isActive: false }));
            }
        } catch (error) {
            console.error("Error ending poll:", error);
            setMessage("Error ending poll. Please try again.");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError || !poll.question) {
        return <div>Loading...</div>;
    }

    const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
    const maxVotes = Math.max(...poll.votes);
    const winnerIndex = poll.votes.indexOf(maxVotes);
    const winningOption = poll.options[winnerIndex];

    const isCreator = poll.creator.toLowerCase() === userAddress?.toLowerCase();

    return (
        <div className="flex items-center flex-col flex-grow pt-10">
            <h1 className="text-3xl font-bold mb-5">Poll-{id}</h1>
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold mb-5">{poll.question}</h2>
                <ul className="mb-5">
                    {poll.options.map((option, index) => (
                        <li key={index} className="mb-2">
                            {option}: {poll.votes[index]}/{totalVotes} votes
                            <progress className="ml-2 progress w-56" value={(poll.votes[index] / totalVotes) * 100} max="100"></progress>
                        </li>
                    ))}
                </ul>
                {isCreator && poll.isActive && (
                    <button className="w-full p-2 mb-2 mt-1 bg-blue-500 text-white rounded-full italic hover:bg-blue-800" onClick={handleEndPoll}>
                        End Poll
                    </button>
                )}
                {!poll.isActive && <p className="mt-7 text-gray-500 font-bold">✅ Voting has ended for this poll. <br />🏆 The winner is {winningOption} with {maxVotes} votes out of {totalVotes}.</p>}
                {!isCreator && poll.isActive && (
                    <p className="italic text-gray-500 font-bold text-center">View only mode</p>
                )}
            </div>
            {message && <p className="text-white mt-5">{message}</p>}
        </div>
    );
}
