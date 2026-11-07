import test from "node:test";
import assert from "node:assert";

import {
  resolveFontPath,
  escapeFontPathForFFmpeg,
} from "../src/utils/fonts.ts";

test(
  "font path can be injected into ffmpeg",
  () => {
    const font =
      resolveFontPath();

    assert.ok(
      font,
      "Expected font path"
    );

    const escaped =
      escapeFontPathForFFmpeg(
        font!
      );

    assert.ok(
      escaped.includes("/")
    );
  }
);
