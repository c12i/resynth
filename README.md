# Resynth

An audiovisual exploration of political speech, where each word's emotional tone is translated into color, sound, and motion.

## How It Works

1. **Emotion Detection**: Uses a machine learning models, [`j-hartmann/emotion-english-distilroberta-base`](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base) and [`twitter-roberta-base-sentiment-latest`](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest), to classify emotions line-by-line and analyse overall sentiment respectively. This is handled by binaries in [/extractors](./extractor).
2. **Data Mapping**: Each emotional label controls a set of visual and audio responses as well as distortion algorithms (all generated with AI assistance).
3. **Web Technology**:
   - **three.js**: Renders the responsive shape.
   - **Tone.js**: Generates real-time synthesized audio.
   - **React + TypeScript**: Powers the single-page application.

## Setup

### Run the UI

```bash
cd ui
npm install
npm run dev
```

### Extract Emotions and Sentiment from Text

```bash
cd extractor
cp .env.example .env
# Add your HF_TOKEN to .env
make build

# Process all real speeches with both tools
make run-all-speeches

# Or run individually:
# make run-all            # Emotions only (sample speeches)
# make run-all-sentiment  # Sentiment only (sample speeches)

# Or process individual speeches
./emotion -input speeches/my-speech.txt
./sentiment -input speeches/my-speech.txt
```
