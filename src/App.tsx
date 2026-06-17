import { useState } from "react";

import "./App.css";

import { BlockPalette } from "./components/block-palette/BlockPalette";
import { CanvasPreview } from "./components/canvas/CanvasPreview";
import { ExecutionControls } from "./components/execution-controls/ExecutionControls";
import { ShapePanel } from "./components/shape-panel/ShapePanel";
import { ProgramWorkspace } from "./components/workspace/ProgramWorkspace";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <strong className="app__title">Code Bridge</strong>

          <p className="app__description">
            블록코딩으로 이해하고 JavaScript 코드로 연결해요.
          </p>
        </div>

        <ExecutionControls />
      </header>

      <main
        className={`app__layout ${
          isSidebarOpen
            ? "app__layout--sidebar-open"
            : "app__layout--sidebar-closed"
        }`}
      >
        <aside
          className={`app__sidebar ${
            isSidebarOpen ? "app__sidebar--open" : "app__sidebar--closed"
          }`}
        >
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={isSidebarOpen ? "도구 패널 접기" : "도구 패널 펼치기"}
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((current) => !current)}
          >
            <span aria-hidden="true">{isSidebarOpen ? "‹" : "›"}</span>
          </button>

          <div className="app__sidebar-content">
            <ShapePanel />
            <BlockPalette />
          </div>
        </aside>

        <section className="app__workspace">
          <ProgramWorkspace />
        </section>

        <section className="app__preview">
          <CanvasPreview />
        </section>
      </main>
    </div>
  );
}

export default App;
