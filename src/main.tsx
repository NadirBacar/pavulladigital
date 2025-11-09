import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Or add programmatically in your main.ts/tsx:
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/eruda';
script.onload = () => (window as any).eruda.init();
document.head.appendChild(script);

createRoot(document.getElementById("root")!).render(<App />);
