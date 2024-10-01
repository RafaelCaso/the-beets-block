"use client";

import { useState } from "react";
import SongList from "~~/app/mymusic/_components/SongList";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface PortfolioProps {
  artistAddress: string;
}

const ArtistPortfolio: React.FC<PortfolioProps> = ({ artistAddress }) => {
  const { data: artistName } = useScaffoldReadContract({
    contractName: "SoundScaffold",
    functionName: "artistNames",
    args: [artistAddress],
  });

  const { data: songs } = useScaffoldReadContract({
    contractName: "SoundScaffold",
    functionName: "getSongs",
    args: [artistAddress],
  });

  const songList = songs ? songs.map((song: bigint) => Number(song)) : [];

  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);

  const handlePlay = (songId: number) => {
    if (currentPlayingId !== null && currentPlayingId !== songId) {
      setCurrentPlayingId(null);
    }
    setCurrentPlayingId(songId);
  };

  return (
    <>
      <div className="bg-gray-900">
        <div className="flex items-center m-10 justify-center">
          <h1 className="text-2xl font-bold text-white m-8">Music by {artistName || "Unknown Artist"}</h1>
        </div>
        <SongList songs={songList} onPlay={handlePlay} currentPlayingId={currentPlayingId} />
      </div>
    </>
  );
};

export default ArtistPortfolio;
