"use client";

import { useEffect, useState } from "react";
import { Address } from "./scaffold-eth";
import { formatEther } from "viem";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

interface Patronage {
  patron: string;
  artist: string;
  value: number;
}

interface ProjectPatronage {
  patron: string;
  value: number;
}

const Patrons = () => {
  const [patrons, setPatrons] = useState<Patronage[]>([]);
  const [, setProjectPatrons] = useState<ProjectPatronage[]>([]);

  const { data: patronEvents, isLoading: patronEventsLoading } = useScaffoldEventHistory({
    contractName: "SoundScaffold",
    eventName: "PatronizeMusician",
    fromBlock: 126147189n,
    watch: true,
  });

  useEffect(() => {
    if (!patronEventsLoading) {
      const patronsArray: Patronage[] = [];
      patronEvents?.forEach(e => {
        if (e.args.patron && e.args.artist && e.args.value) {
          patronsArray.push({
            patron: e.args.patron,
            artist: e.args.artist,
            value: Number(formatEther(e.args.value)),
          });
        }
      });
      setPatrons(patronsArray);
    }
  }, [patronEvents, patronEventsLoading]);

  const { data: projectPatronEvents, isLoading: projectPatronsIsLoading } = useScaffoldEventHistory({
    contractName: "SoundScaffold",
    eventName: "PatronizeProject",
    fromBlock: 126147189n,
    watch: true,
  });

  useEffect(() => {
    if (!projectPatronsIsLoading) {
      const projectPatronsArray: ProjectPatronage[] = [];
      projectPatronEvents?.forEach(e => {
        if (e.args.patron && e.args.value) {
          projectPatronsArray.push({
            patron: e.args.patron,
            value: Number(formatEther(e.args.value)),
          });
        }
      });

      setProjectPatrons(projectPatronsArray);
    }
  }, [projectPatronEvents, projectPatronsIsLoading]);

  return (
    <>
      <div className="flex flex-col items-center w-full">
        {patrons.length > 0 ? (
          patrons.map((item, index) => (
            <div key={index} className="flex items-center justify-between w-1/2 my-2 p-4 bg-gray-600 rounded-lg shadow">
              <span>
                <Address address={item.patron} />
              </span>
              <span className="mx-2">contributed {item.value} ETH to</span>
              <span>
                <Address address={item.artist} />
              </span>
            </div>
          ))
        ) : (
          <p className="text-center">...</p>
        )}
      </div>
    </>
  );
};

export default Patrons;
