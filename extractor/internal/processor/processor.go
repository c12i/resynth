package processor

import (
	"fmt"
	"math"
	"sort"
	"strings"

	"github.com/c12i/resynth/extractor/internal/client"
	"github.com/c12i/resynth/extractor/internal/models"
	"github.com/c12i/resynth/extractor/pkg/types"
)

// Processor handles the emotion extraction logic
type Processor struct {
	client *client.HuggingFaceClient
	config *models.Config
}

// NewProcessor creates a new emotion processor
func NewProcessor(hfClient *client.HuggingFaceClient, config *models.Config) *Processor {
	return &Processor{
		client: hfClient,
		config: config,
	}
}

// ProcessSpeech extracts emotions from a speech (array of lines)
func (p *Processor) ProcessSpeech(lines []string) (*types.Speech, error) {
	speech := &types.Speech{
		Lines: make([]types.LineEmotion, 0, len(lines)),
	}

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}

		emotions, err := p.client.GetTextEmotion(line)
		if err != nil {
			return nil, fmt.Errorf("failed to get emotions for line '%s': %w", line, err)
		}

		filteredEmotions := p.filterEmotions(emotions)

		speech.Lines = append(speech.Lines, types.LineEmotion{
			Text:          line,
			EmotionScores: filteredEmotions,
		})
	}

	fullText := strings.Join(lines, " ")
	sentimentScores, err := p.client.GetSentiment(fullText)
	if err != nil {
		return nil, fmt.Errorf("failed to get sentiment: %w", err)
	}

	if len(sentimentScores) > 0 {
		dominant := p.findDominant(sentimentScores)
		speech.Sentiment = p.normalizeSentimentLabel(dominant.Label)
		speech.SentimentScore = p.roundScore(dominant.Score)
	}

	return speech, nil
}

// filters emotions based on threshold, sorts, and limits
func (p *Processor) filterEmotions(emotions []types.EmotionScore) []types.EmotionScore {
	filtered := make([]types.EmotionScore, 0)
	for _, emotion := range emotions {
		if emotion.Score >= p.config.ScoreThreshold {
			filtered = append(filtered, emotion)
		}
	}
	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].Score > filtered[j].Score
	})

	if len(filtered) > p.config.MaxEmotionsPerLine {
		filtered = filtered[:p.config.MaxEmotionsPerLine]
	}

	if p.config.NormalizeScores && len(filtered) > 0 {
		total := 0.0
		for _, e := range filtered {
			total += e.Score
		}
		for i := range filtered {
			filtered[i].Score = filtered[i].Score / total
		}
	}

	// round scores
	for i := range filtered {
		filtered[i].Score = p.roundScore(filtered[i].Score)
	}

	return filtered
}

// returns the emotion with the highest score
func (p *Processor) findDominant(emotions []types.EmotionScore) types.EmotionScore {
	if len(emotions) == 0 {
		return types.EmotionScore{}
	}

	dominant := emotions[0]
	for _, emotion := range emotions[1:] {
		if emotion.Score > dominant.Score {
			dominant = emotion
		}
	}

	return dominant
}

// converts sentiment labels to lowercase with underscores
// e.g., "Very Positive" -> "very_positive"
func (p *Processor) normalizeSentimentLabel(label string) string {
	return strings.ToLower(strings.ReplaceAll(label, " ", "_"))
}

// rounds a score to the configured number of decimal places
func (p *Processor) roundScore(score float64) float64 {
	multiplier := math.Pow(10, float64(p.config.RoundDecimals))
	return math.Round(score*multiplier) / multiplier
}
