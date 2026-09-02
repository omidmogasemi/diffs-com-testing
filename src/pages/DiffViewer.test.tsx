import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WorkerPoolContextProvider } from "@pierre/diffs/react";
import AppRoutes from "../routes";

/**
 * jsdom has no module-worker support, so the pool gets a inert stub. The point
 * of this test is that routing mounts the diff page inside the worker pool
 * provider, not that syntax highlighting runs.
 */
class StubWorker implements Partial<Worker> {
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
}

describe("diff viewer route", () => {
  it("mounts inside the worker pool provider", () => {
    render(
      <WorkerPoolContextProvider
        poolOptions={{
          workerFactory: () => new StubWorker() as unknown as Worker,
          poolSize: 1,
        }}
        highlighterOptions={{
          theme: { dark: "github-dark", light: "github-light" },
          langs: ["text"],
        }}
      >
        <MemoryRouter initialEntries={["/diff"]}>
          <AppRoutes />
        </MemoryRouter>
      </WorkerPoolContextProvider>,
    );

    expect(screen.getByLabelText("Left File (Original)")).toBeInTheDocument();
    expect(screen.getByLabelText("Right File (Modified)")).toBeInTheDocument();
    expect(
      screen.getByText("Upload two files to see the diff"),
    ).toBeInTheDocument();
  });
});
