import { describe, expect, it } from "vitest";
import { parseDiffFromFile, parsePatchFiles } from "@pierre/diffs";
import { buildLargeFile } from "./large";
import {
  CONFLICT_MARKERS,
  conflictedFile,
  getSample,
  LARGE_FILE_LINE_COUNT,
  largeFile,
  largeFileEdited,
  samples,
  multiFilePatch,
  singleFilePatch,
} from ".";

describe("samples", () => {
  it("have unique ids", () => {
    const ids = samples.map((sample) => sample.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("are all reachable by id", () => {
    for (const sample of samples) {
      expect(getSample(sample.id)).toBe(sample);
    }
  });

  it("returns undefined for an unknown id", () => {
    expect(getSample("nope")).toBeUndefined();
  });

  it("produce a non-empty diff for every pair", () => {
    const pairs = samples.filter((sample) => sample.kind === "pair");
    expect(pairs.length).toBeGreaterThan(0);

    for (const pair of pairs) {
      expect(pair.oldFile.contents).not.toBe(pair.newFile.contents);
      const diff = parseDiffFromFile(pair.oldFile, pair.newFile);
      expect(diff.hunks.length).toBeGreaterThan(0);
    }
  });
});

describe("unified patch fixtures", () => {
  it("parses the multi-file patch into the four files it touches", () => {
    const [patch, ...rest] = parsePatchFiles(multiFilePatch);

    expect(rest).toHaveLength(0);
    expect(patch.files.map((file) => file.name)).toEqual([
      "src/server.ts",
      "src/middleware/rateLimit.ts",
      "src/throttle.ts",
      "README.md",
    ]);
  });

  it("reports the change type of each file", () => {
    const [patch] = parsePatchFiles(multiFilePatch);
    expect(patch.files.map((file) => file.type)).toEqual([
      "change",
      "new",
      "deleted",
      "change",
    ]);
  });

  /**
   * PatchDiff calls getSingularPatch, which throws on a patch holding more
   * than one file — so the single-file fixture has to stay single-file.
   */
  it("keeps the single-file patch to exactly one file", () => {
    const parsed = parsePatchFiles(singleFilePatch);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].files).toHaveLength(1);
    expect(parsed[0].files[0].hunks.length).toBeGreaterThan(0);
  });

  it("gives every patch sample a patch that parses", () => {
    const patchSamples = samples.filter(
      (sample) => sample.kind === "patch" || sample.kind === "multi-patch",
    );
    expect(patchSamples.length).toBe(2);

    for (const sample of patchSamples) {
      const files = parsePatchFiles(sample.patch).flatMap(
        (parsed) => parsed.files,
      );
      expect(files.length).toBeGreaterThan(0);
      if (sample.kind === "patch") expect(files).toHaveLength(1);
    }
  });
});

describe("conflict fixture", () => {
  it("still carries every conflict marker", () => {
    for (const marker of CONFLICT_MARKERS) {
      expect(conflictedFile.contents).toContain(marker);
    }
  });
});

describe("large file fixture", () => {
  it("is large enough to be worth calling large", () => {
    expect(LARGE_FILE_LINE_COUNT).toBeGreaterThan(1000);
  });

  it("differs from its edited copy in scattered places", () => {
    const diff = parseDiffFromFile(largeFile, largeFileEdited);
    expect(diff.hunks.length).toBeGreaterThan(5);
  });

  it("generates the same bytes every time", () => {
    expect(buildLargeFile(false)).toBe(largeFile.contents);
    expect(buildLargeFile(true)).toBe(largeFileEdited.contents);
  });
});
