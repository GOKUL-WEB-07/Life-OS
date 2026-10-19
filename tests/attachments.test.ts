import { expect, it } from "vitest";
import {
  validateAttachment,
  MAX_FILE_BYTES,
} from "../src/services/attachmentService";
it("accepts photo scans and PDF bills within limits", () => {
  for (const type of [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ])
    expect(() =>
      validateAttachment({ name: "document", type, size: 1024 }),
    ).not.toThrow();
});
it("rejects executable and SVG attachments, empty files, and oversized files", () => {
  for (const type of ["image/svg+xml", "text/html", "application/javascript"])
    expect(() =>
      validateAttachment({ name: "file", type, size: 10 }),
    ).toThrow();
  expect(() =>
    validateAttachment({ name: "empty.pdf", type: "application/pdf", size: 0 }),
  ).toThrow();
  expect(() =>
    validateAttachment({
      name: "large.png",
      type: "image/png",
      size: MAX_FILE_BYTES + 1,
    }),
  ).toThrow();
});
