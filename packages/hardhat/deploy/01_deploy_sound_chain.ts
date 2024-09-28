import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deploySoundChain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("SoundChain", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  const ownerAddress = "0xd1B41bE30F980315b8A6b754754aAa299C7abea2";

  // Get the deployed contract to interact with it after deploying.
  const soundChain = await hre.ethers.getContract<Contract>("SoundChain", deployer);
  const soundChainAddress = await soundChain.getAddress();
  const transferOwnership = await soundChain.transferOwnership(ownerAddress);
  console.log("Ownership transferred:", transferOwnership);
  console.log("SoundChain deployed to:", soundChainAddress);
};

export default deploySoundChain;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deploySoundChain.tags = ["SoundChain"];
