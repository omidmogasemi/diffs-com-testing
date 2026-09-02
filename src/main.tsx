import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { WorkerPoolContextProvider } from "@pierre/diffs/react";
import AppRoutes from "./routes";

// HashRouter rather than BrowserRouter: Tauri serves the bundle from a custom
// protocol with no history fallback, so path-based deep links would 404.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WorkerPoolContextProvider
      poolOptions={{
        workerFactory: () =>
          new Worker(
            new URL("@pierre/diffs/worker/worker.js", import.meta.url),
            {
              type: "module",
            },
          ),
        poolSize: 4,
      }}
      highlighterOptions={{
        theme: {
          dark: "github-dark",
          light: "github-light",
        },
        langs: [
          "javascript",
          "typescript",
          "json",
          "markdown",
          "css",
          "html",
          "python",
          "rust",
          "go",
          "java",
          "text",
        ],
      }}
    >
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </WorkerPoolContextProvider>
  </React.StrictMode>,
);
