"use client";

import { useEffect, useState } from "react";
import { Address } from "./scaffold-eth";
import { formatEther } from "viem";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

interface ProjectPatronage {
  patron: string;
  value: number;
}

const ProjectPatrons = () => {
  const [projectPatrons, setProjectPatrons] = useState<ProjectPatronage[]>([]);

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
        {projectPatrons.length > 0 ? (
          projectPatrons.map((item, index) => (
            <div key={index} className="flex items-center justify-between w-1/2 my-2 p-4 bg-gray-600 rounded-lg shadow">
              <span>
                <Address address={item.patron} />
              </span>
              <span className="mx-2">contributed {item.value} ETH to</span>
              <span>SoundScaffold!</span>
            </div>
          ))
        ) : (
          <p className="text-center">No Patrons yet. Be the first and contribute to SoundScaffold!</p>
        )}
      </div>
    </>
  );
};

export default ProjectPatrons;
