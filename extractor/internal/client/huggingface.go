package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/c12i/resynth/extractor/internal/models"
	"github.com/c12i/resynth/extractor/pkg/types"
)

type HuggingFaceClient struct {
	apiToken   string
	httpClient *http.Client
}

func NewHuggingFaceClient(apiToken string) *HuggingFaceClient {
	return &HuggingFaceClient{
		apiToken: apiToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *HuggingFaceClient) callAPI(modelName, text string) (types.HuggingFaceResponse, error) {
	url := fmt.Sprintf("%s/%s", models.HFAPIBaseURL, modelName)

	// truncate text if too long (models have ~512 token limit, roughly 2000 chars)
	maxChars := 2000
	if len(text) > maxChars {
		text = text[:maxChars]
	}

	requestBody := map[string]any{
		"inputs": text,
		"options": map[string]bool{
			"wait_for_model": true,
		},
		"parameters": map[string]any{
			"truncation": true,
			"max_length": 512,
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	var result types.HuggingFaceResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return result, nil
}

// GetTextEmotion calls the text emotion detection model
func (c *HuggingFaceClient) GetTextEmotion(text string) ([]types.EmotionScore, error) {
	result, err := c.callAPI(models.TextEmotionModel, text)
	if err != nil {
		return nil, fmt.Errorf("text emotion API call failed: %w", err)
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("empty response from text emotion API")
	}

	return result[0], nil
}

// GetSentiment calls the sentiment analysis model
func (c *HuggingFaceClient) GetSentiment(text string) ([]types.EmotionScore, error) {
	result, err := c.callAPI(models.SentimentModel, text)
	if err != nil {
		return nil, fmt.Errorf("sentiment API call failed: %w", err)
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("empty response from sentiment API")
	}

	return result[0], nil
}
