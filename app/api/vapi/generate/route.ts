import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin"; // Assuming this path is correct
import { getRandomInterviewCover } from "@/lib/utils";

export async function GET() {
  return Response.json({ success: true, data: "Hello World" }, { status: 200 });
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid, coverImage } =
    await request.json();

  try {
    const { text: questions } = await generateText({
      // Pass the apiKey directly to the google() function here:
      model: google("gemini-2.0-flash-001", {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      }),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]

        Thank you! <3
    `,
    });
    const interview = {
      type,
      role,
      level,
      techstack: techstack.split(","),
      finalized: true,
      coverImage: getRandomInterviewCover(),
      amount,
      userid: userid,
      createdAt: new Date().toISOString(),
      questions: JSON.parse(questions),
    };
    await db.collection("interviews").add(interview);
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
