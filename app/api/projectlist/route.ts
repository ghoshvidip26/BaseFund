import dbConnect from "@/app/models/mongodb";
import Project from "@/app/models/Project";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { title, description, contributors, imageUrl } = await request.json();
    const newProject = new Project({
      title,
      description,
      contributors,
      imageUrl,
    });
    await newProject.save();
    return new Response(JSON.stringify(newProject), { status: 201 });
  } catch (error) {
    console.log("Server-error", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { title: string } }) {
  try {
    await dbConnect();
    const { title } = params;
    const project = await Project.findOne({ title });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(project), { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch project" }), { status: 500 });
  }
}
