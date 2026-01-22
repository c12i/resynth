package types

// EmotionScore represents a single emotion with its confidence score
type EmotionScore struct {
	Label string  `json:"label"`
	Score float64 `json:"score"`
}

// LineEmotion represents emotions for a single line of text
type LineEmotion struct {
	Text          string         `json:"text"`
	EmotionScores []EmotionScore `json:"emotionScores"`
}

// SpeechMetadata contains information about the speech
type SpeechMetadata struct {
	Speaker string `json:"speaker"`
	Event   string `json:"event"`
	Date    string `json:"date"`
}

// Speech represents a complete speech with overall sentiment and line-by-line emotions
type Speech struct {
	SpeechMetadata
	OverallEmotion      string        `json:"overallEmotion,omitempty"`
	OverallEmotionScore float64       `json:"overallEmotionScore,omitempty"`
	Sentiment           string        `json:"sentiment"`
	SentimentScore      float64       `json:"sentimentScore"`
	Lines               []LineEmotion `json:"lines"`
}

// SpeechWithMetadata represents the output format with metadata
type SpeechWithMetadata struct {
	SpeechMetadata
	Lines []LineEmotion `json:"lines"`
}

// SentimentWithMetadata represents sentiment output with metadata
type SentimentWithMetadata struct {
	SpeechMetadata
	Sentiment      string  `json:"sentiment"`
	SentimentScore float64 `json:"sentimentScore"`
}

// HuggingFaceResponse represents the API response from HuggingFace models
type HuggingFaceResponse [][]EmotionScore
