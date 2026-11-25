/* ============================================================
   ShopPee — app.js (v2)
   Multi-product engine: one product.html template driven by ?id=
   All product data extracted from the user's saved Shopee pages.
   Fan-made demo site for a game — no commercial use.
   ============================================================ */
window.BROWSE_SCENES = window.BROWSE_SCENES || {};
window.BROWSE_SCENES.shoppee = C => {
  "use strict";
  const {root,params,t,esc,url,read,write}=C;
  const view=params.has('id')?'product':params.get('view')==='mobile'?'mobile':'index';
  root.innerHTML='<div class="sp-site">'+window.SHOPPEE_TEMPLATES[view]+'</div>';
  const siteRoot=root.firstElementChild;
  siteRoot.dataset.page=view;
  const href=query=>url('shoppee.html',query);
  const canAct=()=>window.BROWSE_BOOTH?.canAct()!==false;


  /* ---------- tiny helpers ---------- */
  const $ = (s, r = siteRoot) => r.querySelector(s);
  const $$ = (s, r = siteRoot) => [...r.querySelectorAll(s)];
  const store = {
    get(key) { return read(key,null); },
    set(key,value) { return write(key,String(value)); }
  };

  /* ---------- toast ---------- */
  let toastTimer = null;
  window.toast = (msg, ms = 2200) => {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      siteRoot.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), ms);
  };

  /* ============================================================
     Product catalogue — real data from the saved Shopee pages
     ============================================================ */
  const P_LIST = [
    {
      id: "pmax", cat: "Mobile Phones",
      name: "Apple iPhone 18 Pro Max [ETA 1 to 4 weeks]",
      img: "shoppee-assets/img/g1.png",
      imgs: ["shoppee-assets/img/g1.png", "shoppee-assets/img/g2.jpg", "shoppee-assets/img/g3.jpg", "shoppee-assets/img/g4.jpg"],
      price: 7999, range: "RM5,999.00 - RM11,999.00", rating: 5.0, sold: "4k+",
      tags: [["mall", "MALL"], ["pre", "PRE-ORDER"], ["promo", "NEW LAUNCH"]],
      voucher: 300, preorder: true,
      variant: {
        storages: { "256GB": 5999, "512GB": 6999, "1TB": 7999, "2TB": 11999 },
        default: "1TB",
        colors: { "Glacier": "#b9c9dd", "Black": "#2b2e33", "Silver": "#e9e9ee", "Burgundy": "#672238" },
      },
      specs: [
        ["Display", "6.9-inch Super Retina XDR · ProMotion up to 120Hz · Brighter, better anti-reflection"],
        ["Chip", "A20 Pro"],
        ["Main Camera", "48MP Fusion Main camera with variable aperture · 8x optical-quality zoom"],
        ["Front Camera", "18MP Center Stage"],
        ["Build", "Durable Ceramic Shield — front and back"],
        ["Battery", "Massive leap in battery life"],
        ["Charging", "USB-C · MagSafe compatible (1m / 2m chargers, sold separately)"],
        ["Operating System", "iOS 20"],
        ["In the Box", "iPhone 18 Pro Max, USB-C Charge Cable (1m), Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "Pre-Order · ETA 1 to 4 weeks"],
      ],
    },
    {
      id: "18pro", cat: "Mobile Phones",
      name: "Apple iPhone 18 Pro [ETA 1 to 4 weeks]",
      img: "shoppee-assets/img/18pro.png", imgs: ["shoppee-assets/img/18pro.png"],
      price: 5499, rating: 5.0, sold: "4k+",
      tags: [["mall", "MALL"], ["pre", "PRE-ORDER"]],
      voucher: 0, preorder: true,
      variant: { storages: { "256GB": 5499, "512GB": 5999, "1TB": 6999 }, default: "256GB" },
      specs: [
        ["Display", "6.3-inch Super Retina XDR · ProMotion up to 120Hz"],
        ["Chip", "A20 Pro"],
        ["Main Camera", "48MP Fusion Main camera · 8x optical-quality zoom"],
        ["Front Camera", "18MP Center Stage"],
        ["Build", "Durable Ceramic Shield — front and back"],
        ["Battery", "All-day battery life"],
        ["Charging", "USB-C · MagSafe compatible"],
        ["Operating System", "iOS 20"],
        ["In the Box", "iPhone 18 Pro, USB-C Charge Cable (1m), Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "Pre-Order · ETA 1 to 4 weeks"],
      ],
    },
    {
      id: "air", cat: "Mobile Phones",
      name: "Apple iPhone Air 256GB",
      img: "shoppee-assets/img/air.png", imgs: ["shoppee-assets/img/air.png"],
      price: 3729, old: 5327, rating: 4.9, sold: "2k+",
      tags: [["mall", "MALL"], ["promo", "-30%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "6.6-inch Super Retina XDR · ProMotion up to 120Hz"],
        ["Chip", "A20"],
        ["Main Camera", "48MP Fusion dual camera"],
        ["Front Camera", "12MP Center Stage"],
        ["Build", "Ultra-thin aerospace titanium · Ceramic Shield"],
        ["Battery", "All-day battery life"],
        ["Charging", "USB-C"],
        ["Operating System", "iOS 20"],
        ["In the Box", "iPhone Air, USB-C Charge Cable (1m), Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "17pmax", cat: "Mobile Phones",
      name: "Apple iPhone 17 Pro Max",
      img: "shoppee-assets/img/17promax.jpg", imgs: ["shoppee-assets/img/17promax.jpg"],
      price: 5879, old: 5999, rating: 5.0, sold: "20k+",
      tags: [["mall", "MALL"], ["promo", "-2%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "6.9-inch Super Retina XDR · ProMotion up to 120Hz"],
        ["Chip", "A19 Pro"],
        ["Main Camera", "48MP Fusion triple camera · 5x optical zoom"],
        ["Front Camera", "24MP"],
        ["Build", "Titanium frame · Ceramic Shield"],
        ["Battery", "Up to 33 hours video playback"],
        ["Charging", "USB-C · MagSafe compatible"],
        ["Operating System", "iOS 19"],
        ["In the Box", "iPhone 17 Pro Max, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "17pro", cat: "Mobile Phones",
      name: "Apple iPhone 17 Pro",
      img: "shoppee-assets/img/17pro.png", imgs: ["shoppee-assets/img/17pro.png"],
      price: 5499, rating: 5.0, sold: "20k+",
      tags: [["mall", "MALL"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "6.3-inch Super Retina XDR · ProMotion up to 120Hz"],
        ["Chip", "A19 Pro"],
        ["Main Camera", "48MP Fusion triple camera · 5x optical zoom"],
        ["Front Camera", "24MP"],
        ["Build", "Titanium frame · Ceramic Shield"],
        ["Battery", "Up to 27 hours video playback"],
        ["Charging", "USB-C · MagSafe compatible"],
        ["Operating System", "iOS 19"],
        ["In the Box", "iPhone 17 Pro, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "17", cat: "Mobile Phones",
      name: "Apple iPhone 17",
      img: "shoppee-assets/img/17.png", imgs: ["shoppee-assets/img/17.png"],
      price: 4279, old: 4322, rating: 5.0, sold: "30k+",
      tags: [["mall", "MALL"], ["promo", "-1%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "6.3-inch Super Retina XDR"],
        ["Chip", "A19"],
        ["Main Camera", "48MP Fusion dual camera"],
        ["Front Camera", "24MP"],
        ["Build", "Aluminium frame · Ceramic Shield"],
        ["Battery", "Up to 26 hours video playback"],
        ["Charging", "USB-C"],
        ["Operating System", "iOS 19"],
        ["In the Box", "iPhone 17, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "17e", cat: "Mobile Phones",
      name: "Apple iPhone 17e",
      img: "shoppee-assets/img/17e.jpg", imgs: ["shoppee-assets/img/17e.jpg"],
      price: 3059, old: 3289, rating: 4.9, sold: "2k+",
      tags: [["mall", "MALL"], ["promo", "-7%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "6.1-inch Super Retina XDR"],
        ["Chip", "A18"],
        ["Main Camera", "48MP Fusion camera"],
        ["Front Camera", "12MP"],
        ["Build", "Aluminium frame"],
        ["Battery", "Up to 26 hours video playback"],
        ["Charging", "USB-C"],
        ["Operating System", "iOS 19"],
        ["In the Box", "iPhone 17e, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "16", cat: "Mobile Phones",
      name: "Apple iPhone 16",
      img: "shoppee-assets/img/16.jpg", imgs: ["shoppee-assets/img/16.jpg"],
      price: 3709, old: 3785, rating: 5.0, sold: "10k+",
      tags: [["mall", "MALL"], ["promo", "-2%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "6.1-inch Super Retina XDR"],
        ["Chip", "A18"],
        ["Main Camera", "48MP Fusion dual camera"],
        ["Front Camera", "12MP"],
        ["Build", "Aluminium frame · Ceramic Shield"],
        ["Battery", "Up to 22 hours video playback"],
        ["Charging", "USB-C"],
        ["Operating System", "iOS 18"],
        ["In the Box", "iPhone 16, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "15", cat: "Mobile Phones",
      name: "Apple iPhone 15",
      img: "shoppee-assets/img/15.jpg", imgs: ["shoppee-assets/img/15.jpg"],
      price: 3099, old: 3195, rating: 5.0, sold: "10k+",
      tags: [["mall", "MALL"], ["promo", "-3%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "6.1-inch Super Retina XDR"],
        ["Chip", "A16 Bionic"],
        ["Main Camera", "48MP Main camera"],
        ["Front Camera", "12MP"],
        ["Build", "Aluminium frame · Dynamic Island"],
        ["Battery", "Up to 20 hours video playback"],
        ["Charging", "USB-C"],
        ["Operating System", "iOS 17"],
        ["In the Box", "iPhone 15, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "duo", cat: "Mobile Phones",
      name: "Apple iPhone Duo",
      img: "shoppee-assets/img/duo.jpg", imgs: ["shoppee-assets/img/duo.jpg"],
      price: 9499, rating: 4.9, sold: "306",
      tags: [["mall", "MALL"], ["pre", "NEW"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "7.8-inch foldable Super Retina XDR · ProMotion up to 120Hz"],
        ["Chip", "A20 Pro"],
        ["Main Camera", "48MP Fusion dual camera"],
        ["Front Camera", "18MP Center Stage"],
        ["Build", "Titanium hinge · Ceramic Shield"],
        ["Battery", "All-day battery life (dual-cell)"],
        ["Charging", "USB-C · MagSafe compatible"],
        ["Operating System", "iOS 20"],
        ["In the Box", "iPhone Duo, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "casepmax", cat: "Cases & Accessories",
      name: "Apple iPhone 18 Pro Max Silicone Case with MagSafe",
      img: "shoppee-assets/img/casepmax.jpg", imgs: ["shoppee-assets/img/casepmax.jpg"],
      price: 209, old: 259, rating: 4.9, sold: "234",
      tags: [["mall", "MALL"]],
      voucher: 0, preorder: false,
      specs: [
        ["Compatibility", "Apple iPhone 18 Pro Max"],
        ["Material", "Premium silicone with soft-touch finish"],
        ["MagSafe", "Built-in magnets, perfectly aligned for MagSafe charging"],
        ["Protection", "Soft microfiber lining · raised edges"],
        ["Design", "Slim, light and easy to grip"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "casepro", cat: "Cases & Accessories",
      name: "Apple iPhone 18 Pro Silicone Case with MagSafe",
      img: "shoppee-assets/img/casepro.jpg", imgs: ["shoppee-assets/img/casepro.jpg"],
      price: 209, rating: 4.4, sold: "99",
      tags: [["mall", "MALL"]],
      voucher: 0, preorder: false,
      specs: [
        ["Compatibility", "Apple iPhone 18 Pro"],
        ["Material", "Premium silicone with soft-touch finish"],
        ["MagSafe", "Built-in magnets for MagSafe charging"],
        ["Protection", "Soft microfiber lining · raised edges"],
        ["Design", "Slim, light and easy to grip"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "casetw", cat: "Cases & Accessories",
      name: "Apple iPhone 18 Pro TechWoven Case with MagSafe",
      img: "shoppee-assets/img/casetw.jpg", imgs: ["shoppee-assets/img/casetw.jpg"],
      price: 219, old: 249, rating: 4.5, sold: "120",
      tags: [["mall", "MALL"], ["promo", "-12%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Compatibility", "Apple iPhone 18 Pro"],
        ["Material", "Durable TechWoven fabric"],
        ["MagSafe", "Built-in magnets for MagSafe charging"],
        ["Protection", "Drop-tested · raised edges"],
        ["Design", "Textured, premium feel"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "case17", cat: "Cases & Accessories",
      name: "Apple iPhone 17 Series Clear Case with MagSafe",
      img: "shoppee-assets/img/case17.png", imgs: ["shoppee-assets/img/case17.png"],
      price: 186.3, old: 239, rating: 4.9, sold: "519",
      tags: [["mall", "MALL"], ["promo", "-22%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Compatibility", "Apple iPhone 17 Series"],
        ["Material", "Clear polycarbonate, anti-yellowing coating"],
        ["MagSafe", "Built-in magnets for MagSafe charging"],
        ["Protection", "Scratch-resistant · raised edges"],
        ["Design", "Crystal clear, shows off your iPhone"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "airpods5", cat: "Audio",
      name: "Apple AirPods 5",
      img: "shoppee-assets/img/airpods5.png", imgs: ["shoppee-assets/img/airpods5.png"],
      price: 549, old: 597, rating: 5.0, sold: "1k+",
      tags: [["mall", "MALL"], ["promo", "-8%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Chip", "H3 headphone chip"],
        ["Audio", "Personalised Spatial Audio with dynamic head tracking"],
        ["Noise Control", "Active Noise Cancellation"],
        ["Battery", "Up to 30 hours total listening time"],
        ["Charging", "USB-C charging case"],
        ["Resistance", "Sweat and water resistant (IPX4)"],
        ["In the Box", "AirPods 5, USB-C Charging Case, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "airpodspro3", cat: "Audio",
      name: "Apple AirPods Pro 3",
      img: "shoppee-assets/img/airpodspro3.png", imgs: ["shoppee-assets/img/airpodspro3.png"],
      price: 789, old: 999, rating: 5.0, sold: "20k+",
      tags: [["mall", "MALL"], ["promo", "-21%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Chip", "H3 headphone chip"],
        ["Audio", "Adaptive Audio · Personalised Spatial Audio"],
        ["Noise Control", "Active Noise Cancellation · Transparency mode"],
        ["Battery", "Up to 30 hours total listening time"],
        ["Charging", "USB-C MagSafe charging case"],
        ["Resistance", "Dust, sweat and water resistant (IP54)"],
        ["In the Box", "AirPods Pro 3, USB-C Charging Case, 4 sizes ear tips, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "watch12", cat: "Smartwatches",
      name: "Apple Watch Series 12 (GPS) 42mm/46mm",
      img: "shoppee-assets/img/watch12.png", imgs: ["shoppee-assets/img/watch12.png"],
      price: 1544, old: 1795, rating: 5.0, sold: "761",
      tags: [["mall", "MALL"], ["promo", "-14%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Size", "42mm / 46mm Aluminium Case"],
        ["Chip", "S12 SiP"],
        ["Display", "Always-On Retina display"],
        ["Health", "ECG · heart rate · blood oxygen · sleep tracking"],
        ["Water", "Water resistant 50m"],
        ["Battery", "All-day battery life, fast charging"],
        ["In the Box", "Apple Watch, Sport Band, USB-C Fast Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "watchse3", cat: "Smartwatches",
      name: "Apple Watch SE 3 (GPS) 40mm/44mm",
      img: "shoppee-assets/img/watchse3.png", imgs: ["shoppee-assets/img/watchse3.png"],
      price: 944, old: 1049, rating: 5.0, sold: "10k+",
      tags: [["mall", "MALL"], ["promo", "-10%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Size", "40mm / 44mm Aluminium Case"],
        ["Chip", "S9 SiP"],
        ["Display", "Retina display"],
        ["Health", "Heart rate · sleep tracking · crash detection"],
        ["Water", "Water resistant 50m"],
        ["Battery", "All-day battery life"],
        ["In the Box", "Apple Watch, Sport Band, USB-C Fast Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "ipadmini", cat: "Computers & Accessories",
      name: "Apple iPad mini (A20 Pro, Wi-Fi)",
      img: "shoppee-assets/img/ipadmini.jpg", imgs: ["shoppee-assets/img/ipadmini.jpg"],
      price: 2999, rating: 5.0, sold: "64",
      tags: [["mall", "MALL"], ["pre", "NEW"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "8.3-inch Liquid Retina display"],
        ["Chip", "A20 Pro"],
        ["Storage", "128GB / 256GB / 512GB"],
        ["Pencil", "Apple Pencil Pro support"],
        ["Camera", "12MP Wide back camera · 12MP Center Stage front"],
        ["Battery", "All-day battery life"],
        ["In the Box", "iPad mini, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "ipad11", cat: "Computers & Accessories",
      name: "Apple iPad 11th generation (Wi-Fi)",
      img: "shoppee-assets/img/ipad11.jpg", imgs: ["shoppee-assets/img/ipad11.jpg"],
      price: 1979, old: 2040, rating: 5.0, sold: "60k+",
      tags: [["mall", "MALL"], ["promo", "-3%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "11-inch Liquid Retina display"],
        ["Chip", "A18"],
        ["Storage", "128GB / 256GB / 512GB"],
        ["Pencil", "Apple Pencil (USB-C) support"],
        ["Camera", "12MP Wide back camera · Center Stage front"],
        ["Battery", "All-day battery life"],
        ["In the Box", "iPad, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "ipadair", cat: "Computers & Accessories",
      name: "Apple iPad Air 11-inch (M4, Wi-Fi)",
      img: "shoppee-assets/img/ipadair.jpg", imgs: ["shoppee-assets/img/ipadair.jpg"],
      price: 2829, old: 3493, rating: 4.9, sold: "4k+",
      tags: [["mall", "MALL"], ["promo", "-19%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "11-inch Liquid Retina display"],
        ["Chip", "M4"],
        ["Storage", "128GB / 256GB / 512GB / 1TB"],
        ["Pencil", "Apple Pencil Pro support"],
        ["Camera", "12MP Wide back camera · Center Stage front"],
        ["Battery", "All-day battery life"],
        ["In the Box", "iPad Air, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "adapter", cat: "Accessories",
      name: "Apple USB-C Power Adapter (20W)",
      img: "shoppee-assets/img/adapter.jpg", imgs: ["shoppee-assets/img/adapter.jpg"],
      price: 69, old: 99, rating: 5.0, sold: "100k+",
      tags: [["mall", "MALL"], ["promo", "-30%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Power", "20W USB-C Power Delivery"],
        ["Compatibility", "iPhone, iPad, AirPods, Apple Watch and more"],
        ["Design", "Compact, easy to carry"],
        ["Safety", "Over-voltage and over-temperature protection"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "airtag", cat: "Accessories",
      name: "Apple AirTag (2nd Generation)",
      img: "shoppee-assets/img/airtag.jpg", imgs: ["shoppee-assets/img/airtag.jpg"],
      price: 115, old: 129, rating: 5.0, sold: "5k+",
      tags: [["mall", "MALL"], ["promo", "-11%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Tracking", "Find My app with Precision Finding (Ultra Wideband)"],
        ["Battery", "User-replaceable CR2032, lasts over a year"],
        ["Resistance", "IP67 water and dust resistant"],
        ["Privacy", "End-to-end encrypted location data"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "pencil", cat: "Accessories",
      name: "Apple Pencil (USB-C)",
      img: "shoppee-assets/img/pencil.jpg", imgs: ["shoppee-assets/img/pencil.jpg"],
      price: 279, old: 349, rating: 5.0, sold: "20k+",
      tags: [["mall", "MALL"], ["promo", "-20%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Compatibility", "iPad models with USB-C"],
        ["Charging", "USB-C port, slide to charge"],
        ["Precision", "Pixel-perfect accuracy, low latency"],
        ["Tilt", "Tilt sensitivity for shading"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "appletv", cat: "Accessories",
      name: "Apple TV 4K (4th Generation)",
      img: "shoppee-assets/img/appletv.jpg", imgs: ["shoppee-assets/img/appletv.jpg"],
      price: 1349, rating: 5.0, sold: "10",
      tags: [["mall", "MALL"], ["pre", "NEW"]],
      voucher: 0, preorder: false,
      specs: [
        ["Video", "4K HDR10+ · Dolby Vision"],
        ["Chip", "A17 Pro"],
        ["Audio", "Dolby Atmos"],
        ["Storage", "64GB / 128GB"],
        ["In the Box", "Apple TV 4K, Siri Remote, Power Cord, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "macneo", cat: "Computers & Accessories",
      name: "Apple MacBook Neo 13\" Laptop | A18 Pro chip | Built for AI",
      img: "shoppee-assets/img/macneo.jpg", imgs: ["shoppee-assets/img/macneo.jpg"],
      price: 2869, old: 2989, rating: 5.0, sold: "3k+",
      tags: [["mall", "MALL"], ["promo", "-4%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "13-inch Liquid Retina display"],
        ["Chip", "A18 Pro"],
        ["Memory", "16GB unified memory"],
        ["Storage", "256GB / 512GB SSD"],
        ["Battery", "Up to 18 hours"],
        ["OS", "macOS"],
        ["In the Box", "MacBook Neo, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
    {
      id: "macair", cat: "Computers & Accessories",
      name: "Apple MacBook Air M5 (13\")",
      img: "shoppee-assets/img/macair.jpg", imgs: ["shoppee-assets/img/macair.jpg"],
      price: 4969, old: 5521, rating: 5.0, sold: "1k+",
      tags: [["mall", "MALL"], ["promo", "-10%"]],
      voucher: 0, preorder: false,
      specs: [
        ["Display", "13.6-inch Liquid Retina display"],
        ["Chip", "M5"],
        ["Memory", "16GB / 24GB unified memory"],
        ["Storage", "256GB / 512GB / 1TB SSD"],
        ["Battery", "Up to 18 hours"],
        ["OS", "macOS"],
        ["In the Box", "MacBook Air, USB-C Charge Cable, Documentation"],
        ["Warranty", "Apple 1-Year Limited Warranty"],
        ["Availability", "In Stock · Ships in 1–3 working days"],
      ],
    },
  ];
  const flagship=P_LIST[0];
  P_LIST.push(
    {...flagship,id:'pmax-outlet',name:'iPhone 18 Pro Max · Warehouse reservation',scam:'deposit',price:1999,range:'RM1,999 · reservation offer',voucher:0,rating:0,sold:'0',tags:[['promo','CLEARANCE']],variant:{storages:{'256GB':1999},default:'256GB',colors:flagship.variant.colors}},
    {...flagship,id:'pmax-storee',name:'iPhone 18 Pro Max · Flagship member price',scam:'store',price:5299,range:'RM5,299 · member price',voucher:0,rating:3.1,sold:'12',tags:[['mall','MALL']],variant:{storages:{'256GB':5299},default:'256GB',colors:flagship.variant.colors}}
  );
  const P_MAP = Object.create(null);
  P_LIST.forEach((p) => { P_MAP[p.id] = p; });

  let P = null;               // current product (product page)
  const VSTATE = { storage: null, color: null, qty: 1 };

  const fmt = (n) => n.toLocaleString("en-MY");
  const unitPrice = () => (P.variant && VSTATE.storage) ? P.variant.storages[VSTATE.storage] : P.price;

  /* ---------- cart ---------- */
  const cartLines=()=>{
    const value=read('sp-cart',[]);
    return Array.isArray(value)?value.filter(line=>line&&P_MAP[line.id]&&Number.isInteger(line.qty)&&line.qty>0&&line.qty<=3).slice(0,30):[];
  };
  const cartCount=()=>cartLines().reduce((n,line)=>n+line.qty,0);
  window.addToCart = (n=1) => {
    if(!canAct()||!P)return;
    const lines=cartLines(),line={id:P.id,storage:VSTATE.storage,color:VSTATE.color,qty:Math.max(1,Math.min(3,n))};
    const index=lines.findIndex(x=>x.id===line.id&&x.storage===line.storage&&x.color===line.color);
    if(index>=0)lines[index]={...line,qty:Math.min(3,lines[index].qty+line.qty)};else lines.push(line);
    write('sp-cart',lines);updateCartBadge();
  };
  function updateCartBadge() {
    $$(".cart-badge").forEach((b) => {
      b.textContent = cartCount();
      b.style.display = cartCount() > 0 ? "flex" : "none";
    });
  }

  /* ---------- countdowns (to midnight) ---------- */
  function startCountdowns() {
    $$("[data-countdown]").forEach((el) => {
      const tick = () => {
        const now = new Date();
        const end = new Date(now); end.setHours(24, 0, 0, 0);
        let s = Math.floor((end - now) / 1000);
        const pad = (n) => String(n).padStart(2, "0");
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        el.querySelectorAll("span").forEach((sp, i) => { sp.textContent = [pad(h), pad(m), pad(sec)][i]; });
      };
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ---------- banner carousel ---------- */
  function startCarousel() {
    const track = $(".banner-track");
    if (!track) return;
    const campaigns = [
      {title: t('Payday phone offers', '发薪日手机优惠'), detail: t('Find your next phone. Vouchers up to RM500.', '挑选你的下一部手机，优惠券最高减 RM500。'), action: t('Explore phones →', '逛逛手机区 →'), image: 'g1.png'},
      {title: 'iPhone 18 Pro Max', detail: t('Choose your colour. Make it yours.', '挑选喜欢的颜色，找到你的新手机。'), action: t('See the phone →', '查看手机 →'), image: 'g2.jpg'},
      {title: t('More ways to shop', '发现更多好物'), detail: t('Phones, tablets and accessories in one place.', '手机、平板与配件，一站选购。'), action: t('Browse the collection →', '浏览商品 →'), image: 'ipadair.jpg'}
    ];
    const slides = $$(".banner-slide", track);
    slides.forEach((slide, index) => {
      const campaign = campaigns[index];
      slide.classList.add('sp-local-banner');
      slide.innerHTML = `<div class="sp-banner-copy"><h2>${esc(campaign.title)}</h2><p>${esc(campaign.detail)}</p><a class="banner-cta" href="${href(index === 1 ? {id: 'pmax'} : {view: 'mobile'})}">${esc(campaign.action)}</a></div><div class="sp-banner-image"><img src="shoppee-assets/img/${campaign.image}" alt=""></div>`;
    });
    const n = slides.length;
    let i = 0;
    const dots = $$(".banner-dot");
    const paint = () => {
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle("active", k === i));
    };
    dots.forEach((d, k) => d.addEventListener("click", () => { i = k; paint(); }));
    setInterval(() => { i = (i + 1) % n; paint(); }, 4200);
  }

  /* ---------- topbar rotating messages ---------- */
  function startTopbar() {
    const el = $(".topbar-msg");
    if (!el) return;
    const msgs = [
      "🎮 ShopPee 游戏演示站 · 非真实购物网站",
      "🚚 Free Shipping across Malaysia",
      "🔥 9.9 Mega Sale — Up to 90% off",
      "📱 iPhone 18 Pro Max — Pre-order now, ETA 1 to 4 weeks",
    ];
    let i = 0;
    setInterval(() => { i = (i + 1) % msgs.length; el.textContent = msgs[i]; }, 3200);
  }

  /* ---------- fake search ---------- */
  function startSearch() {
    $("form.search")?.addEventListener('submit',event=>{
      event.preventDefault();const q=$("form.search input").value.trim().slice(0,100);
      if(q)location.href=href({view:'mobile',q});
    });
  }

  /* ---------- filter & sort (mobile page) ---------- */
  function initFilters() {
    const grid = $(".p-grid.list");
    if (!grid) return;
    const cards = $$(".p-card", grid);
    const countEl = $(".result-count");
    const apply = () => {
      const brands = new Set($$(".f-group[data-filter='brand'] input:checked").map((i) => i.value));
      const price = ($(".f-group[data-filter='price'] input:checked") || {}).value || "any";
      const query=(params.get('q')||'').toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((c) => {
        const okBrand = brands.size === 0 || brands.has(c.dataset.brand);
        const p = parseFloat(c.dataset.price);
        let okPrice = true;
        if (price === "lt1000") okPrice = p < 1000;
        else if (price === "1to3") okPrice = p >= 1000 && p < 3000;
        else if (price === "3to6") okPrice = p >= 3000 && p < 6000;
        else if (price === "gt6000") okPrice = p >= 6000;
        const show = okBrand && okPrice && query.every(word=>c.textContent.toLowerCase().includes(word));
        c.style.display = show ? "" : "none";
        if (show) shown++;
      });
      if (countEl) countEl.textContent = `${shown} 个商品 (demo)`;
    };
    $$(".filters input").forEach((i) => i.addEventListener("change", apply));
    apply();

    if(params.has('q'))$("form.search input").value=params.get('q');
    const sortBtns = $$(".sort-btn");
    const sortMap = { pop: "sold", new: "rating", sales: "sold", priceAsc: "price", priceDesc: "price" };
    sortBtns.forEach((b) => b.addEventListener("click", () => {
      sortBtns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const key = sortMap[b.dataset.sort] || "sold";
      const desc = b.dataset.sort === "priceDesc" || b.dataset.sort === "pop" || b.dataset.sort === "sales";
      const sorted = cards.slice().sort((a, c) => {
        const av = parseFloat(a.dataset[key] || 0), cv = parseFloat(c.dataset[key] || 0);
        return desc ? cv - av : av - cv;
      });
      sorted.forEach((c) => grid.appendChild(c));
      toast("已按「" + b.textContent.trim() + "」排序", 1400);
    }));
  }

  /* ============================================================
     Product page renderer (driven by ?id=)
     ============================================================ */
  function initProductPage() {
    const root = $(".prod-wrap");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    P = P_MAP[params.get("id")] || P_MAP.pmax;
    VSTATE.storage = P.variant ? P.variant.default : null;
    VSTATE.color = P.variant && P.variant.colors ? Object.keys(P.variant.colors)[0] : null;
    VSTATE.qty = 1;
    const cartIndex=params.get('cartLine');
    const cartItem=cartIndex!==null&&/^\d+$/.test(cartIndex)?cartLines()[Number(cartIndex)]:null;
    const selection=cartItem?.id===P.id?cartItem:read('sp-selection-'+P.id,null);
    if(selection&&typeof selection==='object'){
      if(P.variant&&Object.hasOwn(P.variant.storages,selection.storage))VSTATE.storage=selection.storage;
      if(P.variant?.colors&&Object.hasOwn(P.variant.colors,selection.color))VSTATE.color=selection.color;
      if(Number.isInteger(selection.qty)&&selection.qty>=1&&selection.qty<=3)VSTATE.qty=selection.qty;
    }
    $("#qtyInput").value=VSTATE.qty;

    document.title = P.name + " | ShopPee Malaysia";
    const crumb = $("#crumbName"); if (crumb) crumb.textContent = P.name;
    const crumbMid = $("#crumbMid"); if (crumbMid) crumbMid.textContent = P.cat;
    $("#prodTitle").textContent = P.name;

    /* gallery */
    $("#galleryMain").src = P.img;
    const th = $("#galleryThumbs");
    th.innerHTML = P.imgs.map((s, i) =>
      `<button class="thumb${i === 0 ? " active" : ""}" data-src="${s}"><img src="${s}" alt=""></button>`).join("");
    th.style.display = P.imgs.length > 1 ? "" : "none";

    /* rating / sold / tags */
    $("#ratingStars").textContent = "★★★★★".slice(0, Math.round(P.rating));
    $("#ratingText").textContent = P.rating.toFixed(1) + " · " + P.sold + " sold";
    $("#tagRow").innerHTML = P.tags.map(([cls, txt]) => `<span class="tag ${cls}">${txt}</span>`).join("");

    /* price */
    paintPrice();
    $("#rangeNote").textContent = P.range || (P.name + " · 官方正品 · Free Shipping");
    const chips = [
      "🚚 Free Shipping",
      "✅ 15-Day Free Returns",
      "💳 0% Instalment",
    ];
    if (P.voucher) chips.unshift(`🎁 Up to RM${P.voucher} Off Voucher`);
    if (P.preorder) chips.push("📦 Pre-Order · ETA 1–4 weeks");
    $("#vchips").innerHTML = chips.map((c) => `<span class="vchip">${c}</span>`).join("");

    /* variants */
    const vs = $("#variantSection");
    if (P.variant) {
      const storages = Object.keys(P.variant.storages);
      let html = `<div class="variant" data-variant="storage">
        <div class="v-label">${t('Storage: ','容量：')}<b id="storageLabel">${VSTATE.storage}</b></div>
        <div class="v-opts">${storages.map((s) => `<button class="v-opt${s === VSTATE.storage ? " active" : ""}" data-value="${s}">${s}</button>`).join("")}</div></div>`;
      if (P.variant.colors) {
        const colors = Object.keys(P.variant.colors);
        html += `<div class="variant" data-variant="color">
          <div class="v-label">${t('Color: ','颜色：')}<b id="colorLabel">${VSTATE.color}</b></div>
          <div class="v-opts">${colors.map((c) => `<button class="swatch${c === VSTATE.color ? " active" : ""}" data-value="${c}" style="background:${P.variant.colors[c]}" title="${c}"></button>`).join("")}</div></div>`;
      }
      vs.innerHTML = html;
      vs.style.display = "";
    } else {
      vs.style.display = "none";
    }

    /* spec table */
    $("#specBody").innerHTML = P.specs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");

    /* shipping tab */
    $("#shipDelivery").textContent = P.preorder ? "ETA 1 to 4 weeks after launch day (Pre-Order)" : "Ships in 1–3 working days · Free Shipping across Malaysia";

    /* shop card meta */
    const sm = $("#shopMeta");
    if (sm) sm.textContent = "12.4k followers · ⭐ 4.9 · 98% chat response · KL, Malaysia";

    /* modal summary */
    $("#sumImg").src = P.img;
    $("#sumName").textContent = P.name;
    paintSummary();

    /* similar products */
    const others = P_LIST.filter((x) => x.id !== P.id);
    const start = P_LIST.findIndex((x) => x.id === P.id) % others.length;
    const picks = others.slice(start).concat(others.slice(0, start)).slice(0, 6);
    $("#similarGrid").innerHTML = picks.map((x) => `
      <a class="p-card" href="shoppee.html?id=${x.id}">
        <div class="p-img"><img src="${x.img}" alt="${x.name}"></div>
        <div class="p-name">${x.name}</div>
        <div class="p-tags">${(x.tags || []).map(([cls, txt]) => `<span class="tag ${cls}">${txt}</span>`).join("")}</div>
        <div class="p-price-row"><span class="price"><span class="rm">RM</span>${fmt(x.price)}</span>${x.old ? ` <span class="old">RM${fmt(x.old)}</span>` : ""}</div>
        <div class="p-meta"><span class="stars">${"★★★★★".slice(0, Math.round(x.rating))}</span><span>${x.sold} sold</span></div>
      </a>`).join("");

    initVariants();
    initBuyButtons();
    initCheckout();
    setupSeller();
    if(params.get("checkout")==="1")window.openBuy();
  }

  function paintPrice() {
    const price = unitPrice();
    const q = VSTATE.qty;
    const sub = price * q;
    const tot = Math.max(0, sub - (P.voucher || 0));
    const el = $("#variantPrice");
    if (el) el.innerHTML = `<span class="rm">RM</span>${fmt(price)}`;
    const oldEl = $("#oldPrice");
    if (oldEl) {
      if (P.old) { oldEl.style.display = ""; oldEl.textContent = "RM" + fmt(P.old); }
      else oldEl.style.display = "none";
    }
    const note = $("#rangeNote");
    if (note && P.range) note.textContent = "所选规格： " + P.name.split(" [")[0] + " · " + (VSTATE.storage || "") + (VSTATE.color ? " · " + VSTATE.color : "") + (P.preorder ? "（预购，ETA 1–4 周）" : "");
    $$(".summary-price").forEach((x) => { x.innerHTML = `<span class="rm">RM</span>${fmt(sub)}`; });
    ["#summaryTotal", "#summaryTotal2"].forEach((s) => {
      const t = $(s);
      if (t) t.innerHTML = `<span class="rm">RM</span>${fmt(tot)}`;
    });
    const vl = $("#voucherLine");
    if (vl) vl.style.display = P.voucher ? "" : "none";
    const vl2 = $("#voucherLine2");
    if (vl2) vl2.style.display = P.voucher ? "" : "none";
  }

  function paintSummary() {
    write('sp-selection-'+P.id,{...VSTATE});
    const s = $("#sumVar") || $("#summaryVar");
    if (s) s.textContent = (VSTATE.storage || "Standard") + (VSTATE.color ? " · " + VSTATE.color : "") + " × " + VSTATE.qty;
  }

  /* ---------- variants interaction ---------- */
  function initVariants() {
    $$("[data-variant='storage'] .v-opt").forEach((o) => o.addEventListener("click", () => {
      $$("[data-variant='storage'] .v-opt").forEach((x) => x.classList.remove("active"));
      o.classList.add("active");
      VSTATE.storage = o.dataset.value;
      const lb = $("#storageLabel"); if (lb) lb.textContent = o.dataset.value;
      paintPrice(); paintSummary();
      toast("容量：" + o.dataset.value, 1100);
    }));
    $$("[data-variant='color'] .swatch").forEach((s) => s.addEventListener("click", () => {
      $$("[data-variant='color'] .swatch").forEach((x) => x.classList.remove("active"));
      s.classList.add("active");
      VSTATE.color = s.dataset.value;
      const lb = $("#colorLabel"); if (lb) lb.textContent = s.dataset.value;
      paintPrice(); paintSummary();
      toast("颜色：" + s.dataset.value, 1100);
    }));
    $$("#galleryThumbs .thumb").forEach((t) => t.addEventListener("click", () => {
      $$("#galleryThumbs .thumb").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      $("#galleryMain").src = t.dataset.src;
      toast("切换商品图 📷", 900);
    }));
    const qtyInput = $("#qtyInput");
    const setQty = (n) => {
      VSTATE.qty = Math.max(1, Math.min(3, n));
      qtyInput.value = VSTATE.qty;
      paintPrice(); paintSummary();
    };
    $("#qtyMinus").addEventListener("click", () => setQty(VSTATE.qty - 1));
    $("#qtyPlus").addEventListener("click", () => setQty(VSTATE.qty + 1));
    qtyInput.addEventListener("change", () => setQty(parseInt(qtyInput.value, 10) || 1));
  }

  /* ---------- buy buttons ---------- */
  function initBuyButtons() {
    const add = $("#addCartBtn");
    if (add) add.addEventListener("click", () => {
      window.addToCart(VSTATE.qty);
      toast(`🛒 已加入购物车：${P.name.split(" [")[0]} × ${VSTATE.qty}`, 2200);
    });
    const buy = $("#buyNowBtn");
    if (buy) buy.addEventListener("click", () => {
      toast(`⚡ 准备购买：${P.name.split(" [")[0]} × ${VSTATE.qty}`, 1400);
      window.openBuy();
    });
  }

  /* ---------- checkout modal ---------- */
  function initCheckout() {
    const modal = $("#buyModal");
    if (!modal) return;
    const paymentStage=$("#mstep3"),paymentBody=document.createElement('div');
    paymentBody.className='sp-payment-content';
    paymentBody.append(...paymentStage.childNodes);paymentStage.append(paymentBody);
    const steps = [t('Confirm','规格确认'),t('Delivery','收货地址'),t('Payment','模拟付款'),t('Paid','付款成功')];
    let step = 0,paid=false,returnFocus=null;
    const dialogSet=open=>{
      modal.setAttribute('role','dialog');modal.setAttribute('aria-label',t('Checkout','结算'));
      if(open){modal.setAttribute('aria-modal','true');returnFocus=document.activeElement;requestAnimationFrame(()=>$("#mClose").focus());}
      else {modal.removeAttribute('aria-modal');returnFocus?.focus();}
    };
    const paint = () => {
      $$(".m-step", modal).forEach((s, i) => {
        s.classList.toggle("active", i === step);
        s.textContent = (i <= step ? "✓ " : "• ") + steps[i];
      });
      [1, 2, 3, 4].forEach((n) => {
        const p = $("#mstep" + n);
        if (p) p.style.display = n === step + 1 ? "" : "none";
      });
      $("#modalTitle").textContent = step === 3 ? t('Payment successful','模拟付款成功') : t('Buy ','购买 ')+P.name;
      $("#mNext").textContent=t('Next','下一步');
      $("#mBack").style.display = step === 0 || step === 3 ? "none" : "";
      $("#mNext").style.display = step >= 2 ? "none" : "";
      $("#mNext").textContent = t("Next","下一步");
      $("#mFootExtra").style.display = step === 3 ? "" : "none";
      // Hiding Next/Pay must not strand keyboard focus on the document body.
      if(modal.classList.contains('show')&&!siteRoot.closest('[inert]')&&
        (!modal.contains(document.activeElement)||!document.activeElement.getClientRects().length)){
        (step===2?$("#placeOrder"):step===3?$("#mFootExtra .btn-block"):$("#mNext")).focus();
      }
    };
    window.openBuy = () => {
      if(!canAct())return;
      paymentBody.hidden=false;paymentStage.querySelector('.sp-warning')?.remove();
      paintPrice();paintSummary();paid=false;step=0;paint();modal.classList.add('show');$(".modal-back").style.display='block';dialogSet(true);
      if(!P.scam)write('sp-checkout',{productId:P.id,roundId:params.get('round')||null,at:Date.now()});
    };
    window.closeBuy = () => { modal.classList.remove('show');$(".modal-back").style.display='none';dialogSet(false); };
    $("#mClose").addEventListener("click", window.closeBuy);
    $(".modal-back").addEventListener("click", window.closeBuy);
    $("#mBack").addEventListener("click", () => { if (step > 0) { step--; paint(); } });
    $("#mNext").addEventListener("click", () => { if(canAct()&&step<2){step++;paint();} });
    $("#mFootExtra .btn-block").addEventListener("click", () => { window.closeBuy(); toast("🧭 可以继续逛其他商品～", 2000); });
    $("#placeOrder").addEventListener("click", () => {
      if(!canAct()||paid||step!==2)return;
      if(P.scam){
        write('sp-scam-attempts',{id:P.id,at:Date.now(),roundId:params.get('round')||null});
        const warning=P.scam==='deposit'
          ?t('This offer asked for a separate reservation fee. Its seller has no platform verification. Return to the marketplace and check who is selling the phone.','该入口要求另付预订费，店铺也没有平台认证。回到商城，核对手机的实际卖家。')
          :t('This shop copied a flagship name and badge, then sent the payment outside marketplace checkout. Its platform record shows an unverified independent seller. Return and check the seller record.','这家店仿用了旗舰店名称与徽章，并将付款引向商城外部。平台记录显示它是未认证的独立卖家。返回商城，核对店铺认证记录。');
        paymentBody.hidden=true;
        paymentStage.insertAdjacentHTML('beforeend','<div class="sp-warning"><h3>'+t('The payment went to a different seller','这笔模拟付款交给了另一位卖家')+'</h3><p>'+warning+'</p><a class="btn-block" href="'+href({view:'mobile'})+'">'+t('Return to phones','返回手机区')+'</a></div>');
        paymentStage.querySelector('.sp-warning a').focus();
        return;
      }
      const order={id:'SP-'+crypto.randomUUID(),productId:P.id,storeId:'apple-my-verified',storage:VSTATE.storage,color:VSTATE.color,qty:VSTATE.qty,unitPrice:unitPrice(),voucher:P.voucher||0,total:Math.max(0,unitPrice()*VSTATE.qty-(P.voucher||0)),payment:'paid',roundId:params.get('round')||null,at:Date.now()};
      const stored=read('sp-orders',[]),orders=Array.isArray(stored)?stored:[];
      const repeated=orders.find(x=>x&&x.productId===order.productId&&x.storage===order.storage&&x.color===order.color&&x.qty===order.qty&&x.roundId===order.roundId&&x.payment==='paid');
      if(!repeated&&write('sp-orders',[...orders,order].slice(-30))===false)return;
      write('sp-cart',cartLines().filter(line=>line.id!==P.id||line.storage!==VSTATE.storage||line.color!==VSTATE.color));
      updateCartBadge();
      paid=true;step = 3;
      paint();
      $("#orderIdText").textContent = (repeated||order).id;
      const total = Math.max(0, unitPrice() * VSTATE.qty - (P.voucher || 0));
      $("#orderTotal").innerHTML = `<span class="rm">RM</span>${fmt(total)}`;
      $(".success-box h3").textContent=t('Payment successful','模拟付款成功');
      $("#mFootExtra .btn-block").textContent=t('Done · Close receipt','完成 · 关闭收据');
      $("#orderNote").textContent = P.id==='pmax'?t('Your iPhone 18 Pro Max is paid for in this simulation. Close this receipt and submit your round from the game bar.','iPhone 18 Pro Max 模拟付款完成。关闭收据后，在游戏顶部提交本轮。'):t('Payment completed for this item. Check the phone model in your assignment.','该商品模拟付款完成。请核对任务要求的手机型号。');
      confetti();
    });
    $$(".pay-opt").forEach((o) => o.addEventListener("click", () => {
      $$(".pay-opt").forEach((x) => x.classList.remove("active"));
      o.classList.add("active");
      $("input", o).checked = true;
    }));
  }

  /* ---------- confetti ---------- */
  function confetti() {
    const colors = ["#ee4d2d", "#ffb700", "#26aa99", "#4f7cff", "#9b59ff", "#ff6a9f"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
      c.style.animationDelay = Math.random() * 0.5 + "s";
      siteRoot.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  /* ---------- tabs ---------- */
  function initTabs() {
    $$(".tab[data-tab]").forEach((t) => t.addEventListener("click", () => {
      $$(".tab[data-tab]").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      $$(".tab-panel").forEach((p) => { p.style.display = "none"; });
      const panel = $("#panel-" + t.dataset.tab);
      if (panel) panel.style.display = "";
    }));
  }

  /* ---------- misc demo buttons ---------- */
  function initMiscButtons() {
    const cart = $("#cartBtn");
    if(cart)cart.addEventListener('click',()=>{location.href=href({view:'cart'});});
    const acc = $("#accountBtn");
    if (acc) acc.addEventListener("click", () => toast("👤 登录功能为游戏演示，无需真实账号", 2000));
    $$(".g-btn").forEach((b) => b.addEventListener("click", () => toast("演示功能：" + b.textContent.trim() + " 💛", 1400)));
    $$(".brand").forEach((b) => b.addEventListener("click", () => toast("演示：进入 " + b.textContent.trim() + "（未接入真实店铺）", 1800)));
  }

  /* ---------- follow button ---------- */
  function initFollow() {
    const b = $("#followBtn");
    if (b) b.addEventListener("click", () => {
      const willFollow = b.classList.contains("follow");
      b.classList.toggle("follow", !willFollow);
      b.textContent = willFollow ? t("✓ Following", "✓ 已关注") : t("+ Follow", "+ 关注");
      const sellerName = $('.shop-name').firstChild.textContent.trim();
      toast(willFollow ? t('Following ', '已关注 ') + sellerName : t('Unfollowed', '已取消关注'), 1600);
    });
  }

  /* ---------- back to top ---------- */
  function initBackTop() {
    let b = $(".back-top");
    if (!b) {
      b = document.createElement("button");
      b.className = "back-top";
      b.innerHTML = "▲";
      siteRoot.appendChild(b);
    }
    b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function addLures(){
    const grid=$(view==='mobile'?'.p-grid.list':'.p-grid');
    if(!grid)return;
    const cards=['pmax-outlet','pmax-storee'].map(id=>{
      const p=P_MAP[id];
      return '<a class="p-card sp-lure" href="'+href({id})+'" data-brand="iPhone" data-price="'+p.price+'" data-sold="12" data-rating="3.1"><div class="p-img"><img src="'+p.img+'" alt="'+esc(p.name)+'"></div><div class="p-name">'+esc(p.name)+'</div><div class="p-tags"><span class="tag '+(p.scam==='store'?'mall':'promo')+'">'+(p.scam==='store'?'MALL':'WAREHOUSE')+'</span></div><div class="p-price-row"><span class="price"><span class="rm">RM</span>'+fmt(p.price)+'</span></div><div class="p-meta">'+(p.scam==='store'?'Apple Flagship Storee · 3.1':'Mobile Warehouse · New seller')+'</div></a>';
    });
    grid.insertAdjacentHTML('afterbegin',cards.join(''));
  }

  function renderCart(){
    const header=$('.header').outerHTML,top=$('.topbar').outerHTML;
    siteRoot.innerHTML=top+header+'<main class="sp-cart"><h1>'+t('Shopping cart','购物车')+'</h1><div class="sp-cart-lines"></div></main>';
    const lines=cartLines();
    $('.sp-cart-lines').innerHTML=lines.length?lines.map((line,i)=>{
      const p=P_MAP[line.id];
      return '<article class="sp-cart-line"><img src="'+p.img+'" alt=""><div><h2>'+esc(p.name)+'</h2><p>'+esc([line.storage,line.color,'× '+line.qty].filter(Boolean).join(' · '))+'</p><a class="btn btn-buy" href="'+href({id:line.id,checkout:1,cartLine:i})+'">'+t('Checkout','去结算')+'</a> <button class="btn-ghost" data-remove="'+i+'">'+t('Remove','移除')+'</button></div></article>';
    }).join(''):'<p>'+t('Your cart is empty.','购物车还是空的。')+'</p><a class="btn btn-cart" href="'+href({view:'mobile'})+'">'+t('Browse phones','逛手机区')+'</a>';
    siteRoot.addEventListener('click',event=>{
      const b=event.target.closest('[data-remove]');if(!b||!canAct())return;
      const fresh=cartLines();fresh.splice(Number(b.dataset.remove),1);write('sp-cart',fresh);location.reload();
    });
  }

  function setupSeller(){
    const fake=Boolean(P.scam);
    const sellerName=P.scam==='store'?'Apple Flagship Storee':P.scam==='deposit'?'Mobile Warehouse Deals':'Gary is genius';
    $('.shop-name').innerHTML=esc(sellerName)+' <span class="shop-badge">'+(P.scam==='deposit'?'NEW':'MALL')+'</span>';
    $('#crumbMid').nextElementSibling.textContent=sellerName;
    $('.shop-avatar img').alt=sellerName;
    $('#shopMeta').textContent=P.scam==='deposit'?t('Joined 2 days ago · No reviews · 8 followers','加入 2 天 · 暂无评价 · 8 位关注者'):P.scam==='store'?t('312 followers · 3.1 rating · Independent seller','312 位关注者 · 3.1 分 · 独立卖家'):t('12.4k followers · 4.9 rating · Platform-verified seller','12.4k 位关注者 · 4.9 分 · 平台认证卖家');
    $('.shop-btns').insertAdjacentHTML('afterbegin','<button id="spVerify">'+t('Seller details','查看卖家')+'</button>');
    if(fake){
      $('.shop-avatar img').src='shoppee-assets/img/avatar.png';
      $('.policy-row').textContent=P.scam==='deposit'?t('RM50 reservation required · Balance arranged with seller','先付 RM50 预订费 · 尾款联系卖家'):t('Member price · Seller payment link required','会员价 · 需使用卖家付款链接');
      $('#rangeNote').textContent=P.range;
      $('#panel-reviews').innerHTML='<h3>'+t('Ratings & reviews','评价')+'</h3><p class="empty-review">'+t('No verified reviews for this listing.','该商品暂无已验证的买家评价。')+'</p>';
      $('#placeOrder').textContent=P.scam==='deposit'?t('Pay RM50 reservation','模拟支付 RM50 预订费'):t('Pay using seller link','通过卖家链接模拟付款');
    }else $('#placeOrder').textContent=t('Confirm simulated payment','确认模拟付款');
    $('#spVerify').addEventListener('click',()=>{
      const panel=document.createElement('section');panel.className='sp-seller-overlay';panel.setAttribute('role','dialog');panel.setAttribute('aria-label',t('Seller information','卖家资料'));panel.setAttribute('aria-modal','true');
      panel.innerHTML='<div class="sp-seller-card"><button class="sp-seller-close" aria-label="'+t('Close seller information','关闭卖家资料')+'">×</button><small>'+t('SHOPPEE · SELLER RECORD','SHOPPEE · 店铺档案')+'</small><img class="sp-seller-avatar" src="'+esc($('.shop-avatar img').getAttribute('src'))+'" alt=""><h2>'+esc(sellerName)+'</h2><dl><dt>'+t('Shop ID','店铺编号')+'</dt><dd>'+ (fake?(P.scam==='store'?'apple-flagship-storee-my':'warehouse-mobile-new'):'apple-my-verified')+'</dd><dt>'+t('Platform verification','平台认证')+'</dt><dd>'+ (fake?t('Unverified independent seller','未认证的独立卖家'):t('Verified brand store','已验证的品牌店铺'))+'</dd><dt>'+t('Payment destination','付款去向')+'</dt><dd>'+(fake?t('External seller payment / reservation','卖家外部付款／预订入口'):t('ShopPee checkout for this order','本订单的 ShopPee 结算'))+'</dd></dl><p>'+t('Check this platform record alongside the name and promotional artwork.','结合平台记录核对店名和促销图片。')+'</p></div>';
      siteRoot.append(panel);const close=panel.querySelector('button');close.focus();
      const dismiss=()=>{panel.remove();$('#spVerify').focus();};
      close.addEventListener('click',dismiss);panel.addEventListener('click',event=>{if(event.target===panel)dismiss();});
      panel.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();close.focus();}if(event.key==='Escape'&&!document.querySelector('.br-ad'))dismiss();});
    });
  }

  function enhancePage(){
    // All in-shop navigation uses the scene URL so the existing clock survives.
    for(const link of siteRoot.querySelectorAll('a[href]')){
      const raw=link.getAttribute('href');
      if(raw==='index.html')link.href=href({});
      else if(raw==='mobile.html')link.href=href({view:'mobile'});
      else if(raw.startsWith('product.html?'))link.href=href({id:new URLSearchParams(raw.split('?')[1]).get('id')});
      else if(raw.startsWith('shoppee.html')){
        const target=new URL(raw,location.href);link.href=href(Object.fromEntries(target.searchParams));
      }
    }
    for(const input of siteRoot.querySelectorAll('#mstep2 input'))input.readOnly=true;
    if($('#mstep2'))$('#mstep2').insertAdjacentHTML('afterbegin','<p class="sp-demo-note">'+t('Demo delivery details are already filled in.','演示收件资料已预填。')+'</p>');
    if($('.sp-payment-content'))$('.sp-payment-content').insertAdjacentHTML('afterbegin','<p class="sp-demo-note">'+t('Choose a demo payment method. Confirming records a local simulated order.','选择演示付款方式，确认后记录本地模拟订单。')+'</p>');
    for(const option of siteRoot.querySelectorAll('.pay-opt')){
      option.tabIndex=0;option.setAttribute('role','radio');option.setAttribute('aria-checked',String(option.classList.contains('active')));
      option.addEventListener('click',()=>{for(const other of siteRoot.querySelectorAll('.pay-opt'))other.setAttribute('aria-checked',String(other===option));});
      option.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();option.click();}});
    }
    const like=$('.g-actions .g-btn');
    const paintSaved=()=>{if(like){const saved=read('sp-saved',[]);like.textContent=Array.isArray(saved)&&saved.includes(P.id)?t('♥ Saved','♥ 已收藏'):t('♡ Save','♡ 收藏');}};
    paintSaved();
    if(like)like.addEventListener('click',()=>{const saved=read('sp-saved',[]),values=Array.isArray(saved)?saved:[];const next=values.includes(P.id)?values.filter(id=>id!==P.id):[...values,P.id];if(write('sp-saved',next)!==false)paintSaved();});
    siteRoot.addEventListener('keydown',event=>{
      const modal=$('#buyModal.show');if(!modal||root.inert)return;
      if(event.key==='Escape'&&!document.querySelector('.br-ad')){event.preventDefault();window.closeBuy();return;}
      if(event.key!=='Tab')return;
      const controls=[...modal.querySelectorAll('button,a[href],input,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    window.addEventListener('pageshow',event=>{if(event.persisted)requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(params.get('view')==='cart'){location.reload();return;}
      updateCartBadge();paintSaved();
    }));});
  }

  /* ---------- boot ---------- */
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.fb) {
      t.dataset.fb = "1";
      t.src = "shoppee-assets/img/fallback.svg";
    }
  }, true);

  (() => {
    if(params.get('view')==='cart')renderCart();
    updateCartBadge();
    startTopbar();
    startCarousel();
    startCountdowns();
    startSearch();
    addLures();
    initProductPage();
    initTabs();
    initMiscButtons();
    initFollow();
    initBackTop();
  })();
  enhancePage();
  window.SHOPPEE_I18N(siteRoot,C.lang);
  // Match the catalogue text that the player sees in the selected language.
  initFilters();
};
