"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
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

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [hasPlacedBet, setHasPlacedBet] = useState<boolean>(false);
  const { writeContractAsync, isPending } = useScaffoldWriteContract("PredictionMarket");

  const { data: totalParticipants, isLoading: isTotalParticipantsLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "getParticipantCount",
  });

  const { data: totalFunds, isLoading: isTotalFundsLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "getTotalFunds",
  });

  const { data: userHasPlacedBet } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "hasPlacedBet",
    args: [connectedAddress],
  });

  useEffect(() => {
    if (userHasPlacedBet !== undefined) {
      setHasPlacedBet(userHasPlacedBet);
    }
  }, [userHasPlacedBet]);

  const handlePlaceBet = async () => {
    try {
      if (selectedTeam) {
        const teamIndex = teams.findIndex(team => team.name === selectedTeam);
        if (teamIndex !== -1) {
          await writeContractAsync(
            {
              functionName: "placeBet",
              args: [teamIndex],
              value: parseEther("1"), // 1 ETH
            },
            {
              onBlockConfirmation: txnReceipt => {
                console.log("📦 Transaction blockHash", txnReceipt.blockHash);
              },
            },
          );
        }
      }
    } catch (e) {
      console.error("Error placing bet", e);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="text-3xl font-bold mb-5 text-white">Who will win Euro 2024?</h1>
        <div className="grid grid-cols-4 gap-4">
          {teams.map((team, index) => (
            <button
              key={index}
              className={`btn flex text-lg items-center ${selectedTeam === team.name ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedTeam(team.name)}
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
        {selectedTeam && (
          <div className="mt-5 text-center">
            <p className="text-xl text-white">You have selected: <strong>{selectedTeam}</strong></p>
            {hasPlacedBet && (
              <p className="text-red-500 mt-2">You have placed a bet.</p>
            )}
            <button className="btn btn-primary" onClick={handlePlaceBet} disabled={isPending || hasPlacedBet}>
              {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Place Bet"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
