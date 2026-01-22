# Extractor

A Go-based CLI toolkit for extracting emotions and sentiment from text using HuggingFace's free Inference API.

## Tools

### `emotion` - Emotion Extractor

Analyzes each line of text for 7 emotions (anger, disgust, fear, joy, neutral, sadness, surprise) and outputs line-by-line emotion data.

### `sentiment` - Sentiment Analyzer

Determines overall sentiment of a speech (very_negative, negative, neutral, positive, very_positive) and outputs just the sentiment classification.

## Usage

### Emotion Extraction

```bash
./emotion -input speeches/speech.txt
```

### Sentiment Analysis

```bash
./sentiment -input speeches/speech.txt
```

## Command-Line Flags

- `-input` (required): Input text file with a single speech
- `-output`: Output JSON file to append to (default: `../speeches.json`)
- `-threshold`: Minimum emotion score threshold (default: 0.1)
- `-max-emotions`: Maximum emotions per line (default: 3)
- `-normalize`: Normalize scores to sum to 1.0 (default: false)
- `-round`: Decimal places to round scores (default: 2)
