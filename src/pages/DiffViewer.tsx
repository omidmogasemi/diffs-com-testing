import { useState } from "react";
import { FileDiff } from "@pierre/diffs/react";
import type { FileContents } from "@pierre/diffs/react";
import { parseDiffFromFile, getFiletypeFromFileName } from "@pierre/diffs";
import "./DiffViewer.css";

export default function DiffViewer() {
  const [leftFile, setLeftFile] = useState<FileContents | null>(null);
  const [rightFile, setRightFile] = useState<FileContents | null>(null);

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

    if (side === "left") {
      setLeftFile(fileContents);
    } else {
      setRightFile(fileContents);
    }
  };

  const fileDiff =
    leftFile && rightFile ? parseDiffFromFile(leftFile, rightFile) : null;

  return (
    <section className="page">
      <h1 className="page__title">Diff Viewer</h1>

      <div className="upload-section">
        <div className="upload-box">
          <label htmlFor="left-file">Left File (Original)</label>
          <input
            type="file"
            id="left-file"
            onChange={(e) => handleFileUpload(e, "left")}
          />
          {leftFile && <span className="file-name">{leftFile.name}</span>}
        </div>

        <div className="upload-box">
          <label htmlFor="right-file">Right File (Modified)</label>
          <input
            type="file"
            id="right-file"
            onChange={(e) => handleFileUpload(e, "right")}
          />
          {rightFile && <span className="file-name">{rightFile.name}</span>}
        </div>
      </div>

      {fileDiff && (
        <div className="diff-container">
          <FileDiff
            fileDiff={fileDiff}
            options={{
              diffStyle: "split",
              theme: {
                dark: "github-dark",
                light: "github-light",
              },
            }}
          />
        </div>
      )}

      {!fileDiff && <p className="hint">Upload two files to see the diff</p>}
    </section>
  );
}
