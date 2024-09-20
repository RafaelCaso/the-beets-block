"use client";

import SongList from "~~/app/mymusic/_components/SongList";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface PortfolioProps {
  artistAddress: string;
}

const ArtistPortfolio: React.FC<PortfolioProps> = ({ artistAddress }) => {
  const { data: artistName } = useScaffoldReadContract({
    contractName: "SoundChain",
    functionName: "artistNames",
    args: [artistAddress],
  });

  const { data: songs } = useScaffoldReadContract({
    contractName: "SoundChain",
    functionName: "getSongs",
    args: [artistAddress],
  });

  const songList = [];

  if (songs?.length) {
    for (let i = 0; i < songs?.length; i++) {
      songList.push(Number(songs[i]));
    }
  }

  return (
    <>
      <h1>{artistName}</h1>
      <SongList songs={songList} />
    </>
  );
};

export default ArtistPortfolio;
