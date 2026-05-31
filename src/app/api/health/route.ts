import { NextResponse } from "next/server";

export async function GET() {
  const envStatus = {
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    hasElevenLabsKey: Boolean(process.env.ELEVENLABS_API_KEY),
    hasElevenLabsVoiceId: Boolean(process.env.ELEVENLABS_VOICE_ID),
  };

  const isHealthy = envStatus.hasOpenAIKey && envStatus.hasElevenLabsKey;

  return NextResponse.json({
    status: isHealthy ? "ok" : "error",
    message: isHealthy
      ? "Todas as chaves de API estão configuradas."
      : "Algumas chaves de API estão faltando no servidor.",
    envStatus,
  }, { status: isHealthy ? 200 : 500 });
}
