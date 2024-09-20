"use client";

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

  return (
    <>
      <SongList songs={songList} />
    </>
  );
};

export default MyMusic;
