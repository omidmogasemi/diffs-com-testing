import type { FileContents } from "@pierre/diffs/react";

/**
 * A thing the gallery can render.
 *
 * `pair` feeds the diff surfaces that take two files, `patch` feeds PatchDiff,
 * and `file` feeds the single-file viewer. This is the shape the fixtures
 * module is being built to, so swapping `SAMPLES` below for an import from
 * `../fixtures` is the whole of that hand-off.
 */
export type Sample =
  | {
      id: string;
      label: string;
      description?: string;
      kind: "pair";
      oldFile: FileContents;
      newFile: FileContents;
    }
  | {
      id: string;
      label: string;
      description?: string;
      kind: "patch";
      patch: string;
    }
  | {
      id: string;
      label: string;
      description?: string;
      kind: "file";
      file: FileContents;
    };

const cartOld = `import { formatPrice } from "./money";

export function subtotal(items) {
  let total = 0;
  for (const item of items) {
    total = total + item.price * item.quantity;
  }
  return total;
}

export function describeCart(items) {
  if (items.length === 0) {
    return "Your cart is empty";
  }
  return items.length + " items, " + formatPrice(subtotal(items));
}
`;

const cartNew = `import { formatPrice } from "./money";

const FREE_SHIPPING_THRESHOLD = 5000;

export function subtotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function shippingCost(items) {
  return subtotal(items) >= FREE_SHIPPING_THRESHOLD ? 0 : 499;
}

export function describeCart(items) {
  if (items.length === 0) {
    return "Your cart is empty";
  }

  const count = items.length === 1 ? "1 item" : \`\${items.length} items\`;
  return \`\${count}, \${formatPrice(subtotal(items) + shippingCost(items))}\`;
}
`;

/**
 * A long, mostly-unchanged file: the one that makes virtualization, hunk
 * collapsing and `expandUnchanged` visibly do something.
 */
function longFile(mutate: boolean): string {
  const lines: string[] = ["// Generated fixture: 400 routes.", ""];
  for (let i = 1; i <= 400; i++) {
    const handler = mutate && i % 137 === 0 ? "asyncHandler" : "handler";
    lines.push(`route("/resource/${i}", ${handler}(resource${i}));`);
  }
  if (mutate) {
    lines.push(
      "",
      "// Added at the end of the file.",
      "export const ready = true;",
    );
  }
  return lines.join("\n") + "\n";
}

/**
 * Generated with the library's own parser in the loop rather than written by
 * hand: hunk headers whose line counts do not match the body are rejected at
 * render time.
 */
const singleFilePatch = `diff --git a/src/money.ts b/src/money.ts
--- a/src/money.ts
+++ b/src/money.ts
@@ -1,7 +1,12 @@
-export function formatPrice(cents) {
-  return "$" + (cents / 100).toFixed(2);
+const FORMATTER = new Intl.NumberFormat("en-US", {
+  style: "currency",
+  currency: "USD",
+});
+
+export function formatPrice(cents: number): string {
+  return FORMATTER.format(cents / 100);
 }
 
-export function parsePrice(text) {
-  return Number(text.replace("$", "")) * 100;
+export function parsePrice(text: string): number {
+  return Math.round(Number(text.replace(/[^0-9.]/g, "")) * 100);
 }
`;

const multiFilePatch =
  singleFilePatch +
  `diff --git a/src/money.test.ts b/src/money.test.ts
new file mode 100644
--- /dev/null
+++ b/src/money.test.ts
@@ -0,0 +1,5 @@
+import { formatPrice } from "./money";
+
+test("formats whole dollars", () => {
+  expect(formatPrice(5000)).toBe("$50.00");
+});
`;

/**
 * Stand-in fixtures so the page works on its own. The fixtures module replaces
 * these with a richer set (conflict markers, more languages, a bigger file).
 */
export const SAMPLES: readonly Sample[] = [
  {
    id: "cart",
    label: "Rewritten function",
    description:
      "Additions, deletions and reflowed lines in one small file. Good for lineDiffType and diffIndicators.",
    kind: "pair",
    oldFile: { name: "src/cart.js", contents: cartOld, lang: "javascript" },
    newFile: { name: "src/cart.js", contents: cartNew, lang: "javascript" },
  },
  {
    id: "large",
    label: "Large file, few changes",
    description:
      "400 lines with three scattered edits. Shows hunk collapsing, expansion and virtualization.",
    kind: "pair",
    oldFile: {
      name: "src/routes.generated.ts",
      contents: longFile(false),
      lang: "typescript",
    },
    newFile: {
      name: "src/routes.generated.ts",
      contents: longFile(true),
      lang: "typescript",
    },
  },
  {
    id: "patch-single",
    label: "Unified patch (1 file)",
    description:
      "One file's patch. Partial by definition, so hunk expansion has nothing to reveal.",
    kind: "patch",
    patch: singleFilePatch,
  },
  {
    id: "patch-multi",
    label: "Unified patch (2 files)",
    description:
      "A patch with an added file alongside a changed one. PatchDiff takes a single file, so this one is split with parsePatchFiles.",
    kind: "patch",
    patch: multiFilePatch,
  },
  {
    id: "single",
    label: "Single file",
    description: "No diff at all — the plain file viewer.",
    kind: "file",
    file: { name: "src/cart.js", contents: cartNew, lang: "javascript" },
  },
];
