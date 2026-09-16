/**
 * Unified patches, the kind `git format-patch` and a pull request's `.diff`
 * produce.
 *
 * Two of them, because the library splits here: `PatchDiff` renders a patch
 * string directly but rejects anything holding more than one file (it calls
 * `getSingularPatch`, which throws). Multi-file patches go through
 * `parsePatchFiles` and get rendered file by file with `FileDiff`.
 */
/** Four files: an edit, a new file, a deletion and a docs tweak. */
export const multiFilePatch = `From 7f3c1a2b4d5e6f708192a3b4c5d6e7f809a1b2c3 Mon Sep 17 00:00:00 2001
From: Sample Author <author@example.com>
Date: Mon, 3 Mar 2025 11:04:22 +0000
Subject: [PATCH] Move rate limiting into middleware

diff --git a/src/server.ts b/src/server.ts
index 8a1f2c3..b4d5e6f 100644
--- a/src/server.ts
+++ b/src/server.ts
@@ -1,12 +1,14 @@
 import express from "express";
 import { router } from "./routes";
+import { rateLimit } from "./middleware/rateLimit";
 
 const app = express();
 
 app.use(express.json());
+app.use(rateLimit({ windowMs: 60_000, max: 120 }));
 app.use("/api", router);
 
-const port = 3000;
+const port = Number(process.env.PORT ?? 3000);
 app.listen(port, () => {
   console.log(\`listening on \${port}\`);
 });
diff --git a/src/middleware/rateLimit.ts b/src/middleware/rateLimit.ts
new file mode 100644
index 0000000..c7e8f90
--- /dev/null
+++ b/src/middleware/rateLimit.ts
@@ -0,0 +1,28 @@
+import type { NextFunction, Request, Response } from "express";
+
+interface RateLimitOptions {
+  windowMs: number;
+  max: number;
+}
+
+export function rateLimit({ windowMs, max }: RateLimitOptions) {
+  const hits = new Map<string, { count: number; resetAt: number }>();
+
+  return (req: Request, res: Response, next: NextFunction) => {
+    const key = req.ip ?? "unknown";
+    const now = Date.now();
+    const entry = hits.get(key);
+
+    if (!entry || entry.resetAt <= now) {
+      hits.set(key, { count: 1, resetAt: now + windowMs });
+      return next();
+    }
+
+    if (++entry.count > max) {
+      res.status(429).json({ error: "Too many requests" });
+      return;
+    }
+
+    next();
+  };
+}
diff --git a/src/throttle.ts b/src/throttle.ts
deleted file mode 100644
index d1e2f3a..0000000
--- a/src/throttle.ts
+++ /dev/null
@@ -1,11 +0,0 @@
-const seen = new Set<string>();
-
-export function throttle(key: string): boolean {
-  if (seen.has(key)) {
-    return false;
-  }
-
-  seen.add(key);
-  setTimeout(() => seen.delete(key), 1000);
-  return true;
-}
diff --git a/README.md b/README.md
index 1122334..5566778 100644
--- a/README.md
+++ b/README.md
@@ -8,6 +8,9 @@ npm install
 npm run dev
 \`\`\`
 
+Requests are rate limited to 120 per minute per IP. Set \`PORT\` to change the
+listen port.
+
 ## Tests
 
 \`\`\`sh
`;

/** One file, which is all `PatchDiff` accepts. */
export const singleFilePatch = `diff --git a/src/queue.ts b/src/queue.ts
index 3f2a1b0..9c8d7e6 100644
--- a/src/queue.ts
+++ b/src/queue.ts
@@ -1,15 +1,24 @@
 export class Queue<T> {
   private items: T[] = [];
+  private readonly limit: number;
+
+  constructor(limit = Infinity) {
+    this.limit = limit;
+  }
 
-  push(item: T): void {
+  push(item: T): boolean {
+    if (this.items.length >= this.limit) {
+      return false;
+    }
     this.items.push(item);
+    return true;
   }
 
   pop(): T | undefined {
     return this.items.shift();
   }
 
   get size(): number {
     return this.items.length;
   }
 }
`;
