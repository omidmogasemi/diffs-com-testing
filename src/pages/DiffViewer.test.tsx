import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WorkerPoolContextProvider } from "@pierre/diffs/react";
import AppRoutes from "../routes";
import { CONTROLS, DEFAULT_OPTIONS } from "../diff/options";

/**
 * jsdom has no module-worker support, so the pool gets an inert stub. These
 * tests are about the gallery's own wiring — which controls exist, what they
 * are scoped to, and that the surfaces mount — not about syntax highlighting,
 * which never resolves here.
 */
class StubWorker implements Partial<Worker> {
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
}

function renderGallery() {
  return render(
    <WorkerPoolContextProvider
      poolOptions={{
        workerFactory: () => new StubWorker() as unknown as Worker,
        poolSize: 1,
      }}
      highlighterOptions={{
        theme: { dark: "github-dark", light: "github-light" },
        langs: ["javascript", "typescript", "text"],
      }}
    >
      <MemoryRouter initialEntries={["/diff"]}>
        <AppRoutes />
      </MemoryRouter>
    </WorkerPoolContextProvider>,
  );
}

describe("feature gallery", () => {
  it("mounts inside the worker pool provider with the upload inputs intact", () => {
    renderGallery();

    expect(
      screen.getByRole("heading", { name: "Feature gallery" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Left File (Original)")).toBeInTheDocument();
    expect(screen.getByLabelText("Right File (Modified)")).toBeInTheDocument();
  });

  it("renders a control for every option, starting at the library defaults", () => {
    renderGallery();
    const panel = screen.getByRole("complementary", {
      name: "Rendering options",
    });

    for (const control of CONTROLS) {
      const field = within(panel).getByLabelText(control.label);

      if (control.kind === "toggle") {
        expect(field).toHaveProperty("checked", DEFAULT_OPTIONS[control.key]);
      } else {
        expect(field).toHaveValue(
          control.kind === "number"
            ? DEFAULT_OPTIONS[control.key]
            : String(DEFAULT_OPTIONS[control.key]),
        );
      }
    }
  });

  it("drives the diff from the panel", () => {
    renderGallery();

    const diffStyle = screen.getByLabelText("diffStyle");
    expect(diffStyle).toHaveValue("split");

    fireEvent.change(diffStyle, { target: { value: "unified" } });
    expect(diffStyle).toHaveValue("unified");

    const lineNumbers = screen.getByLabelText("disableLineNumbers");
    fireEvent.click(lineNumbers);
    expect(lineNumbers).toBeChecked();
  });

  it("disables the diff-only controls on the single-file viewer", () => {
    renderGallery();

    // The last sample is the single file, which only offers the File surface.
    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "single" },
    });

    expect(screen.getByLabelText("Component")).toHaveValue("file");
    expect(screen.getByLabelText("diffStyle")).toBeDisabled();
    expect(screen.getByLabelText("overflow")).toBeEnabled();
  });

  it("offers PatchDiff only for a single-file patch", () => {
    renderGallery();
    const content = screen.getByLabelText("Content");
    const component = screen.getByLabelText("Component");

    fireEvent.change(content, { target: { value: "patch-single" } });
    expect(
      within(component).getByRole("option", { name: "PatchDiff" }),
    ).toBeInTheDocument();

    // A two-file patch makes PatchDiff throw, so it is not offered at all.
    fireEvent.change(content, { target: { value: "patch-multi" } });
    expect(
      within(component).queryByRole("option", { name: "PatchDiff" }),
    ).not.toBeInTheDocument();
    expect(component).toHaveValue("patch-files");
  });

  it("switches the component for a sample that supports several", () => {
    renderGallery();

    const component = screen.getByLabelText("Component");
    expect(component).toHaveValue("file-diff");

    fireEvent.change(component, { target: { value: "multi-file-diff" } });
    expect(component).toHaveValue("multi-file-diff");
  });
});
