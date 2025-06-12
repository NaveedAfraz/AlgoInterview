import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function GET() {
  return Response.json({ success: true, data: "Hello World" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Incoming Vapi Webhook Body:", JSON.stringify(body, null, 2)); // Log the full body for inspection

  try {
    // Safely access nested properties
    const message = body?.message;
    const toolCallList = message?.toolCallList;

    if (!toolCallList || toolCallList.length === 0) {
      console.error("Vapi webhook did not contain expected toolCallList.");
      // You might want to handle other Vapi webhook types here if necessary
      // For now, return an error or a success if this specific endpoint
      // only handles tool calls.
      return Response.json(
        { success: false, error: "Expected toolCallList not found in webhook body." },
        { status: 400 } // Bad Request because the payload structure is not what's expected for this operation
      );
    }

    const functionCall = toolCallList[0]?.function;

    if (!functionCall || !functionCall.arguments) {
      console.error("Vapi webhook toolCallList did not contain expected function arguments.");
      return Response.json(
        { success: false, error: "Function arguments not found in tool call." },
        { status: 400 }
      );
    }

    const { type, role, level, techstack, amount, userid } = JSON.parse(
      functionCall.arguments
    );

    console.log("Parsed Tool Call Arguments:");
    console.log("type", type);
    console.log("role", role);
    console.log("level", level);
    console.log("techstack", techstack);
    console.log("amount", amount);
    console.log("userid", userid);

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
      userid: userid,
      createdAt: new Date().toISOString(),
      questions: JSON.parse(questions),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/vapi/generate:", error); // Use console.error for errors
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}