import { useMemo, useState } from "react";
import { File, FileDiff, PatchDiff } from "@pierre/diffs/react";
import type { FileContents } from "@pierre/diffs/react";
import type { FileDiffOptions, FileOptions } from "@pierre/diffs";
import {
  parseDiffFromFile,
  parsePatchFiles,
  getFiletypeFromFileName,
} from "@pierre/diffs";
import { getSample, samples } from "../fixtures";
import "./DiffViewer.css";

const NO_SAMPLE = "";

const diffOptions: FileDiffOptions<undefined> = {
  diffStyle: "split",
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
};

const fileOptions: FileOptions<undefined> = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
};

export default function DiffViewer() {
  const [sampleId, setSampleId] = useState(NO_SAMPLE);
  const [leftFile, setLeftFile] = useState<FileContents | null>(null);
  const [rightFile, setRightFile] = useState<FileContents | null>(null);
  // Bumped to remount the file inputs, which are uncontrolled: clearing our own
  // state does not clear the "no file chosen" text the browser renders.
  const [uploadKey, setUploadKey] = useState(0);

  const sample = sampleId === NO_SAMPLE ? undefined : getSample(sampleId);

  const handleSampleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSampleId(event.target.value);
    setLeftFile(null);
    setRightFile(null);
    setUploadKey((key) => key + 1);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const contents = await file.text();
    const lang = getFiletypeFromFileName(file.name) || "text";

    const fileContents: FileContents = {
      name: file.name,
      contents,
      lang,
    };

    // An upload and a sample are two answers to the same question, so picking
    // one drops the other.
    setSampleId(NO_SAMPLE);

    if (side === "left") {
      setLeftFile(fileContents);
    } else {
      setRightFile(fileContents);
    }
  };

  const uploadedDiff = useMemo(
    () =>
      leftFile && rightFile ? parseDiffFromFile(leftFile, rightFile) : null,
    [leftFile, rightFile],
  );

  const sampleDiff = useMemo(
    () =>
      sample?.kind === "pair"
        ? parseDiffFromFile(sample.oldFile, sample.newFile)
        : null,
    [sample],
  );

  // PatchDiff only takes single-file patches, so a wider patch is split here
  // and each file rendered on its own.
  const patchFiles = useMemo(
    () =>
      sample?.kind === "multi-patch"
        ? parsePatchFiles(sample.patch).flatMap((parsed) => parsed.files)
        : [],
    [sample],
  );

  return (
    <section className="page">
      <h1 className="page__title">Diff Viewer</h1>

      <div className="sample-picker">
        <label htmlFor="sample">Sample</label>
        <select id="sample" value={sampleId} onChange={handleSampleChange}>
          <option value={NO_SAMPLE}>None — upload files below</option>
          {samples.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        {sample && <p className="sample-picker__hint">{sample.description}</p>}
      </div>

      <div className="upload-section">
        <div className="upload-box">
          <label htmlFor="left-file">Left File (Original)</label>
          <input
            key={`left-${uploadKey}`}
            type="file"
            id="left-file"
            onChange={(e) => handleFileUpload(e, "left")}
          />
          {leftFile && <span className="file-name">{leftFile.name}</span>}
        </div>

        <div className="upload-box">
          <label htmlFor="right-file">Right File (Modified)</label>
          <input
            key={`right-${uploadKey}`}
            type="file"
            id="right-file"
            onChange={(e) => handleFileUpload(e, "right")}
          />
          {rightFile && <span className="file-name">{rightFile.name}</span>}
        </div>
      </div>

      {sampleDiff && (
        <div className="diff-container">
          <FileDiff fileDiff={sampleDiff} options={diffOptions} />
        </div>
      )}

      {sample?.kind === "file" && (
        <div className="diff-container">
          <File file={sample.file} options={fileOptions} />
        </div>
      )}

      {sample?.kind === "patch" && (
        <div className="diff-container">
          <PatchDiff patch={sample.patch} options={diffOptions} />
        </div>
      )}

      {patchFiles.map((file) => (
        <div className="diff-container" key={file.name}>
          <FileDiff fileDiff={file} options={diffOptions} />
        </div>
      ))}

      {uploadedDiff && (
        <div className="diff-container">
          <FileDiff fileDiff={uploadedDiff} options={diffOptions} />
        </div>
      )}

      {!sample && !uploadedDiff && (
        <p className="hint">
          Pick a sample, or upload two files to see the diff
        </p>
      )}
    </section>
  );
}
