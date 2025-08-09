"use client";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
} from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function Page() {
  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <main className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white flex flex-col justify-center items-center px-6 py-10">
          <div className="text-center max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
              Welcome to BaseFund
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 font-light">
              A decentralized platform to launch, fund, and support impactful
              public projects with blockchain transparency on Base.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/projectform"
                className="bg-white hover:bg-gray-100 text-blue-900 font-semibold px-6 py-3 rounded-lg transition-transform transform hover:scale-105 shadow-md"
              >
                🚀 Go to Dashboard
              </Link>
              <Link
                href="/projectlist"
                className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-transform transform hover:scale-105 shadow-md"
              >
                🔍 Explore Projects
              </Link>
            </div>
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-blue-300">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              Connect Your Wallet
            </h2>
            <Wallet>
              <ConnectWallet />
              <WalletDropdown>
                <WalletAdvancedWalletActions />
                <WalletAdvancedAddressDetails />
                <WalletAdvancedTransactionActions />
                <WalletAdvancedTokenHoldings />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      )}
    </>
  );
}
