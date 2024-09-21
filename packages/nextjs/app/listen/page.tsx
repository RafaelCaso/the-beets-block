"use client";

import { useEffect, useState } from "react";
import SongList from "../mymusic/_components/SongList";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Listen = () => {
  const [songs, setSongs] = useState<number[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const { data: uploadedSongEvents, isLoading: uploadedSongsIsLoading } = useScaffoldEventHistory({
    contractName: "SoundChain",
    eventName: "SongUploaded",
    fromBlock: 0n,
    watch: true,
  });

  useEffect(() => {
    if (uploadedSongEvents && !uploadedSongsIsLoading) {
      const songIdArray: number[] = [];
      uploadedSongEvents.forEach(e => {
        if (e.args.songId) {
          songIdArray.push(Number(e.args.songId));
        }
      });

      setSongs(songIdArray);
    }
  }, [uploadedSongEvents]);

  const handlePlay = (songId: number) => {
    if (currentPlayingId !== null && currentPlayingId !== songId) {
      setCurrentPlayingId(null); // Stop the current song
    }
    setCurrentPlayingId(songId); // Set the new song to play
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <SongList songs={songs} onPlay={handlePlay} currentPlayingId={currentPlayingId} />
    </div>
  );
};

export default Listen;
