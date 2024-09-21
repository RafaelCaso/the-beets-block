import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Howl } from "howler";
import { Address } from "~~/components/scaffold-eth";
import { Avatar } from "~~/components/scaffold-eth/Avatar";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface SongProps {
  songCID: string; // ipfs url
  metadataCID: string; // JSON
}

const Song: React.FC<SongProps> = ({ songCID, metadataCID }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Track current song time
  const [duration, setDuration] = useState(0); // Track total song duration
  const [metadata, setMetadata] = useState<{
    title?: string;
    artist?: string;
    genre?: string;
    uploadTime?: string;
    artistAddress?: string;
  }>({});
  const howlerRef = useRef<Howl | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const meta = JSON.parse(metadataCID);
    const humanReadableTime = new Date(meta.uploadTime * 1000).toString();
    meta.uploadTime = humanReadableTime;
    setMetadata(meta);

    howlerRef.current = new Howl({
      src: [songCID],
      loop: false, // Not looping for the tracker to work well
      volume: 1.0,
      format: ["mp3", "ogg"],
      onload: () => {
        setDuration(howlerRef.current?.duration() || 0); // Set total song duration
      },
      onend: () => {
        setIsPlaying(false); // Stop when the song ends
      },
    });

    return () => {
      howlerRef.current?.unload();
    };
  }, [songCID, metadataCID]);

  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(howlerRef.current?.seek() as number); // Update current song time
      }, 1000);
    } else if (!isPlaying && currentTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

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

  // Function to handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (howlerRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const seekTime = (clickX / rect.width) * duration; // Calculate seek time
      howlerRef.current.seek(seekTime); // Set Howler's current time
      setCurrentTime(seekTime);
    }
  };

  const handleClick = () => {
    router.push("/artist-portfolio?artistAddress=" + metadata.artistAddress);
  };

  return (
    <div
      // onClick={handleClick}
      className="flex items-center bg-gray-800 text-white p-4 rounded-lg shadow-lg my-4 w-2/3 mx-auto transition-transform duration-300 transform"
    >
      {/* Play/Pause Button */}
      <button
        onClick={e => {
          e.stopPropagation();
          togglePlay();
        }}
        className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center focus:outline-none mr-4 hover:scale-125 hover:bg-gray-700"
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

        {/* Progress Bar */}
        <div
          className="relative mt-2 w-full h-8 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
          ref={progressRef}
          onClick={handleSeek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-orange-500"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>

        {/* Current Time / Total Duration */}
        <div className="flex justify-between text-xs mt-1">
          <span>{new Date(currentTime * 1000).toISOString().slice(14, 19)}</span>
          <span>{new Date(duration * 1000).toISOString().slice(14, 19)}</span>
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
