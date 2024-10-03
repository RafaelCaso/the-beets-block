"use client";

import ArtistPortfolio from "../artist-portfolio/_components/ArtistPortfolio";
import { NextPage } from "next";
import { useAccount } from "wagmi";

const MyMusic: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  if (!connectedAddress) {
    return <h1>404</h1>;
  }
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <ArtistPortfolio artistAddress={connectedAddress} />
      </div>
    </>
  );
};

export default MyMusic;
