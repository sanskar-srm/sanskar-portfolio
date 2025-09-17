"use server";

import { refineProjectDescription, type RefineProjectDescriptionInput } from "@/ai/flows/refine-project-descriptions";
import { sendEmail, type SendEmailInput } from "@/ai/flows/send-email";

export async function refineDescriptionAction(input: RefineProjectDescriptionInput) {
  try {
    const result = await refineProjectDescription(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("AI refinement failed:", error);
    return { success: false, error: "Failed to refine description." };
  }
}

export async function sendEmailAction(input: SendEmailInput) {
    try {
        await sendEmail(input);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error: "Failed to send email." };
    }
}
