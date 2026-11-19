# Spot the Fake Cash assets

- **2D note-inspection game** is a rebuild modelled on the reference UV-torch mechanism (flip front/back, capped zoom, torch-cone reveal), replacing the earlier Three.js/WebXR version.
- **Banknote images** — the twelve PNGs in `notes/` are the six Malaysian ringgit denominations (front and back), downloaded from the Bank Negara Malaysia website at `https://www.bnm.gov.my/documents/20124/18729204`. They are used unaltered apart from file renaming (`RM1-f.png`, `RM1-b.png`, `RM5-f.png`, `RM5-b.png`, `RM10-f.png`, `RM10-bk.png`, `RM20-f.png`, `RM20-b.png`, `RM50-f.png`, `RM50-b.png`, `RM100-f.png`, `RM100-b.png`).
- The UV overlay (glowing numeral, security thread, crest and fluorescent fibres) is drawn at runtime on a `<canvas>`; it is an illustrative approximation of the UV features, not a reproduction of BNM's actual UV artwork.
