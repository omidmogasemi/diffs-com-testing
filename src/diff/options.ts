import type { FileDiffOptions, FileOptions } from "@pierre/diffs/react";

/**
 * The gallery's control surface.
 *
 * Every field here maps to a real `@pierre/diffs` option, and the defaults
 * below are the library's own defaults (read off the 1.4.2 renderers) rather
 * than our preferences — so the page opens showing what a caller gets when
 * they pass no options at all.
 */
export interface GalleryOptions {
  // BaseCodeOptions
  themePair: ThemePairId;
  themeType: "system" | "light" | "dark";
  overflow: "scroll" | "wrap";
  disableLineNumbers: boolean;
  collapsed: boolean;
  disableFileHeader: boolean;
  stickyHeader: boolean;
  disableVirtualizationBuffers: boolean;
  useCSSClasses: boolean;
  useTokenTransformer: boolean;
  tokenizeMaxLineLength: number;
  tokenizeMaxLength: number;

  // BaseDiffOptions
  diffStyle: "unified" | "split";
  diffIndicators: "classic" | "bars" | "none";
  hunkSeparators: "simple" | "metadata" | "line-info" | "line-info-basic";
  disableBackground: boolean;
  expandUnchanged: boolean;
  collapsedContextThreshold: number;
  expansionLineCount: number;
  lineDiffType: "word-alt" | "word" | "char" | "none";
  maxLineDiffLength: number;

  // InteractionManagerBaseOptions
  lineHoverHighlight: "disabled" | "both" | "number" | "line";
  enableLineSelection: boolean;
  /**
   * The library has two gutter-utility APIs and throws if both are supplied,
   * so this is one control rather than a toggle plus a renderer.
   */
  gutterUtility: "off" | "built-in" | "custom";
  enableTokenInteractionsOnWhitespace: boolean;
}

/**
 * Light/dark theme pairs. The library takes either a single theme name or a
 * `{ light, dark }` record; pairing them keeps `themeType` meaningful, since
 * switching to light with only a dark theme registered has nothing to show.
 */
export const THEME_PAIRS = {
  github: { label: "GitHub", light: "github-light", dark: "github-dark" },
  vitesse: { label: "Vitesse", light: "vitesse-light", dark: "vitesse-dark" },
  catppuccin: {
    label: "Catppuccin",
    light: "catppuccin-latte",
    dark: "catppuccin-mocha",
  },
  solarized: {
    label: "Solarized",
    light: "solarized-light",
    dark: "solarized-dark",
  },
  one: { label: "One", light: "one-light", dark: "one-dark-pro" },
  minNord: { label: "Min / Nord", light: "min-light", dark: "nord" },
} as const;

export type ThemePairId = keyof typeof THEME_PAIRS;

export const DEFAULT_OPTIONS: GalleryOptions = {
  themePair: "github",
  themeType: "system",
  overflow: "scroll",
  disableLineNumbers: false,
  collapsed: false,
  disableFileHeader: false,
  stickyHeader: false,
  disableVirtualizationBuffers: false,
  useCSSClasses: false,
  useTokenTransformer: false,
  tokenizeMaxLineLength: 1000,
  tokenizeMaxLength: 100000,

  diffStyle: "split",
  diffIndicators: "bars",
  hunkSeparators: "line-info",
  disableBackground: false,
  expandUnchanged: false,
  collapsedContextThreshold: 1,
  expansionLineCount: 100,
  lineDiffType: "word-alt",
  maxLineDiffLength: 1000,

  lineHoverHighlight: "disabled",
  enableLineSelection: false,
  gutterUtility: "off",
  enableTokenInteractionsOnWhitespace: false,
};

/* --- Control schema ------------------------------------------------------ */

type KeysOfType<T> = {
  [K in keyof GalleryOptions]: GalleryOptions[K] extends T ? K : never;
}[keyof GalleryOptions];

