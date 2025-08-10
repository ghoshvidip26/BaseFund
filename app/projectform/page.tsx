"use client";

import { useState } from "react";
import Image from "next/image";
import { useContractWrite } from "wagmi";
import { contractABI } from "../contracts/abi";
import axios from "axios";
import { useUpload } from "../context/context"; // your custom upload hook

export default function ProjectForm() {
  const { uploadUrl, setUploadUrl } = useUpload();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const { writeContractAsync } = useContractWrite();
  console.log("Contract Address:", contractAddress);
  const [form, setForm] = useState({
    title: "",
    description: "",
    contributors: "",
    fundingGoal: "",
    endDate: "",
    category: "",
    creatorName: "",
    websiteUrl: "",
    minContribution: "",
  });

  // const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Upload image file to Pinata
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      const uploadRequest = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload Request:", uploadRequest);
      const response = await uploadRequest.json();
      console.log("Upload Response:", response.url);
      setUploadUrl(response.url);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("File upload failed. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };
  console.log("Upload URL:", uploadUrl);
  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const fundingGoalEth = parseFloat(form.fundingGoal);
    if (isNaN(fundingGoalEth) || fundingGoalEth <= 0) {
      alert("Please enter a valid funding goal greater than 0");
      return;
    }
    const fundingGoalWei = BigInt(Math.round(fundingGoalEth * 1e18));

    const deadlineUnix = Math.floor(new Date(form.endDate).getTime() / 1000);
    if (deadlineUnix <= Math.floor(Date.now() / 1000)) {
      alert("Please choose a future deadline date.");
      return;
    }

    if (!uploadUrl) {
      alert("Project image is required");
      return;
    }

    try {
      setLoading(true);
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "createProject",
        args: [
          uploadUrl,
          form.title,
          form.description,
          fundingGoalWei,
          deadlineUnix,
          form.websiteUrl || "",
          form.category,
        ],
      });
      console.log("Transaction sent:", tx);

      const mongoPayload = {
        title: form.title,
        description: form.description,
        imageUrl: uploadUrl,
        fundingGoal: fundingGoalEth,
        deadline: deadlineUnix,
        creatorName: form.creatorName,
        contributors: form.contributors.split(",").map((c) => c.trim()),
        category: form.category,
        websiteUrl: form.websiteUrl,
      };
      const mongoRes = await axios.post("/api/projectlist", mongoPayload);
      console.log("MongoDB response:", mongoRes.data);
      alert("Project created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating project, check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">
          Create a New Project
        </h2>

        <form onSubmit={submitProject} className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Upload Project Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="p-2 border rounded-lg"
              disabled={loading}
            />
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>
          {/* Show uploaded image preview */}
          {uploadUrl && (
            <div className="md:col-span-2 bg-gray-50 border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <Image
                src={uploadUrl}
                alt="Uploaded project"
                width={800}
                height={400}
                className="w-full rounded-lg"
              />
            </div>
          )}
          {/* The rest of your inputs */}
          {[
            {
              id: "title",
              label: "Project Title *",
              type: "text",
              placeholder: "Enter project name",
            },
            {
              id: "description",
              label: "Description *",
              type: "textarea",
              placeholder: "Describe your project",
            },
            {
              id: "creatorName",
              label: "Creator / Organization *",
              type: "text",
              placeholder: "Your name or org",
            },
            {
              id: "fundingGoal",
              label: "Funding Goal (ETH) *",
              type: "number",
              placeholder: "e.g. 10",
              min: "0",
              step: "0.0001",
            },
            { id: "endDate", label: "Campaign End Date *", type: "date" },
            {
              id: "minContribution",
              label: "Minimum Contribution (ETH)",
              type: "number",
              placeholder: "Optional",
            },
            {
              id: "contributors",
              label: "Contributors",
              type: "text",
              placeholder: "comma-separated addresses",
            },
            {
              id: "websiteUrl",
              label: "Website / Social Media",
              type: "url",
              placeholder: "https://example.com",
            },
          ].map((field) => (
            <div key={field.id} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  rows={4}
                  placeholder={field.placeholder}
                  value={form[field.id as keyof typeof form]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="p-3 text-black border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.id as keyof typeof form]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="p-3 text-black border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              )}
              {errors[field.id] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg text-white font-semibold shadow-md transition ${
                loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating Project..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
