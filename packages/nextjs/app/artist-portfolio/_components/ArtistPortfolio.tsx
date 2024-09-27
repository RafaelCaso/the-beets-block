"use client";

import { useState } from "react";
import SongList from "~~/app/mymusic/_components/SongList";
import { Avatar } from "~~/components/scaffold-eth/Avatar";
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

  const songList = songs ? songs.map((song: bigint) => Number(song)) : [];

  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null); // Track the currently playing song

  const handlePlay = (songId: number) => {
    if (currentPlayingId !== null && currentPlayingId !== songId) {
      // If a song is currently playing and it's not the same as the clicked one, stop it
      setCurrentPlayingId(null); // This will stop the current song in the Song component
    }
    setCurrentPlayingId(songId); // Set the new song to play
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
