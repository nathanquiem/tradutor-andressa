import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(file: File): Promise<{
  text: string;
  detectedLanguage: string;
}> {
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json",
  });

  return {
    text: transcription.text,
    detectedLanguage: transcription.language ?? "unknown",
  };
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the user's text to ${targetLanguage}. Return only the translated text, nothing else.`,
      },
      { role: "user", content: text },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content?.trim() ?? "";
}
