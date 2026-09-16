# diffs-com-testing

A Tauri + React + TypeScript app. This repo currently holds the app shell —
routing, layout and tooling — plus a file diff viewer built on
[`@pierre/diffs`](https://www.npmjs.com/package/@pierre/diffs).

## Running it

```sh
npm install
npm run dev      # Vite dev server on http://localhost:1420
npm run build    # typecheck + production build into dist/
```

To run it as a desktop app (needs a Rust toolchain):

```sh
npm run tauri dev
npm run tauri build
```

## Checks

```sh
npm run lint          # eslint
npm run test          # vitest
npm run format        # prettier --write
npm run format:check  # prettier --check
npx tsc --noEmit      # typecheck only
```

## Layout

```
src/
  main.tsx              entry point: worker pool provider + HashRouter
  routes.tsx            the route tree
  App.tsx               root layout (header / <Outlet /> / footer)
  config.ts             APP_NAME
  components/           Header, Nav, Footer
  fixtures/             sample files the Diff Viewer can load
  pages/                Home, DiffViewer, About, NotFound
  styles/global.css     design tokens + shell styles
  test/setup.ts         vitest setup
```

### Sample files

The Diff Viewer has a **Sample** picker above the upload boxes, so a feature can
be tried without finding two files first. The samples live in `src/fixtures/`:

```
src/fixtures/
  index.ts     the Sample union and the list the picker renders
  pairs.ts     before/after file pairs (TypeScript, JSON, Markdown, a rename)
  patch.ts     unified patches, one single-file and one over four files
  conflict.ts  a file left mid-merge, conflict markers and all
  large.ts     a generated ~1,500-line file, plus an edited copy
```

A sample's `kind` is the way `@pierre/diffs` takes that input:

| kind          | rendered with           | note                                               |
| ------------- | ----------------------- | -------------------------------------------------- |
| `pair`        | `FileDiff`              | via `parseDiffFromFile(oldFile, newFile)`          |
| `file`        | `File`                  | one file, no comparison                            |
| `patch`       | `PatchDiff`             | single-file patches only — it throws on wider ones |
| `multi-patch` | one `FileDiff` per file | split with `parsePatchFiles` first                 |

To add one, append it to `samples` in `src/fixtures/index.ts`; the picker and
the fixture tests both read from that array.

The large file is generated rather than checked in, so it does not dominate the
repository or every search through it. Generation is deterministic, which keeps
the diff against its edited copy to the edits alone.

### Adding a page

1. Add the component under `src/pages/`.
2. Register it in the route tree in `src/routes.tsx`.
3. Add a nav entry in the `links` array in `src/components/Nav.tsx`.

### Styling

Plain CSS with custom properties — no UI framework. Colors, spacing and radii
are defined once as tokens at the top of `src/styles/global.css`, with a dark
set under `prefers-color-scheme: dark`. Change the tokens rather than the
components.

Routing uses `HashRouter`: Tauri serves the bundle from a custom protocol with
no history fallback, so path-based deep links would 404.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
