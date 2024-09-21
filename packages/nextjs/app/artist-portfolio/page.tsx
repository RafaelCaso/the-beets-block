"use client";

import { useSearchParams } from "next/navigation";
import ArtistPortfolio from "./_components/ArtistPortfolio";
import { NextPage } from "next";

const Portfolio: NextPage = () => {
  const searchParams = useSearchParams();
  const artistAddress = searchParams?.get("artistAddress");

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
