import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAddress } from "viem";
import { useEnsAvatar, useEnsName } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";

type AvatarProps = {
  address?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "10xl";
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
  "4xl": 18,
  "5xl": 21,
  "6xl": 24,
  "7xl": 27,
  "8xl": 30,
  "9xl": 33,
  "10xl": 40,
};
export const Avatar = ({ address, size = "base" }: AvatarProps) => {
  const router = useRouter();
  const avatarImage = address || "0x000000000000000000000000000000000000dead";

  const [, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const checkSumAddress = getAddress(avatarImage);

  const { data: fetchedEnsName } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
  });

  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEnsName || undefined,
    chainId: 1,
  });

  useEffect(() => {
    setEnsName(fetchedEnsName ?? null);
  }, [fetchedEnsName]);

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar ?? null);
  }, [fetchedEnsAvatar]);

  const handleClick = () => {
    router.push("/artist-portfolio?artistAddress=" + address);
  };

  return (
    <div onClick={handleClick} className="flex rounded-full items-center hover:scale-105 cursor-pointer">
      {ensAvatar ? (
        <img
          src={ensAvatar}
          alt="ENS Avatar"
          className="rounded-full w-12 h-12"
          style={{
            width: `${(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}px`,
            height: `${(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}px`,
          }}
        />
      ) : (
        <BlockieAvatar address={checkSumAddress} size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]} />
      )}
    </div>
  );
};
