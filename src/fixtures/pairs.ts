import type { FileContents } from "@pierre/diffs/react";

/**
 * Before/after file pairs. Each one targets a different corner of the diff
 * renderer, so the viewer has something to show without an upload.
 *
 * `cacheKey` is set on every fixture: `parseDiffFromFile` combines the two
 * keys into one, which lets the worker pool reuse a rendered diff instead of
 * re-highlighting it every time a sample is re-selected.
 */

/** Additions, deletions and edits inside one function. */
export const typescriptBefore: FileContents = {
  cacheKey: "sample-ts-before",
  name: "src/cart.ts",
  lang: "typescript",
  contents: `export interface CartItem {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export function subtotal(items: CartItem[]): number {
  let total = 0;
  for (const item of items) {
    total += item.quantity * item.unitPrice;
  }
  return total;
}

export function applyDiscount(total: number, percentOff: number): number {
  return total - total * (percentOff / 100);
}

export function formatTotal(total: number): string {
  return "$" + total.toFixed(2);
}
`,
};

export const typescriptAfter: FileContents = {
  cacheKey: "sample-ts-after",
  name: "src/cart.ts",
  lang: "typescript",
  contents: `export interface CartItem {
  sku: string;
  quantity: number;
  unitPrice: number;
  /** Per-item discount, applied before the cart-wide one. */
  discountPercent?: number;
}

export function subtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const line = item.quantity * item.unitPrice;
    const off = (item.discountPercent ?? 0) / 100;
    return total + line * (1 - off);
  }, 0);
}

export function applyDiscount(total: number, percentOff: number): number {
  if (percentOff < 0 || percentOff > 100) {
    throw new RangeError("percentOff must be between 0 and 100");
  }
  return total - total * (percentOff / 100);
}

export function formatTotal(total: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(total);
}
`,
};

/** Structural edits in a config file: reordering, added and removed keys. */
export const jsonBefore: FileContents = {
  cacheKey: "sample-json-before",
  name: "tsconfig.json",
  lang: "json",
  contents: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
`,
};

export const jsonAfter: FileContents = {
  cacheKey: "sample-json-after",
  name: "tsconfig.json",
  lang: "json",
  contents: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "tests"],
  "exclude": ["dist"]
}
`,
};

/** Prose, where the interesting part is word-level change inside a line. */
export const markdownBefore: FileContents = {
  cacheKey: "sample-md-before",
  name: "README.md",
  lang: "markdown",
  contents: `# Checkout service

Handles carts and payment capture.

## Running it

Start the service with \`npm start\`. It listens on port 3000.

## Notes

The service keeps cart state in memory, so restarting it drops open carts.
`,
};

export const markdownAfter: FileContents = {
  cacheKey: "sample-md-after",
  name: "README.md",
  lang: "markdown",
  contents: `# Checkout service

Handles carts, discounts and payment capture.

## Running it

Start the service with \`npm run dev\`. It listens on port 8080 by default;
set \`PORT\` to change that.

## Notes

Cart state lives in Redis, so a restart no longer drops open carts.

## Deploying

Tagged commits on \`main\` deploy automatically.
`,
};

/** A rename paired with an edit, which the header renders differently. */
export const renamedBefore: FileContents = {
  cacheKey: "sample-rename-before",
  name: "src/utils/helpers.py",
  lang: "python",
  contents: `def slugify(value):
    return value.lower().replace(" ", "-")


def truncate(value, limit):
    if len(value) <= limit:
        return value
    return value[:limit] + "..."
`,
};

export const renamedAfter: FileContents = {
  cacheKey: "sample-rename-after",
  name: "src/utils/text.py",
  lang: "python",
  contents: `import re


def slugify(value):
    value = re.sub(r"[^a-z0-9]+", "-", value.lower())
    return value.strip("-")


def truncate(value, limit, suffix="…"):
    if len(value) <= limit:
        return value
    return value[: limit - len(suffix)] + suffix
`,
};
