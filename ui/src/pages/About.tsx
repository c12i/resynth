import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Work Sans', sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "600px",
          height: "400px",
          backgroundImage: "url(/resynth-cube.png)",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          opacity: 0.5,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <button
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: "1.75rem",
          left: "2.5rem",
          zIndex: 100,
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "1rem",
          fontFamily: "'Work Sans', sans-serif",
          cursor: "pointer",
          padding: "0.5rem",
          transition: "opacity 0.3s",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        <span>←</span>
        <span>Back Home</span>
      </button>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "6rem 2rem 3rem 2rem",
          lineHeight: "1.8",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "400",
            marginTop: "7rem",
            marginBottom: "1rem",
            fontFamily: "'Syne Mono', monospace",
          }}
        >
          Resynth
        </h1>
        <p style={{ fontSize: "1.5rem", color: "#aaa", marginBottom: "3rem" }}>
          A machine that listens. A machine that feels
        </p>

        <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
          RESYNTH is an audiovisual installation that transforms African
          political speech into moving light and synthesized sound. Each word
          spoken is analyzed by artificial intelligence, translated into
          emotional signals, and expressed through shifting shape, color, and
          tone.
        </p>
        <p style={{ marginBottom: "3rem", fontSize: "1.1rem" }}>
          It's not just a tool. It's an interpreter — one that reveals what's
          often hidden beneath rhetoric: emotion.
        </p>

        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            marginTop: "3rem",
          }}
        >
          Why We Built This
        </h2>
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
          Political speeches are performances.
          <br />
          They persuade, provoke, and promise.
          <br />
          But behind every word lies a feeling — fear, joy, anger, or hope.
        </p>
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
          In a world saturated with noise, RESYNTH invites you to listen
          differently.
          <br />
          Not for what's said, but how it's felt.
        </p>
        <p style={{ marginBottom: "3rem", fontSize: "1.1rem" }}>
          We wanted to build something that makes those emotions visible,
          audible, and alive.
        </p>

        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            marginTop: "3rem",
          }}
        >
          How It Works (in simple terms)
        </h2>

        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            marginTop: "2rem",
          }}
        >
          Step 1: Speech is transcribed
        </h3>
        <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
          We start by collecting speeches from African political figures. These
          are either uploaded or streamed into the system. The first thing
          RESYNTH does is turn spoken words into text.
        </p>

        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            marginTop: "2rem",
          }}
        >
          Step 2: Emotion detection with Machine Learning
        </h3>
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
          The text is analyzed line-by-line using machine learning models. Each
          line is classified into one of seven emotions (based on Ekman's 6
          basic emotions plus neutral) using{" "}
          <a
            href="https://huggingface.co/j-hartmann/emotion-english-distilroberta-base"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Emotion Distilroberta Base
          </a>
          , while the overall sentiment of the speech is determined using{" "}
          <a
            href="https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Twitter Roberta Base
          </a>
          :
        </p>

        <div style={{ marginBottom: "3rem", marginTop: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>Joy</strong>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#d4a500",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>Anger</strong>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#8B0000",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>Sadness</strong>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#2979ff",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>Fear</strong>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#9c27ff",
                }}
              ></div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>Disgust</strong>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#76ff03",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>Surprise</strong>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#ff4081",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>Neutral</strong>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#5a6c7a",
                }}
              ></div>
            </div>
          </div>
        </div>

        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            marginTop: "2rem",
          }}
        >
          Step 3: Emotional data becomes visual and sound output
        </h3>
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
          Each emotion is mapped to:
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ul
            style={{
              marginBottom: "3rem",
              fontSize: "1.1rem",
              paddingLeft: "2rem",
              textAlign: "left",
            }}
          >
            <li>
              A unique color. When multiple emotions are present, colors blend
              to form gradients that reflect the emotional complexity of the
              moment
            </li>
            <li>
              A particle distortion algorithm (like twitching, drooping,
              spiraling)
            </li>
            <li>
              A synthesized sound (softer tones for sadness, sharp spikes for
              anger, etc.). The overall sentiment of the speech also shapes a
              background tone that plays throughout, ranging from tense,
              dissonant chords for negative sentiment to warm, harmonious chords
              for positive sentiment
            </li>
          </ul>
        </div>

        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            marginTop: "3rem",
          }}
        >
          The Role of UI
        </h2>
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
          The user interface is designed to be minimal and immersive. You
          control the experience:
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ul
            style={{
              marginBottom: "3rem",
              fontSize: "1.1rem",
              paddingLeft: "2rem",
              textAlign: "left",
            }}
          >
            <li>Choose which speech to experience</li>
            <li>Adjust the audio tone style (ambient, synthwave, or lo-fi)</li>
            <li>Control the volume</li>
            <li>Interact with the 3D cube (rotate, zoom, pan)</li>
            <li>Watch emotions unfold in real-time as the speech plays</li>
          </ul>
        </div>

        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            marginTop: "3rem",
          }}
        >
          Why African Voices
        </h2>
        <p style={{ marginBottom: "3rem", fontSize: "1.1rem" }}>
          We center African political speech to make space for emotional
          expression often overlooked in Western media and data analysis. These
          speeches are historically layered: shaped by independence, protest,
          identity, and power.
          <br />
          <br />
          With RESYNTH, we amplify those emotions, not to judge them — but to
          make them felt.
        </p>

        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            marginTop: "3rem",
          }}
        >
          The Creators
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "1.1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <img
              src="/collins-muriuki.png"
              alt="Collins Muriuki"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "1rem",
                border: "3px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            <div style={{ lineHeight: "1.6" }}>
              <strong>Collins Muriuki</strong>
              <br />
              <span style={{ fontSize: "0.95rem", color: "#aaa" }}>
                (Developer)
              </span>
              <br />
              <a
                href="https://c12i.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#fff", textDecoration: "underline" }}
              >
                c12i.xyz
              </a>
            </div>
          </div>

          <div
            style={{
              fontSize: "1.1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <img
              src="/charity-wachira.png"
              alt="Charity Wachira"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "1rem",
                border: "3px solid rgba(255, 255, 255, 0.2)",
              }}
            />
            <div style={{ lineHeight: "1.6" }}>
              <strong>Charity Wachira</strong>
              <br />
              <span style={{ fontSize: "0.95rem", color: "#aaa" }}>
                (Designer)
              </span>
              <br />
              <a
                href="https://charitywachira.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#fff", textDecoration: "underline" }}
              >
                charitywachira.com
              </a>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "4rem", fontSize: "1.1rem" }}>
          <a
            href="https://github.com/c12i/resynth"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#fff",
              textDecoration: "underline",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            GitHub Source Code
          </a>
        </div>
      </div>
    </div>
  );
}
