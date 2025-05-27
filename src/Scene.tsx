import { Canvas } from "@react-three/fiber";
import { GlowingHalo } from "./GlowingHalo";

export default function Scene() {
  return (
    <div style={{ width: "100%", height: "100vh", background: "inherit" }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight />
        <GlowingHalo color="#00ffff" intensity={1.0} />
      </Canvas>
    </div>
  );
}
