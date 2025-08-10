"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useContractWrite, useAccount } from "wagmi";
import { contractABI } from "../contracts/abi";

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const { writeContractAsync } = useContractWrite();
  const { address } = useAccount();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const contributeToProject = async (title: string) => {
    try {
      setStatus("Sending transaction...");
      const tx = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "contribute",
        args: [title],
        value: BigInt("100000000000000000"), // 0.001 ETH as example contribution
      });
      setStatus("Transaction sent! 🎉");
      console.log("Transaction hash:", tx);
    } catch (err) {
      setStatus("Transaction failed ❌");
      console.error("Contribution error:", err);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/projectlist");
        console.log("Fetched projects:", res.data);
        setProjects(res.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            Discover Projects
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Support innovative projects and help bring ideas to life through
            blockchain crowdfunding
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-4 text-lg">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Projects Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to create an innovative project!
              </p>
              <a
                href="/projectform"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Create Project
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 group"
              >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
                      {project.category || "General"}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      Project #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {project.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description.length > 120
                      ? project.description.substring(0, 120) + "..."
                      : project.description}
                  </p>

                  {/* Creator Info */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {project.creatorName?.charAt(0).toUpperCase() || "A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {project.creatorName || "Anonymous Creator"}
                      </p>
                      <p className="text-xs text-gray-500">Project Creator</p>
                    </div>
                  </div>

                  {/* Funding Information */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-blue-800">
                        Goal: {project.fundingGoal || 0} ETH
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {project.endDate &&
                        new Date(project.endDate) > new Date()
                          ? `${Math.ceil(
                              (new Date(project.endDate).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days left`
                          : "Campaign Ended"}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>0 ETH raised</span>
                      <span>0% funded</span>
                    </div>
                  </div>

                  {/* Contributors Section */}
                  {project.contributors &&
                    Array.isArray(project.contributors) &&
                    project.contributors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Contributors
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {project.contributors
                              .slice(0, 4)
                              .map((contributor: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white flex items-center justify-center"
                                  title={contributor}
                                >
                                  <span className="text-xs font-medium text-white">
                                    {contributor.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              ))}
                            {project.contributors.length > 4 && (
                              <div className="w-7 h-7 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  +{project.contributors.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {project.contributors.length} supporter
                            {project.contributors.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Website Link */}
                  {project.websiteUrl && (
                    <div className="mb-4">
                      <a
                        href={project.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          ></path>
                        </svg>
                        Visit Project Website
                      </a>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => contributeToProject(project.title)}
                    disabled={!address}
                  >
                    {!address
                      ? "Connect Wallet to Contribute"
                      : "Contribute 0.01 ETH"}
                  </button>

                  {/* Min Contribution Info */}
                  {project.minContribution && project.minContribution > 0 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Minimum contribution: {project.minContribution} ETH
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Toast */}
        {status && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white border-l-4 border-blue-500 text-gray-800 px-6 py-4 rounded-lg shadow-lg max-w-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {status.includes("🎉") ? (
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  ) : status.includes("❌") ? (
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  ) : (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{status}</p>
                </div>
                <button
                  onClick={() => setStatus("")}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
