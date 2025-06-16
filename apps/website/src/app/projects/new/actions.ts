"use server";

import { createProject } from "@mvp/database";
import { revalidatePath } from "next/cache";

interface CreateProjectData {
  name: string;
  description?: string;
  ownerId: string;
}

export async function createProjectAction(data: CreateProjectData) {
  try {
    const project = await createProject(data);
    revalidatePath("/projects");
    return project;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw new Error("Failed to create project");
  }
}
