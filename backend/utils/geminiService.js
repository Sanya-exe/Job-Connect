import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const summarizeJob = async (job) => {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
You MUST summarize the job below.

If job details are missing or empty, reply ONLY with:
"No job data provided"

Do NOT ask for input.
Do NOT give examples.
Do NOT explain anything.

Keep output short (max 3 points each).

Format:

Key Responsibilities:
• ...
• ...

Important Skills:
• ...
• ...

Experience Needed:
• ...

Job details:
Title: ${job?.title || "Not provided"}
Company: ${job?.company || "Not provided"}
Location: ${job?.city || ""}, ${job?.country || ""}
Experience Level: ${job?.experienceLevel || "Not provided"}
Skills: ${job?.skillsRequired?.join(", ") || "Not specified"}

Description:
${job?.description || "Not provided"}
`;
  const result = await model.generateContent(prompt);
 

  const response = await result.response;

  return response.text();
};