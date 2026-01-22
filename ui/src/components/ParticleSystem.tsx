import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EmotionType, EmotionScore } from "../types/emotion";
import { applyEmotionDistortion, lerp } from "../utils/emotionDistortions";

const emotionColors: Record<EmotionType, string> = {
  anger: "#cc1234",      // Darker red
  disgust: "#76ff03",
  fear: "#9c27ff",
  joy: "#d4a500",        // Darker gold/yellow
  neutral: "#5a6c7a",    // Darker gray-blue
  sadness: "#2979ff",
  surprise: "#ff4081",
};

// Vertex shader
const vertexShader = `
  uniform float uTime;
  uniform vec3 uEmotionColors[7];
  uniform float uEmotionWeights[7];
  uniform float uCoreGlowIntensity;

  attribute float distortionIntensity;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vDistanceFromCenter;

  void main() {
    // Calculate distance from center for core glow
    vDistanceFromCenter = length(position);

    // Find dominant emotion and blend with secondary emotions
    vec3 blendedColor = vec3(0.0);
    float totalWeight = 0.0;
    float maxWeight = 0.0;
    int dominantIndex = 0;

    // Find dominant emotion
    for (int i = 0; i < 7; i++) {
      if (uEmotionWeights[i] > maxWeight) {
        maxWeight = uEmotionWeights[i];
        dominantIndex = i;
      }
      totalWeight += uEmotionWeights[i];
    }

    // Weight dominant emotion more heavily (70% dominant, 30% blend)
    if (totalWeight > 0.0) {
      vec3 dominantColor = uEmotionColors[dominantIndex];
      vec3 blendColor = vec3(0.0);

      for (int i = 0; i < 7; i++) {
        blendColor += uEmotionColors[i] * uEmotionWeights[i];
      }
      blendColor /= totalWeight;

      vColor = mix(blendColor, dominantColor, 0.7);
    } else {
      vColor = vec3(1.0);
    }

    // Apply transformations
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective point size with distortion-based scaling - increased for better visibility
    float baseSize = 9.0;
    float sizeMultiplier = 1.0 + (distortionIntensity * 0.8);
    gl_PointSize = baseSize * sizeMultiplier * (300.0 / -mvPosition.z);

    // Vary opacity based on distortion for artistic depth - increased base opacity
    vOpacity = 0.7 + (distortionIntensity * 0.1);
  }
`;

// Fragment shader
const fragmentShader = `
  uniform float uCoreGlowIntensity;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vDistanceFromCenter;

  void main() {
    // Create cube-shaped particles with 3D shading
    vec2 coord = gl_PointCoord - vec2(0.5);

    // Create a square/cube shape
    float edge = 0.45;
    float softEdge = 0.48;

    // Hard edges for cube shape
    if (abs(coord.x) > softEdge || abs(coord.y) > softEdge) {
      discard;
    }

    // Create 3D cube illusion with lighting
    // Simulate three visible faces of a cube
    vec3 normal = vec3(0.0);
    float faceBrightness = 1.0;

    // Determine which face we're on based on position
    float threshold = 0.15;

    if (coord.x > threshold && coord.y < -threshold) {
      // Right face (lighter)
      normal = vec3(1.0, 0.0, 0.0);
      faceBrightness = 1.0;
    } else if (coord.x < -threshold && coord.y > threshold) {
      // Left face (darker)
      normal = vec3(-1.0, 0.0, 0.0);
      faceBrightness = 0.6;
    } else if (coord.y > threshold) {
      // Top face (medium)
      normal = vec3(0.0, 1.0, 0.0);
      faceBrightness = 0.8;
    } else {
      // Front face
      normal = vec3(0.0, 0.0, 1.0);
      faceBrightness = 0.9;
    }

    // Add edge highlights for cube definition
    float edgeDist = max(abs(coord.x), abs(coord.y));
    float edgeHighlight = smoothstep(edge - 0.02, edge, edgeDist);
    faceBrightness = mix(faceBrightness, faceBrightness * 1.2, edgeHighlight * 0.3);

    // Add soft white glow to core particles - increased radius for more glow
    float coreRadius = 6.0;
    float coreGlow = 0.0;

    if (vDistanceFromCenter < coreRadius) {
      // Smooth falloff from center with stronger intensity
      float coreFactor = 1.0 - (vDistanceFromCenter / coreRadius);
      coreGlow = pow(coreFactor, 1.5) * uCoreGlowIntensity;
    }

    // Mix emotional color with white glow
    vec3 finalColor = mix(vColor, vec3(1.0), coreGlow);

    // Apply face brightness for 3D effect
    finalColor *= faceBrightness;

    // Add extra brightness to the glow
    finalColor += vec3(coreGlow * 0.3);

    gl_FragColor = vec4(finalColor, vOpacity);
  }
`;

