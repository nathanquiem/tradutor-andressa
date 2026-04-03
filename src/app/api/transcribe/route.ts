import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const result = await transcribeAudio(audioFile);

    return NextResponse.json({
      text: result.text,
      detectedLanguage: result.detectedLanguage,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
