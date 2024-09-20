"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ArtistPortfolio from "./_components/ArtistPortfolio";
import { NextPage } from "next";

const Portfolio: NextPage = () => {
  const searchParams = useSearchParams();
  const artistAddress = searchParams?.get("artistAddress");
  const testAddress = "0xd1B41bE30F980315b8A6b754754aAa299C7abea2";

  console.log(artistAddress);

  if (!artistAddress) {
    return (
      <>
        <div>loading ...</div>
      </>
    );
  }
  return (
    <>
      <h1>Artist Portfolio Page</h1>
      <ArtistPortfolio artistAddress={artistAddress} />
    </>
  );
};

export default Portfolio;
