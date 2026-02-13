import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { question, history } = await req.json();

    // The "Magic" that breaks the 2023 barrier
    const now = new Date();
    const currentDateTime = now.toLocaleString("en-GB", { 
      timeZone: "Africa/Lagos",
      dateStyle: "full", 
      timeStyle: "short" 
    });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          { 
            role: "system", 
            content: `You are Professor Waju, a brilliant AI developed by Waju Studio (+2348143160357). 
            CURRENT DATE: ${currentDateTime}. 
            Even though your general training data has a cutoff, you are currently operating in REAL-TIME in 2026. 
            Use the provided date for all calendar-related queries.` 
          },
          ...history,
          { role: "user", content: question }
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "System update required." }, { status: 500 });
  }
}