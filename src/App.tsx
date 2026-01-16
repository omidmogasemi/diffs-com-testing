import { useState } from "react";
import { FileDiff, FileContents } from "@pierre/diffs/react";
import { parseDiffFromFile, getFiletypeFromFileName } from "@pierre/diffs";
import "./App.css";

function App() {
  const [leftFile, setLeftFile] = useState<FileContents | null>(null);
  const [rightFile, setRightFile] = useState<FileContents | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right"
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

  const fileDiff = leftFile && rightFile
    ? parseDiffFromFile(leftFile, rightFile)
    : null;

  return (
    <main className="container">
      <h1>File Diff Viewer</h1>

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

      {!fileDiff && (
        <p className="hint">Upload two files to see the diff</p>
      )}
    </main>
  );
}

export default App;
