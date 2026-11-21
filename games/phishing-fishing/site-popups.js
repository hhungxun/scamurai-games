/* Simulated Edge/Chrome browser & OS sandbox popups for Phishing Fishing.
   100% offline, inert, and local — never navigates away or transmits input. */
(function (root) {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function formatOmnibox(rawUrl) {
    try {
      const u = new URL(rawUrl);
      const parts = u.hostname.split(".");
      const reg = parts.length >= 2 ? parts.slice(-2).join(".") : u.hostname;
      const sub = parts.length > 2 ? parts.slice(0, -2).join(".") + "." : "";
      const path = (u.pathname === "/" ? "" : u.pathname) + u.search;
      return `<span class="ol-omni-scheme">${esc(u.protocol)}//</span><span class="ol-omni-sub">${esc(sub)}</span><strong class="ol-omni-reg">${esc(reg)}</strong><span class="ol-omni-path">${esc(path)}</span>`;
    } catch {
      return `<strong>${esc(rawUrl)}</strong>`;
    }
  }

  function mockField(label, placeholder, type = "text") {
    return `<label class="ol-sim-field"><span>${esc(label)}</span><input type="${esc(type)}" value="" placeholder="${esc(placeholder)}" autocomplete="off" readonly tabindex="-1"></label>`;
  }

  function buildLinkPage(email, block, playerName) {
    const id = email.id;
    const name = esc(playerName || "Aisha");
    switch (id) {
      case "bank-verification":
        return {
          tab: "Maybank2u · Device Security Review",
          brandBg: "#1a1a1a",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#ffc800;color:#111"><strong>Maybank2u</strong><span>Digital Banking Security</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-alert warn">New device detected · Windows / Chrome · Kuala Lumpur · Ref MB-841209</div>
                <h2>Remove Unrecognised Device</h2>
                <p>Outgoing transfers are temporarily paused. Sign in and enter the SMS authorisation code sent to your phone to confirm device removal (no transfer will be made).</p>
                ${mockField("Online Banking Username", "e.g. aisha.student")}
                ${mockField("Banking Password", "••••••••••••", "password")}
                ${mockField("6-Digit SMS Authorisation Code (OTP)", "Enter 6-digit code")}
                <button type="button" class="ol-sim-cta" style="background:#111" data-sim-cta>Confirm &amp; Remove Device</button>
              </div>
            </div>`
        };
      case "parcel-fee":
        return {
          tab: "Pos Malaysia · Sepang Hub Redelivery",
          brandBg: "#c22b18",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#c22b18;color:#fff"><strong>Pos Malaysia</strong><span>Delivery Exception Desk</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-alert warn">Parcel held at Sepang Hub · Truncated unit number</div>
                <h2>Address Correction &amp; Surcharge (RM 2.40)</h2>
                <p>Confirm your campus block/unit and settle the RM 2.40 re-labelling surcharge for tomorrow’s dispatch.</p>
                ${mockField("Block / Unit Number", "e.g. D3-04-12, XMUM Sepang")}
                ${mockField("Card Number (Visa / Mastercard)", "4000 1234 5678 9010")}
                <div class="ol-sim-row">${mockField("Expiry (MM/YY)", "08/28")}${mockField("CVV", "•••", "password")}</div>
                <button type="button" class="ol-sim-cta" style="background:#c22b18" data-sim-cta>Pay RM 2.40 &amp; Release Parcel</button>
              </div>
            </div>`
        };
      case "tax-rebate":
        return {
          tab: "MyTax · Surplus Tax Credit Disbursement",
          brandBg: "#123b7a",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#123b7a;color:#fff"><strong>MyTax · LHDN</strong><span>Direct Credit Verification</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Reference</span><b>EF-2026-184207</b><span>Refund Amount</span><b style="color:#107c41">RM 486.20</b></div>
                <h2>Instant FPX Bank Ownership Check</h2>
                <p>Verify your receiving bank account via our FPX partner before Friday’s cut-off. <strong>RM 0.00 will be debited.</strong></p>
                ${mockField("MyKad / IC Number", "040812-10-XXXX")}
                ${mockField("Bank Name", "Maybank2u / CIMB Clicks / Public Bank")}
                ${mockField("Online Banking Username", "Enter banking login ID")}
                ${mockField("Online Banking Password", "••••••••••••", "password")}
                <button type="button" class="ol-sim-cta" style="background:#123b7a" data-sim-cta>Verify via FPX (RM 0.00)</button>
              </div>
            </div>`
        };
      case "alien-wallet":
        return {
          tab: "Meridian Digital Wallet · Backup Migration",
          brandBg: "#1a2338",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#1a2338;color:#fff"><strong>Meridian Wallet</strong><span>Recovery Backup Upgrade</span></div>
              <div class="ol-sim-card">
                <h2>Verify Your 12-Word Recovery Phrase</h2>
                <p>Ref WLT-184207 · Enter your 12-word recovery phrase in exact order to migrate your balance to the upgraded backup vault.</p>
                <div class="ol-seed-grid">${Array.from({ length: 12 }, (_, i) => `<span><small>${i + 1}.</small> word ${i + 1}</span>`).join("")}</div>
                <button type="button" class="ol-sim-cta" style="background:#1a2338" data-sim-cta>Confirm Recovery Backup</button>
              </div>
            </div>`
        };
      case "cloud-share":
        return {
          tab: "Permissions requested · Microsoft 365",
          brandBg: "#0f6cbd",
          body: `
            <div class="ol-sim-site ol-sim-oauth">
              <div class="ol-oauth-card">
                <div class="ol-ms-brand"><span class="ol-ms-sq"><i></i><i></i><i></i><i></i></span><strong>Microsoft</strong></div>
                <div class="ol-oauth-user">student@xmum.edu.my</div>
                <h2>Permissions requested</h2>
                <div class="ol-oauth-app"><strong>Document Sync Viewer</strong><span class="ol-unverified">Unverified publisher</span></div>
                <p>This app would like to:</p>
                <ul class="ol-oauth-scopes">
                  <li><strong>Mail.ReadWrite</strong><span>Read, update, create, and delete all emails in your mailbox</span></li>
                  <li><strong>Mail.Send</strong><span>Send mail as you to any internal or external recipient</span></li>
                  <li><strong>User.Read</strong><span>Sign in and read your basic campus profile</span></li>
                </ul>
                <div class="ol-oauth-btns">
                  <button type="button" class="ol-sim-ghost" data-sim-close>Cancel</button>
                  <button type="button" class="ol-sim-cta" style="background:#0f6cbd" data-sim-cta>Accept</button>
                </div>
              </div>
            </div>`
        };
      case "cloud-share-record":
        return {
          tab: "activity-budget.xlsx · XMUM SharePoint",
          brandBg: "#107c41",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#107c41;color:#fff"><strong>XMUM SharePoint</strong><span>AG1-2 Shared Folder · Read-Only</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>File</span><b>activity-budget.xlsx</b><span>Scope</span><b>Files.Read (this file only)</b></div>
                <h2>AG1-2 Community Event Budget (View Only)</h2>
                <table class="ol-sim-table">
                  <thead><tr><th>Item</th><th>Qty</th><th>Estimate</th></tr></thead>
                  <tbody>
                    <tr><td>Booth Standee Banners</td><td>2</td><td>RM 180.00</td></tr>
                    <tr><td>Printed QR Station Cards</td><td>25</td><td>RM 95.00</td></tr>
                    <tr><td>Volunteer Refreshments</td><td>12</td><td>RM 144.00</td></tr>
                  </tbody>
                </table>
                <p class="ol-sim-muted">Signed in via XMUM SSO (student@xmum.edu.my). No additional mailbox permissions requested.</p>
              </div>
            </div>`
        };
      case "payroll-update":
        return {
          tab: "Allowance AL-26118 · FPX Instant Verification",
          brandBg: "#7a1c24",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#7a1c24;color:#fff"><strong>XMUM Student Finance</strong><span>Allowance Batch AL-26118</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Allowance</span><b>AL-26118</b><span>Placement</span><b>CS-26104</b></div>
                <h2>Instant Bank Verification (FPX Verify)</h2>
                <p>Log in to your online banking account and enter the 6-digit SMS TAC to confirm ownership before Friday 17:00. <strong>RM 0.00 will be debited.</strong></p>
                ${mockField("Select Bank", "Public Bank / Maybank2u / CIMB")}
                ${mockField("Online Banking Login ID", "Enter bank username")}
                ${mockField("Online Banking Password", "••••••••••••", "password")}
                ${mockField("6-Digit SMS TAC", "Enter SMS TAC")}
                <button type="button" class="ol-sim-cta" style="background:#7a1c24" data-sim-cta>Complete FPX Verify (RM 0.00)</button>
              </div>
            </div>`
        };
      case "payroll-confirm":
        return {
          tab: "XMUM Finance Portal · Allowance AL-26118",
          brandBg: "#1b365d",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#1b365d;color:#fff"><strong>XMUM Finance Portal</strong><span>Signed in: ${name}</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Allowance</span><b>AL-26118</b><span>Status</span><b style="color:#107c41">Scheduled (Friday batch)</b></div>
                <h2>Confirm Receiving Bank Details</h2>
                <p>Verify the bank name and receiving account number on file for your placement allowance disbursement.</p>
                <div class="ol-sim-kv"><span>Account Holder</span><b>${name}</b><span>Bank</span><b>Public Bank Berhad</b><span>Account No.</span><b>4821-••••-9012</b></div>
                <button type="button" class="ol-sim-cta" style="background:#1b365d" data-sim-cta>Confirm Receiving Account</button>
              </div>
            </div>`
        };
      case "parcel-update":
        return {
          tab: "ParcelPath Tracking · PP-MY-612483",
          brandBg: "#c2590a",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#c2590a;color:#fff"><strong>ParcelPath Tracking</strong><span>Order BN-22814</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Tracking</span><b>PP-MY-612483</b><span>Status</span><b style="color:#107c41">Ready for Pickup</b></div>
                <h2>XMUM Campus Parcel Counter</h2>
                <p><strong>Hours:</strong> 10:00 am – 6:00 pm (collect by Friday 6:00 pm)<br><strong>Delivery fee:</strong> RM 4.50 — Paid with BookNest order BN-22814</p>
                <p class="ol-sim-muted">Bring your student card and quote PP-MY-612483 at the staffed counter. Balance due: RM 0.00.</p>
              </div>
            </div>`
        };
      case "event-registration":
        return {
          tab: "XMUM Events · First Aid Workshop FA-1124",
          brandBg: "#1b365d",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#1b365d;color:#fff"><strong>XMUM Student Activities</strong><span>My Registrations</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Registration</span><b>FA-1124</b><span>Status</span><b>Provisional (Confirm by Fri 5 pm)</b></div>
                <h2>First Aid Workshop · Sat 10:00 am–12:00 pm</h2>
                <p><strong>Venue:</strong> Student Activity Centre, Room 2<br><strong>Refundable Seat Deposit:</strong> RM 10.00 (returned to Student Billing after attendance check-in)</p>
                <button type="button" class="ol-sim-cta" style="background:#1b365d" data-sim-cta>Pay RM 10.00 via Student Portal Billing</button>
              </div>
            </div>`
        };
      case "security-change":
        return {
          tab: "Campus ID · Account Security",
          brandBg: "#1b365d",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#1b365d;color:#fff"><strong>XMUM Campus ID</strong><span>Account → Security → Recovery</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Maintenance</span><b>CID-M-1023</b><span>Window</span><b>Friday 6:00–8:00 pm</b></div>
                <h2>Recovery Phone Number</h2>
                <p>Registered recovery number for <strong>student@xmum.edu.my</strong>:</p>
                <div class="ol-sim-kv"><span>Current Phone</span><b>+60 1•-••• •842</b><span>Status</span><b style="color:#107c41">Active</b></div>
                <button type="button" class="ol-sim-cta" style="background:#1b365d" data-sim-cta>Confirm Current Number</button>
              </div>
            </div>`
        };
      case "internship-shortlist":
        return {
          tab: "XMUM Career Services · CS-26104",
          brandBg: "#1b365d",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#1b365d;color:#fff"><strong>XMUM Career Services</strong><span>Careers → My Applications</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Application</span><b>CS-26104</b><span>Status</span><b style="color:#107c41">Shortlisted</b></div>
                <h2>Select Interview Slot · Data Internship</h2>
                <div class="ol-slot-list">
                  <span>Thu 10:00 AM · Room A2-204</span>
                  <span>Thu 2:30 PM · Room A2-204</span>
                  <span>Fri 11:00 AM · Online (Teams)</span>
                </div>
                <button type="button" class="ol-sim-cta" style="background:#1b365d" data-sim-cta>Confirm Interview Slot</button>
              </div>
            </div>`
        };
      case "scholarship-review":
        return {
          tab: "XMUM Financial Aid · SCH-26118",
          brandBg: "#1b365d",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#1b365d;color:#fff"><strong>XMUM Financial Aid</strong><span>My Applications · SCH-26118</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Application</span><b>SCH-26118</b><span>Document</span><b>Comments_SCH26118.pdf</b></div>
                <h2>Household Income Verification Checklist</h2>
                <p>Upload only the requested household income slip with unrelated account numbers and transactions redacted.</p>
                <button type="button" class="ol-sim-cta" style="background:#1b365d" data-sim-cta>Upload Redacted Document</button>
              </div>
            </div>`
        };
      case "library-fine":
        return {
          tab: "XMUM Library · Account LB-20418",
          brandBg: "#1b365d",
          body: `
            <div class="ol-sim-site">
              <div class="ol-sim-nav" style="background:#1b365d;color:#fff"><strong>XMUM Library</strong><span>My Account · LB-20418</span></div>
              <div class="ol-sim-card">
                <div class="ol-sim-kv"><span>Library Account</span><b>LB-20418</b><span>Outstanding Fine</span><b>RM 8.00</b></div>
                <h2>Settle Overdue Balance</h2>
                <p>Pay via your logged-in university billing account. An official portal receipt is issued immediately.</p>
                <button type="button" class="ol-sim-cta" style="background:#1b365d" data-sim-cta>Pay RM 8.00 via Student Billing</button>
              </div>
            </div>`
        };
      default:
        return {
          tab: block.text || "Web Preview",
          brandBg: "#0f6cbd",
          body: `<div class="ol-sim-site"><div class="ol-sim-card"><h2>${esc(block.text)}</h2><p>Simulated page for <code>${esc(block.url)}</code>.</p></div></div>`
        };
    }
  }

  function buildAttachmentView(email, block) {
    const id = email.id;
    const filename = block.text;
    if (id === "shopping-document") {
      return {
        mode: "browser",
        url: "file:///C:/Users/Student/Downloads/Receipt-SL-583102.pdf.html",
        tab: "Receipt-SL-583102.pdf.html — Sign in",
        body: `
          <div class="ol-sim-site ol-sim-oauth">
            <div class="ol-oauth-card">
              <div class="ol-sim-alert warn">Local HTML file opened in browser (not a PDF!)</div>
              <div class="ol-ms-brand"><span class="ol-ms-sq"><i></i><i></i><i></i><i></i></span><strong>ShopLane Receipt Viewer</strong></div>
              <h2>Sign in with Microsoft 365 to view receipt</h2>
              <p>This app requests permission to access your XMUM mailbox:</p>
              <ul class="ol-oauth-scopes">
                <li><strong>Mail.ReadWrite</strong><span>Read and modify all emails in your inbox</span></li>
                <li><strong>Mail.Send</strong><span>Send emails from student@xmum.edu.my</span></li>
              </ul>
              <button type="button" class="ol-sim-cta" style="background:#0f6cbd" data-sim-cta>Accept &amp; Open Receipt</button>
            </div>
          </div>`
      };
    }
    if (id === "scholarship-document") {
      return {
        mode: "app",
        appTitle: "Microsoft Word — Assessment-SCH-26118.docm (Protected View)",
        body: `
          <div class="ol-sim-word">
            <div class="ol-word-bar"><span><strong>SECURITY WARNING</strong> Macros have been disabled. This file originated from an email attachment.</span><button type="button" data-sim-cta>Enable Content</button></div>
            <div class="ol-word-page">
              <div class="ol-word-blur">
                <h3>XMUM Scholarship Assessment — SCH-26118</h3>
                <p>This rubric document is protected. Click <strong>Enable Content</strong> in the yellow bar above to run the embedded macro and decrypt panel remarks.</p>
              </div>
            </div>
          </div>`
      };
    }
    if (id === "lecture-clone" || id === "wifi-profile") {
      const exeName = id === "wifi-profile" ? "XMUM-Student-Activator-Setup.exe" : "Attendance-Review.pdf.exe";
      return {
        mode: "app",
        appTitle: "Windows Security — User Account Control",
        body: `
          <div class="ol-sim-uac">
            <div class="ol-uac-head"><span>User Account Control</span></div>
            <div class="ol-uac-body">
              <h2>Do you want to allow this app from an unknown publisher to make changes to your device?</h2>
              <div class="ol-sim-kv"><span>Program</span><b>${esc(exeName)}</b><span>Verified publisher</span><b style="color:#c50f1f">Unknown (Unsigned .exe)</b></div>
              ${id === "wifi-profile" ? '<div class="ol-sim-alert warn">Windows Defender SmartScreen flagged this file as unrecognised software.</div>' : ""}
              <div class="ol-oauth-btns">
                <button type="button" class="ol-sim-cta" style="background:#c50f1f" data-sim-cta>Yes (Allow changes)</button>
                <button type="button" class="ol-sim-ghost" data-sim-close>No</button>
              </div>
            </div>
          </div>`
      };
    }
    if (id === "penguin-qr") {
      return {
        mode: "browser",
        url: "https://locker-release.parcel-verify.example/card-check/PP-MY-441208",
        tab: "QR Scan Preview · Parcel Locker Release",
        body: `
          <div class="ol-sim-site">
            <div class="ol-sim-nav" style="background:#c2590a;color:#fff"><strong>Campus Locker Release</strong><span>Scanned from Collection-PP-MY-441208-QR.png</span></div>
            <div class="ol-sim-card">
              <h2>Verify Adult Identity to Open Locker</h2>
              <p>Enter your payment card details to release Parcel PP-MY-441208 (RM 0.00 charged).</p>
              ${mockField("Card Number", "4000 1234 5678 9010")}
              <div class="ol-sim-row">${mockField("Expiry (MM/YY)", "08/28")}${mockField("CVV", "•••", "password")}</div>
              <button type="button" class="ol-sim-cta" style="background:#c2590a" data-sim-cta>Verify Card &amp; Release Locker</button>
            </div>
          </div>`
      };
    }
    return {
      mode: "app",
      appTitle: `PDF Viewer — ${filename}`,
      body: `
        <div class="ol-sim-pdf">
          <div class="ol-pdf-sheet">
            <div class="ol-pdf-head"><strong>ShopLane Official Receipt</strong><span>Order SL-582714</span></div>
            <table class="ol-sim-table">
              <tbody>
                <tr><td>A5 notebook set × 1</td><td>RM 18.00</td></tr>
                <tr><td>Standard campus delivery</td><td>RM 4.50</td></tr>
                <tr><td><strong>Total Paid (Card ending 4821)</strong></td><td><strong>RM 22.50</strong></td></tr>
              </tbody>
            </table>
            <p class="ol-sim-muted">Read-only PDF document · No scripts, macros, or external sign-in prompts.</p>
          </div>
        </div>`
    };
  }

  let dialog = null;
  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.id = "ol-site-popup";
    dialog.className = "ol-site-popup";
    dialog.setAttribute("aria-label", "Safe simulated website preview");
    dialog.addEventListener("click", e => {
      if (e.target === dialog) dialog.close();
      if (e.target.closest("[data-sim-close]")) dialog.close();
      if (e.target.closest("[data-sim-cta]")) {
        const toast = dialog.querySelector("#ol-pop-toast");
        if (toast) {
          toast.textContent = "Sandbox simulation — nothing was submitted, installed, or sent. Close this popup to classify the email in Outlook.";
          toast.hidden = false;
        }
      }
      if (e.target.closest("#ol-pop-lock")) {
        const cert = dialog.querySelector("#ol-pop-cert");
        if (cert) cert.hidden = !cert.hidden;
      }
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function openLink(email, block, opts = {}) {
    const dlg = ensureDialog();
    const spec = buildLinkPage(email, block, opts.playerName);
    const clockText = opts.clockText || "";
    const urgent = !!opts.urgent;
    dlg.innerHTML = `
      <div class="ol-pop-shell">
        <div class="ol-pop-tabs">
          <div class="ol-pop-tab"><span class="ol-pop-dot" style="background:${spec.brandBg}"></span><span>${esc(spec.tab)}</span></div>
          <div class="ol-pop-meta">
            <span class="ol-pop-sandbox">SAFE SANDBOX</span>
            <span class="ol-pop-clock ${urgent ? "urgent" : ""}" id="ol-pop-clock">${esc(clockText)}</span>
            <button type="button" class="ol-pop-close" data-sim-close aria-label="Close simulated browser">Close (Esc) ✕</button>
          </div>
        </div>
        <div class="ol-pop-omnibox">
          <span class="ol-pop-nav" aria-hidden="true">← &nbsp; → &nbsp; ↻</span>
          <div class="ol-pop-urlbar">
            <button type="button" id="ol-pop-lock" class="ol-pop-lock" title="Check HTTPS & domain">🔒</button>
            <span class="ol-pop-urltext">${formatOmnibox(block.url)}</span>
          </div>
        </div>
        <div id="ol-pop-cert" class="ol-pop-cert" hidden>
          <strong>HTTPS encrypted connection</strong> — Check the <strong>bold root domain</strong> in the address bar above. Both real sites and phishing sites use HTTPS padlocks.
        </div>
        <div class="ol-pop-body">${spec.body}</div>
        <div id="ol-pop-toast" class="ol-pop-toast" role="status" hidden></div>
      </div>`;
    if (!dlg.open) dlg.showModal();
  }

  function openAttachment(email, block, opts = {}) {
    const dlg = ensureDialog();
    const spec = buildAttachmentView(email, block);
    const clockText = opts.clockText || "";
    const urgent = !!opts.urgent;
    const omnibox = spec.mode === "browser"
      ? `<div class="ol-pop-omnibox"><span class="ol-pop-nav" aria-hidden="true">← &nbsp; → &nbsp; ↻</span><div class="ol-pop-urlbar"><span class="ol-pop-lock">⚠</span><span class="ol-pop-urltext">${formatOmnibox(spec.url)}</span></div></div>`
      : "";
    dlg.innerHTML = `
      <div class="ol-pop-shell">
        <div class="ol-pop-tabs">
          <div class="ol-pop-tab"><span class="ol-pop-dot" style="background:#484644"></span><span>${esc(spec.tab || spec.appTitle)}</span></div>
          <div class="ol-pop-meta">
            <span class="ol-pop-sandbox">SAFE SANDBOX</span>
            <span class="ol-pop-clock ${urgent ? "urgent" : ""}" id="ol-pop-clock">${esc(clockText)}</span>
            <button type="button" class="ol-pop-close" data-sim-close aria-label="Close file preview">Close (Esc) ✕</button>
          </div>
        </div>
        ${omnibox}
        <div class="ol-pop-body">${spec.body}</div>
        <div id="ol-pop-toast" class="ol-pop-toast" role="status" hidden></div>
      </div>`;
    if (!dlg.open) dlg.showModal();
  }

  function syncClock(text, urgent) {
    if (!dialog || !dialog.open) return;
    const el = dialog.querySelector("#ol-pop-clock");
    if (el) { el.textContent = text; el.classList.toggle("urgent", !!urgent); }
  }
  function close() { if (dialog && dialog.open) dialog.close(); }
  function isOpen() { return Boolean(dialog && dialog.open); }

  root.SitePopups = { openLink, openAttachment, syncClock, close, isOpen };
})(typeof window !== "undefined" ? window : globalThis);
