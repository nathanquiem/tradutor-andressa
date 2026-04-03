import { NextRequest } from "next/server";
import { synthesizeSpeech } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const audioStream = await synthesizeSpeech(text);

    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Synthesis failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
