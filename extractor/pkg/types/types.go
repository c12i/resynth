package types

type Speech struct {
	SpeechMetadata
	OverallEmotion      string        `json:"overallEmotion,omitempty"`
	OverallEmotionScore float64       `json:"overallEmotionScore,omitempty"`
	Sentiment           string        `json:"sentiment"`
	SentimentScore      float64       `json:"sentimentScore"`
	Lines               []LineEmotion `json:"lines"`
}

type SpeechMetadata struct {
	Speaker string `json:"speaker"`
	Event   string `json:"event"`
	Date    string `json:"date"`
}

type LineEmotion struct {
	Text          string         `json:"text"`
	EmotionScores []EmotionScore `json:"emotionScores"`
}

type EmotionScore struct {
	Label string  `json:"label"`
	Score float64 `json:"score"`
}

// speech output format with metadata
type SpeechWithMetadata struct {
	SpeechMetadata
	Lines []LineEmotion `json:"lines"`
}

// sentiment output with metadata
type SentimentWithMetadata struct {
	SpeechMetadata
	Sentiment      string  `json:"sentiment"`
	SentimentScore float64 `json:"sentimentScore"`
}

// API response from HuggingFace models
type HuggingFaceResponse [][]EmotionScore
