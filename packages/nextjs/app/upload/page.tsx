"use client";

import React, { ChangeEvent, useState } from "react";
import { create } from "ipfs-http-client";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
// import { musicGenres } from "~~/utils/musicGenres";
import { notification } from "~~/utils/scaffold-eth";

const ipfs = create({ host: "localhost", port: 5001, protocol: "http" });

const UploadMusic: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeSoundChainAsync } = useScaffoldWriteContract("SoundChain");

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [genre, setGenre] = useState<string>("");

  const { data: artistName } = useScaffoldReadContract({
    contractName: "SoundChain",
    functionName: "artistNames",
    args: [connectedAddress],
  });

  const checkCopyright = async (fileBuffer: ArrayBuffer) => {
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

  const handleUpload = async () => {
    if (!connectedAddress) {
      notification.error("Please sign in before uploading");
      return;
    }
    if (!file || !name || !genre) {
      notification.error("Please fill in all fields and select a file!");
      return;
    }

    try {
      const reader = new FileReader();

      reader.readAsArrayBuffer(file);
      reader.onloadend = async () => {
        const buffer = reader.result as ArrayBuffer;
        // **************************************************
        // ****     VERY IMPORTANT!!!!!!!                 ***
        // ****     Uncomment below for copyright check   ***
        // **************************************************
        // const checkResult = await checkCopyright(buffer);

        // if (checkResult.metadata && checkResult.metadata.music) {
        //   const highScore = checkResult.metadata.music.some((musicItem: any) => musicItem.score >= 90);

        //   if (highScore) {
        //     notification.error("This file has been flagged as copyrighted.");
        //     return;
        //   }
        // }

        const result = await ipfs.add(buffer);
        const fileIpfsUrl = `http://localhost:8080/ipfs/${result.path}`;
        setFileUrl(fileIpfsUrl);

        const currentDateTime = new Date();
        // Store unixTimeStamp in metadata
        const unixTimeStamp = Math.floor(currentDateTime.getTime() / 1000);

        // Create metadata
        const metadata = {
          artist: artistName,
          title: name,
          genre: genre.toLowerCase(),
          fileUrl: fileIpfsUrl,
          uploadTime: unixTimeStamp,
          artistAddress: connectedAddress,
        };

        // Upload metadata to IPFS
        const metadataBuffer = Buffer.from(JSON.stringify(metadata));
        const metadataResult = await ipfs.add(metadataBuffer);
        // const metadataUrl = `http://localhost:8080/ipfs/${metadataResult.path}`;
        const metadataUrl = metadataResult.path;

        await writeSoundChainAsync({
          functionName: "mintItem",
          args: [connectedAddress, metadataUrl],
        });

        console.log("File uploaded to IPFS:", fileIpfsUrl);
        console.log("Metadata uploaded to IPFS:", metadataUrl);
      };
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
    }
  };

  return (
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
          onChange={e => setGenre(e.target.value)}
          className="w-full p-3 mb-4 text-black border border-gray-400 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
        />

        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600 mb-4"
        />

        <button
          onClick={handleUpload}
          className="w-full bg-orange-500 p-3 rounded-lg text-white hover:bg-orange-600 transition-colors"
        >
          Upload
        </button>

        {fileUrl && (
          <div className="mt-6 text-center">
            <p className="text-lg font-medium">File uploaded to IPFS:</p>
            <audio controls className="mt-2 w-full">
              <source src={fileUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMusic;
