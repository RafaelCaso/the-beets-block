import { useState } from "react";
import { EtherInput } from ".";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface PatronizeArtistProps {
  title: string;
  artistAddress: string;
  songId: number;
  closeModal: () => void;
}

const PatronizeArtist: React.FC<PatronizeArtistProps> = ({ title, artistAddress, songId, closeModal }) => {
  const [contributionAmount, setContributionAmount] = useState("");

  const { writeContractAsync: writeSoundScaffoldAsync } = useScaffoldWriteContract("SoundScaffold");

  const { address: connectedAddress } = useAccount();

  const handleContributeBtn = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet to contribute");
      closeModal();
      return;
    }
    await writeSoundScaffoldAsync({
      functionName: "contribute",
      args: [artistAddress, BigInt(songId)],
      value: parseEther(contributionAmount),
    });

    notification.success("Thank you so much for patroning the arts! You're an absolute legend.");
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg text-black font-semibold mb-4">Contribute to {title}</h2>
        <EtherInput value={contributionAmount} onChange={e => setContributionAmount(e)} />
        <div className="pt-6">
          <button onClick={handleContributeBtn} className="bg-orange-500 text-white p-2 rounded-lg w-full">
            Confirm Contribution
          </button>
        </div>
        <button onClick={closeModal} className="mt-4 text-gray-600 underline">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PatronizeArtist;
