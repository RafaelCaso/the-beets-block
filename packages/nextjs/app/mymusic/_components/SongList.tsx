import { useEffect, useRef, useState } from "react";
import { MutableRefObject } from "react";
import Song from "../../listen/_components/Song";
import { readContract } from "@wagmi/core";
import abi from "~~/utils/SoundScaffold.json";
import { config } from "~~/wagmiConfig";

interface SongListProps {
  songs: number[];
  onPlay: (songId: number) => void;
  currentPlayingId: number | null;
  scrollToSongId?: number | null;
  songRefs?: MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

const fetchTokenURI = async (songId: bigint) => {
  try {
    const songUrl = await readContract(config, {
      address: contractAddress,
      abi: abi.abi,
      functionName: "tokenURI",
      args: [songId],
    });

    if (songUrl) {
      const response = await fetch(songUrl as string);
      const json = await response.json();
      return json;
    }
  } catch (error) {
    console.error("Error fetching token URI:", error);
    return null;
  }
};

const SongList: React.FC<SongListProps> = ({ songs, onPlay, currentPlayingId, scrollToSongId }) => {
  const [songMetadata, setSongMetadata] = useState<{ [key: number]: { fileUrl?: string } | null }>({});
  const songRefs = useRef<{ [key: number]: HTMLDivElement | null }>({}); // Refs for each song div

  useEffect(() => {
    const fetchAllMetadata = async () => {
      const metadataPromises = songs.map(async songId => {
        const metadata = await fetchTokenURI(BigInt(songId));
        return { songId, metadata };
      });

      const metadataResults = await Promise.all(metadataPromises);

      const metadataMap: { [key: number]: { fileUrl?: string } | null } = {};
      metadataResults.forEach(({ songId, metadata }) => {
        metadataMap[songId] = metadata;
      });

      setSongMetadata(metadataMap);
    };

    if (songs.length) {
      fetchAllMetadata();
    }
  }, [songs]);

  useEffect(() => {
    if (scrollToSongId && songRefs.current[scrollToSongId]) {
      songRefs.current[scrollToSongId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      onPlay(scrollToSongId);
    }
  }, [scrollToSongId, onPlay]);

  return (
    <div className="w-full flex flex-col items-start">
      {songs.length > 0 ? (
        songs.map(songId => {
          const metadata = songMetadata[songId];

          return (
            <div key={songId} ref={el => (songRefs.current[songId] = el)}>
              {metadata?.fileUrl ? (
                <Song
                  songCID={metadata.fileUrl}
                  metadataCID={JSON.stringify(metadata)}
                  songId={songId}
                  onPlay={onPlay}
                  songIsPlaying={currentPlayingId === songId}
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
