"use client";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <header
      className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 border-b border-blue-500/20 bg-blue-950/80 backdrop-blur-xl shadow-lg"
      role="banner"
      aria-label="Site Header"
    >
      {/* Logo / Brand */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative group-hover:scale-110 transition-transform duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 rounded-xl rotate-12"></div>
          <div className="absolute top-0 left-0 w-12 h-12 bg-blue-950 border-2 border-blue-400 rounded-xl -rotate-12 flex items-center justify-center">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-blue-300 text-transparent bg-clip-text">
              Base
            </span>
          </div>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-500 text-transparent bg-clip-text group-hover:scale-105 transition-transform duration-300">
          BaseFund
        </span>
      </Link>

      {/* Connected Wallet Info */}
      {isConnected ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-200 font-medium">
              {shortAddress}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
          >
            Logout
          </button>
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">Not connected</span>
      )}
    </header>
  );
}
