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
  pages/                Home, DiffViewer, About, NotFound
  styles/global.css     design tokens + shell styles
  test/setup.ts         vitest setup
```

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
