"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";

// Type for metadata
interface Metadata {
  name?: string;
  instrument?: string;
  bpm?: number;
}

const Listen: React.FC = () => {
  // Hardcoded IPFS URLs for tracks and metadata
  const hardcodedSongCIDs = [
    "http://localhost:8080/ipfs/QmYuPWyw2QAP3orqc8QjCKFtWQKC3CmaJ9zDJHzAgp63aP",
    "http://localhost:8080/ipfs/QmSFLEuRSyMAi8K1CHJwzvkE4M8k2WrnpUXSxfRkUn5fSA",
    "http://localhost:8080/ipfs/QmdB9Ks6Fww9tcLntZ9pv2YqM8QPdZBdZfX22tpHJhkmtG",
  ];

  const hardcodedMetadataCIDs = [
    "http://localhost:8080/ipfs/QmVrg62tc7EfSctKkoYjPozk4obf7XD3s53HzsaurPeUKQ",
    "http://localhost:8080/ipfs/QmP1Wn4kiaziEM1RWwFzvV7nARWhh4HgrjesRhmeSC23Ck",
    "http://localhost:8080/ipfs/QmcZhfWp3yTPPocVZxcxMiD6gmDgLWGokv2KhMq1sZtfJw",
  ];

  // State definitions with types
  const [files, setFiles] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const [muteStates, setMuteStates] = useState<Record<number, boolean>>({});

  const howlerRefs = useRef<Howl[]>([]);

  useEffect(() => {
    const fetchFilesAndMetadata = async () => {
      try {
        setFiles(hardcodedSongCIDs);

        const metadataPromises = hardcodedMetadataCIDs.map(cid => fetch(cid).then(response => response.json()));
        const meta = await Promise.all(metadataPromises);
        setMetadata(meta);

        // Initialize Howl instances
        howlerRefs.current = hardcodedSongCIDs.map(
          file =>
            new Howl({
              src: [file],
              loop: true,
              volume: 1.0,
              format: ["mp3", "ogg"],
            }),
        );

        // Set initial mute state for each file
        setMuteStates(
          hardcodedSongCIDs.reduce((acc, _, index) => {
            acc[index] = false;
            return acc;
          }, {} as Record<number, boolean>),
        );
      } catch (error) {
        console.error("Error fetching metadata or initializing files:", error);
      }
    };

    fetchFilesAndMetadata();

    return () => {
      // Cleanup Howl instances
      howlerRefs.current.forEach(howler => howler.unload());
    };
  }, []);

  const playAll = () => {
    howlerRefs.current.forEach(howler => {
      if (!howler.playing()) {
        howler.play();
      }
    });
  };

  const pauseAll = () => {
    howlerRefs.current.forEach(howler => {
      if (howler.playing()) {
        howler.pause();
      }
    });
  };

  const toggleMute = (index: number) => {
    const newMuteStates = { ...muteStates, [index]: !muteStates[index] };
    setMuteStates(newMuteStates);
    howlerRefs.current[index].mute(newMuteStates[index]);
  };

  return (
    <>
      <h1>Files</h1>
      <button onClick={playAll}>Play All</button>
      <button onClick={pauseAll}>Pause All</button>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <a href={file} target="_blank" rel="noopener noreferrer">
              {file}
            </a>
            <p>{metadata[index]?.name || "Unknown Track"}</p>
            <p>{metadata[index]?.instrument || "Unknown Instrument"}</p>
            <button onClick={() => toggleMute(index)}>{muteStates[index] ? "Unmute" : "Mute"}</button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Listen;
