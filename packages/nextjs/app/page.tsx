"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Patrons from "~~/components/Patrons";
import ProjectPatrons from "~~/components/ProjectPatrons";
import { Address } from "~~/components/scaffold-eth";
import { Avatar } from "~~/components/scaffold-eth/Avatar";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import thumbnail from "~~/public/thumbnail.jpg";
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
        <div className="pt-10 bg-gray-900 text-white flex flex-col items-center justify-center space-y-6">
          <h2 className="text-2xl font-bold text-center">
            This is just the beginning. We want to bring <span className="text-5xl">music</span> to web3 in a much more
            meaningful way.
          </h2>
          <Link href="/listen" className="text-lg underline hover:text-orange-500 transition-colors">
            Listen to music here or register below to upload your own original music!
          </Link>
        </div>

        <div className="py-8 flex justify-center bg-gray-900">
          <Image
            src={thumbnail}
            alt="ScaffoldEth2"
            width={200}
            height={200}
            className="rounded-lg shadow-lg hover:scale-105 transition-transform"
          />
        </div>

        {isRegistered ? (
          <div className="p-10 flex items-center justify-center bg-gray-900 text-white">
            <div className="max-w-md mx-auto p-8 bg-gray-800 shadow-lg rounded-lg space-y-6">
              <h2 className="text-3xl font-semibold text-center">Welcome, {artistName}</h2>
              <div className="flex justify-center">
                <Avatar address={connectedAddress} size="10xl" />
              </div>
              <div className="flex justify-center">
                <Address address={connectedAddress} />
              </div>
              <Link
                href="/upload"
                className="block bg-orange-500 text-center p-4 rounded-lg text-white hover:bg-orange-600 transition-colors"
              >
                Upload Music
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-10 flex items-center justify-center bg-gray-900 text-white">
            <div className="max-w-md mx-auto p-8 bg-gray-800 shadow-lg rounded-lg space-y-4">
              <h2 className="text-3xl font-semibold text-center">Register to upload music!</h2>
              <input
                type="text"
                placeholder="Artist Name"
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleRegister}
                className="w-full bg-orange-500 p-4 rounded-lg text-white hover:bg-orange-600 transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        )}

        <div className="py-6 bg-gray-900 text-white text-center">
          <h3 className="text-lg">
            Sound Scaffold is <b>free</b> to use aside from gas fees. Feel free to contribute to your favorite tracks
            and the project itself!
          </h3>
        </div>

        <div className="py-4 bg-gray-900 text-white text-center">
          <ProjectPatrons />
        </div>

        <div className="py-4 bg-gray-900 text-white text-center">
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
