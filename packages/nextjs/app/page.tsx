"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Patrons from "~~/components/Patrons";
import { Address } from "~~/components/scaffold-eth";
import { Avatar } from "~~/components/scaffold-eth/Avatar";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeSoundScaffoldAsync } = useScaffoldWriteContract("SoundScaffold");

  const [artistName, setArtistName] = useState<string>("");

  const { data: isRegistered, error: isRegisteredError } = useScaffoldReadContract({
    contractName: "SoundScaffold",
    functionName: "accountExists",
    args: [connectedAddress],
  });

  const { data: userArtistName, isFetched } = useScaffoldReadContract({
    contractName: "SoundScaffold",
    functionName: "artistNames",
    args: [connectedAddress],
  });

  const globalSetIsRegistered: (isRegistered: boolean) => void = useGlobalState.getState().setIsRegistered;

  useEffect(() => {
    const fetchData = async () => {
      if (isRegistered && isFetched) {
        setArtistName(userArtistName || "");
      }
    };
    globalSetIsRegistered(true);
    fetchData();
  }, [isRegistered, isFetched]);

  const handleRegister = async () => {
    if (!artistName) {
      notification.error("Please select a name to register");
      return;
    }
    if (!connectedAddress) {
      notification.error("Please connect your wallet to register");
      return;
    }

    setArtistName("");

    await writeSoundScaffoldAsync({
      functionName: "registerAccount",
      args: [artistName],
    });
  };

  const handleOwner = async () => {
    await writeSoundScaffoldAsync({
      functionName: "withdraw",
    });
  };

  if (!isRegisteredError) {
    return (
      <>
        <div className="pt-6 bg-gray-900 text-white flex items-center justify-center">
          <h2 className="text-xl">
            This is the just the beginning. We want to bring<span className="text-4xl"> music</span> to web3 in a much
            more meaningful way.
          </h2>
        </div>

        {isRegistered ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="max-w-2xl mx-auto p-8 bg-gray-800 shadow-md rounded-lg">
              <h2 className="text-3xl font-semibold mb-6 text-center">Welcome {artistName}</h2>
              <div className="flex items-center justify-center">
                <Avatar address={connectedAddress} size="10xl" />
              </div>
              <div className="mx-auto p-6 flex items-center justify-center">
                <Address address={connectedAddress} />
              </div>
              <div className="flex items-center justify-center text-center">
                <Link
                  className="w-full bg-orange-500 p-3 rounded-lg text-white hover:bg-orange-600 transition-colors"
                  href="/upload"
                >
                  Upload Music
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="max-w-2xl mx-auto p-8 bg-gray-800 shadow-md rounded-lg">
              <h2 className="text-3xl font-semibold mb-6 text-center">Register to upload music!</h2>
              <input
                type="text"
                placeholder="Artist Name"
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                className="w-full p-3 mb-4 text-black border border-gray-400 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              />
              <div className="flex items-center justify-center">
                <button
                  className="w-full bg-orange-500 p-3 rounded-lg text-white hover:bg-orange-600 transition-colors justify-center"
                  onClick={handleRegister}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="p-0 min-h-10 bg-gray-900 text-white flex items-center justify-center text-center">
          <h3>
            Sound Scaffold is free to use aside from gas fees. Feel free to contribute to your favorite tracks and the
            project itself!
          </h3>
        </div>
        <div className="p-0 min-h-10 bg-gray-900 text-white flex items-center justify-center text-center">
          <Patrons />
        </div>
        {connectedAddress === process.env.NEXT_PUBLIC_OWNER && <button onClick={handleOwner}>Withdraw</button>}
      </>
    );
  } else {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1>Oh no, something went wrong</h1>
      </div>
    );
  }
};

export default Home;