export type BooleanOptionKey = KeysOfType<boolean>;
export type NumberOptionKey = KeysOfType<number>;
export type StringOptionKey = Exclude<
  keyof GalleryOptions,
  BooleanOptionKey | NumberOptionKey
>;

export type ControlGroup =
  "Layout" | "Diff rendering" | "Highlighting" | "Interaction";

/**
 * `all` controls apply to every surface; `diff` ones are ignored by the
 * single-file viewer, so the panel greys them out rather than pretending.
 */
export type ControlScope = "all" | "diff";

interface ControlBase {
  label: string;
  help: string;
  group: ControlGroup;
  scope: ControlScope;
}

export type Control =
  | (ControlBase & { kind: "toggle"; key: BooleanOptionKey })
  | (ControlBase & {
      kind: "select";
      key: StringOptionKey;
      choices: readonly { value: string; label: string }[];
    })
  | (ControlBase & {
      kind: "number";
      key: NumberOptionKey;
      min: number;
      max: number;
      step: number;
    });

const themeChoices = Object.entries(THEME_PAIRS).map(([value, pair]) => ({
  value,
  label: pair.label,
}));

export const CONTROLS: readonly Control[] = [
  // --- Layout ---
  {
    kind: "select",
    key: "diffStyle",
    label: "diffStyle",
    help: "Side-by-side or a single interleaved column.",
    group: "Layout",
    scope: "diff",
    choices: [
      { value: "split", label: "split" },
      { value: "unified", label: "unified" },
    ],
  },
  {
    kind: "select",
    key: "overflow",
    label: "overflow",
    help: "Scroll long lines horizontally, or wrap them.",
    group: "Layout",
    scope: "all",
    choices: [
      { value: "scroll", label: "scroll" },
      { value: "wrap", label: "wrap" },
    ],
  },
  {
    kind: "toggle",
    key: "disableLineNumbers",
    label: "disableLineNumbers",
    help: "Hide the line-number gutter.",
    group: "Layout",
    scope: "all",
  },
  {
    kind: "toggle",
    key: "disableFileHeader",
    label: "disableFileHeader",
    help: "Render without the filename header bar.",
    group: "Layout",
    scope: "all",
  },
  {
    kind: "toggle",
    key: "stickyHeader",
    label: "stickyHeader",
    help: "Pin the file header while the content scrolls under it.",
    group: "Layout",
    scope: "all",
  },
  {
    kind: "toggle",
    key: "collapsed",
    label: "collapsed",
    help: "Start collapsed to just the header.",
    group: "Layout",
    scope: "all",
  },
  {
    kind: "toggle",
    key: "disableVirtualizationBuffers",
    label: "disableVirtualizationBuffers",
    help: "Render every row instead of a window around the viewport. Slow on large files, which is the point of trying it.",
    group: "Layout",
    scope: "all",
  },

  // --- Diff rendering ---
  {
    kind: "select",
    key: "diffIndicators",
    label: "diffIndicators",
    help: "How added and removed lines are marked beside the code.",
    group: "Diff rendering",
    scope: "diff",
    choices: [
      { value: "bars", label: "bars" },
      { value: "classic", label: "classic (+/-)" },
      { value: "none", label: "none" },
    ],
  },
  {
    kind: "select",
    key: "hunkSeparators",
    label: "hunkSeparators",
    help: "The divider drawn between hunks. line-info variants are the ones that expose hunk expansion.",
    group: "Diff rendering",
    scope: "diff",
    choices: [
      { value: "line-info", label: "line-info" },
      { value: "line-info-basic", label: "line-info-basic" },
      { value: "metadata", label: "metadata" },
      { value: "simple", label: "simple" },
    ],
  },
  {
    kind: "toggle",
    key: "disableBackground",
    label: "disableBackground",
    help: "Drop the green/red row tints and keep only the indicators.",
    group: "Diff rendering",
    scope: "diff",
  },
  {
    kind: "toggle",
    key: "expandUnchanged",
    label: "expandUnchanged",
    help: "Show the whole file rather than collapsing untouched regions.",
    group: "Diff rendering",
    scope: "diff",
  },
  {
    kind: "number",
    key: "collapsedContextThreshold",
    label: "collapsedContextThreshold",
    help: "Collapse a gap only when it is larger than this many lines.",
    group: "Diff rendering",
    scope: "diff",
    min: 0,
    max: 50,
    step: 1,
  },
  {
    kind: "number",
    key: "expansionLineCount",
    label: "expansionLineCount",
    help: "Lines revealed per click on a hunk expander.",
    group: "Diff rendering",
    scope: "diff",
    min: 1,
    max: 500,
    step: 10,
  },

  // --- Highlighting ---
  {
    kind: "select",
    key: "themePair",
    label: "theme",
    help: "Shiki theme pair. Highlighting happens in the worker pool, so changing this re-tokenizes.",
    group: "Highlighting",
    scope: "all",
    choices: themeChoices,
  },
  {
    kind: "select",
    key: "themeType",
    label: "themeType",
    help: "Which half of the pair to show: follow the OS, or force one.",
    group: "Highlighting",
    scope: "all",
    choices: [
      { value: "system", label: "system" },
      { value: "light", label: "light" },
      { value: "dark", label: "dark" },
    ],
  },
  {
    kind: "select",
    key: "lineDiffType",
    label: "lineDiffType",
    help: "Granularity of the within-line highlight on changed lines.",
    group: "Highlighting",
    scope: "diff",
    choices: [
      { value: "word-alt", label: "word-alt" },
      { value: "word", label: "word" },
      { value: "char", label: "char" },
      { value: "none", label: "none" },
    ],
  },
  {
    kind: "number",
    key: "maxLineDiffLength",
    label: "maxLineDiffLength",
    help: "Lines longer than this skip the within-line diff.",
    group: "Highlighting",
    scope: "diff",
    min: 0,
    max: 20000,
    step: 100,
  },
  {
    kind: "toggle",
    key: "useCSSClasses",
    label: "useCSSClasses",
    help: "Emit theme CSS classes instead of inline colour styles.",
    group: "Highlighting",
    scope: "all",
  },
  {
    kind: "toggle",
    key: "useTokenTransformer",
    label: "useTokenTransformer",
    help: "Run tokens through the shiki transformer pipeline.",
    group: "Highlighting",
    scope: "all",
  },
  {
    kind: "number",
    key: "tokenizeMaxLineLength",
    label: "tokenizeMaxLineLength",
    help: "Lines longer than this are left unhighlighted.",
    group: "Highlighting",
    scope: "all",
    min: 0,
    max: 20000,
    step: 100,
  },
  {
    kind: "number",
    key: "tokenizeMaxLength",
    label: "tokenizeMaxLength",
    help: "Files larger than this (in characters) are left unhighlighted.",
    group: "Highlighting",
    scope: "all",
    min: 0,
    max: 1000000,
    step: 10000,
  },

  // --- Interaction ---
  {
    kind: "select",
    key: "lineHoverHighlight",
    label: "lineHoverHighlight",
    help: "What lights up under the pointer.",
    group: "Interaction",
    scope: "all",
    choices: [
      { value: "disabled", label: "disabled" },
      { value: "both", label: "both" },
      { value: "line", label: "line" },
      { value: "number", label: "number" },
    ],
  },
  {
    kind: "toggle",
    key: "enableLineSelection",
    label: "enableLineSelection",
    help: "Click and drag the gutter to select a line range.",
    group: "Interaction",
    scope: "all",
  },
  {
    kind: "select",
    key: "gutterUtility",
    label: "enableGutterUtility",
    help: "The hover affordance in the gutter. built-in uses onGutterUtilityClick; custom renders your own node through renderGutterUtility. Supplying both throws, so this is one control.",
    group: "Interaction",
    scope: "all",
    choices: [
      { value: "off", label: "off" },
      { value: "built-in", label: "built-in (onGutterUtilityClick)" },
      { value: "custom", label: "custom (renderGutterUtility)" },
    ],
  },
  {
    kind: "toggle",
    key: "enableTokenInteractionsOnWhitespace",
    label: "enableTokenInteractionsOnWhitespace",
    help: "Fire token events over indentation as well as over code.",
    group: "Interaction",
    scope: "all",
  },
];

