"use client";

import { useEffect, useState } from "react";
import SongList from "../mymusic/_components/SongList";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

interface Song {
  songId: number;
  artist: string;
  title: string;
  genre: string;
}

const Listen = () => {
  const [songs, setSongs] = useState<Set<number>>(new Set()); // Keep songIdSet as a Set
  const [songDetails, setSongDetails] = useState<Song[]>([]); // Store detailed song info
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search input
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);

  const { data: uploadedSongEvents, isLoading: uploadedSongsIsLoading } = useScaffoldEventHistory({
    contractName: "SoundChain",
    eventName: "SongUploaded",
    fromBlock: 0n,
    watch: true,
  });

  useEffect(() => {
    if (uploadedSongEvents && !uploadedSongsIsLoading) {
      const songIdSet = new Set<number>();
      const songDetailsArray: Song[] = [];

      uploadedSongEvents.forEach(e => {
        if (e.args.songId) {
          const songId = Number(e.args.songId);
          songIdSet.add(songId);

          // Assuming e.args has artistName, songTitle, genre
          if (e.args.artist && e.args.title && e.args.genre)
            songDetailsArray.push({
              songId,
              artist: e.args.artist,
              title: e.args.title,
              genre: e.args.genre,
            });
        }
      });

      setSongs(songIdSet);
      setSongDetails(songDetailsArray);
      setFilteredSongs(songDetailsArray); // Initially show all songs
    }
  }, [uploadedSongEvents, uploadedSongsIsLoading]);

  const handlePlay = (songId: number) => {
    if (currentPlayingId !== null && currentPlayingId !== songId) {
      setCurrentPlayingId(null); // Stop the current song
    }
    setCurrentPlayingId(songId); // Set the new song to play
  };

  const handleSearchClick = () => {
    if (!searchQuery) {
      setFilteredSongs(songDetails); // Show all songs if no search query
    } else {
      const lowercasedSearch = searchQuery.toLowerCase();
      const filtered = songDetails.filter(
        song =>
          song.title.toLowerCase().includes(lowercasedSearch) ||
          song.artist.toLowerCase().includes(lowercasedSearch) ||
          song.genre.toLowerCase().includes(lowercasedSearch),
      );
      setFilteredSongs(filtered);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen relative pl-24">
      {/* Search widget in the top right corner */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)} // Only set the input value here
          placeholder="Search..."
          className="p-2 pl-4 w-64 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearchClick}
          className="p-2 px-4 bg-blue-500 text-white rounded-full focus:outline-none hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      {/* Song List */}
      <SongList
        songs={filteredSongs.map(song => song.songId)}
        onPlay={handlePlay}
        currentPlayingId={currentPlayingId}
      />
    </div>
  );
};

export default Listen;
