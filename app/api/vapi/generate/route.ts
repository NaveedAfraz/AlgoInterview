import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin"; // Assuming this path is correct
import { getRandomInterviewCover } from "@/lib/utils"; // Assuming this path is correct

export async function GET() {
  return Response.json({ success: true, data: "Hello World" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Incoming Vapi Webhook Body (Direct Properties):", JSON.stringify(body, null, 2)); // Log the full body for inspection

  try {
    // Access the properties directly from the 'body' object
    // Vercel logs confirmed these are top-level properties in the POST body.
    const { type, role, level, amount, techstack, userid } = body; // userid might be missing if not explicitly passed

    // Add checks for undefined values if 'userid' or others might not always be present
    if (!role || !type || !level || !amount || !techstack) {
        console.error("Missing required parameters in Vapi webhook body.");
        return Response.json(
            { success: false, error: "Missing required parameters (role, type, level, amount, techstack)." },
            { status: 400 }
        );
    }

    console.log("Parsed Request Body Parameters:");
    console.log("type", type);
    console.log("role", role);
    console.log("level", level);
    console.log("techstack", techstack);
    console.log("amount", amount);
    console.log("userid", userid); // Will be undefined if not sent by Vapi

    const { text: questions } = await generateText({
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
      userid: userid, // userid will be undefined if not provided in Vapi webhook
      createdAt: new Date().toISOString(),
      questions: JSON.parse(questions),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/vapi/generate:", error);
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}