# jsQR

`jsQR.js` is the unmodified browser build of [jsQR 1.4.0](https://github.com/cozmo/jsQR), downloaded from `https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js`. Its Apache 2.0 license is included as `jsQR.LICENSE`.

It decodes camera frames locally when native `BarcodeDetector` is unavailable or fails. Serving this copy with the game avoids a runtime CDN dependency for Participants' scanners.
