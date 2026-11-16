import { createRoot } from "react-dom/client";
import { ToastRegion } from "@ui-sdk/react/toast";
import "../../src/index.css";
import "./proto.css";
import { SectionBar } from "./section-bar";

export function Harness() {
  return (
    <main>
      <header className="lab-header">
        <div>
          <h1>UI lab</h1>
          <p className="hint">Interface experiments built with UI SDK behaviors.</p>
        </div>
      </header>
      <div className="p-stage">
        <SectionBar />
      </div>
      <div data-agent-hidden>
        <ToastRegion />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Harness />);
