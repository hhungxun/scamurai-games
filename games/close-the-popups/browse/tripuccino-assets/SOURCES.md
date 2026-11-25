# Tripuccino assets and sample inventory

This desktop flight scene was ported from the local Tripuccino prototype. Airline schedules, prices, amenities and the payment wallet are fixed game data, not a live booking service. The airport directory has 163 countries/regions and 443 source airport entries; KUL, SZB, TPE and TSA are defined by the scene. Directory coverage does not imply flight inventory.

- `taipei.jpg`: Liberty Square, AngMoKio, resized; [source](https://commons.wikimedia.org/wiki/File:ChiangKai-shek_memorial2009_amk.jpg), CC BY-SA 3.0.
- `market.jpg`: Shilin Night Market, Exec8, resized; [source](https://commons.wikimedia.org/wiki/File:Shilin_Night_Market_02.jpg), CC BY-SA 4.0.
- `airlines/*.webp`: airline marks copied from the supplied saved Trip.com reference by the preceding prototype implementation, used to identify the corresponding example airline. These are third-party marks, not project-owned artwork.
- `lucide.min.js`: Lucide icons; see `lucide-LICENSE.txt`.
- `airports.js`: airport/country directory prepared by the preceding implementation from OurAirports data. This integration preserves that directory; it does not assert that every entry was independently checked.

Photo credits are also accessible from the website footer. No runtime third-party assets or payment endpoints are required.
