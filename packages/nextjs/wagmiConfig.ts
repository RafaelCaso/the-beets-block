import { createConfig, http } from "@wagmi/core";
import { hardhat, mainnet, sepolia } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http(),
  },
});
