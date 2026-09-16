import { useCallback, useEffect, useMemo, useState } from "react";
import {
  File,
  FileDiff,
  MultiFileDiff,
  PatchDiff,
  useWorkerPool,
} from "@pierre/diffs/react";
import type {
  FileContents,
  FileDiffMetadata,
  SelectedLineRange,
} from "@pierre/diffs/react";
import {
  getFiletypeFromFileName,
  parseDiffFromFile,
  parsePatchFiles,
} from "@pierre/diffs";
import OptionsPanel, { type OptionValue } from "../diff/OptionsPanel";
import PreviewBoundary from "../diff/PreviewBoundary";
import {
  DEFAULT_OPTIONS,
  buildDiffOptions,
  buildFileOptions,
  poolRenderOptions,
  type GalleryOptions,
} from "../diff/options";
import { SAMPLES, type Sample } from "../diff/samples";
import "./DiffViewer.css";

/** The component the preview pane mounts. */
type SurfaceId =
  "file-diff" | "multi-file-diff" | "patch-diff" | "patch-files" | "file";

const SURFACES: Record<SurfaceId, { label: string; help: string }> = {
  "file-diff": {
    label: "FileDiff",
    help: "Takes diff metadata you parsed yourself with parseDiffFromFile.",
  },
  "multi-file-diff": {
    label: "MultiFileDiff",
    help: "Takes the two files directly and parses them for you.",
  },
  "patch-diff": {
    label: "PatchDiff",
    help: "Takes a unified patch string. It throws on a patch holding more than one file, so it is only offered for single-file patches.",
  },
  "patch-files": {
    label: "parsePatchFiles + FileDiff",
    help: "Splits the patch yourself and renders a FileDiff per file. This is how a multi-file patch is handled.",
  },
  file: {
    label: "File",
    help: "The plain viewer: one file, no diff.",
  },
};

function surfacesFor(sample: Sample, patchFileCount: number): SurfaceId[] {
  switch (sample.kind) {
    case "pair":
      return ["file-diff", "multi-file-diff", "file"];
    case "patch":
      // PatchDiff insists on exactly one file diff, so it is only an option
      // when the patch actually holds one.
      return patchFileCount === 1
        ? ["patch-diff", "patch-files"]
        : ["patch-files"];
    case "file":
      return ["file"];
  }
}

/** The uploaded-files source lives alongside the samples in the same picker. */
const UPLOAD_ID = "__upload__";

const MAX_EVENTS = 40;

