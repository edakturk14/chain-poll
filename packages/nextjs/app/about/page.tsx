"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Team {
    name: string;
    code: string;
}

const teams: Team[] = [
    { name: "Albania", code: "AL" },
    { name: "Austria", code: "AT" },
    { name: "Belgium", code: "BE" },
    { name: "Croatia", code: "HR" },
    { name: "Czechia", code: "CZ" },
    { name: "Denmark", code: "DK" },
    { name: "England", code: "GB-ENG" },
    { name: "France", code: "FR" },
    { name: "Georgia", code: "GE" },
    { name: "Germany", code: "DE" },
    { name: "Hungary", code: "HU" },
    { name: "Italy", code: "IT" },
    { name: "Netherlands", code: "NL" },
    { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" },
    { name: "Romania", code: "RO" },
    { name: "Scotland", code: "GB-SCT" },
    { name: "Serbia", code: "RS" },
    { name: "Slovakia", code: "SK" },
    { name: "Slovenia", code: "SI" },
    { name: "Spain", code: "ES" },
    { name: "Switzerland", code: "CH" },
    { name: "Türkiye", code: "TR" },
    { name: "Ukraine", code: "UA" },
];

const VotingPage = () => {
    const { address: connectedAddress } = useAccount();
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [hasVoted, setHasVoted] = useState<boolean>(false);

    const { data: voted, isLoading: isCheckingVote } = useScaffoldReadContract({
        contractName: "PredictionMarket",
        functionName: "hasVoted",
        args: [connectedAddress],
    });

    const { writeContractAsync, isPending } = useScaffoldWriteContract("PredictionMarket");

    useEffect(() => {
        if (voted !== undefined) {
            setHasVoted(voted);
        }
    }, [voted]);

    const handleVote = async () => {
        if (selectedTeam === null) {
            setMessage("Please select a team to vote for.");
            return;
        }

        setMessage("");
        try {
            await writeContractAsync(
                {
                    functionName: "placeVote",
                    args: [selectedTeam],
                },
                {
                    onBlockConfirmation: txnReceipt => {
                        console.log("📦 Transaction blockHash", txnReceipt.blockHash);
                    },
                }
            );
            setMessage("Successfully placed vote!");
        } catch (error) {
            console.error("Error placing vote:", error);
            setMessage("Error placing vote. Please try again.");
        }
    };

    return (
        <div className="flex items-center flex-col flex-grow pt-10">
            <h1 className="text-3xl font-bold mb-5 text-white">Who will win Euro 2024?</h1>
            <div className="grid grid-cols-4 gap-4">
                {teams.map((team, index) => (
                    <button
                        key={index}
                        className={`btn flex text-lg items-center ${selectedTeam === index ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setSelectedTeam(index)} // Passing team index instead of name
                    >
                        <img
                            src={`https://countryflagsapi.netlify.app/flag/${team.code}.svg`}
                            alt={`${team.name} flag`}
                            className="w-8 h-6 mr-2"
                        />
                        {team.name}
                    </button>
                ))}
            </div>
            {hasVoted ? (
                <div className="mt-5 text-center">
                    <p className="text-xl text-white">You have already voted.</p>
                </div>
            ) : (
                <div className="mt-5 text-center">
                    {selectedTeam === null && (
                        <p className="text-xl text-white">Please select a team to vote for.</p>
                    )}
                    {selectedTeam !== null && (
                        <>
                            <p className="text-xl text-white">
                                You have selected: <strong>{teams[selectedTeam].name}</strong>
                            </p>
                            <button className="btn btn-primary" onClick={handleVote} disabled={isPending}>
                                {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Place Vote"}
                            </button>
                        </>
                    )}
                </div>
            )}
            {message && <p className="text-white mt-5">{message}</p>}
        </div>
    );
};

export default VotingPage;
