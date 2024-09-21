"use client";

import React from "react";
import Song from "../../listen/_components/Song";
import { useFetchTokenURI } from "./useFetchTokenUri";

interface SongListProps {
  songs: number[];
  onPlay: (songId: number) => void; // Function to handle play event
  currentPlayingId: number | null; // The currently playing song ID
}

const SongList: React.FC<SongListProps> = ({ songs, onPlay, currentPlayingId }) => {
  return (
    <div>
      {songs.length > 0 ? (
        songs.map(songId => {
          const metadata = useFetchTokenURI(BigInt(songId));

          return (
            <div key={songId}>
              {" "}
              {metadata?.fileUrl ? (
                <Song
                  songCID={metadata.fileUrl}
                  metadataCID={JSON.stringify(metadata)}
                  songId={songId} // Pass songId to Song component
                  onPlay={onPlay} // Pass onPlay function
                  songIsPlaying={currentPlayingId === songId} // Determine if the current song is playing
                />
              ) : (
                <p>Loading song {songId}...</p>
              )}
            </div>
          );
        })
      ) : (
        <p>No songs found</p>
      )}
    </div>
  );
};

export default SongList;
