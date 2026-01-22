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
	outputFile := flag.String("output", "../speeches.json", "Output JSON file to append to (default: ../speeches.json)")
	threshold := flag.Float64("threshold", 0.1, "Minimum emotion score threshold")
	maxEmotions := flag.Int("max-emotions", 3, "Maximum emotions per line")
	normalize := flag.Bool("normalize", false, "Normalize scores to sum to 1.0")
	roundTo := flag.Int("round", 2, "Decimal places to round scores")
	flag.Parse()

	if *inputFile == "" {
		log.Fatal("Error: -input flag is required")
	}

	_ = godotenv.Load()

	hfToken := os.Getenv("HF_TOKEN")
	if hfToken == "" {
		log.Fatal("Error: HF_TOKEN environment variable is required")
	}

	config := &models.Config{
		HFToken:            hfToken,
		ScoreThreshold:     *threshold,
		MaxEmotionsPerLine: *maxEmotions,
		NormalizeScores:    *normalize,
		RoundDecimals:      *roundTo,
	}

	hfClient := client.NewHuggingFaceClient(hfToken)
	proc := processor.NewProcessor(hfClient, config)

	// Read the input file (single speech)
	content, err := os.ReadFile(*inputFile)
	if err != nil {
		log.Fatalf("Error reading input file: %v", err)
	}

	// Parse lines from the file
	lines := parseLines(string(content))
	if len(lines) == 0 {
		log.Fatal("Error: No content found in input file")
	}

	log.Printf("Processing speech from %s (%d lines)...", *inputFile, len(lines))

	// Process the speech
	speech, err := proc.ProcessSpeech(lines)
	if err != nil {
		log.Fatalf("Error processing speech: %v", err)
	}

	log.Printf("✓ Speech processed (sentiment: %s, %.2f)", speech.Sentiment, speech.SentimentScore)

	// Parse metadata from filename
	metadata := types.ParseMetadataFromFilename(*inputFile)
	log.Printf("  Speaker: %s", metadata.Speaker)
	log.Printf("  Event: %s", metadata.Event)
	log.Printf("  Date: %s", metadata.Date)

	// Read existing speeches from output file (if it exists)
	existingSpeeches := make([]types.SpeechWithMetadata, 0)
	if data, err := os.ReadFile(*outputFile); err == nil {
		if err := json.Unmarshal(data, &existingSpeeches); err != nil {
			log.Printf("Warning: Could not parse existing JSON file, starting fresh: %v", err)
		} else {
			log.Printf("Found %d existing speech(es) in %s", len(existingSpeeches), *outputFile)
		}
	} else {
		log.Printf("No existing file found, creating new %s", *outputFile)
	}

	// Append new speech with metadata
	speechWithMetadata := types.SpeechWithMetadata{
		SpeechMetadata: metadata,
		Lines:          speech.Lines,
	}
	existingSpeeches = append(existingSpeeches, speechWithMetadata)

	// Write back to file
	jsonData, err := json.MarshalIndent(existingSpeeches, "", "  ")
	if err != nil {
		log.Fatalf("Error marshaling JSON: %v", err)
	}

	if err := os.WriteFile(*outputFile, jsonData, 0644); err != nil {
		log.Fatalf("Error writing output file: %v", err)
	}

	log.Printf("✓ Appended speech to %s (now contains %d speech(es))", *outputFile, len(existingSpeeches))
	log.Println("✓ Extraction complete!")
}

// parseLines splits the input text into lines, removing empty lines
func parseLines(content string) []string {
	lines := make([]string, 0)

	for _, line := range strings.Split(content, "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" {
			lines = append(lines, trimmed)
		}
	}

	return lines
}
