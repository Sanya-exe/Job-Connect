import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const summarizeJob = async (job) => {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
Summarize the following job in simple bullet points.

Title: ${job.title}
Company: ${job.company}
Category: ${job.category}
Location: ${job.city}, ${job.country}
Experience: ${job.experienceLevel}

Skills Required:
${job.skillsRequired?.join(", ")}

Job Description:
${job.description}

Return:
• key responsibilities
• important skills
• experience needed
`;

  const result = await model.generateContent(prompt);
  console.log(result);

  const response = await result.response;

  return response.text();
};