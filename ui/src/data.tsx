import type { SpeechWithMetadata } from "./types/emotion";

// This will be loaded dynamically from speeches.json
// For now, export an empty array as a placeholder
export let speeches: SpeechWithMetadata[] = [];

// Function to load speeches from JSON file
export async function loadSpeeches(): Promise<SpeechWithMetadata[]> {
  try {
    const response = await fetch("/speeches.json");
    if (!response.ok) {
      throw new Error(`Failed to load speeches: ${response.statusText}`);
    }
    const data = await response.json();
    speeches = data;
    return data;
  } catch (error) {
    console.error("Error loading speeches:", error);
    // Return fallback data if loading fails
    return [];
  }
}

