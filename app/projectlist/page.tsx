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

  const contributeToProject = async (projectId: number) => {
    try {
      setStatus("Sending transaction...");
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "contribute",
        args: [projectId, address], // assume contract expects (uint256, address)
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
        const res = await axios.get("/api/projectlist"); // Ensure this endpoint returns { projectId, title, ... }
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 to-amber-200 text-white px-6 flex items-center justify-center py-10">
      <div className="max-w-7xl mx-auto w-full">
        {loading ? (
          <p className="text-white text-center text-lg">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-white text-center text-lg">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow-lg p-6 text-black"
              >
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                  unoptimized
                />
                <h2 className="text-xl font-bold mb-2">{project.title}</h2>
                <p className="text-gray-700 mb-4">{project.description}</p>
                <p className="text-gray-500 text-sm mb-2">
                  Contributors:{" "}
                  {Array.isArray(project.contributors)
                    ? project.contributors.slice(0, 3).join(", ") +
                      (project.contributors.length > 3 ? "..." : "")
                    : project.contributors}
                </p>
                <button
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  onClick={() => contributeToProject(project.projectId)}
                >
                  Contribute
                </button>
              </div>
            ))}
          </div>
        )}
        {status && (
          <p className="text-white text-center mt-6 text-md font-medium">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
