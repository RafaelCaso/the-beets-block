import { useEffect, useState } from "react";
// ***********************************************************
// MAKE SURE ABI IS AVAILABLE IN NEXT PACKAGE BEFORE DEPLOYING
// ***********************************************************
import abi from "../../../../hardhat/artifacts/contracts/SoundChain.sol/SoundChain.json";
import Song from "../../listen/_components/Song";
import { readContract } from "@wagmi/core";
import { config } from "~~/wagmiConfig";

interface SongListProps {
  songs: number[];
  onPlay: (songId: number) => void; // Function to handle play event
  currentPlayingId: number | null; // The currently playing song ID
}

// ************************************************
// ***** MAKE SURE TO ADJUST CONTRACT ADDRESS *****
// ************************************************
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// use wagmi to get around react hook error (different amount of rerenders)
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

const SongList: React.FC<SongListProps> = ({ songs, onPlay, currentPlayingId }) => {
  const [songMetadata, setSongMetadata] = useState<{ [key: number]: { fileUrl?: string } | null }>({});

  useEffect(() => {
    const fetchAllMetadata = async () => {
      const metadataPromises = songs.map(async songId => {
        const metadata = await fetchTokenURI(BigInt(songId));
        return { songId, metadata };
      });

      const metadataResults = await Promise.all(metadataPromises);

      // Update state with fetched metadata
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

  return (
    <div>
      {songs.length > 0 ? (
        songs.map(songId => {
          const metadata = songMetadata[songId];

          return (
            <div key={songId}>
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
