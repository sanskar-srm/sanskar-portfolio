"use server";

import { refineProjectDescription, type RefineProjectDescriptionInput } from "@/ai/flows/refine-project-descriptions";

export async function refineDescriptionAction(input: RefineProjectDescriptionInput) {
  try {
    const result = await refineProjectDescription(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("AI refinement failed:", error);
    return { success: false, error: "Failed to refine description." };
  }
}
