const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

export async function synthesizeSpeech(text: string): Promise<ReadableStream> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as Record<string, Record<string, string>>)?.detail?.message ||
        `ElevenLabs error: ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error("No response body from ElevenLabs");
  }

  return response.body;
}
