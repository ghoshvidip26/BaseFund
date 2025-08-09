"use client";

import { useState } from "react";
import Image from "next/image";
import { useContractWrite } from "wagmi";
import { contractABI } from "../contracts/abi";

export default function ProjectForm() {
  const contractAddress = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  const { writeContractAsync } = useContractWrite();

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

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.creatorName.trim())
      newErrors.creatorName = "Creator name is required";
    if (!form.fundingGoal || parseFloat(form.fundingGoal) <= 0)
      newErrors.fundingGoal = "Enter a valid funding goal";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (!form.category) newErrors.category = "Select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateImageAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:3001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description }),
      });
      const data = await res.json();
      const url = `data:image/png;base64,${data.base64}`;
      setImageUrl(url);

      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "createProject",
        args: [
          url,
          form.title,
          form.description,
          form.contributors.split(",").map((c) => c.trim()),
        ],
      });

      await fetch("/api/projectlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: url,
          fundingGoal: parseFloat(form.fundingGoal),
          minContribution: parseFloat(form.minContribution || "0"),
        }),
      });

      alert("Project created successfully!");
    } catch (error) {
      console.error(error);
      alert("Error creating project");
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

        <form
          onSubmit={generateImageAndSubmit}
          className="grid gap-6 md:grid-cols-2"
        >
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
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="art">Art & Creative</option>
              <option value="music">Music</option>
              <option value="film">Film & Video</option>
              <option value="games">Games</option>
              <option value="education">Education</option>
              <option value="health">Health & Wellness</option>
              <option value="environment">Environment</option>
              <option value="community">Community</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {imageUrl && (
            <div className="md:col-span-2 bg-gray-50 border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                Generated Image Preview:
              </p>
              <Image
                src={imageUrl}
                alt="Generated project"
                width={800}
                height={400}
                className="w-full rounded-lg"
              />
            </div>
          )}

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