interface ParticleSystemProps {
  currentEmotion: EmotionType;
  emotionScores: EmotionScore[];
  consecutiveEmotionCount?: number;
}

export function ParticleSystem({
  currentEmotion,
  emotionScores,
  consecutiveEmotionCount = 0,
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Group>(null!);
  const geometryRef = useRef<THREE.BufferGeometry>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const frameRef = useRef(0);
  const rubikPhaseRef = useRef(0);

  // Big cube made of many mini cubes
  const cubeSize = 10; // 10x10x10 grid of particles
  const particleCount = cubeSize ** 3;

  // Create shader uniforms
  const uniforms = useMemo(() => {
    const emotionColorArray = [
      new THREE.Color(emotionColors.anger),
      new THREE.Color(emotionColors.disgust),
      new THREE.Color(emotionColors.fear),
      new THREE.Color(emotionColors.joy),
      new THREE.Color(emotionColors.neutral),
      new THREE.Color(emotionColors.sadness),
      new THREE.Color(emotionColors.surprise),
    ];

    return {
      uTime: { value: 0 },
      uEmotionColors: { value: emotionColorArray },
      uEmotionWeights: { value: [0, 0, 0, 0, 0, 0, 0] },
      uCoreGlowIntensity: { value: 0.5 },
    };
  }, []);

  // Store original and current positions
  const {
    originalPositions,
    currentPositions,
    targetPositions,
    distortionIntensities,
  } = useMemo(() => {
    const original = new Float32Array(particleCount * 3);
    const current = new Float32Array(particleCount * 3);
    const target = new Float32Array(particleCount * 3);
    const intensities = new Float32Array(particleCount);

    // Create a 3D grid of particles forming a solid cube
    for (let i = 0; i < particleCount; i++) {
      // Calculate 3D position in grid
      let x = i % cubeSize;
      let y = Math.floor(i / cubeSize) % cubeSize;
      let z = Math.floor(i / (cubeSize * cubeSize));

      // Center the cube and add spacing
      x = (x - cubeSize / 2 + 0.5) * 1.6;
      y = (y - cubeSize / 2 + 0.5) * 1.6;
      z = (z - cubeSize / 2 + 0.5) * 1.6;

      const idx = i * 3;
      original[idx] = x;
      original[idx + 1] = y;
      original[idx + 2] = z;
      current[idx] = x;
      current[idx + 1] = y;
      current[idx + 2] = z;
      target[idx] = x;
      target[idx + 1] = y;
      target[idx + 2] = z;
      intensities[i] = 0;
    }

    return {
      originalPositions: original,
      currentPositions: current,
      targetPositions: target,
      distortionIntensities: intensities,
    };
  }, [particleCount, cubeSize]);

  // Initialize geometry
  useEffect(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const positionAttribute = new THREE.BufferAttribute(currentPositions, 3);
    const intensityAttribute = new THREE.BufferAttribute(
      distortionIntensities,
      1,
    );

    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("distortionIntensity", intensityAttribute);
  }, [currentPositions, distortionIntensities]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, []);

  // Helper function to apply Rubik's cube-style rotation to a slice
  const applyRubikRotation = (
    x: number,
    y: number,
    z: number,
    rotationPhase: number,
    consecutiveCount: number
  ): [number, number, number] => {
    // Threshold for when Rubik rotations start
    const threshold = 3;
    if (consecutiveCount < threshold) {
      return [x, y, z];
    }

    // Determine rotation intensity based on consecutive count
    const intensity = Math.min((consecutiveCount - threshold) / 10, 1.0);

    // Cycle through different rotation patterns
    const cycleSpeed = 0.02;
    const cycle = Math.floor(rotationPhase * cycleSpeed) % 6;

    // Define slice thickness (which particles get rotated)
    const sliceThickness = 2.5;

    // Rotation angle increases with consecutive count
    const baseAngle = rotationPhase * 0.03 * intensity;

    let newX = x;
    let newY = y;
    let newZ = z;

    // Different rotation patterns based on cycle
    switch (cycle) {
      case 0: // Rotate top slice around Y axis
        if (y > cubeSize / 2 - sliceThickness) {
          const angle = baseAngle;
          const centerX = 0;
          const centerZ = 0;
          const dx = x - centerX;
          const dz = z - centerZ;
          newX = centerX + dx * Math.cos(angle) - dz * Math.sin(angle);
          newZ = centerZ + dx * Math.sin(angle) + dz * Math.cos(angle);
        }
        break;

      case 1: // Rotate bottom slice around Y axis (opposite direction)
        if (y < -cubeSize / 2 + sliceThickness) {
          const angle = -baseAngle;
          const centerX = 0;
          const centerZ = 0;
          const dx = x - centerX;
          const dz = z - centerZ;
          newX = centerX + dx * Math.cos(angle) - dz * Math.sin(angle);
          newZ = centerZ + dx * Math.sin(angle) + dz * Math.cos(angle);
        }
        break;

      case 2: // Rotate right slice around X axis
        if (x > cubeSize / 2 - sliceThickness) {
          const angle = baseAngle;
          const centerY = 0;
          const centerZ = 0;
          const dy = y - centerY;
          const dz = z - centerZ;
          newY = centerY + dy * Math.cos(angle) - dz * Math.sin(angle);
          newZ = centerZ + dy * Math.sin(angle) + dz * Math.cos(angle);
        }
        break;

      case 3: // Rotate left slice around X axis (opposite direction)
        if (x < -cubeSize / 2 + sliceThickness) {
          const angle = -baseAngle;
          const centerY = 0;
          const centerZ = 0;
          const dy = y - centerY;
          const dz = z - centerZ;
          newY = centerY + dy * Math.cos(angle) - dz * Math.sin(angle);
          newZ = centerZ + dy * Math.sin(angle) + dz * Math.cos(angle);
        }
        break;

      case 4: // Rotate front slice around Z axis
        if (z > cubeSize / 2 - sliceThickness) {
          const angle = baseAngle;
          const centerX = 0;
          const centerY = 0;
          const dx = x - centerX;
          const dy = y - centerY;
          newX = centerX + dx * Math.cos(angle) - dy * Math.sin(angle);
          newY = centerY + dx * Math.sin(angle) + dy * Math.cos(angle);
        }
        break;

      case 5: // Rotate back slice around Z axis (opposite direction)
        if (z < -cubeSize / 2 + sliceThickness) {
          const angle = -baseAngle;
          const centerX = 0;
          const centerY = 0;
          const dx = x - centerX;
          const dy = y - centerY;
          newX = centerX + dx * Math.cos(angle) - dy * Math.sin(angle);
          newY = centerY + dx * Math.sin(angle) + dy * Math.cos(angle);
        }
        break;
    }

    return [newX, newY, newZ];
  };

  // Animation loop
  useFrame((_, delta) => {
    const geometry = geometryRef.current;
    const points = pointsRef.current;
    const material = materialRef.current;

    if (!geometry || !points || !material) return;
    if (!geometry.attributes.position) return;

    // Update frame counter (preserve speed from original)
    frameRef.current += delta * 50;

    // Update Rubik rotation phase
    rubikPhaseRef.current += delta * 60;

    // Update shader uniforms
    material.uniforms.uTime.value = frameRef.current;

    // Update emotion weights for color blending
    const emotionOrder: EmotionType[] = [
      "anger",
      "disgust",
      "fear",
      "joy",
      "neutral",
      "sadness",
      "surprise",
    ];
    const weights = [0, 0, 0, 0, 0, 0, 0];
    emotionScores.forEach((emotionScore) => {
      const index = emotionOrder.indexOf(emotionScore.label);
      if (index !== -1) {
        weights[index] = emotionScore.score;
      }
    });
    material.uniforms.uEmotionWeights.value = weights;

    // Update core glow based on emotion positivity - increased for more intensity
    const emotionGlowIntensity: Record<EmotionType, number> = {
      joy: 0.9, // Brightest
      surprise: 0.85, // Bright
      neutral: 0.6, // Medium
      sadness: 0.4, // Dim
      fear: 0.35, // Dimmer
      disgust: 0.3, // Dimmest
      anger: 0.5, // Dim
    };
    material.uniforms.uCoreGlowIntensity.value =
      emotionGlowIntensity[currentEmotion] || 0.6;

    // Update particle positions with emotion distortions
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const ox = originalPositions[idx];
      const oy = originalPositions[idx + 1];
      const oz = originalPositions[idx + 2];

      // Apply emotion distortion first
      let [dx, dy, dz] = applyEmotionDistortion(
        currentEmotion,
        ox,
        oy,
        oz,
        frameRef.current,
      );

      // Then apply Rubik's cube rotation on top of emotion distortion
      [dx, dy, dz] = applyRubikRotation(
        dx,
        dy,
        dz,
        rubikPhaseRef.current,
        consecutiveEmotionCount
      );

      targetPositions[idx] = dx;
      targetPositions[idx + 1] = dy;
      targetPositions[idx + 2] = dz;

      // Lerp toward target (smooth transitions) - reduced for slower, smoother transitions
      currentPositions[idx] = lerp(currentPositions[idx], dx, 0.04);
      currentPositions[idx + 1] = lerp(currentPositions[idx + 1], dy, 0.04);
      currentPositions[idx + 2] = lerp(currentPositions[idx + 2], dz, 0.04);

      // Calculate distortion intensity based on distance from original position
      const distX = currentPositions[idx] - ox;
      const distY = currentPositions[idx + 1] - oy;
      const distZ = currentPositions[idx + 2] - oz;
      const distance = Math.sqrt(distX * distX + distY * distY + distZ * distZ);

      // Normalize intensity (0-1 range, with max distance of ~10 units)
      distortionIntensities[i] = Math.min(distance / 10.0, 1.0);
    }

    // Update geometry
    geometry.attributes.position.needsUpdate = true;
    if (geometry.attributes.distortionIntensity) {
      geometry.attributes.distortionIntensity.needsUpdate = true;
    }

    // Update edge particles with same distortions
    const edgeGeometry = edgeGeometryRef.current;
    const edgeMaterial = edgeMaterialRef.current;

    if (edgeGeometry && edgeMaterial && edgeGeometry.attributes.position) {
      // Update edge material uniforms to match main material
      edgeMaterial.uniforms.uTime.value = frameRef.current;
      edgeMaterial.uniforms.uEmotionWeights.value = material.uniforms.uEmotionWeights.value;
      edgeMaterial.uniforms.uCoreGlowIntensity.value = material.uniforms.uCoreGlowIntensity.value;

      // Apply same distortions to edge particles
      for (let i = 0; i < edgeCount; i++) {
        const idx = i * 3;
        const ox = edgeOriginalPositions[idx];
        const oy = edgeOriginalPositions[idx + 1];
        const oz = edgeOriginalPositions[idx + 2];

        // Apply emotion distortion first
        let [dx, dy, dz] = applyEmotionDistortion(
          currentEmotion,
          ox,
          oy,
          oz,
          frameRef.current,
        );

        // Then apply Rubik's cube rotation on top
        [dx, dy, dz] = applyRubikRotation(
          dx,
          dy,
          dz,
          rubikPhaseRef.current,
          consecutiveEmotionCount
        );

        edgeTargetPositions[idx] = dx;
        edgeTargetPositions[idx + 1] = dy;
        edgeTargetPositions[idx + 2] = dz;

        // Smooth interpolation
        edgeCurrentPositions[idx] = lerp(
          edgeCurrentPositions[idx],
          edgeTargetPositions[idx],
          0.04,
        );
        edgeCurrentPositions[idx + 1] = lerp(
          edgeCurrentPositions[idx + 1],
          edgeTargetPositions[idx + 1],
          0.04,
        );
        edgeCurrentPositions[idx + 2] = lerp(
          edgeCurrentPositions[idx + 2],
          edgeTargetPositions[idx + 2],
          0.04,
        );

        // Calculate distortion intensity
        const distance = Math.sqrt(
          Math.pow(edgeCurrentPositions[idx] - ox, 2) +
            Math.pow(edgeCurrentPositions[idx + 1] - oy, 2) +
            Math.pow(edgeCurrentPositions[idx + 2] - oz, 2),
        );

        edgeIntensities[i] = Math.min(distance / 10.0, 1.0);
      }

      edgeGeometry.attributes.position.needsUpdate = true;
      if (edgeGeometry.attributes.distortionIntensity) {
        edgeGeometry.attributes.distortionIntensity.needsUpdate = true;
      }
    }

    // Automatic rotation removed - now controlled by OrbitControls
  });

  // Create edge particles for cube outline that morphs with distortions
  const {
    edgeOriginalPositions,
    edgeCurrentPositions,
    edgeTargetPositions,
    edgeIntensities,
    edgeCount,
  } = useMemo(() => {
    const edgeParticles: Array<{x: number, y: number, z: number}> = [];
    const halfSize = (cubeSize - 1) / 2;
    const spacing = 1.07;

    // Generate edge particles along the 12 edges of the cube
    const steps = cubeSize; // Number of particles per edge

    // Helper to add edge particles
    const addEdge = (
      startX: number, startY: number, startZ: number,
      endX: number, endY: number, endZ: number
    ) => {
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const x = (startX + (endX - startX) * t) * spacing;
        const y = (startY + (endY - startY) * t) * spacing;
        const z = (startZ + (endZ - startZ) * t) * spacing;
        edgeParticles.push({x, y, z});
      }
    };

    // Bottom face edges (4 edges)
    addEdge(-halfSize, -halfSize, -halfSize, halfSize, -halfSize, -halfSize);
    addEdge(halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize);
    addEdge(halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize);
    addEdge(-halfSize, -halfSize, halfSize, -halfSize, -halfSize, -halfSize);

    // Top face edges (4 edges)
    addEdge(-halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize);
    addEdge(halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize);
    addEdge(halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize);
    addEdge(-halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize);

    // Vertical edges (4 edges)
    addEdge(-halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize);
    addEdge(halfSize, -halfSize, -halfSize, halfSize, halfSize, -halfSize);
    addEdge(halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize);
    addEdge(-halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize);

    const count = edgeParticles.length;
    const positions = new Float32Array(count * 3);
    const original = new Float32Array(count * 3);
    const current = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const intensities = new Float32Array(count);

    edgeParticles.forEach((particle, i) => {
      const idx = i * 3;
      positions[idx] = particle.x;
      positions[idx + 1] = particle.y;
      positions[idx + 2] = particle.z;
      original[idx] = particle.x;
      original[idx + 1] = particle.y;
      original[idx + 2] = particle.z;
      current[idx] = particle.x;
      current[idx + 1] = particle.y;
      current[idx + 2] = particle.z;
      target[idx] = particle.x;
      target[idx + 1] = particle.y;
      target[idx + 2] = particle.z;
      intensities[i] = 0;
    });

    return {
      edgePositions: positions,
      edgeOriginalPositions: original,
      edgeCurrentPositions: current,
      edgeTargetPositions: target,
      edgeIntensities: intensities,
      edgeCount: count,
    };
  }, [cubeSize]);

  const edgeGeometryRef = useRef<THREE.BufferGeometry>(null!);
  const edgeMaterialRef = useRef<THREE.ShaderMaterial>(null!);

  // Initialize edge geometry
  useEffect(() => {
    const geometry = edgeGeometryRef.current;
    if (!geometry) return;

    const positionAttribute = new THREE.BufferAttribute(edgeCurrentPositions, 3);
    const intensityAttribute = new THREE.BufferAttribute(edgeIntensities, 1);

    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("distortionIntensity", intensityAttribute);
  }, [edgeCurrentPositions, edgeIntensities]);

  return (
    <group ref={pointsRef}>
      {/* Main particle system */}
      <points scale={1.0}>
        <bufferGeometry ref={geometryRef} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthTest={true}
          depthWrite={false}
        />
      </points>

      {/* Edge particles that morph with distortions */}
      <points scale={1.0}>
        <bufferGeometry ref={edgeGeometryRef} />
        <shaderMaterial
          ref={edgeMaterialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthTest={true}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
