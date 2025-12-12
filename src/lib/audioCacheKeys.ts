export type DialogueTurnForCacheKey = { text: string; voiceId: string };

const CACHE_KEY_VERSION = 1;

function cyrb53Hex(input: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const result = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return result.toString(16).padStart(13, "0");
}

async function sha256Hex(input: string): Promise<string> {
  const cryptoObj = globalThis.crypto;
  const bytes = new TextEncoder().encode(input);
  const digest = await cryptoObj.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashHex(input: string): Promise<string> {
  try {
    return await sha256Hex(input);
  } catch {
    // Fall back below.
  }

  return cyrb53Hex(input);
}

export async function makeLineAudioCacheKey(params: {
  text: string;
  voiceId: string;
  modelId: string;
  outputFormat?: string;
}): Promise<string> {
  const payload = {
    v: CACHE_KEY_VERSION,
    type: "line",
    modelId: params.modelId,
    outputFormat: params.outputFormat ?? "mp3_44100_128",
    voiceId: params.voiceId,
    text: params.text,
  };

  return `audio:line:v${CACHE_KEY_VERSION}:${await hashHex(JSON.stringify(payload))}`;
}

export async function makeDialogueAudioCacheKey(params: {
  turns: DialogueTurnForCacheKey[];
  modelId: string;
  outputFormat?: string;
}): Promise<string> {
  const payload = {
    v: CACHE_KEY_VERSION,
    type: "dialogue",
    modelId: params.modelId,
    outputFormat: params.outputFormat ?? "mp3_44100_128",
    turns: params.turns,
  };

  return `audio:dialogue:v${CACHE_KEY_VERSION}:${await hashHex(JSON.stringify(payload))}`;
}