export const CONTROL_GROUPS: readonly ControlGroup[] = [
  "Layout",
  "Diff rendering",
  "Highlighting",
  "Interaction",
];

/* --- Translation to library options -------------------------------------- */

/**
 * `theme`, `lineDiffType`, `maxLineDiffLength`, `useTokenTransformer` and
 * `tokenizeMaxLineLength` are resolved inside the highlighting worker, not by
 * the component. Passing them in `options` alone changes nothing once a worker
 * pool is mounted — the pool has to be told too, via
 * `WorkerPoolManager.setRenderOptions`. The page does both; this is the list it
 * forwards to the pool.
 */
export function poolRenderOptions(options: GalleryOptions) {
  return {
    theme: themeFor(options),
    useTokenTransformer: options.useTokenTransformer,
    tokenizeMaxLineLength: options.tokenizeMaxLineLength,
    lineDiffType: options.lineDiffType,
    maxLineDiffLength: options.maxLineDiffLength,
  };
}

export function themeFor(options: GalleryOptions) {
  const pair = THEME_PAIRS[options.themePair];
  return { light: pair.light, dark: pair.dark };
}

/**
 * The options both surfaces understand: everything from `BaseCodeOptions` plus
 * the interaction handlers. Split out because `FileOptions` and
 * `FileDiffOptions` are not assignable to each other — their header-render
 * callbacks are typed against different metadata.
 */
