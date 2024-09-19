import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Howl } from "howler";
import { Address } from "~~/components/scaffold-eth";
import { Avatar } from "~~/components/scaffold-eth/Avatar";

interface SongProps {
  songCID: string;
  metadataCID: string; // this is already passed as JSON, no need to fetch it again
}

const Song: React.FC<SongProps> = ({ songCID, metadataCID }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [metadata, setMetadata] = useState<{
    title?: string;
    artist?: string;
    genre?: string;
    uploadTime?: string;
    artistAddress?: string;
  }>({});
  const howlerRef = useRef<Howl | null>(null);
  const router = useRouter();

  useEffect(() => {
    const meta = JSON.parse(metadataCID);
    const humanReadableTime = new Date(meta.uploadTime * 1000).toString();
    meta.uploadTime = humanReadableTime;
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

  const handleClick = () => {
    router.push("/");
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center bg-gray-800 text-white p-4 rounded-lg shadow-lg my-4 w-2/3 mx-auto transition-transform duration-300 transform hover:scale-105 hover:bg-gray-700 cursor-pointer"
    >
      {/* Play/Pause Button */}
      <button
        onClick={e => {
          e.stopPropagation();
          togglePlay();
        }}
        className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center focus:outline-none mr-4"
      >
        {isPlaying ? <span className="material-icons">pause</span> : <span className="material-icons">play</span>}
      </button>

      <div className="flex-1">
        {/* Title */}
        <div className="flex items-center">
          <p className="text-lg font-semibold">{metadata.title || "Unknown Track"}</p>
        </div>

        {/* Genre and Upload Time */}
        <div className="flex flex-col mt-2">
          <p className="text-sm italic">{metadata.genre || "Unknown Genre"}</p>
          <p className="text-sm italic">{metadata.uploadTime || "Unknown Date"}</p>
        </div>

        {/* Placeholder for waveform visualization */}
        <div className="relative mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-orange-500" style={{ width: "50%" }}></div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        {/* Artist Name */}
        <p className="text-lg font-semibold">{metadata.artist || "Unknown Artist"}</p>

        {/* Avatar */}
        <Avatar address={metadata.artistAddress} size="10xl" />

        <div className="mt-2">
          <Address address={metadata.artistAddress} />
        </div>
      </div>
    </div>
  );
};

export default Song;
