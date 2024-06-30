"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const PollPage = () => {
  const { address: connectedAddress } = useAccount();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pollId, setPollId] = useState<number | null>(null);

  const { writeContractAsync, isPending } = useScaffoldWriteContract("PollContract");

  const { data: events } = useScaffoldEventHistory({
    contractName: "PollContract",
    eventName: "PollCreated",
    fromBlock: 0n, // Adjust as needed
    watch: true,
    receiptData: true,
  });

  const addOption = () => setOptions([...options, '']);
  const handleChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!question || options.length < 2 || options.some(option => !option)) {
      setMessage("Please fill in the question and at least two options.");
      return;
    }

    setMessage("");
    try {
      const txResponse = await writeContractAsync({
        functionName: "createPoll",
        args: [question, options],
      });

      if (txResponse) {
        setTxHash(txResponse);
        console.log(txResponse);
        console.log(events);
        if (events) {
          const event = events.find(event => event.transaction === txHash);
          if (event) {
            setPollId(Number(event.args.pollId) + 1);
          }
        }

      }
    } catch (error) {
      console.error("Error creating poll:", error);
      setMessage("Error creating poll. Please try again.");
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10 ubuntu-regular">
      <h1 className="text-3xl font-bold mb-5 text-blue-00 text-center ubuntu-bold">Create your poll for free</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Poll Question"
          style={{ textIndent: '8px', paddingLeft: '8px' }}
          className="w-full pl-3 py-2 mb-4 border rounded-full border-blue-700 shadow-md"
        />
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              style={{ textIndent: '8px', paddingLeft: '8px' }}
              className="w-full pl-3 py-2 border rounded-full border-blue-500 shadow-md"
            />
            {index >= 2 && (
              <button
                onClick={() => removeOption(index)}
                className="ml-2 p-2 text-red-500"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addOption}
          className="w-full p-2 mb-2 mt-1 bg-blue-400 hover:bg-blue-500 text-white rounded-full italic transition duration-150 ease-in-out"
        >
          + Add Option
        </button>
        <button
          onClick={handleSubmit}
          className="w-full p-2 bg-blue-800 hover:bg-blue-700 text-white rounded-full italic font-bold transition duration-150 ease-in-out"
          disabled={!connectedAddress || isPending}
        >
          {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Create Poll"}
        </button>

      </div>
      {message && <p className="text-black mt-5">{message}</p>}
      {pollId !== null && (
        <div className="mt-5 text-center">
          <p className="font-italic">
            <strong>Your poll has been created with ID 👉 {" "}</strong>
            <a href={`/${pollId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-bold">
              {pollId}
            </a>
            <br />
            Send the link to your friends to access the poll.
            <br />
            <br />
            Your admin view 👉 {" "}
            <a href={`/admin/${pollId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-bold">
              {pollId}
            </a>
          </p>
        </div>
      )}
      <div className="w-full max-w-md mt-10 p-4 text-center">
        <h2 className="text-xl font-bold mb-4">How the "Chain Poll" App Works</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li>
            <strong className="text-black">Create a Poll for Free:</strong>
            <br />
            <span className="text-gray-600 italic">You can create a poll for free by providing a question and options.</span>
          </li>
          <li>
            <strong className="text-black">Share Your Poll:</strong>
            <br />
            <span className="text-gray-600 italic">Once your poll is ready, share a unique link with your network. This link will lead participants to the poll page where they can view the question, select from the options provided, and submit their vote.</span>
          </li>
          <li>
            <strong className="text-black">End the Poll & View Results:</strong>
            <br />
            <span className="text-gray-600 italic">When you decide to close the poll, you can switch to the admin view. Here, you'll be able to end the poll and view the results to see how people voted.</span>
          </li>
        </ol>
      </div>

    </div>
  );
};

export default PollPage;
