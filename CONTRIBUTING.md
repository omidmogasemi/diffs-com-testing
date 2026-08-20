# Contributing to diffs-com-testing

Thanks for taking an interest in this project. `diffs-com-testing` is a small desktop app for comparing two files side by side: a React + TypeScript frontend (bundled by Vite) rendering diffs with [`@pierre/diffs`](https://www.npmjs.com/package/@pierre/diffs), wrapped in a [Tauri v2](https://v2.tauri.app/) shell with a Rust backend.

It is a young, deliberately small repo, so this guide is short and concrete. If something here does not match what you actually hit, that is a bug in this document — please say so.

## Before you start

You will need:

- **Node.js 18 or newer** and **npm**. The repo pins no Node version (`.nvmrc` does not exist), but Vite 6 requires Node 18+. `package-lock.json` is the committed lockfile, so use `npm`, not yarn or bun.
- **Rust (stable) via [rustup](https://rustup.rs/)** — only if you touch `src-tauri/` or want to run the desktop app. Frontend-only work does not need it.
- **Tauri's platform prerequisites** (WebKitGTK on Linux, Xcode command line tools on macOS, the WebView2 runtime and MSVC build tools on Windows). Follow https://v2.tauri.app/start/prerequisites/ for your OS.

Recommended editor setup is VS Code with the `tauri-apps.tauri-vscode` and `rust-lang.rust-analyzer` extensions — both are already listed in `.vscode/extensions.json`.

## Getting set up

```bash
git clone https://github.com/omidmogasemi/diffs-com-testing.git
cd diffs-com-testing
npm install
```

`npm install` covers the frontend. Rust dependencies are fetched on the first Tauri build; expect that first build to take several minutes while 480-plus crates compile.

## Running the app

**Frontend only, in a browser** — fastest loop for UI work on the diff view:

```bash
npm run dev
```

Vite serves on http://localhost:1420. The port is fixed (`strictPort: true` in `vite.config.ts`), so if the dev server refuses to start, free port 1420 rather than picking another one — Tauri expects the app there.

**Full desktop app:**

```bash
npm run tauri dev
```

Heads up: `src-tauri/tauri.conf.json` sets `beforeDevCommand`/`beforeBuildCommand` to `pnpm dev` and `pnpm build`, while the committed lockfile is npm's. Until that is reconciled, either install pnpm (`npm i -g pnpm`) or change those two fields to `npm run dev` / `npm run build` locally. Fixing this properly — picking one package manager and making the config and lockfile agree — is a welcome first contribution.

To produce a distributable bundle:

```bash
npm run build        # tsc typecheck, then vite build -> dist/
npm run tauri build  # native bundle for your platform
```

## Project layout

| Path | What lives there |
| --- | --- |
| `src/` | React frontend. `App.tsx` holds the file-picker and `FileDiff` view; `main.tsx` mounts React inside `WorkerPoolContextProvider`, which does Shiki syntax highlighting off the main thread. |
| `src/App.css` | Hand-written plain CSS, including a `prefers-color-scheme: dark` block. No CSS framework or preprocessor. |
| `src-tauri/src/` | Rust backend. `lib.rs` registers plugins and Tauri commands; `main.rs` just calls into it. |
| `src-tauri/tauri.conf.json` | Window size, bundle identifier, build hooks. |
| `src-tauri/capabilities/default.json` | Tauri v2 permissions for the main window. Any new plugin or command usually needs a permission added here. |
| `index.html`, `vite.config.ts` | Vite entry point and dev-server config. |

Adding a language to syntax highlighting means adding it to the preloaded langs list in `src/main.tsx`.

## Checks before you push

There is no CI in this repo yet — nothing runs automatically on a pull request — so these checks are on you:

```bash
npm run build        # tsc + vite build; this is the de facto typecheck
```

TypeScript is in `strict` mode with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` enabled, so an unused import is a build failure, not a warning. A green `npm run build` is the minimum bar for a frontend change.

If you touched `src-tauri/`:

```bash
cd src-tauri
cargo fmt
cargo clippy
cargo build
```

And because there are no automated tests, **say in your pull request how you exercised the change by hand** — which two files you diffed, what you clicked, what you saw. That description is the test evidence for now.

Two gaps worth filling, if you are looking for something useful to do: there is no linter (no ESLint, Prettier, or Biome config) and no test framework. Proposals to add either are welcome — open an issue first so we can agree on the tool before you wire it up.

## Coding style

- **TypeScript/React**: match the surrounding code. Two-space indent, double-quoted strings, function components with hooks, named exports where the existing files use them. There is no formatter config to enforce this, so read the neighbouring file before you write.
- **CSS**: plain CSS in `src/App.css`, kept close to the component it styles. Keep the dark-mode block in sync when you add styles.
- **Rust**: default `rustfmt` formatting (`cargo fmt` before committing) and clippy-clean.
- Keep diffs focused. Unrelated reformatting in the same commit makes review harder than the change itself.

## Commit messages

Follow the style already in the history: an imperative, sentence-case subject with no trailing period, and — for anything non-trivial — a blank line and a short bullet list explaining what changed and why.

```
Add diffs.com file comparison support

- Install @pierre/diffs package for diff rendering
- Create file upload UI for left/right file comparison
- Implement FileDiff component with split view and syntax highlighting
```

Conventional Commits prefixes (`feat:`, `fix:`) are not used here; please do not introduce them piecemeal. If an AI assistant helped, a `Co-Authored-By:` trailer is fine — the existing history uses one.

## Branches and pull requests

- `main` is the default branch and the base for all work. Do not commit to it directly; open a pull request.
- Branch off the latest `main` and name the branch after the work, lowercase and hyphenated, optionally with a type prefix: `fix/diff-worker-pool`, `feat/directory-compare`, `docs/readme-rewrite`.
- Keep pull requests small and single-purpose. A large refactor bundled with a bug fix will be asked to split.
- In the description, cover: what changed, why, and how you verified it manually (see the checks section). Screenshots or a short clip help a lot for UI changes, since the whole app is UI.
- Rebase or merge `main` into your branch to resolve conflicts before asking for review. Do not force-push to a branch someone else is reviewing or has checked out.

## Reporting bugs and requesting features

Open an issue at https://github.com/omidmogasemi/diffs-com-testing/issues. There are no issue templates, so please include:

- **For bugs**: your OS and version, Node and Rust versions (`node -v`, `rustc -V`), whether you hit it in `npm run dev` (browser) or `npm run tauri dev` (desktop), the steps to reproduce, what you expected, and what happened. If the problem depends on the files being diffed, attach small examples that reproduce it — file size, encoding, and language all affect the diff and highlighting paths.
- **For features**: the use case first, then the proposed behaviour. What are you trying to accomplish that the app makes hard today?

Console output helps: the browser devtools console for frontend issues, and the terminal running `npm run tauri dev` for anything on the Rust side.

## Getting help

Open an issue or comment on an existing one — that is the whole process. Useful upstream references:

- Tauri v2 — https://v2.tauri.app/
- Vite — https://vite.dev/
- React — https://react.dev/
- `@pierre/diffs` — https://www.npmjs.com/package/@pierre/diffs

## Housekeeping notes

A few things about this repo are unsettled, and it is better to say so than to let you discover them mid-change:

- **There is no LICENSE file**, and `package.json` is marked `"private": true`. Until a license is added, the terms for outside contributions are undefined. If you plan to contribute substantially, ask the maintainer to add one first.
- **The README is still the `create-tauri-app` template** and does not describe the actual diff viewer.
- **There is no code of conduct.** Be decent to each other in the meantime.
- **The package manager mismatch** described in the "Running the app" section is real and unresolved.
