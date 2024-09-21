"use client";

import { useState } from "react";
import ArtistPortfolio from "../artist-portfolio/_components/ArtistPortfolio";
import SongList from "./_components/SongList";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const MyMusic: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: songs } = useScaffoldReadContract({
    contractName: "SoundChain",
    functionName: "getSongs",
    args: [connectedAddress],
  });

  const songList = [];

  if (songs?.length) {
    for (let i = 0; i < songs?.length; i++) {
      songList.push(Number(songs[i]));
    }
  }

  const [playingSongId, setPlayingSongId] = useState<number | null>(null);

  const handlePlay = (songId: number) => {
    setPlayingSongId(songId);
  };

  if (!connectedAddress) {
    return <h1>404</h1>;
  }
  return (
    <>
      <ArtistPortfolio artistAddress={connectedAddress} />
    </>
  );
};

export default MyMusic;
