import type { EmotionType } from "../types/emotion";

export function applyEmotionDistortion(
  emotion: EmotionType,
  x: number,
  y: number,
  z: number,
  frame: number,
): [number, number, number] {
  switch (emotion) {
    case "anger":
      // Sharp, aggressive expansion with violent pulsing - like an explosion
      const distance = Math.sqrt(x * x + y * y + z * z);
      const normalX = distance > 0 ? x / distance : 0;
      const normalY = distance > 0 ? y / distance : 0;
      const normalZ = distance > 0 ? z / distance : 0;

      // Powerful, rhythmic pulsing outward
      const angerPulse = Math.sin(frame / 12) * Math.sin(frame / 12); // Squared for sharper pulse
      const explosionStrength = angerPulse * 5.0;

      // Sharp, jagged distortions - like shards of glass
      const shardX = Math.floor(Math.sin(x * 2.5 + frame / 15) * 4) * 0.9;
      const shardY = Math.floor(Math.cos(y * 2.5 + frame / 15) * 4) * 0.9;
      const shardZ = Math.floor(Math.sin(z * 2.5 + frame / 15) * 4) * 0.9;

      // Violent rotation/twist
      const twist = frame / 20;
      const twistX = Math.cos(twist) * y * 0.3 - Math.sin(twist) * z * 0.3;
      const twistZ = Math.sin(twist) * y * 0.3 + Math.cos(twist) * z * 0.3;

      // Aggressive vibration
      const rage = Math.sin(frame / 8) * Math.cos(frame / 10);
      const vibrateX = Math.sin(frame * 2 + x * 8) * rage * 0.6;
      const vibrateY = Math.cos(frame * 2.2 + y * 9) * rage * 0.6;
      const vibrateZ = Math.sin(frame * 1.8 + z * 7) * rage * 0.6;

      return [
        x + normalX * explosionStrength + shardX + twistX + vibrateX,
        y + normalY * explosionStrength + shardY + vibrateY,
        z + normalZ * explosionStrength + shardZ + twistZ + vibrateZ,
      ];

    case "sadness":
      // Slow, wave-like ripples emanating from center - like tears spreading
      const ripplePhase = frame / 40;
      const distFromCenter = Math.sqrt(x * x + y * y + z * z);

      // Ripples move outward from center
      const rippleWave = Math.sin(distFromCenter * 0.8 - ripplePhase) * 0.8;

      // Gentle downward drift
      const drift = Math.sin(frame / 60) * 0.5;

      // Subtle inward pull
      const pull = Math.cos(frame / 80) * 0.3;
      const pullX = distFromCenter > 0 ? (x / distFromCenter) * pull : 0;
      const pullZ = distFromCenter > 0 ? (z / distFromCenter) * pull : 0;

      return [
        x - pullX + Math.sin(frame / 70 + x * 0.5) * 0.4,
        y + rippleWave - drift,
        z - pullZ + Math.cos(frame / 70 + z * 0.5) * 0.4,
      ];

    case "fear":
      // High-frequency trembling with subtle recoiling - emphasizing the shaking
      const fearDist = Math.sqrt(x * x + y * y + z * z);
      const fearNormalX = fearDist > 0 ? x / fearDist : 0;
      const fearNormalY = fearDist > 0 ? y / fearDist : 0;
      const fearNormalZ = fearDist > 0 ? z / fearDist : 0;

      // Subtle shrinking inward - just a hint of recoiling
      const recoil = Math.sin(frame / 18) * 0.08 + 0.92; // Oscillates between 0.92 and 1.0 (very subtle)
      const pullInward = (1 - recoil) * 0.8;

      // STRONG high-frequency trembling - this is the main effect
      const trembleSpeed = frame * 4;
      const trembleX = Math.sin(trembleSpeed * 1.7 + x * 35) * 1.2;
      const trembleY = Math.sin(trembleSpeed * 2.3 + y * 38) * 1.2;
      const trembleZ = Math.sin(trembleSpeed * 1.9 + z * 36) * 1.2;

      // Secondary trembling layer for more complexity
      const trembleSpeed2 = frame * 3.2;
      const trembleX2 = Math.cos(trembleSpeed2 * 1.5 + x * 28) * 0.8;
      const trembleY2 = Math.cos(trembleSpeed2 * 2.1 + y * 31) * 0.8;
      const trembleZ2 = Math.cos(trembleSpeed2 * 1.8 + z * 29) * 0.8;

      // Chaotic, panicked movements - different for each particle
      const panicX = Math.sin(frame / 9 + x * 5.5) * Math.cos(frame / 11 + y * 4.8) * 1.0;
      const panicY = Math.cos(frame / 10 + y * 6.2) * Math.sin(frame / 12 + z * 5.1) * 1.0;
      const panicZ = Math.sin(frame / 8 + z * 5.8) * Math.cos(frame / 13 + x * 4.5) * 1.0;

      // Erratic scattering for outer particles only
      const scatterFactor = fearDist > 5 ? 1.0 : 0.0;
      const scatter = Math.sin(frame / 7 - fearDist * 0.5) * scatterFactor * 1.5;

      return [
        x * recoil - fearNormalX * pullInward + trembleX + trembleX2 + panicX + fearNormalX * scatter,
        y * recoil - fearNormalY * pullInward + trembleY + trembleY2 + panicY + fearNormalY * scatter,
        z * recoil - fearNormalZ * pullInward + trembleZ + trembleZ2 + panicZ + fearNormalZ * scatter,
      ];

    case "joy":
      // Effervescent, bubbly, floating upward - like champagne bubbles or laughter
      const bubble = Math.sin(frame / 18 + x * 0.5 + z * 0.5);
      const rise = Math.sin(frame / 25) * 0.8;

      // Playful spiraling upward
      const spiral = frame / 30;
      const spiralX = Math.cos(spiral + y * 0.3) * 0.9;
      const spiralZ = Math.sin(spiral + y * 0.3) * 0.9;

      // Bouncy, elastic energy
      const bounce = Math.abs(Math.sin(frame / 20 + x * 0.2)) * 0.8;

      // Light, airy expansion
      const expand = Math.sin(frame / 40) * 0.25;

      return [
        x * (1 + expand) + spiralX * bubble,
        y + rise + bounce, // Upward buoyancy
        z * (1 + expand) + spiralZ * bubble,
      ];

    case "disgust":
      // Only certain regions bulge - creating isolated diseased patches
      const regionX = Math.floor(x / 2);
      const regionZ = Math.floor(z / 2);

      // Only affect certain regions (checkerboard-like pattern)
      if ((regionX + regionZ) % 2 === 0) {
        const warp1 = Math.sin(frame / 35 + x * 2.5);
        const warp2 = Math.cos(frame / 28 + y * 3.2);
        const warp3 = Math.sin(frame / 32 + z * 2.8);

        // Asymmetric bulges that move around
        const bulgeX = Math.sin(frame / 20 + y * z * 0.5) * 1.4;
        const bulgeY = Math.cos(frame / 24 + x * z * 0.6) * 1.2;
        const bulgeZ = Math.sin(frame / 22 + x * y * 0.4) * 1.4;

        const wobble = Math.sin(frame / 15) * Math.cos(frame / 18);

        return [
          x + bulgeX * warp1 + Math.sin(y * 5 + frame / 12) * wobble * 1.0,
          y + bulgeY * warp2 + Math.cos(z * 4.5 + frame / 14) * wobble * 0.8,
          z + bulgeZ * warp3 + Math.sin(x * 4.8 + frame / 11) * wobble * 1.0,
        ];
      }

      // Unaffected regions have minimal distortion
      return [
        x + Math.sin(frame / 40 + x * 0.5) * 0.15,
        y + Math.cos(frame / 40 + y * 0.5) * 0.15,
        z + Math.sin(frame / 40 + z * 0.5) * 0.15,
      ];

    case "surprise":
      // Sharp, sudden burst outward with electric-like jolts - like being zapped
      const burstWave = Math.sin(frame / 8);
      // Asymmetric burst - expands fast, retracts faster
      const burstStrength =
        burstWave > 0 ? burstWave * burstWave * 5.5 : burstWave * 1.5;

      const surpriseDist = Math.sqrt(x * x + y * y + z * z);
      const burstX = surpriseDist > 0 ? (x / surpriseDist) * burstStrength : 0;
      const burstY = surpriseDist > 0 ? (y / surpriseDist) * burstStrength : 0;
      const burstZ = surpriseDist > 0 ? (z / surpriseDist) * burstStrength : 0;

      // Electric-like jittery movements
      const jolt = Math.sin(frame / 3);
      const joltX = Math.sin(frame * 3 + x * 8) * jolt;
      const joltY = Math.cos(frame * 3.5 + y * 9) * jolt;
      const joltZ = Math.sin(frame * 2.8 + z * 7) * jolt;

      return [
        x + burstX + joltX * 1.6,
        y + burstY + joltY * 1.6,
        z + burstZ + joltZ * 1.6,
      ];

    case "neutral":
    default:
      // Gentle breathing with slight shrinking - calm, contained state
      const breathe = Math.sin(frame / 60) * 0.15;
      const float = Math.cos(frame / 80) * 0.2;

      // Slight shrink - calm, contained
      const shrink = 0.85; // Shrink to 85% of original size

      return [
        x * shrink + Math.sin(frame / 100 + x * 0.1) * float,
        y * shrink + breathe * 0.5,
        z * shrink + Math.cos(frame / 100 + z * 0.1) * float,
      ];
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
