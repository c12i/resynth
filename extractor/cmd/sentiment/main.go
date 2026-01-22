package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"
	"strings"

	"github.com/collinsmuriuki/resynth/extractor/internal/client"
	"github.com/collinsmuriuki/resynth/extractor/internal/models"
	"github.com/collinsmuriuki/resynth/extractor/internal/processor"
	"github.com/collinsmuriuki/resynth/extractor/pkg/types"
	"github.com/joho/godotenv"
)

func main() {
	inputFile := flag.String("input", "", "Input text file with a single speech (required)")
	outputFile := flag.String("output", "../sentiments.json", "Output JSON file to append to (default: ../sentiments.json)")
	roundTo := flag.Int("round", 2, "Decimal places to round scores")
	flag.Parse()

	if *inputFile == "" {
		log.Fatal("Error: -input flag is required")
	}

	_ = godotenv.Load()

	apiToken := os.Getenv("HF_TOKEN")
	if apiToken == "" {
		log.Fatal("Error: HF_TOKEN environment variable not set")
	}

	// Initialize client and processor
	hfClient := client.NewHuggingFaceClient(apiToken)
	proc := processor.NewProcessor(hfClient, &models.Config{
		ScoreThreshold:     0.1,
		MaxEmotionsPerLine: 3,
		NormalizeScores:    false,
		RoundDecimals:      *roundTo,
	})

	// Read input file
	content, err := os.ReadFile(*inputFile)
	if err != nil {
		log.Fatalf("Error reading input file: %v", err)
	}

	// Split into lines and filter empty ones
	allLines := strings.Split(string(content), "\n")
	lines := make([]string, 0)
	for _, line := range allLines {
		if strings.TrimSpace(line) != "" {
			lines = append(lines, line)
		}
	}

	if len(lines) == 0 {
		log.Fatal("Error: Input file contains no non-empty lines")
	}

	log.Printf("Processing speech from %s (%d lines)...", *inputFile, len(lines))

	// Process speech to get sentiment
	speech, err := proc.ProcessSpeech(lines)
	if err != nil {
		log.Fatalf("Error processing speech: %v", err)
	}

	log.Printf("✓ Speech analyzed (sentiment: %s, %.2f)", speech.Sentiment, speech.SentimentScore)

	// Parse metadata from filename
	metadata := types.ParseMetadataFromFilename(*inputFile)
	log.Printf("  Speaker: %s", metadata.Speaker)
	log.Printf("  Event: %s", metadata.Event)
	log.Printf("  Date: %s", metadata.Date)

	// Create sentiment output with metadata
	sentimentOutput := types.SentimentWithMetadata{
		SpeechMetadata: metadata,
		Sentiment:      speech.Sentiment,
		SentimentScore: speech.SentimentScore,
	}

	// Read existing sentiments from output file (if it exists)
	existingSentiments := make([]types.SentimentWithMetadata, 0)
	if data, err := os.ReadFile(*outputFile); err == nil {
		if err := json.Unmarshal(data, &existingSentiments); err != nil {
			log.Printf("Warning: Could not parse existing JSON file, starting fresh: %v", err)
		} else {
			log.Printf("Found %d existing sentiment(s) in %s", len(existingSentiments), *outputFile)
		}
	} else {
		log.Printf("No existing file found, creating new %s", *outputFile)
	}

	// Append new sentiment
	existingSentiments = append(existingSentiments, sentimentOutput)

	// Write back to file
	jsonData, err := json.MarshalIndent(existingSentiments, "", "  ")
	if err != nil {
		log.Fatalf("Error marshaling JSON: %v", err)
	}

	if err := os.WriteFile(*outputFile, jsonData, 0644); err != nil {
		log.Fatalf("Error writing output file: %v", err)
	}

	log.Printf("✓ Appended sentiment to %s (now contains %d sentiment(s))", *outputFile, len(existingSentiments))
	log.Println("✓ Analysis complete!")
}

