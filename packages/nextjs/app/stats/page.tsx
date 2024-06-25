"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useEffect, useState } from "react";

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

export default function Stats() {
    const { data: totalParticipants, isLoading: isTotalParticipantsLoading } = useScaffoldReadContract({
        contractName: "PredictionMarket",
        functionName: "getParticipantCount",
    });

    const { data: teamBets, isLoading: isTeamBetsLoading } = useScaffoldReadContract({
        contractName: "PredictionMarket",
        functionName: "getTeamVotes",
    });

    const [topTeams, setTopTeams] = useState<{ name: string; bets: number }[]>([]);

    useEffect(() => {
        if (teamBets) {
            const betsArray = (teamBets as bigint[]).map((bets, index) => ({
                name: teams[index]?.name || `Team ${index + 1}`, // Safely access team name
                bets: Number(bets),
            }));
            const sortedTeams = betsArray.sort((a, b) => b.bets - a.bets).slice(0, 5);
            setTopTeams(sortedTeams);
        }
    }, [teamBets]);

    return (
        <div className="flex items-center flex-col flex-grow pt-10">
            <h1 className="text-3xl font-bold mb-5 text-white">Guesses</h1>
            <div className="card w-full max-w-xl bg-secondary text-primary-content shadow-xl m-4">
                <div className="card-body items-center text-center">
                    <div className="card-actions items-center flex-col gap-4 text-lg">
                        <div className="mb-4">
                            <h2 className="font-bold m-0">Total Participants:</h2>
                            {isTotalParticipantsLoading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                <p className="m-0">{totalParticipants ? totalParticipants.toString() : 0}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <h2 className="font-bold m-0">Top 5 Teams with Most Votes:</h2>
                            {isTeamBetsLoading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                <div>
                                    {topTeams.map((team, index) => (
                                        <p key={index} className="m-0">
                                            {team.name}: {team.bets}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
