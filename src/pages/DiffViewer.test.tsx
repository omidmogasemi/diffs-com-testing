import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WorkerPoolContextProvider } from "@pierre/diffs/react";
import AppRoutes from "../routes";
import { samples } from "../fixtures";

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

function renderDiffViewer() {
  return render(
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
}

describe("diff viewer route", () => {
  it("mounts inside the worker pool provider", () => {
    renderDiffViewer();

    expect(screen.getByLabelText("Left File (Original)")).toBeInTheDocument();
    expect(screen.getByLabelText("Right File (Modified)")).toBeInTheDocument();
    expect(
      screen.getByText("Pick a sample, or upload two files to see the diff"),
    ).toBeInTheDocument();
  });

  it("offers every fixture in the sample picker", () => {
    renderDiffViewer();

    const picker = screen.getByLabelText("Sample");
    const labels = Array.from(picker.querySelectorAll("option")).map(
      (option) => option.textContent,
    );

    for (const sample of samples) {
      expect(labels).toContain(sample.label);
    }
  });

  it("describes the sample once one is picked", () => {
    renderDiffViewer();

    const [first] = samples;
    fireEvent.change(screen.getByLabelText("Sample"), {
      target: { value: first.id },
    });

    expect(screen.getByText(first.description)).toBeInTheDocument();
  });
});
