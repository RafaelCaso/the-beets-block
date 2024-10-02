"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SongList from "../mymusic/_components/SongList";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

interface Song {
  songId: number;
  artist: string;
  title: string;
  genre: string;
}

const Listen = () => {
  const [songs, setSongs] = useState<Set<number>>(new Set());
  const [songDetails, setSongDetails] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const [itemsToShow, setItemsToShow] = useState<number>(10);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const songRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const { data: uploadedSongEvents, isLoading: uploadedSongsIsLoading } = useScaffoldEventHistory({
    contractName: "SoundScaffold",
    eventName: "SongUploaded",
    fromBlock: 126147189n,
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
      setFilteredSongs(songDetailsArray);
    }
  }, [uploadedSongEvents, uploadedSongsIsLoading]);

  const handlePlay = (songId: number) => {
    if (currentPlayingId !== null && currentPlayingId !== songId) {
      setCurrentPlayingId(null);
    }
    setCurrentPlayingId(songId);
  };

  const handleSearchClick = () => {
    if (!searchQuery) {
      setFilteredSongs(songDetails);
      setSearchQuery("");
    } else {
      const lowercasedSearch = searchQuery.toLowerCase();
      const filtered = songDetails.filter(
        song =>
          song.title.toLowerCase().includes(lowercasedSearch) ||
          song.artist.toLowerCase().includes(lowercasedSearch) ||
          song.genre.toLowerCase().includes(lowercasedSearch),
      );
      setFilteredSongs(filtered);
      setSearchQuery("");
    }
    setItemsToShow(10);
  };

  const loadMore = useCallback(() => {
    setItemsToShow(prevItems => prevItems + 10);
  }, []);

  useEffect(() => {
    if (loadMoreRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 1.0 },
      );

      observer.observe(loadMoreRef.current);

      return () => {
        if (loadMoreRef.current) {
          observer.unobserve(loadMoreRef.current);
        }
      };
    }
  }, [loadMoreRef, loadMore]);

  const handleRandomSong = () => {
    if (filteredSongs.length === 0) return;

    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    const randomSong = filteredSongs[randomIndex];

    if (randomIndex >= itemsToShow) {
      setItemsToShow(randomIndex + 1);
    }

    setTimeout(() => {
      const songElement = songRefs.current[randomSong.songId];
      if (songElement) {
        songElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      handlePlay(randomSong.songId);
    }, 300);
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen relative pl-28">
      {/* Right-side fixed container */}
      <div className="pt-20 fixed top-4 right-4 flex flex-col items-center space-y-4">
        {/* Search widget */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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

        {/* Random song button */}
        <button
          onClick={handleRandomSong}
          className="fixed top-20 left-4 h-30 w-20 bg-green-500 rounded text-white focus:outline-none hover:bg-green-600 transition"
        >
          Play Random Song
        </button>
      </div>

      {/* Song List */}
      <SongList
        songs={filteredSongs.slice(0, itemsToShow).map(song => song.songId)}
        onPlay={handlePlay}
        currentPlayingId={currentPlayingId}
        songRefs={songRefs}
      />

      {/* Invisible div to track the end of the list */}
      <div ref={loadMoreRef} className="h-4"></div>
    </div>
  );
};

export default Listen;
