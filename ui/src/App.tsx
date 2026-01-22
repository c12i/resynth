import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import About from "./pages/About";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Play />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}