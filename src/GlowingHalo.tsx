import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

export function GlowingHalo({
  color = "hotpink",
  intensity = 1.0,
}: {
  color?: string;
  intensity?: number;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05 * intensity;
    if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[0.8, 1.0, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        side={2} // DoubleSide
      />
    </mesh>
  );
}
