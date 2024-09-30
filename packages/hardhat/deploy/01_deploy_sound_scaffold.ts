import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deploySoundScaffold: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("SoundScaffold", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  const ownerAddress = "0xd1B41bE30F980315b8A6b754754aAa299C7abea2";

  const soundScaffold = await hre.ethers.getContract<Contract>("SoundScaffold", deployer);
  const soundScaffoldAddress = await soundScaffold.getAddress();
  const transferOwnership = await soundScaffold.transferOwnership(ownerAddress);
  console.log("Ownership transferred:", transferOwnership);
  console.log("Sound Scaffold deployed to:", soundScaffoldAddress);
};

export default deploySoundScaffold;

deploySoundScaffold.tags = ["SoundScaffold"];
