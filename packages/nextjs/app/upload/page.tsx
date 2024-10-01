"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { create } from "ipfs-http-client";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { musicGenres } from "~~/utils/musicGenres";
import { notification } from "~~/utils/scaffold-eth";

const ipfs = create({ host: "localhost", port: 5001, protocol: "http" });

const UploadMusic: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeSoundScaffoldAsync } = useScaffoldWriteContract("SoundScaffold");

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [genrePresets, setGenrePresets] = useState<string[]>([]);
  const [checkingCopyright, setCheckingCopyright] = useState<boolean>(false);
  const [canCheckCopyright, setCanCheckCopyright] = useState<boolean>(true);
  const [lastFlaggedTime, setLastFlaggedTime] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: artistName } = useScaffoldReadContract({
    contractName: "SoundScaffold",
    functionName: "artistNames",
    args: [connectedAddress],
  });

  const CHECK_COOLDOWN_TIME = 60 * 1000; // 1 minute cooldown after a flagged song

  // Effect to reset cooldown after the cooldown time has passed
  useEffect(() => {
    if (lastFlaggedTime) {
      const remainingTime = Date.now() - lastFlaggedTime;
      if (remainingTime >= CHECK_COOLDOWN_TIME) {
        setCanCheckCopyright(true);
        setLastFlaggedTime(null);
      } else {
        const timer = setTimeout(() => {
          setCanCheckCopyright(true);
          setLastFlaggedTime(null);
        }, CHECK_COOLDOWN_TIME - remainingTime);
        return () => clearTimeout(timer);
      }
    }
  }, [lastFlaggedTime]);

  const checkCopyright = async (fileBuffer: ArrayBuffer) => {
    notification.info("Checking for copyright...");
    try {
      const response = await fetch("/api/check-copyright", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: fileBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to check copyright:", error);
      throw error;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setGenre(value);

    if (value) {
      const filteredSuggestions = musicGenres.filter(symbol => symbol.startsWith(value.toLowerCase()));
      setGenrePresets(filteredSuggestions);
    } else {
      setGenrePresets([]);
    }
  };

  const handleUpload = async () => {
    console.log("Handle Upload triggered");
    if (!connectedAddress) {
      notification.error("Please sign in before uploading");
      return;
    }
    if (!file || !name || !genre) {
      notification.error("Please fill in all fields and select a file!");
      return;
    }

    try {
      console.log("inside try block");
      const reader = new FileReader();

      reader.onloadend = async () => {
        setCheckingCopyright(true);
        const buffer = reader.result as ArrayBuffer;

        /*
         ************* COPYRIGHT CHECK **************
         */
        if (!canCheckCopyright) {
          notification.error("You've recently uploaded a flagged track. Please wait before trying again.");
          setCheckingCopyright(false);
          return;
        }

        const checkResult = await checkCopyright(buffer);

        if (checkResult.metadata && checkResult.metadata.music) {
          console.log("inside copyright check");
          const highScore = checkResult.metadata.music.some((musicItem: any) => musicItem.score >= 90);

          if (highScore) {
            notification.error("This file has been flagged as copyrighted.");
            resetForm();
            setLastFlaggedTime(Date.now()); // Set the flagged time
            setCanCheckCopyright(false); // Start cooldown
            setCheckingCopyright(false);
            return;
          }
        }

        console.log("cleared copyright check");
        const result = await ipfs.add(buffer);
        console.log("ipfs.add(buffer) complete");
        const fileIpfsUrl = `http://localhost:8080/ipfs/${result.path}`;
        setFileUrl(fileIpfsUrl);

        const currentDateTime = new Date();
        const unixTimeStamp = Math.floor(currentDateTime.getTime() / 1000);

        const metadata = {
          artist: artistName,
          title: name,
          genre: genre,
          fileUrl: fileIpfsUrl,
          uploadTime: unixTimeStamp,
          artistAddress: connectedAddress,
        };
        console.log(metadata);

        const metadataBuffer = Buffer.from(JSON.stringify(metadata));
        const metadataResult = await ipfs.add(metadataBuffer);
        const metadataUrl = metadataResult.path;

        await writeSoundScaffoldAsync({
          functionName: "mintItem",
          args: [connectedAddress, metadataUrl, metadata.genre, metadata.title],
        });

        notification.success("File uploaded!");
        resetForm();
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      notification.error("Failed to upload the file.");
    } finally {
      setCheckingCopyright(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileUrl("");
    setName("");
    setGenre("");
    setCheckingCopyright(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="pt-6 pb-0 min-h-10 bg-gray-900 text-white flex items-center justify-center text-center">
        <h3>
          Our copyright check is currently very strict so we apologize if it incorrectly flags your song. Please reach
          out to us at SoundScaffold@gmail.com and supply your track for human review.
        </h3>
      </div>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 shadow-md rounded-lg">
          <h2 className="text-3xl font-semibold mb-6 text-center">Upload Music</h2>

          <input
            type="text"
            placeholder="Track Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 mb-4 text-black border border-gray-400 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Genre"
            value={genre}
            onChange={handleGenreChange}
            className="w-full p-3 mb-4 text-black border border-gray-400 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
          />
          {genrePresets.length > 0 && (
            <ul className="menu bg-primary-focus w-full rounded-md mt-1 max-h-40 overflow-auto">
              {genrePresets.map(preset => (
                <li
                  key={preset}
                  onClick={e => {
                    e.stopPropagation();
                    setGenre(preset);
                    setGenrePresets([]);
                  }}
                >
                  <a className="text-white hover:bg-primary">{preset}</a>
                </li>
              ))}
            </ul>
          )}

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600 mb-4"
          />

          <button
            onClick={handleUpload}
            className={`w-full bg-orange-500 p-3 rounded-lg text-white transition-colors ${
              checkingCopyright ? "cursor-not-allowed opacity-50 bg-gray-500" : "hover:bg-orange-600"
            }`}
            disabled={checkingCopyright}
          >
            {checkingCopyright ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </>
  );
};

export default UploadMusic;
