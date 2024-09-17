"use client";

import Song from "./_components/Song";
import type { NextPage } from "next";

const Listen: NextPage = () => {
  // const testSong = "http://localhost:8080/ipfs/QmYuPWyw2QAP3orqc8QjCKFtWQKC3CmaJ9zDJHzAgp63aP";
  // const testMeta = "http://localhost:8080/ipfs/QmVrg62tc7EfSctKkoYjPozk4obf7XD3s53HzsaurPeUKQ";

  // const testSong2 = "http://localhost:8080/ipfs/QmSFLEuRSyMAi8K1CHJwzvkE4M8k2WrnpUXSxfRkUn5fSA";
  // const testMeta2 = "http://localhost:8080/ipfs/QmP1Wn4kiaziEM1RWwFzvV7nARWhh4HgrjesRhmeSC23Ck";

  const ifImAbleSong = "http://localhost:8080/ipfs/QmfCBb8Lm9tP2yRAexr1TjQjUq4XMe86UWqUjVo9zvveTc";
  // const ifImAbleMeta = "http://localhost:8080/ipfs/QmNZhYabzjLmYdfB6gdZTQqzWa1KLAP9aEFD5DhJHfi6zK";

  const ifImAbleMetaData = {
    artist: "Caso Beats",
    title: "If I'm Able",
    genre: "Lofi",
    fileUrl: "http://localhost:8080/ipfs/QmfCBb8Lm9tP2yRAexr1TjQjUq4XMe86UWqUjVo9zvveTc",
  };

  const ifImAbleMeta = JSON.stringify(ifImAbleMetaData);

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-4xl text-white mb-6">This page is broken as shit due to Song.tsx refactoring</h1>
      {/* <Song songCID={testSong} metadataCID={testMeta} />
      <Song songCID={testSong2} metadataCID={testMeta2} />*/}
      <Song songCID={ifImAbleSong} metadataCID={ifImAbleMeta} />
    </div>
  );
};

export default Listen;
