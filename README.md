# Resynth

**What you're seeing and hearing is not random.**
This is an audiovisual exploration of political speech — where each word's emotional tone is translated into color, sound, and motion.

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

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Visual Meaning

### **Color**

Each dominant emotion is mapped to a distinct color:

- **Joy** → Golden Yellow
- **Anger** → Crimson Red
- **Sadness** → Deep Blue
- **Fear** → Violet
- **Disgust** → Acid Green
- **Surprise** → Pink
- **Neutral** → Gray

### **Shape Behavior**

The shape reacts and deforms based on the emotion:

- **Anger**: Sharp, erratic bursts
- **Sadness**: Slow, drooping motion
- **Joy**: Buoyant, uplifting spirals
- **Fear**: Jittery, unstable flickers
- **Disgust**: Twisted, warped flow
- **Surprise**: Chaotic pulses
- **Neutral**: Calm and minimal

### **Color Gradients**

When multiple emotions are detected in a single moment, colors blend into gradients to reflect emotional complexity and internal conflict.

## Sound Design

Each emotion triggers a unique synthesized note and timbre:

- The **pitch** and **oscillator type** represent the emotional weight.
- Sounds are tuned to create a **melodic backdrop**, even as the emotional tone shifts.
- Ambient tones run continuously, while sharper notes mark transitions between emotions.

## How It Works

1. **Speech-to-Text**: Transcribes political speech in real time or from archived audio.
2. **Emotion Detection**: Uses a machine learning model (`distilroberta-base`) to classify emotions line-by-line.
3. **Data Mapping**: Each emotional label controls a set of visual and audio responses.
4. **Web Technology**:
   - **three.js**: Renders the responsive shape.
   - **Tone.js**: Generates real-time synthesized audio.
   - **React + TypeScript**: Powers the single-page application.
