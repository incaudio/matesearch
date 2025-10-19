// Stub file for compatibility - OpenAI features removed to reduce bundle size
import { VibeMatchResult } from "@shared/schema";


const MUSICAL_VIBES = [
  "energetic", "calm", "melancholic", "upbeat", "dreamy", "intense", "romantic", "mysterious",
  "joyful", "nostalgic", "powerful", "gentle", "dark", "bright", "ethereal", "groovy",
  "chill", "aggressive", "soothing", "euphoric", "ambient", "dramatic", "playful", "epic",
  "funky", "moody", "triumphant", "haunting", "sensual", "rebellious", "peaceful", "cinematic",
  "bluesy", "jazzy", "electronic", "acoustic", "orchestral", "minimalist", "maximalist", "experimental",
  "retro", "futuristic", "organic", "synthetic", "rhythmic", "melodic", "harmonic", "dissonant",
  "uplifting", "depressing", "hopeful", "anxious", "confident", "vulnerable", "angry", "loving",
  "spiritual", "secular", "meditative", "chaotic", "structured", "flowing", "staccato", "legato",
  "major", "minor", "chromatic", "pentatonic", "modal", "atonal", "tonal", "polytonal",
  "fast", "slow", "moderate", "accelerating", "decelerating", "rubato", "steady", "syncopated",
  "loud", "soft", "dynamic", "static", "crescendo", "diminuendo", "forte", "piano",
  "bright", "warm", "cold", "raw", "polished", "lo-fi", "hi-fi", "vintage",
  "danceable", "contemplative", "hypnotic", "catchy", "complex", "simple", "layered", "sparse",
  "vocal-heavy", "instrumental", "a cappella", "symphonic", "chamber", "solo", "ensemble", "choir",
  "traditional", "modern", "fusion", "crossover", "genre-bending", "pure", "hybrid", "eclectic",
  "repetitive", "varied", "progressive", "regressive", "circular", "linear", "cyclical", "evolving",
  "tribal", "urban", "rural", "cosmic", "earthly", "celestial", "infernal", "neutral",
  "masculine", "feminine", "androgynous", "youthful", "mature", "timeless", "dated", "contemporary",
  "commercial", "underground", "mainstream", "niche", "accessible", "challenging", "familiar", "novel",
  "emotional", "intellectual", "physical", "spiritual", "mental", "visceral", "cerebral", "primal",
  "sociable", "solitary", "communal", "individual", "collective", "personal", "universal", "specific",
  "celebratory", "mourning", "reflective", "reactive", "proactive", "passive", "active", "interactive",
  "narrative", "abstract", "literal", "metaphorical", "symbolic", "direct", "indirect", "implicit",
  "improvised", "composed", "arranged", "produced", "raw", "refined", "rough", "smooth",
  "textured", "clean", "distorted", "pure", "mixed", "blended", "separated", "unified",
  "organic", "mechanical", "natural", "artificial", "analog", "digital", "hybrid", "authentic",
  "imitative", "original", "derivative", "innovative", "conventional", "unconventional", "traditional", "revolutionary"
];

export async function analyzeVibeFromAudio(audioBase64: string): Promise<VibeMatchResult> {
  try {
    // Convert base64 to buffer for Whisper transcription
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Save to temporary file for Whisper
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    
    const tempFilePath = path.join(os.tmpdir(), `vibe-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // All OpenAI/Whisper/audio features removed. Only text-based vibe match is supported now.
    // This file is now a stub for compatibility.
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    // Return a basic vibe match result
    return {
      vibes: ["mysterious", "ambient", "experimental"],
      confidence: 0.5,
      description: "Audio vibe analysis is not currently supported. Please use text-based search."
    };
  } catch (error) {
    console.error('Error analyzing audio vibe:', error);
    throw new Error('Failed to analyze audio vibe');
  }
}
