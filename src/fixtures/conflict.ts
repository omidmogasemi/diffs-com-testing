import type { FileContents } from "@pierre/diffs/react";

/**
 * A file left in a conflicted state by a merge, markers and all. It is here to
 * see how the viewer treats the markers — they are ordinary lines to a
 * highlighter, so this is what a half-merged file actually looks like on screen.
 */
export const conflictedFile: FileContents = {
  cacheKey: "sample-conflict",
  name: "src/config/featureFlags.ts",
  lang: "typescript",
  contents: `export interface FeatureFlags {
  checkoutV2: boolean;
  darkMode: boolean;
  betaSearch: boolean;
}

export const defaultFlags: FeatureFlags = {
<<<<<<< HEAD
  checkoutV2: true,
  darkMode: true,
  betaSearch: false,
=======
  checkoutV2: false,
  darkMode: true,
  betaSearch: true,
>>>>>>> feature/beta-search
};

export function isEnabled(
  flags: FeatureFlags,
  name: keyof FeatureFlags,
): boolean {
  return flags[name] === true;
}

<<<<<<< HEAD
export function enabledNames(flags: FeatureFlags): string[] {
  return Object.keys(flags).filter((name) =>
    isEnabled(flags, name as keyof FeatureFlags),
  );
}
||||||| merged common ancestor
export function enabledNames(flags: FeatureFlags): string[] {
  return Object.keys(flags);
}
=======
export function enabledNames(flags: FeatureFlags): readonly string[] {
  return Object.freeze(
    Object.entries(flags)
      .filter(([, on]) => on)
      .map(([name]) => name),
  );
}
>>>>>>> feature/beta-search
`,
};

/** The same file before the merge, so the conflict can be viewed as a diff. */
export const preMergeFile: FileContents = {
  cacheKey: "sample-conflict-base",
  name: "src/config/featureFlags.ts",
  lang: "typescript",
  contents: `export interface FeatureFlags {
  checkoutV2: boolean;
  darkMode: boolean;
  betaSearch: boolean;
}

export const defaultFlags: FeatureFlags = {
  checkoutV2: true,
  darkMode: true,
  betaSearch: false,
};

export function isEnabled(
  flags: FeatureFlags,
  name: keyof FeatureFlags,
): boolean {
  return flags[name] === true;
}

export function enabledNames(flags: FeatureFlags): string[] {
  return Object.keys(flags).filter((name) =>
    isEnabled(flags, name as keyof FeatureFlags),
  );
}
`,
};

/** The marker prefixes a merge leaves behind, in the order git writes them. */
export const CONFLICT_MARKERS = ["<<<<<<< ", "||||||| ", "=======", ">>>>>>> "];