export default function DiffViewer() {
  const [options, setOptions] = useState<GalleryOptions>(DEFAULT_OPTIONS);
  const [sampleId, setSampleId] = useState<string>(SAMPLES[0].id);
  const [surfaceId, setSurfaceId] = useState<SurfaceId>("file-diff");
  const [leftFile, setLeftFile] = useState<FileContents | null>(null);
  const [rightFile, setRightFile] = useState<FileContents | null>(null);
  const [selectedLines, setSelectedLines] = useState<SelectedLineRange | null>(
    null,
  );
  const [events, setEvents] = useState<string[]>([]);

  const pool = useWorkerPool();

  // Highlighting runs in the worker pool, which was initialized with the app's
  // startup theme. Component options alone will not move it, so the five
  // render-level options have to be pushed to the pool as well.
  useEffect(() => {
    void pool?.setRenderOptions(poolRenderOptions(options));
  }, [pool, options]);

  const uploadSample: Sample | null = useMemo(() => {
    if (!leftFile || !rightFile) return null;
    return {
      id: UPLOAD_ID,
      label: "Your files",
      kind: "pair",
      oldFile: leftFile,
      newFile: rightFile,
    };
  }, [leftFile, rightFile]);

  const sample: Sample =
    (sampleId === UPLOAD_ID ? uploadSample : null) ??
    SAMPLES.find((s) => s.id === sampleId) ??
    SAMPLES[0];

  // Parsing is what tells us how many files a patch holds, and that decides
  // which surfaces can render it.
  const patchFiles = useMemo(
    () =>
      sample.kind === "patch"
        ? parsePatchFiles(sample.patch).flatMap((parsed) => parsed.files)
        : [],
    [sample],
  );

  const available = surfacesFor(sample, patchFiles.length);
  const surface = available.includes(surfaceId) ? surfaceId : available[0];

  // Reset the selection when what we are looking at changes: line 12 of one
  // file has nothing to do with line 12 of the next.
  useEffect(() => {
    setSelectedLines(null);
  }, [sample.id, surface]);

  const logEvent = useCallback((message: string) => {
    setEvents((prev) => [message, ...prev].slice(0, MAX_EVENTS));
  }, []);

  const handleChange = useCallback(
    (key: keyof GalleryOptions, value: OptionValue) => {
      // The control schema guarantees the value's type matches the key; that
      // correspondence is not expressible in the callback's signature.
      setOptions((prev) => ({ ...prev, [key]: value }) as GalleryOptions);
    },
    [],
  );

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const contents = await file.text();
    const uploaded: FileContents = {
      name: file.name,
      contents,
      lang: getFiletypeFromFileName(file.name) || "text",
    };

    if (side === "left") setLeftFile(uploaded);
    else setRightFile(uploaded);
    setSampleId(UPLOAD_ID);
  };

  const isDirty = useMemo(
    () =>
      (Object.keys(DEFAULT_OPTIONS) as (keyof GalleryOptions)[]).some(
        (key) => options[key] !== DEFAULT_OPTIONS[key],
      ),
    [options],
  );

  return (
    <section className="page page--wide gallery">
      <header className="gallery__intro">
        <h1 className="page__title">Feature gallery</h1>
        <p className="page__lede">
          Every option the panel lists is a real <code>@pierre/diffs</code>{" "}
          prop, and the values it opens with are the library&rsquo;s own
          defaults.
        </p>
      </header>

      <div className="gallery__sources">
        <SourcePicker
          sample={sample}
          sampleId={sampleId}
          hasUpload={uploadSample != null}
          onSelect={setSampleId}
        />
        <SurfacePicker
          available={available}
          surface={surface}
          onSelect={setSurfaceId}
        />
        <UploadControls
          leftFile={leftFile}
          rightFile={rightFile}
          onUpload={handleUpload}
        />
      </div>

      <div className="gallery__body">
        <div className="gallery__preview">
          <PreviewBoundary resetKey={`${sample.id}:${surface}`}>
            <Preview
              sample={sample}
              surface={surface}
              patchFiles={patchFiles}
              options={options}
              selectedLines={selectedLines}
              onSelectLines={setSelectedLines}
              onEvent={logEvent}
            />
          </PreviewBoundary>
          <EventLog
            events={events}
            selectedLines={selectedLines}
            onClear={() => setEvents([])}
          />
        </div>

        <OptionsPanel
          options={options}
          onChange={handleChange}
          onReset={() => setOptions(DEFAULT_OPTIONS)}
          supportsDiffOptions={surface !== "file"}
          isDirty={isDirty}
        />
      </div>
    </section>
  );
}

/* --- Preview -------------------------------------------------------------- */

interface PreviewProps {
  sample: Sample;
  surface: SurfaceId;
  patchFiles: FileDiffMetadata[];
  options: GalleryOptions;
  selectedLines: SelectedLineRange | null;
  onSelectLines: (range: SelectedLineRange | null) => void;
  onEvent: (message: string) => void;
}

function Preview({
  sample,
  surface,
  patchFiles,
  options,
  selectedLines,
  onSelectLines,
  onEvent,
}: PreviewProps) {
  const fileDiff = useMemo(
    () =>
      sample.kind === "pair"
        ? parseDiffFromFile(sample.oldFile, sample.newFile)
        : null,
    [sample],
  );

  const handlers = {
    onLineClick: (props: { lineNumber: number }) =>
      onEvent(`onLineClick line ${props.lineNumber}`),
    onLineNumberClick: (props: { lineNumber: number }) =>
      onEvent(`onLineNumberClick line ${props.lineNumber}`),
    onTokenClick: (props: { tokenText: string }) =>
      onEvent(`onTokenClick ${JSON.stringify(props.tokenText)}`),
    onLineSelected: (range: SelectedLineRange | null) => {
      onSelectLines(range);
      onEvent(
        range
          ? `onLineSelected ${range.start}-${range.end}`
          : "selection cleared",
      );
    },
    // The library throws if `onGutterUtilityClick` and `renderGutterUtility`
    // are both supplied, so only one of the two is ever attached.
    ...(options.gutterUtility === "built-in"
      ? {
          onGutterUtilityClick: (range: SelectedLineRange) =>
            onEvent(`onGutterUtilityClick ${range.start}-${range.end}`),
        }
      : {}),
  };

  const diffOptions = { ...buildDiffOptions(options), ...handlers };
  const fileOptions = { ...buildFileOptions(options), ...handlers };

  const shared = {
    className: "gallery__surface",
    selectedLines,
    ...(options.gutterUtility === "custom"
      ? {
          renderGutterUtility: () => (
            <button
              type="button"
              className="gutter-demo"
              title="Demo gutter action"
              onClick={() => onEvent("renderGutterUtility button clicked")}
            >
              +
            </button>
          ),
        }
      : {}),
  };

  switch (surface) {
    case "file-diff":
      return fileDiff ? (
        <FileDiff {...shared} fileDiff={fileDiff} options={diffOptions} />
      ) : null;

    case "multi-file-diff":
      return sample.kind === "pair" ? (
        <MultiFileDiff
          {...shared}
          oldFile={sample.oldFile}
          newFile={sample.newFile}
          options={diffOptions}
        />
      ) : null;

    case "patch-diff":
      return sample.kind === "patch" ? (
        <PatchDiff {...shared} patch={sample.patch} options={diffOptions} />
      ) : null;

    case "patch-files":
      return (
        <div className="gallery__stack">
          {patchFiles.map((file, i) => (
            <FileDiff
              key={`${file.name}-${i}`}
              {...shared}
              fileDiff={file}
              options={diffOptions}
            />
          ))}
        </div>
      );

    case "file": {
      const file =
        sample.kind === "file"
          ? sample.file
          : sample.kind === "pair"
            ? sample.newFile
            : null;
      return file ? (
        <File {...shared} file={file} options={fileOptions} />
      ) : null;
    }
  }
}

