import test from "node:test";
import assert from "node:assert";

import {
  resolveFontPath,
  escapeFontPathForFFmpeg,
} from "../src/utils/fonts.ts";

test(
  "font path resolves on host",
  () => {
    const font = resolveFontPath();

    assert.ok(
      font,
      "No usable font found"
    );
  }
);

test(
  "ffmpeg escaping works",
  () => {
    const escaped =
      escapeFontPathForFFmpeg(
        "C:/Windows/Fonts/arial.ttf"
      );

    assert.strictEqual(
      escaped,
      "C\\:/Windows/Fonts/arial.ttf"
    );
  }
);
