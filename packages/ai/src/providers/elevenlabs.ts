export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

export interface TextToSpeechOptions {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface TextToSpeechResult {
  audio_url?: string;
  audio_base64?: string;
  contentType: string;
}

export async function generateVoice(
  text: string,
  options?: {
    voice?: string;
    model?: string;
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  },
): Promise<TextToSpeechResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is required for voice generation");
  }

  const voiceId = options?.voice || "21m00Tcm4TlvDq8ikWAM"; // Default voice (Rachel)
  const modelId = options?.model || "eleven_monolingual_v1";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarity_boost ?? 0.5,
          style: options?.style ?? 0,
          use_speaker_boost: options?.use_speaker_boost ?? true,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();
  
  // Convert ArrayBuffer to base64
  const uint8Array = new Uint8Array(audioBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const audioBase64 = btoa(binary);

  return {
    audio_base64: audioBase64,
    contentType: "audio/mpeg",
  };
}

export async function getVoices(): Promise<ElevenLabsVoice[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is required");
  }

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.statusText}`);
  }

  const data = await response.json();
  return data.voices;
}