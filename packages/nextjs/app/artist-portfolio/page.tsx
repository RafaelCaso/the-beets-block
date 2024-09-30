"use client";

import { useSearchParams } from "next/navigation";
import ArtistPortfolio from "./_components/ArtistPortfolio";
import { NextPage } from "next";

const Portfolio: NextPage = () => {
  const searchParams = useSearchParams();
  const artistAddress = searchParams?.get("artistAddress");

  if (!artistAddress) {
    return (
      <>
        <div>loading ...</div>
      </>
    );
  }
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <ArtistPortfolio artistAddress={artistAddress} />
      </div>
    </>
  );
};

export default Portfolio;
