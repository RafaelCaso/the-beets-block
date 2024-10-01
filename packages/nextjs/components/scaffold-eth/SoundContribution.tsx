"use client";

import { useState } from "react";
import { EtherInput } from ".";
import { parseEther } from "viem";
import { useWalletClient } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

const SoundContributionFooter: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const { data: walletClient } = useWalletClient();

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const handleContributeBtn = async () => {
    const tx = {
      to: contractAddress,
      value: parseEther(contributionAmount),
    };

    try {
      await walletClient?.sendTransaction(tx);
      notification.success("Thank you for contributing!");
      closeModal();
    } catch (error) {
      notification.error("Something went wrong");
      console.error(error);
      closeModal();
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-4 right-8 z-50">
        <button
          onClick={openModal}
          className="bg-orange-500 text-white p-2 rounded-lg transition-colors hover:bg-orange-600"
        >
          Contribute to SoundScaffold
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg text-black font-semibold mb-4">
              Contributions to the Sound Scaffold project are greatly appreciated!
            </h2>
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
      )}
    </>
  );
};

export default SoundContributionFooter;
