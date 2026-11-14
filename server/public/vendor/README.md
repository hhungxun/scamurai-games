# QR Code Generator

`qrcode.js` is the browser build of [qrcode-generator 1.4.4](https://github.com/kazuhikoarase/qrcode-generator), obtained from `https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js`. The author's copyright and MIT license notice are retained in the file; the MIT license text is in `qrcode.LICENSE`.

Registration and the shared SDK use this local copy so issuing a participant QR does not depend on a third-party CDN during the event.

`jsQR.js` is the unmodified browser build of [jsQR 1.4.0](https://github.com/cozmo/jsQR), with its Apache 2.0 license in `jsQR.LICENSE`. The shared participant/Station 5 scanner decodes camera frames locally. The older Station 5 vendor URL is retained for previously loaded game tabs.
