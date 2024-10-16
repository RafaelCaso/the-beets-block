"use client";

import { useEffect, useState } from "react";
import { Address } from "./scaffold-eth";
import { formatEther } from "viem";

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

  useEffect(() => {
    const fetchPatronizeMusicians = async () => {
      try {
        const response = await fetch(
          "https://subgraph.satsuma-prod.com/4f495f562fa5/encode-club--740441/sound-scaffold-subgraph/api",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              query {
                patronizeMusicians {
                  id
                  songId
                  patron
                  artist
                  value
                }
              }
            `,
            }),
          },
        );

        const { data } = await response.json();

        if (data?.patronizeMusicians) {
          const patronsArray: Patronage[] = data.patronizeMusicians.map((patronage: any) => ({
            patron: patronage.patron,
            artist: patronage.artist,
            value: Number(formatEther(patronage.value)),
          }));
          setPatrons(patronsArray);
        }
      } catch (error) {
        console.error("Error fetching patronizeMusicians:", error);
      }
    };

    fetchPatronizeMusicians();
  }, []);

  useEffect(() => {
    const fetchProjectPatronize = async () => {
      try {
        const response = await fetch(
          "https://subgraph.satsuma-prod.com/4f495f562fa5/encode-club--740441/sound-scaffold-subgraph/api",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              query {
                patronizeProjects {
                  id
                  patron
                  value
                }
              }
            `,
            }),
          },
        );

        const { data } = await response.json();

        if (data?.patronizeProjects) {
          const projectPatronsArray: ProjectPatronage[] = data.patronizeProjects.map((patronage: any) => ({
            patron: patronage.patron,
            value: Number(formatEther(patronage.value)),
          }));
          setProjectPatrons(projectPatronsArray);
        }
      } catch (error) {
        console.error("Error fetching patronizeProjects:", error);
      }
    };

    fetchProjectPatronize();
  }, []);

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
