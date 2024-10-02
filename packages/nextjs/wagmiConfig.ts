import { createConfig, http } from "@wagmi/core";
import { hardhat, mainnet, optimism, sepolia } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, sepolia, hardhat, optimism],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http(),
    [optimism.id]: http(),
  },
});
