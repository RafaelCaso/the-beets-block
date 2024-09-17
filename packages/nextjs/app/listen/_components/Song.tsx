import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";

interface SongProps {
  songCID: string;
  metadataCID: string; // this is already passed as JSON, no need to fetch it again
}

const Song: React.FC<SongProps> = ({ songCID, metadataCID }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [metadata, setMetadata] = useState<{ title?: string; artist?: string; genre?: string }>({});
  const howlerRef = useRef<Howl | null>(null);

  // Using useEffect to initialize the song and Howler.js
  useEffect(() => {
    // Since `metadataCID` is already an object, parse and set metadata directly
    const meta = JSON.parse(metadataCID);
    setMetadata(meta);

    howlerRef.current = new Howl({
      src: [songCID],
      loop: true,
      volume: 1.0,
      format: ["mp3", "ogg"],
    });

    return () => {
      howlerRef.current?.unload();
    };
  }, [songCID, metadataCID]);

  const togglePlay = () => {
    if (howlerRef.current) {
      if (isPlaying) {
        howlerRef.current.pause();
      } else {
        howlerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center bg-gray-800 text-white p-4 rounded-lg shadow-lg my-4 w-2/3 mx-auto">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center focus:outline-none mr-4"
      >
        {isPlaying ? <span className="material-icons">pause</span> : <span className="material-icons">play</span>}
      </button>

      {/* Song Info */}
      <div className="flex-1">
        {/* Use title, artist, and genre from the metadata */}
        <p className="text-lg font-semibold">{metadata.title || "Unknown Track"}</p>
        <p className="text-sm">{metadata.artist || "Unknown Artist"}</p>
        <p className="text-sm italic">{metadata.genre || "Unknown Genre"}</p>

        {/* Placeholder for waveform visualization */}
        <div className="relative mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-orange-500" style={{ width: "50%" }}></div>
        </div>
      </div>

      {/* Graphic or album art placeholder */}
      <div className="w-12 h-12 bg-gray-700 rounded-lg ml-4"></div>
    </div>
  );
};

export default Song;
