import type { FileContents } from "@pierre/diffs/react";

/**
 * A large file, generated rather than checked in: a few thousand literal lines
 * would dominate the repository and every grep in it, and the generator says
 * what the shape is more clearly than the output would.
 *
 * Generation is deterministic — same input, same bytes — so the diff between
 * the two variants below is exactly the edits `editEvery` introduces and
 * nothing else.
 */

const RULE_COUNT = 240;

/** ~6 lines per rule plus the preamble, so roughly 1,500 lines. */
export function buildLargeFile(edited: boolean): string {
  const header = [
    "// Generated validation rules — do not edit by hand.",
    "// Source: scripts/generate-rules.ts",
    "",
    "export interface Rule {",
    "  id: string;",
    "  description: string;",
    "  validate(value: string): boolean;",
    "}",
    "",
    "export const rules: Rule[] = [",
  ];

  const body: string[] = [];
  for (let i = 0; i < RULE_COUNT; i++) {
    const id = String(i).padStart(4, "0");
    const minLength = 3 + (i % 17);
    // Every 25th rule differs between the two variants, which scatters the
    // hunks through the file instead of clustering them at one end.
    const changed = edited && i % 25 === 0;

    body.push("  {");
    body.push(`    id: "rule-${id}",`);
    body.push(
      changed
        ? `    description: "Rule ${id}: value must be at least ${minLength + 1} characters",`
        : `    description: "Rule ${id}: value must be at least ${minLength} characters",`,
    );
    body.push(
      changed
        ? `    validate: (value) => value.trim().length >= ${minLength + 1},`
        : `    validate: (value) => value.length >= ${minLength},`,
    );
    body.push("  },");
  }

  const footer = [
    "];",
    "",
    "export function findRule(id: string): Rule | undefined {",
    "  return rules.find((rule) => rule.id === id);",
    "}",
    "",
  ];

  if (edited) {
    // A whole added function, so the diff has one large insertion as well as
    // the scattered single-line changes.
    footer.splice(
      footer.length - 1,
      0,
      "export function failingRules(value: string): Rule[] {",
      "  return rules.filter((rule) => !rule.validate(value));",
      "}",
      "",
    );
  }

  return [...header, ...body, ...footer].join("\n");
}

export const largeFile: FileContents = {
  cacheKey: "sample-large-before",
  name: "src/generated/rules.ts",
  lang: "typescript",
  contents: buildLargeFile(false),
};

export const largeFileEdited: FileContents = {
  cacheKey: "sample-large-after",
  name: "src/generated/rules.ts",
  lang: "typescript",
  contents: buildLargeFile(true),
};

/** Line count of the generated file, handy for labels and for tests. */
export const LARGE_FILE_LINE_COUNT = largeFile.contents.split("\n").length;