/* --- Pickers -------------------------------------------------------------- */

function SourcePicker({
  sample,
  sampleId,
  hasUpload,
  onSelect,
}: {
  sample: Sample;
  sampleId: string;
  hasUpload: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="picker">
      <label className="picker__label" htmlFor="sample">
        Content
      </label>
      <select
        id="sample"
        className="picker__input"
        value={hasUpload && sampleId === UPLOAD_ID ? UPLOAD_ID : sample.id}
        onChange={(e) => onSelect(e.target.value)}
      >
        {SAMPLES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
        {hasUpload && <option value={UPLOAD_ID}>Your files</option>}
      </select>
      {sample.description && (
        <p className="picker__help">{sample.description}</p>
      )}
    </div>
  );
}

function SurfacePicker({
  available,
  surface,
  onSelect,
}: {
  available: SurfaceId[];
  surface: SurfaceId;
  onSelect: (id: SurfaceId) => void;
}) {
  return (
    <div className="picker">
      <label className="picker__label" htmlFor="surface">
        Component
      </label>
      <select
        id="surface"
        className="picker__input"
        value={surface}
        onChange={(e) => onSelect(e.target.value as SurfaceId)}
      >
        {available.map((id) => (
          <option key={id} value={id}>
            {SURFACES[id].label}
          </option>
        ))}
      </select>
      <p className="picker__help">{SURFACES[surface].help}</p>
    </div>
  );
}

function UploadControls({
  leftFile,
  rightFile,
  onUpload,
}: {
  leftFile: FileContents | null;
  rightFile: FileContents | null;
  onUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right",
  ) => void;
}) {
  return (
    <div className="picker picker--upload">
      <span className="picker__label">Or compare your own</span>
      <div className="upload-row">
        <label className="upload-row__field">
          <span>Left File (Original)</span>
          <input
            type="file"
            aria-label="Left File (Original)"
            onChange={(e) => onUpload(e, "left")}
          />
          {leftFile && <em>{leftFile.name}</em>}
        </label>
        <label className="upload-row__field">
          <span>Right File (Modified)</span>
          <input
            type="file"
            aria-label="Right File (Modified)"
            onChange={(e) => onUpload(e, "right")}
          />
          {rightFile && <em>{rightFile.name}</em>}
        </label>
      </div>
    </div>
  );
}

/* --- Event log ------------------------------------------------------------ */

function EventLog({
  events,
  selectedLines,
  onClear,
}: {
  events: string[];
  selectedLines: SelectedLineRange | null;
  onClear: () => void;
}) {
  return (
    <section className="event-log" aria-label="Interaction events">
      <div className="event-log__head">
        <h2 className="event-log__title">Events</h2>
        {selectedLines && (
          <span className="event-log__selection">
            selectedLines {selectedLines.start}&ndash;{selectedLines.end}
          </span>
        )}
        <button
          type="button"
          className="event-log__clear"
          onClick={onClear}
          disabled={events.length === 0}
        >
          Clear
        </button>
      </div>
      {events.length === 0 ? (
        <p className="event-log__empty">
          Turn on an interaction option, then click the diff.
        </p>
      ) : (
        <ol className="event-log__list">
          {events.map((event, i) => (
            <li key={`${event}-${i}`}>{event}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
