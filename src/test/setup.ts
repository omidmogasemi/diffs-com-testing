import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without `globals`, so React Testing Library cannot register its
// own automatic cleanup. Without this every render stays in the document and
// later queries start matching elements left behind by earlier tests.
afterEach(cleanup);
