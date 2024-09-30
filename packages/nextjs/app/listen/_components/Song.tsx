import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { parseEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { Avatar } from "~~/components/scaffold-eth/Avatar";
import PatronizeArtist from "~~/components/scaffold-eth/PatronizeArtist";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface SongProps {
  songCID: string;
  metadataCID: string;
  songId: number;
  onPlay: (songId: number) => void;
  songIsPlaying: boolean;
}

const Song: React.FC<SongProps> = ({ songCID, metadataCID, songId, onPlay, songIsPlaying }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [metadata, setMetadata] = useState<{
    title?: string;
    artist?: string;
    genre?: string;
    uploadTime?: string;
    artistAddress?: string;
  }>({});
  const [contributionCount, setContributionCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  const howlerRef = useRef<Howl | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const { data: songPatronized, isLoading: songPatronizedLoading } = useScaffoldEventHistory({
    contractName: "SoundScaffold",
    eventName: "PatronizeMusician",
    fromBlock: 0n,
    watch: true,
  });

  // count how many contributions for song component
  useEffect(() => {
    if (songPatronized) {
      const songContributions = songPatronized.filter((event: any) => event.args.songId === BigInt(songId));

      setContributionCount(songContributions.length);
    }
  }, [songPatronized, songId]);

  // populate data and music
  useEffect(() => {
    const meta = JSON.parse(metadataCID);
    const humanReadableTime = new Date(meta.uploadTime * 1000).toDateString();
    meta.uploadTime = humanReadableTime;
    setMetadata(meta);

    howlerRef.current = new Howl({
      src: [songCID],
      loop: false,
      volume: 1.0,
      format: ["mp3", "ogg"],
      onload: () => {
        setDuration(howlerRef.current?.duration() || 0);
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
      },
    });

    return () => {
      howlerRef.current?.unload();
    };
  }, [songCID, metadataCID]);

  // update progress bar
  useEffect(() => {
    const updateCurrentTime = () => {
      if (howlerRef.current) {
        setCurrentTime(howlerRef.current.seek());
      }
    };

    if (isPlaying) {
      const interval = setInterval(updateCurrentTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // pause song if another is selected by user
  useEffect(() => {
    if (songIsPlaying && !isPlaying) {
      howlerRef.current?.play();
      setIsPlaying(true);
      onPlay(songId);
    } else if (!songIsPlaying && isPlaying) {
      howlerRef.current?.pause();
      setIsPlaying(false);
    }
  }, [songIsPlaying]);

  const togglePlay = () => {
    if (howlerRef.current) {
      if (isPlaying) {
        howlerRef.current.pause();
      } else {
        howlerRef.current.play();
        onPlay(songId);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // allow user to click on progress bar to move around song
  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (howlerRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const seekTime = (clickX / rect.width) * duration;
      howlerRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  return (
    <div className="flex items-center bg-gray-800 text-white p-4 rounded-lg shadow-lg my-4 transition-transform duration-300 transform w-full sm:w-[400px] md:w-[1000px]">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center focus:outline-none mr-4 hover:scale-125 hover:bg-gray-700"
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

        {/* Contributions */}
        <div className="p-6">
          <button
            onClick={openModal}
            className="w-full bg-orange-500 p-3 rounded-lg text-white transition-colors hover:bg-orange-600"
          >
            Contribute
          </button>
        </div>
        <div className="text-sm mt-2 text-gray-400">Contributions: {contributionCount}</div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <PatronizeArtist
          title={metadata.title || "unknown title"}
          artistAddress={metadata.artistAddress!}
          songId={songId}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default Song;
