"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ArtistPortfolio from "./_components/ArtistPortfolio";
import { NextPage } from "next";

const Portfolio: NextPage = () => {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchParamsWrapper />
        </Suspense>
      </div>
    </>
  );
};

const SearchParamsWrapper = () => {
  const searchParams = useSearchParams();
  const artistAddress = searchParams?.get("artistAddress");

  return artistAddress ? <ArtistPortfolio artistAddress={artistAddress} /> : <div>Loading...</div>;
};

export default Portfolio;
