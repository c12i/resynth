import type { EmotionType } from "../types/emotion";

export function applyEmotionDistortion(
  emotion: EmotionType,
  x: number,
  y: number,
  z: number,
  frame: number,
  intensityMultiplier: number = 1.0, // New parameter for consecutive emotion amplification
): [number, number, number] {
  switch (emotion) {
    case "anger":
      // Rubik's cube style - half of the cube rotates/flips while expanding outward
      const cubeHalfSize = 8;

      // Calculate distance from center for outward expansion
      const angerDistFromCenter = Math.sqrt(x * x + y * y + z * z);
      const normalX = angerDistFromCenter > 0 ? x / angerDistFromCenter : 0;
      const normalY = angerDistFromCenter > 0 ? y / angerDistFromCenter : 0;
      const normalZ = angerDistFromCenter > 0 ? z / angerDistFromCenter : 0;

      // Outward expansion - pulsing stretch with UMPH (amplified by intensity)
      const expansionPulse = Math.sin(frame / 15) * 0.5 + 0.5; // 0 to 1
      const expansionStrength = expansionPulse * 7.0 * intensityMultiplier; // Strong outward push

      // VERY SLIGHT corner emphasis (amplified by intensity)
      const cornerFactor = (Math.abs(x) / cubeHalfSize) *
                          (Math.abs(y) / cubeHalfSize) *
                          (Math.abs(z) / cubeHalfSize);
      const cornerBoost = cornerFactor * 1.5 * intensityMultiplier;

      // Apply expansion first
      const expandedX = x + normalX * (expansionStrength + cornerBoost);
      const expandedY = y + normalY * (expansionStrength + cornerBoost);
      const expandedZ = z + normalZ * (expansionStrength + cornerBoost);

      // Determine which half of the cube this particle is in
      // Split the cube vertically (along Y axis)
      const isTopHalf = y > 0;

      // Rotation angle - light tilt, oscillates back and forth
      const rotationAngle = Math.sin(frame / 20) * Math.PI / 12; // Light tilt - up to 15 degrees

      // VERY AGGRESSIVE shaking everywhere (amplified by intensity)
      const shakeSpeed = 5.5 * intensityMultiplier;
      const shakeAmplitude = 2.5 * intensityMultiplier;
      const globalShakeX = Math.sin(frame * shakeSpeed + x * 12) * shakeAmplitude;
      const globalShakeY = Math.cos(frame * shakeSpeed * 1.15 + y * 13) * shakeAmplitude;
      const globalShakeZ = Math.sin(frame * shakeSpeed * 0.85 + z * 11) * shakeAmplitude;

      // Additional high-frequency tremor (amplified by intensity)
      const tremorSpeed = 9.0 * intensityMultiplier;
      const tremorAmplitude = 1.5 * intensityMultiplier;
      const tremorX = Math.sin(frame * tremorSpeed + x * 20) * tremorAmplitude;
      const tremorY = Math.cos(frame * tremorSpeed * 1.2 + y * 22) * tremorAmplitude;
      const tremorZ = Math.sin(frame * tremorSpeed * 0.9 + z * 18) * tremorAmplitude;

      let finalX = expandedX;
      let finalY = expandedY;
      let finalZ = expandedZ;

      // Apply rotation to top half only (rotate around Y axis)
      if (isTopHalf) {
        // Rotate around Y axis
        const cosAngle = Math.cos(rotationAngle);
        const sinAngle = Math.sin(rotationAngle);

        finalX = expandedX * cosAngle - expandedZ * sinAngle;
        finalZ = expandedX * sinAngle + expandedZ * cosAngle;
        finalY = expandedY; // Y stays the same for Y-axis rotation
      }

      return [
        finalX + globalShakeX + tremorX,
        finalY + globalShakeY + tremorY,
        finalZ + globalShakeZ + tremorZ,
      ];

    case "sadness":
      // Slow, wave-like ripples emanating from center - like tears spreading (amplified by intensity)
      const ripplePhase = frame / 40;
      const distFromCenter = Math.sqrt(x * x + y * y + z * z);

      // Ripples move outward from center (amplified)
      const rippleWave = Math.sin(distFromCenter * 0.8 - ripplePhase) * 0.8 * intensityMultiplier;

      // Gentle downward drift (amplified)
      const drift = Math.sin(frame / 60) * 0.5 * intensityMultiplier;

      // Subtle inward pull (amplified)
      const pull = Math.cos(frame / 80) * 0.3 * intensityMultiplier;
      const pullX = distFromCenter > 0 ? (x / distFromCenter) * pull : 0;
      const pullZ = distFromCenter > 0 ? (z / distFromCenter) * pull : 0;

      return [
        x - pullX + Math.sin(frame / 70 + x * 0.5) * 0.4 * intensityMultiplier,
        y + rippleWave - drift,
        z - pullZ + Math.cos(frame / 70 + z * 0.5) * 0.4 * intensityMultiplier,
      ];

    case "fear":
      // High-frequency trembling with subtle recoiling - emphasizing the shaking
      const fearDist = Math.sqrt(x * x + y * y + z * z);
      const fearNormalX = fearDist > 0 ? x / fearDist : 0;
      const fearNormalY = fearDist > 0 ? y / fearDist : 0;
      const fearNormalZ = fearDist > 0 ? z / fearDist : 0;

      // Subtle shrinking inward - just a hint of recoiling (amplified by intensity)
      const recoilAmount = 0.08 * intensityMultiplier;
      const recoil = Math.sin(frame / 18) * recoilAmount + (1.0 - recoilAmount);
      const pullInward = (1 - recoil) * 0.8 * intensityMultiplier;

      // STRONG high-frequency trembling - this is the main effect (amplified by intensity)
      const trembleSpeed = frame * 4 * intensityMultiplier;
      const trembleX = Math.sin(trembleSpeed * 1.7 + x * 35) * 1.2 * intensityMultiplier;
      const trembleY = Math.sin(trembleSpeed * 2.3 + y * 38) * 1.2 * intensityMultiplier;
      const trembleZ = Math.sin(trembleSpeed * 1.9 + z * 36) * 1.2 * intensityMultiplier;

      // Secondary trembling layer for more complexity (amplified by intensity)
      const trembleSpeed2 = frame * 3.2 * intensityMultiplier;
      const trembleX2 = Math.cos(trembleSpeed2 * 1.5 + x * 28) * 0.8 * intensityMultiplier;
      const trembleY2 = Math.cos(trembleSpeed2 * 2.1 + y * 31) * 0.8 * intensityMultiplier;
      const trembleZ2 = Math.cos(trembleSpeed2 * 1.8 + z * 29) * 0.8 * intensityMultiplier;

      // Chaotic, panicked movements - different for each particle (amplified by intensity)
      const panicX = Math.sin(frame / 9 + x * 5.5) * Math.cos(frame / 11 + y * 4.8) * 1.0 * intensityMultiplier;
      const panicY = Math.cos(frame / 10 + y * 6.2) * Math.sin(frame / 12 + z * 5.1) * 1.0 * intensityMultiplier;
      const panicZ = Math.sin(frame / 8 + z * 5.8) * Math.cos(frame / 13 + x * 4.5) * 1.0 * intensityMultiplier;

      // Erratic scattering for outer particles only (amplified by intensity)
      const scatterFactor = fearDist > 5 ? 1.0 : 0.0;
      const scatter = Math.sin(frame / 7 - fearDist * 0.5) * scatterFactor * 1.5 * intensityMultiplier;

      return [
        x * recoil - fearNormalX * pullInward + trembleX + trembleX2 + panicX + fearNormalX * scatter,
        y * recoil - fearNormalY * pullInward + trembleY + trembleY2 + panicY + fearNormalY * scatter,
        z * recoil - fearNormalZ * pullInward + trembleZ + trembleZ2 + panicZ + fearNormalZ * scatter,
      ];

    case "joy":
      // Effervescent, bubbly, floating upward - like champagne bubbles or laughter (amplified by intensity)
      const bubble = Math.sin(frame / 18 + x * 0.5 + z * 0.5);
      const rise = Math.sin(frame / 25) * 0.8 * intensityMultiplier;

      // Playful spiraling upward (amplified by intensity)
      const spiral = frame / 30;
      const spiralX = Math.cos(spiral + y * 0.3) * 0.9 * intensityMultiplier;
      const spiralZ = Math.sin(spiral + y * 0.3) * 0.9 * intensityMultiplier;

      // Bouncy, elastic energy (amplified by intensity)
      const bounce = Math.abs(Math.sin(frame / 20 + x * 0.2)) * 0.8 * intensityMultiplier;

      // Light, airy expansion (amplified by intensity)
      const expand = Math.sin(frame / 40) * 0.25 * intensityMultiplier;

      return [
        x * (1 + expand) + spiralX * bubble,
        y + rise + bounce, // Upward buoyancy
        z * (1 + expand) + spiralZ * bubble,
      ];

    case "disgust":
      // Only certain regions bulge - creating isolated diseased patches
      const disgustCubeHalfSize = 8;

      // Check if particle is on an edge (close to the boundary on at least one axis)
      const disgustOnEdgeX = Math.abs(Math.abs(x) - disgustCubeHalfSize) < 0.5;
      const disgustOnEdgeY = Math.abs(Math.abs(y) - disgustCubeHalfSize) < 0.5;
      const disgustOnEdgeZ = Math.abs(Math.abs(z) - disgustCubeHalfSize) < 0.5;
      const disgustIsOnEdge = disgustOnEdgeX || disgustOnEdgeY || disgustOnEdgeZ;

      const regionX = Math.floor(x / 2);
      const regionZ = Math.floor(z / 2);

      // Only affect certain regions (checkerboard-like pattern)
      if ((regionX + regionZ) % 2 === 0) {
        const warp1 = Math.sin(frame / 35 + x * 2.5);
        const warp2 = Math.cos(frame / 28 + y * 3.2);
        const warp3 = Math.sin(frame / 32 + z * 2.8);

        // Asymmetric bulges that move around (reduced on edges, amplified by intensity)
        const bulgeIntensity = (disgustIsOnEdge ? 0.25 : 1.0) * intensityMultiplier;
        const bulgeX = Math.sin(frame / 20 + y * z * 0.5) * 1.4 * bulgeIntensity;
        const bulgeY = Math.cos(frame / 24 + x * z * 0.6) * 1.2 * bulgeIntensity;
        const bulgeZ = Math.sin(frame / 22 + x * y * 0.4) * 1.4 * bulgeIntensity;

        const wobble = Math.sin(frame / 15) * Math.cos(frame / 18);
        const wobbleIntensity = (disgustIsOnEdge ? 0.2 : 1.0) * intensityMultiplier;

        return [
          x + bulgeX * warp1 + Math.sin(y * 5 + frame / 12) * wobble * 1.0 * wobbleIntensity,
          y + bulgeY * warp2 + Math.cos(z * 4.5 + frame / 14) * wobble * 0.8 * wobbleIntensity,
          z + bulgeZ * warp3 + Math.sin(x * 4.8 + frame / 11) * wobble * 1.0 * wobbleIntensity,
        ];
      }

      // Unaffected regions have minimal distortion (amplified by intensity)
      return [
        x + Math.sin(frame / 40 + x * 0.5) * 0.15 * intensityMultiplier,
        y + Math.cos(frame / 40 + y * 0.5) * 0.15 * intensityMultiplier,
        z + Math.sin(frame / 40 + z * 0.5) * 0.15 * intensityMultiplier,
      ];

    case "surprise":
      // Sharp, sudden burst outward with electric-like jolts - like being zapped (amplified by intensity)
      const burstWave = Math.sin(frame / 8);
      // Asymmetric burst - expands fast, retracts faster (amplified by intensity)
      const burstStrength =
        (burstWave > 0 ? burstWave * burstWave * 5.5 : burstWave * 1.5) * intensityMultiplier;

      const surpriseDist = Math.sqrt(x * x + y * y + z * z);
      const burstX = surpriseDist > 0 ? (x / surpriseDist) * burstStrength : 0;
      const burstY = surpriseDist > 0 ? (y / surpriseDist) * burstStrength : 0;
      const burstZ = surpriseDist > 0 ? (z / surpriseDist) * burstStrength : 0;

      // Electric-like jittery movements (amplified by intensity)
      const jolt = Math.sin(frame / 3);
      const joltX = Math.sin(frame * 3 + x * 8) * jolt * intensityMultiplier;
      const joltY = Math.cos(frame * 3.5 + y * 9) * jolt * intensityMultiplier;
      const joltZ = Math.sin(frame * 2.8 + z * 7) * jolt * intensityMultiplier;

      return [
        x + burstX + joltX * 1.6,
        y + burstY + joltY * 1.6,
        z + burstZ + joltZ * 1.6,
      ];

    case "neutral":
    default:
      // Gentle breathing with slight shrinking - calm, contained state (amplified by intensity)
      const breathe = Math.sin(frame / 60) * 0.15 * intensityMultiplier;
      const float = Math.cos(frame / 80) * 0.2 * intensityMultiplier;

      // Slight shrink - calm, contained (more shrink with intensity)
      const shrinkAmount = 0.15 * intensityMultiplier;
      const shrink = 1.0 - shrinkAmount; // Shrink more with higher intensity

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