function sharedOptions(options: GalleryOptions) {
  return {
    theme: themeFor(options),
    themeType: options.themeType,
    overflow: options.overflow,
    disableLineNumbers: options.disableLineNumbers,
    collapsed: options.collapsed,
    disableFileHeader: options.disableFileHeader,
    stickyHeader: options.stickyHeader,
    disableVirtualizationBuffers: options.disableVirtualizationBuffers,
    useCSSClasses: options.useCSSClasses,
    useTokenTransformer: options.useTokenTransformer,
    tokenizeMaxLineLength: options.tokenizeMaxLineLength,
    tokenizeMaxLength: options.tokenizeMaxLength,

    lineHoverHighlight: options.lineHoverHighlight,
    enableLineSelection: options.enableLineSelection,
    enableGutterUtility: options.gutterUtility !== "off",
    enableTokenInteractionsOnWhitespace:
      options.enableTokenInteractionsOnWhitespace,
  };
}

/** Builds the `options` prop for FileDiff, MultiFileDiff and PatchDiff. */
export function buildDiffOptions(
  options: GalleryOptions,
): FileDiffOptions<undefined, undefined> {
  return {
    ...sharedOptions(options),
    diffStyle: options.diffStyle,
    diffIndicators: options.diffIndicators,
    hunkSeparators: options.hunkSeparators,
    disableBackground: options.disableBackground,
    expandUnchanged: options.expandUnchanged,
    collapsedContextThreshold: options.collapsedContextThreshold,
    expansionLineCount: options.expansionLineCount,
    lineDiffType: options.lineDiffType,
    maxLineDiffLength: options.maxLineDiffLength,
  };
}

/**
 * Builds the `options` prop for the single-file viewer, which has no diff to
 * configure — the panel greys those controls out to match.
 */
export function buildFileOptions(
  options: GalleryOptions,
): FileOptions<undefined, undefined> {
  return sharedOptions(options);
}
