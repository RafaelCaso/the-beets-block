import { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const useFetchTokenURI = (songId: bigint | undefined) => {
  const { data: songUrl } = useScaffoldReadContract({
    contractName: "SoundChain",
    functionName: "tokenURI",
    args: [songId],
  });

  const [metadata, setMetadata] = useState<{ fileUrl?: string } | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (songUrl) {
        try {
          const response = await fetch(songUrl); // Fetch metadata from the tokenURI (songUrl)
          const json = await response.json(); // Parse metadata JSON
          setMetadata(json); // Save metadata in state
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }
      }
    };

    fetchMetadata();
  }, [songUrl]);
  return metadata; // Return metadata (which may include fileUrl)
};
