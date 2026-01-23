package models

const (
	// HuggingFace API base URL (updated to new router endpoint - Jan 2026)
	HFAPIBaseURL = "https://router.huggingface.co/hf-inference/models"

	// Model names
	TextEmotionModel = "j-hartmann/emotion-english-distilroberta-base"
	SentimentModel   = "tabularisai/multilingual-sentiment-analysis"
)

// configuration for the emotion extractor
type Config struct {
	HFToken            string
	ScoreThreshold     float64
	MaxEmotionsPerLine int
	NormalizeScores    bool
	RoundDecimals      int
}

func DefaultConfig() *Config {
	return &Config{
		ScoreThreshold:     0.1,
		MaxEmotionsPerLine: 3,
		NormalizeScores:    false,
		RoundDecimals:      2,
	}
}
