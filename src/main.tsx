import React from "react";
import ReactDOM from "react-dom/client";
import { WorkerPoolContextProvider } from "@pierre/diffs/react";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WorkerPoolContextProvider
      poolOptions={{
        workerFactory: () =>
          new Worker(
            new URL("@pierre/diffs/worker/worker.js", import.meta.url),
            { type: "module" }
          ),
        poolSize: 4,
      }}
      highlighterOptions={{
        theme: {
          dark: "github-dark",
          light: "github-light",
        },
        langs: ["javascript", "typescript", "json", "markdown", "css", "html", "python", "rust", "go", "java", "text"],
      }}
    >
      <App />
    </WorkerPoolContextProvider>
  </React.StrictMode>
);
