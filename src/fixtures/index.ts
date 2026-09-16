import type { FileContents } from "@pierre/diffs/react";
import {
  jsonAfter,
  jsonBefore,
  markdownAfter,
  markdownBefore,
  renamedAfter,
  renamedBefore,
  typescriptAfter,
  typescriptBefore,
} from "./pairs";
import { multiFilePatch, singleFilePatch } from "./patch";
import { conflictedFile, preMergeFile } from "./conflict";
import { LARGE_FILE_LINE_COUNT, largeFile, largeFileEdited } from "./large";

/**
 * Ready-made inputs for the diff viewer, so a feature can be tried without
 * finding two files to upload first.
 *
 * A sample's `kind` is the way `@pierre/diffs` takes that input: two files to
 * compare (`pair`), one file to display (`file`), a single-file patch string
 * `PatchDiff` renders as-is (`patch`), or a multi-file patch that has to be
 * split with `parsePatchFiles` first (`multi-patch`).
 */

interface SampleBase {
  /** Stable id — used as the `<select>` value and in the URL-free UI state. */
  id: string;
  label: string;
  /** One line on what the sample is for, shown under the picker. */
  description: string;
}

export interface PairSample extends SampleBase {
  kind: "pair";
  oldFile: FileContents;
  newFile: FileContents;
}

export interface FileSample extends SampleBase {
  kind: "file";
  file: FileContents;
}

/** A single-file patch. `PatchDiff` throws on anything wider. */
export interface PatchSample extends SampleBase {
  kind: "patch";
  patch: string;
}

/** A patch over several files, rendered one `FileDiff` per file. */
export interface MultiPatchSample extends SampleBase {
  kind: "multi-patch";
  patch: string;
}

export type Sample = PairSample | FileSample | PatchSample | MultiPatchSample;

export const samples: Sample[] = [
  {
    kind: "pair",
    id: "typescript-refactor",
    label: "TypeScript refactor",
    description:
      "Additions, deletions and in-place edits across one small module.",
    oldFile: typescriptBefore,
    newFile: typescriptAfter,
  },
  {
    kind: "pair",
    id: "json-config",
    label: "JSON config change",
    description: "Added and removed keys in a structured config file.",
    oldFile: jsonBefore,
    newFile: jsonAfter,
  },
  {
    kind: "pair",
    id: "markdown-prose",
    label: "Markdown prose",
    description:
      "Reworded sentences, where the change is inside the line rather than the whole line.",
    oldFile: markdownBefore,
    newFile: markdownAfter,
  },
  {
    kind: "pair",
    id: "rename-with-edits",
    label: "Rename with edits",
    description:
      "The file moves and its contents change, so the header reports a rename.",
    oldFile: renamedBefore,
    newFile: renamedAfter,
  },
  {
    kind: "patch",
    id: "single-file-patch",
    label: "Unified patch (1 file)",
    description:
      "One file's worth of patch text, handed to PatchDiff as the raw string.",
    patch: singleFilePatch,
  },
  {
    kind: "multi-patch",
    id: "multi-file-patch",
    label: "Unified patch (4 files)",
    description:
      "A git-format patch with an edit, a new file and a deletion, split into one diff per file.",
    patch: multiFilePatch,
  },
  {
    kind: "file",
    id: "merge-conflict",
    label: "Merge conflict markers",
    description:
      "A file left mid-merge, with both two-way and three-way conflict markers still in it.",
    file: conflictedFile,
  },
  {
    kind: "pair",
    id: "merge-conflict-diff",
    label: "Merge conflict, as a diff",
    description: "The same conflicted file against its pre-merge version.",
    oldFile: preMergeFile,
    newFile: conflictedFile,
  },
  {
    kind: "file",
    id: "large-file",
    label: `Large file (${LARGE_FILE_LINE_COUNT.toLocaleString()} lines)`,
    description:
      "A generated file big enough to show how rendering behaves at size.",
    file: largeFile,
  },
  {
    kind: "pair",
    id: "large-file-diff",
    label: "Large file, with scattered edits",
    description:
      "The same large file against an edited copy: many small hunks plus one big insertion.",
    oldFile: largeFile,
    newFile: largeFileEdited,
  },
];

export function getSample(id: string): Sample | undefined {
  return samples.find((sample) => sample.id === id);
}

export { CONFLICT_MARKERS, conflictedFile, preMergeFile } from "./conflict";
export { LARGE_FILE_LINE_COUNT, largeFile, largeFileEdited } from "./large";
export { multiFilePatch, singleFilePatch } from "./patch";
export * from "./pairs";
