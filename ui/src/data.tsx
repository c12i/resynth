import type { SpeechWithMetadata } from "./types/emotion";

// This will be loaded dynamically from speeches.json
// For now, export an empty array as a placeholder
export let speeches: SpeechWithMetadata[] = [];

// Function to load speeches and sentiments from JSON files
export async function loadSpeeches(): Promise<SpeechWithMetadata[]> {
  try {
    // Load both speeches and sentiments in parallel
    const [speechesResponse, sentimentsResponse] = await Promise.all([
      fetch("/speeches.json"),
      fetch("/sentiments.json"),
    ]);

    if (!speechesResponse.ok) {
      throw new Error(`Failed to load speeches: ${speechesResponse.statusText}`);
    }

    const speechesData: SpeechWithMetadata[] = await speechesResponse.json();

    // Sentiments are optional - if they fail to load, continue without them
    let sentimentsData: any[] = [];
    if (sentimentsResponse.ok) {
      sentimentsData = await sentimentsResponse.json();
    } else {
      console.warn("Sentiments data not available");
    }

    // Merge sentiment data into speeches by matching speaker, event, and date
    const mergedData = speechesData.map((speech) => {
      const sentiment = sentimentsData.find(
        (s) =>
          s.speaker === speech.speaker &&
          s.event === speech.event &&
          s.date === speech.date
      );

      if (sentiment) {
        return {
          ...speech,
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.sentimentScore,
        };
      }

      return speech;
    });

    speeches = mergedData;
    return mergedData;
  } catch (error) {
    console.error("Error loading speeches:", error);
    // Return fallback data if loading fails
    return [];
  }
}

