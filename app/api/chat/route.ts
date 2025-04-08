import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { provider, model, prompt } = body;

  if (!provider || !model || !prompt) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  try {
    if (provider === "openai") {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
      });

      return Response.json({ response: completion.choices[0].message.content });
    }

    if (provider === "gemini") {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined");
      }
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model });
      const result = await geminiModel.generateContent(prompt);

      return Response.json({ response: result.response.text() });
    }

    return new Response(JSON.stringify({ error: "Invalid provider" }), { status: 400 });
  } catch (error: any) {
    console.error("❌ OpenAI or Gemini error:", error); // ✅ Add this line
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }  
}
