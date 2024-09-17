"use client";

import React from "react";
import Song from "../../listen/_components/Song";
import { useFetchTokenURI } from "./useFetchTokenUri";

interface SongListProps {
  songs: number[];
}

const SongList: React.FC<SongListProps> = ({ songs }) => {
  return (
    <div>
      {songs.length > 0 ? (
        songs.map((songId, index) => {
          const metadata = useFetchTokenURI(BigInt(songId));

          return (
            <div key={index}>
              {metadata?.fileUrl ? (
                <Song songCID={metadata.fileUrl} metadataCID={JSON.stringify(metadata)} />
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
