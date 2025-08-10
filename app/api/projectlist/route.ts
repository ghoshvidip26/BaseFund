import dbConnect from "@/app/models/mongodb";
import Project from "@/app/models/Project";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const {
      title,
      description,
      imageUrl,
      fundingGoal,
      deadline,
      creatorName,
      contributors,
      category,
      websiteUrl,
    } = await request.json();

    const cleanedContributors = Array.isArray(contributors)
      ? contributors.filter((c) => c.trim() !== "")
      : [];

    const newProject = new Project({
      title,
      description,
      imageUrl,
      fundingGoal,
      deadline,
      creatorName,
      contributors: cleanedContributors,
      category,
      websiteUrl,
    });
    await newProject.save();
    return new Response(JSON.stringify(newProject.toObject()), { status: 201 });
  } catch (error) {
    console.log("Server-error", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const projects = await Project.find();
    console.log("Fetched projects:", projects);
    return new Response(JSON.stringify(projects), { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch projects" }), {
      status: 500,
    });
  }
}
