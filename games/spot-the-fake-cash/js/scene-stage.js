/* 3D forensic inspection stage:
 * - Professional bank/forensic inspection desk with procedural millimeter calibration mat
 * - Multi-part machined 365nm UV inspection torch with soft gradient volumetric beam
 * - Dual-sided banknote UV shader, smooth flip & zoom, zero per-frame allocations */
(function (root) {
  'use strict';

  const MIN_ZOOM = 1.0;
  const MAX_ZOOM = 2.6;
  const ZOOM_STEP = 0.2;
  const DESKTOP_TORCH_POS = [0.22, 1.15, -0.17];
  const NOTE_BASE_POS = [0, 1.13, -0.48];

  function createCuttingMatTexture(maxAnisotropy) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep matte forensic slate-green / charcoal base
    const bg = ctx.createRadialGradient(1024, 512, 120, 1024, 512, 1150);
    bg.addColorStop(0, '#1d2428');
    bg.addColorStop(1, '#13171a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 2048, 1024);

    // Subtle fine millimeter sub-grid
    ctx.strokeStyle = 'rgba(180, 205, 215, 0.055)';
    ctx.lineWidth = 1;
    const minor = 32;
    for (let x = 64; x <= 1984; x += minor) {
      ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, 960); ctx.stroke();
    }
    for (let y = 64; y <= 960; y += minor) {
      ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(1984, y); ctx.stroke();
    }

    // Major centimeter grid
    ctx.strokeStyle = 'rgba(210, 226, 232, 0.12)';
    ctx.lineWidth = 1.5;
    const major = 128;
    for (let x = 64; x <= 1984; x += major) {
      ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, 960); ctx.stroke();
    }
    for (let y = 64; y <= 960; y += major) {
      ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(1984, y); ctx.stroke();
    }

    // Outer technical border frame
    ctx.strokeStyle = 'rgba(237, 207, 97, 0.34)';
    ctx.lineWidth = 3;
    ctx.strokeRect(54, 54, 1940, 916);

    // Center banknote alignment reticle (RM50 proportion guide)
    const cx = 1024, cy = 512, gw = 840, gh = 420;
    ctx.strokeStyle = 'rgba(237, 207, 97, 0.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.strokeRect(cx - gw / 2, cy - gh / 2, gw, gh);
    ctx.setLineDash([]);

    // Crisp corner L-brackets around inspection zone
    ctx.strokeStyle = 'rgba(237, 207, 97, 0.72)';
    ctx.lineWidth = 4;
    const bl = 34;
    const corners = [
      [cx - gw / 2, cy - gh / 2, 1, 1],
      [cx + gw / 2, cy - gh / 2, -1, 1],
      [cx - gw / 2, cy + gh / 2, 1, -1],
      [cx + gw / 2, cy + gh / 2, -1, -1]
    ];
    for (const [x, y, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(x + dx * bl, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * bl);
      ctx.stroke();
    }

    // Top & bottom millimeter scale ticks
    ctx.strokeStyle = 'rgba(220, 232, 238, 0.32)';
    ctx.fillStyle = 'rgba(220, 232, 238, 0.48)';
    ctx.font = '600 18px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 15; i++) {
      const x = 64 + i * 128;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, 54); ctx.lineTo(x, 76); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, 970); ctx.lineTo(x, 948); ctx.stroke();
      if (i > 0 && i < 15) ctx.fillText(String(i * 10), x, 940);
    }

    // Subtle forensic lab stencil labels
    ctx.fillStyle = 'rgba(243, 239, 229, 0.34)';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCAMURAI // CURRENCY AUTHENTICATION BENCH', 86, 102);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(237, 207, 97, 0.45)';
    ctx.fillText('RM50 SPEC · 149 × 69 mm · 365nm UV', 1962, 102);
    ctx.fillStyle = 'rgba(243, 239, 229, 0.25)';
    ctx.textAlign = 'left';
    ctx.fillText('UNIT: mm · CALIBRATED SURFACE', 86, 932);

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = maxAnisotropy;
    return tex;
  }

  function createKnurlTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#252930';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#15181d';
    ctx.lineWidth = 3;
    for (let i = -256; i < 512; i += 14) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 256, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 256); ctx.lineTo(i + 256, 0); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function createBeamGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    // Cone geometry UV: y=1 at tip (lens), y=0 at wide base
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, 'rgba(185, 118, 255, 0.34)');
    grad.addColorStop(0.32, 'rgba(157, 78, 221, 0.16)');
    grad.addColorStop(0.75, 'rgba(130, 56, 205, 0.04)');
    grad.addColorStop(1.0, 'rgba(110, 40, 190, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createDeskWoodTexture(maxAnisotropy) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1d1c1b';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 2) {
      const shade = 26 + Math.sin(y * 0.09) * 3 + Math.sin(y * 0.37) * 2;
      ctx.fillStyle = `rgb(${shade + 2}, ${shade + 1}, ${shade})`;
      ctx.fillRect(0, y, 512, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = maxAnisotropy;
    return tex;
  }

  function createStage(container) {
    if (!window.THREE) throw new Error('The local Three.js library could not load.');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111215);
    scene.fog = new THREE.FogExp2(0x111215, 0.16);

    const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.08, 60);
    camera.position.set(0, 1.38, 0.70);
    camera.lookAt(0, 1.12, -0.48);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = -1;
    renderer.domElement.setAttribute('aria-label', '3D banknote inspection area');

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Studio forensic bench lighting
    scene.add(new THREE.HemisphereLight(0xf6f3ec, 0x1d2026, 0.78));

    const overheadLamp = new THREE.SpotLight(0xfff8eb, 1.55, 6.0, Math.PI / 3.4, 0.65, 1.2);
    overheadLamp.position.set(0, 2.55, -0.36);
    overheadLamp.target.position.set(0, 0.89, -0.48);
    scene.add(overheadLamp);
    scene.add(overheadLamp.target);

    const fillLight = new THREE.DirectionalLight(0xcbdcff, 0.36);
    fillLight.position.set(-2.0, 2.2, 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffead2, 0.32);
    rimLight.position.set(2.2, 2.0, -1.6);
    scene.add(rimLight);

    // ===== Professional Forensic Inspection Workbench =====
    const benchGroup = new THREE.Group();
    benchGroup.name = 'Forensic Workbench';

    // Main dark anodized/slate tabletop with subtle grain
    const deskTex = createDeskWoodTexture(maxAniso);
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.96, 0.055, 1.08),
      new THREE.MeshStandardMaterial({ map: deskTex, roughness: 0.56, metalness: 0.16 })
    );
    deskTop.position.set(0, 0.858, -0.52);
    benchGroup.add(deskTop);

    // Brushed aluminum front & side edge bumper trim
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x5c626b, metalness: 0.78, roughness: 0.32 });
    const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(1.965, 0.016, 0.014), trimMat);
    frontTrim.position.set(0, 0.878, 0.022);
    benchGroup.add(frontTrim);

    // Red Scamurai bench accent strip recessed under the front lip
    const accentTrim = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.006, 0.008),
      new THREE.MeshBasicMaterial({ color: 0xd82b24 })
    );
    accentTrim.position.set(0, 0.864, 0.021);
    benchGroup.add(accentTrim);

    // Under-table steel apron & legs (visible in VR and wide desktop views)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e2024, metalness: 0.65, roughness: 0.42 });
    const apron = new THREE.Mesh(new THREE.BoxGeometry(1.80, 0.07, 0.92), legMat);
    apron.position.set(0, 0.80, -0.52);
    benchGroup.add(apron);

    const legGeo = new THREE.BoxGeometry(0.055, 0.80, 0.055);
    [[-0.86, -0.09], [0.86, -0.09], [-0.86, -0.95], [0.86, -0.95]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.40, lz);
      benchGroup.add(leg);
    });

    // Calibrated forensic inspection mat
    const matTex = createCuttingMatTexture(maxAniso);
    const matPad = new THREE.Mesh(
      new THREE.BoxGeometry(1.26, 0.008, 0.63),
      new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.84, metalness: 0.05 })
    );
    matPad.position.set(0, 0.89, -0.48);
    benchGroup.add(matPad);

    // Subtle raised aluminum desk-lamp gantry behind the mat (frames the lab space without blocking view)
    const backRail = new THREE.Mesh(
      new THREE.BoxGeometry(1.48, 0.022, 0.026),
      new THREE.MeshStandardMaterial({ color: 0x353941, metalness: 0.8, roughness: 0.3 })
    );
    backRail.position.set(0, 0.896, -0.96);
    benchGroup.add(backRail);

    // Desk calibration ruler bar resting near the back edge of the mat
    const metalBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.012, 0.028),
      new THREE.MeshStandardMaterial({ color: 0x454a54, metalness: 0.82, roughness: 0.28 })
    );
    metalBar.position.set(-0.42, 0.898, -0.84);
    benchGroup.add(metalBar);

    const statusLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.005, 0.008),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    statusLed.position.set(-0.60, 0.905, -0.84);
    benchGroup.add(statusLed);

    scene.add(benchGroup);

    // Subtle dark studio floor plane for VR grounding
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.92, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // ===== Professional Machined 365nm UV Inspection Torch =====
    const uvTorchMesh = new THREE.Group();
    uvTorchMesh.name = 'UV Inspection Torch';

    const gunmetalMat = new THREE.MeshStandardMaterial({ color: 0x262a32, metalness: 0.86, roughness: 0.28 });
    const brushedSteelMat = new THREE.MeshStandardMaterial({ color: 0x7c838f, metalness: 0.9, roughness: 0.24 });
    const darkRubberMat = new THREE.MeshStandardMaterial({ color: 0x16181c, metalness: 0.12, roughness: 0.88 });
    const knurlMat = new THREE.MeshStandardMaterial({ map: createKnurlTexture(), metalness: 0.62, roughness: 0.44 });

    // Main handle barrel with knurled grip sleeve
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.0195, 0.0205, 0.145, 28), gunmetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.012;
    uvTorchMesh.add(barrel);

    const knurlGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.0206, 0.0206, 0.072, 28), knurlMat);
    knurlGrip.rotation.x = Math.PI / 2;
    knurlGrip.position.z = 0.022;
    uvTorchMesh.add(knurlGrip);

    // Tail cap + tactile rubber power switch
    const tailCap = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.0195, 0.022, 24), brushedSteelMat);
    tailCap.rotation.x = Math.PI / 2;
    tailCap.position.z = 0.092;
    uvTorchMesh.add(tailCap);

    const tailSwitch = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.008, 20), darkRubberMat);
    tailSwitch.rotation.x = Math.PI / 2;
    tailSwitch.position.z = 0.105;
    uvTorchMesh.add(tailSwitch);

    // Side status indicator button + UV active ring
    const powerRingMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const powerRing = new THREE.Mesh(new THREE.TorusGeometry(0.0055, 0.0014, 10, 20), powerRingMat);
    powerRing.rotation.x = Math.PI / 2;
    powerRing.position.set(0, 0.0205, -0.042);
    uvTorchMesh.add(powerRing);

    const sideButton = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0048, 0.004, 16), darkRubberMat);
    sideButton.position.set(0, 0.021, -0.042);
    uvTorchMesh.add(sideButton);

    // Machined cooling fins collar
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.0245, 0.0245, 0.0045, 28), gunmetalMat);
      fin.rotation.x = Math.PI / 2;
      fin.position.z = -0.056 - i * 0.009;
      uvTorchMesh.add(fin);
    }

    // Flared optical head housing + stainless anti-roll bezel
    const headHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.0235, 0.038, 28), gunmetalMat);
    headHousing.rotation.x = Math.PI / 2;
    headHousing.position.z = -0.094;
    uvTorchMesh.add(headHousing);

    const bezelRing = new THREE.Mesh(new THREE.CylinderGeometry(0.0332, 0.0322, 0.011, 12), brushedSteelMat);
    bezelRing.rotation.x = Math.PI / 2;
    bezelRing.position.z = -0.114;
    uvTorchMesh.add(bezelRing);

    // Recessed UV optical reflector + glowing 365nm emitter lens
    const accentRingMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const accentRing = new THREE.Mesh(new THREE.TorusGeometry(0.0285, 0.0022, 12, 32), accentRingMat);
    accentRing.position.z = -0.118;
    uvTorchMesh.add(accentRing);

    const lensMat = new THREE.MeshBasicMaterial({ color: 0xd8b4fe });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.026, 28), lensMat);
    lens.position.z = -0.117;
    lens.rotation.y = Math.PI;
    uvTorchMesh.add(lens);

    const emitterCoreMat = new THREE.MeshBasicMaterial({ color: 0xf5e8ff });
    const emitterCore = new THREE.Mesh(new THREE.CircleGeometry(0.009, 18), emitterCoreMat);
    emitterCore.position.z = -0.1185;
    emitterCore.rotation.y = Math.PI;
    uvTorchMesh.add(emitterCore);

    // UV spotlight & soft gradient volumetric beam
    const spotLight = new THREE.SpotLight(0xa855f7, 4.6, 2.6, Math.PI / 5.8, 0.45, 1.1);
    spotLight.position.set(0, 0, -0.118);
    spotLight.target.position.set(0, 0, -1);
    uvTorchMesh.add(spotLight);
    uvTorchMesh.add(spotLight.target);

    const beamTex = createBeamGradientTexture();
    const torchBeamCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.64, 32, 1, true),
      new THREE.MeshBasicMaterial({
        map: beamTex,
        color: 0xb77cff,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    torchBeamCone.rotation.x = Math.PI / 2;
    torchBeamCone.position.z = -0.435;
    uvTorchMesh.add(torchBeamCone);

    uvTorchMesh.position.set(...DESKTOP_TORCH_POS);
    // Slight natural inward aim on desktop so UV immediately kisses the banknote edge
    uvTorchMesh.rotation.set(0, 0.14, 0);
    scene.add(uvTorchMesh);

    const textureLoader = new THREE.TextureLoader();
    const noteTextures = new Map();
    const fallbackTextures = new Map();

    let banknoteMesh = null;
    let banknoteMaterial = null;
    let isUVOn = true;
    let banknoteZoom = 1;
    let flipAnim = null;
    let tiltAnim = null;
    let currentTiltDeg = 0;

    // Reusable scratch math objects (zero GC churn in 90Hz VR)
    const _worldPos = new THREE.Vector3();
    const _worldDir = new THREE.Vector3();
    const _worldQuat = new THREE.Quaternion();
    const _noteNormal = new THREE.Vector3();
    const _camWorldPos = new THREE.Vector3();
    const _toCam = new THREE.Vector3();

    function makeFallbackTexture(label, uvMode) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const wash = ctx.createLinearGradient(0, 0, 1024, 512);
      wash.addColorStop(0, uvMode ? '#242353' : '#94c6c5');
      wash.addColorStop(1, uvMode ? '#101529' : '#c5dfd5');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, 1024, 512);
      ctx.strokeStyle = uvMode ? '#9e86ed' : '#337379';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 984, 472);
      ctx.fillStyle = uvMode ? '#f6b7fc' : '#164a56';
      ctx.font = 'bold 104px sans-serif';
      ctx.fillText('50', 68, 180);
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(label, 72, 280);
      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = maxAniso;
      return tex;
    }

    async function preloadTextures(sets) {
      const names = new Set(sets.flatMap(n => [n.frontDay, n.frontUV, n.backDay, n.backUV]).filter(Boolean));
      await Promise.all([...names].map(async name => {
        let url;
        try {
          const response = await fetch('./assets/notes/' + encodeURIComponent(name));
          if (!response.ok) return;
          url = URL.createObjectURL(await response.blob());
          const texture = await textureLoader.loadAsync(url);
          texture.encoding = THREE.sRGBEncoding;
          texture.anisotropy = maxAniso;
          noteTextures.set(name, texture);
        } catch {
          // Placeholder used when an image is unavailable.
        } finally {
          if (url) URL.revokeObjectURL(url);
        }
      }));
      return { loaded: noteTextures.size, total: names.size };
    }

    function getNoteTextures(set) {
      return {
        frontDay: getTexture(set.frontDay, set.denomination + ' front', false),
        frontUV: getTexture(set.frontUV, set.denomination + ' front / UV', true),
        backDay: getTexture(set.backDay, set.denomination + ' back', false),
        backUV: getTexture(set.backUV, set.denomination + ' back / UV', true)
      };
    }

    function getTexture(name, label, uvMode) {
      if (noteTextures.has(name)) return noteTextures.get(name);
      if (!fallbackTextures.has(label)) fallbackTextures.set(label, makeFallbackTexture(label, uvMode));
      return fallbackTextures.get(label);
    }

    function applyUVState() {
      spotLight.visible = isUVOn;
      torchBeamCone.visible = isUVOn;
      accentRingMat.color.setHex(isUVOn ? 0xa855f7 : 0x3b3f47);
      powerRingMat.color.setHex(isUVOn ? 0xc084fc : 0x4b5563);
      lensMat.color.setHex(isUVOn ? 0xd8b4fe : 0x1c1e24);
      emitterCoreMat.color.setHex(isUVOn ? 0xf5e8ff : 0x262930);
      if (banknoteMaterial) banknoteMaterial.uniforms.uIsUVOn.value = isUVOn ? 1.0 : 0.0;
    }

    function setUV(on) {
      isUVOn = !!on;
      applyUVState();
      return isUVOn;
    }

    function toggleUV() {
      return setUV(!isUVOn);
    }

    // Per-denomination hologram/colour-shifting thread UV boxes matching the real scans!
    const HOLO_LAYOUT = {
      RM50:  { frontRect: [0.870, 0.945, 0.03, 0.96], patch: [0.228, 0.795], backBand: [0.575, 0.610] },
      RM100: { frontRect: [0.285, 0.324, 0.08, 0.92], patch: [0.165, 0.840], backBand: [0.195, 0.365] },
      RM20:  { frontRect: [0.270, 0.308, 0.12, 0.90], patch: [0.185, 0.845], backBand: [0.690, 0.745] },
      RM10:  { frontRect: [0.334, 0.372, 0.10, 0.90], patch: [0.195, 0.840], backBand: [0.675, 0.715] },
      RM5:   { frontRect: [0.135, 0.215, 0.35, 0.68], patch: [0.100, 0.845], backBand: [0.785, 0.925] }
    };

    function buildBanknote(set) {
      const { frontDay: frontDayTex, frontUV: frontUVTex, backDay: backDayTex, backUV: backUVTex } = getNoteTextures(set);
      const holoValid = set.hologramValid !== false ? 1.0 : 0.0;
      const clearWindow = set.clearWindow === true ? 1.0 : 0.0;
      const layout = HOLO_LAYOUT[set.denomination] || HOLO_LAYOUT.RM50;

      if (!banknoteMaterial) {
        banknoteMaterial = new THREE.ShaderMaterial({
          uniforms: {
            tFrontDay: { value: frontDayTex },
            tFrontUV: { value: frontUVTex },
            tBackDay: { value: backDayTex },
            tBackUV: { value: backUVTex },
            uLightPos: { value: new THREE.Vector3(0, 1.2, 0) },
            uLightDir: { value: new THREE.Vector3(0, 0, -1) },
            uIsUVOn: { value: isUVOn ? 1.0 : 0.0 },
            uSpotAngle: { value: Math.cos(Math.PI / 5.5) },
            uHoloValid: { value: holoValid },
            uClearWindow: { value: clearWindow },
            uHoloRect: { value: new THREE.Vector4(...layout.frontRect) },
            uPatchPos: { value: new THREE.Vector2(...layout.patch) },
            uBackBand: { value: new THREE.Vector2(...layout.backBand) }
          },
          transparent: true,
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            varying vec3 vViewDir;
            void main() {
              vUv = uv;
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              vWorldNormal = normalize(mat3(modelMatrix) * normal);
              vViewDir = normalize(cameraPosition - worldPos.xyz);
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            uniform sampler2D tFrontDay;
            uniform sampler2D tFrontUV;
            uniform sampler2D tBackDay;
            uniform sampler2D tBackUV;
            uniform vec3 uLightPos;
            uniform vec3 uLightDir;
            uniform float uIsUVOn;
            uniform float uSpotAngle;
            uniform float uHoloValid;
            uniform float uClearWindow;
            uniform vec4 uHoloRect;
            uniform vec2 uPatchPos;
            uniform vec2 uBackBand;
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            varying vec3 vViewDir;

            vec3 holoSpectrum(float t) {
              vec3 a = vec3(0.56, 0.56, 0.56);
              vec3 b = vec3(0.44, 0.44, 0.44);
              vec3 c = vec3(1.0, 1.0, 1.0);
              vec3 d = vec3(0.08, 0.38, 0.68);
              return a + b * cos(6.28318 * (c * t + d));
            }

            void main() {
              bool isFront = gl_FrontFacing;
              vec2 uvCoord = isFront ? vUv : vec2(1.0 - vUv.x, vUv.y);
              vec4 dayTex = isFront ? texture2D(tFrontDay, uvCoord) : texture2D(tBackDay, uvCoord);
              vec4 uvTex  = isFront ? texture2D(tFrontUV, uvCoord)  : texture2D(tBackUV, uvCoord);

              vec3 lightToPos = normalize(vWorldPosition - uLightPos);
              float cosAngle = dot(lightToPos, normalize(uLightDir));
              float spotFactor = 0.0;
              if (cosAngle > uSpotAngle && uIsUVOn > 0.5) {
                spotFactor = smoothstep(uSpotAngle, min(1.0, uSpotAngle + 0.11), cosAngle);
              }

              vec3 color = mix(dayTex.rgb, uvTex.rgb, spotFactor);

              // === Angle-reactive Tilt Hologram & Colour-Shifting Thread ===
              vec3 N = isFront ? normalize(vWorldNormal) : -normalize(vWorldNormal);
              vec3 V = normalize(vViewDir);
              float ndotv = clamp(dot(N, V), 0.0, 1.0);
              float tiltFactor = smoothstep(0.955, 0.52, ndotv);

              float holoMask = 0.0;
              if (isFront) {
                float stripX = smoothstep(uHoloRect.x - 0.008, uHoloRect.x + 0.004, uvCoord.x)
                             * (1.0 - smoothstep(uHoloRect.y - 0.004, uHoloRect.y + 0.008, uvCoord.x));
                float stripY = smoothstep(uHoloRect.z - 0.015, uHoloRect.z + 0.01, uvCoord.y)
                             * (1.0 - smoothstep(uHoloRect.w - 0.01, uHoloRect.w + 0.015, uvCoord.y));
                float strip = stripX * stripY;

                vec2 p = (uvCoord - uPatchPos) * vec2(1.0, 0.55);
                float patchMask = 1.0 - smoothstep(0.036, 0.050, abs(p.x) + abs(p.y));
                holoMask = clamp(strip + patchMask * 0.85, 0.0, 1.0);
              } else {
                float bandX = smoothstep(uBackBand.x - 0.008, uBackBand.x + 0.006, uvCoord.x)
                            * (1.0 - smoothstep(uBackBand.y - 0.006, uBackBand.y + 0.008, uvCoord.x));
                holoMask = bandX * 0.72;
              }

              if (holoMask > 0.01 && uHoloValid > 0.5 && spotFactor < 0.75) {
                float anglePhase = (V.x * 2.4 + V.y * 1.9) + uvCoord.y * 1.45 + uvCoord.x * 0.8;
                vec3 rainbow = holoSpectrum(anglePhase);
                float microLines = 0.78 + 0.22 * sin((uvCoord.y * 90.0 + uvCoord.x * 35.0) + anglePhase * 6.0);
                float sweepFlash = pow(0.5 + 0.5 * sin(uvCoord.y * 5.2 + (V.x - V.y) * 5.5), 4.0);
                vec3 foilColor = mix(rainbow, vec3(1.0, 0.96, 0.82), sweepFlash * 0.55) * microLines;
                float strength = holoMask * tiltFactor * (1.0 - spotFactor * 0.65);
                color = mix(color, color * 0.35 + foilColor * 0.95, clamp(strength * 0.92, 0.0, 0.92));
              }

              // === Genuine RM5 Polymer Clear Window translucency (real scan hornbill oval!) ===
              float alpha = dayTex.a;
              if (uClearWindow > 0.5) {
                vec2 winCenter = isFront ? vec2(0.140, 0.495) : vec2(0.860, 0.495);
                vec2 d = (uvCoord - winCenter) / vec2(0.072, 0.215);
                float winMask = 1.0 - smoothstep(0.85, 1.05, length(d));
                if (winMask > 0.5) alpha = 0.44;
              }

              // Note textures are already sRGB; ShaderMaterial skips auto-linearization in r128,
              // so output directly without #include <encodings_fragment> to avoid double-gamma washout.
              gl_FragColor = vec4(color, alpha);
            }
          `,
          side: THREE.DoubleSide
        });
      } else {
        banknoteMaterial.uniforms.tFrontDay.value = frontDayTex;
        banknoteMaterial.uniforms.tFrontUV.value = frontUVTex;
        banknoteMaterial.uniforms.tBackDay.value = backDayTex;
        banknoteMaterial.uniforms.tBackUV.value = backUVTex;
        banknoteMaterial.uniforms.uIsUVOn.value = isUVOn ? 1.0 : 0.0;
        banknoteMaterial.uniforms.uHoloValid.value = holoValid;
        banknoteMaterial.uniforms.uClearWindow.value = clearWindow;
        banknoteMaterial.uniforms.uHoloRect.value.set(...layout.frontRect);
        banknoteMaterial.uniforms.uPatchPos.value.set(...layout.patch);
        banknoteMaterial.uniforms.uBackBand.value.set(...layout.backBand);
      }

      if (!banknoteMesh) {
        banknoteMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.225), banknoteMaterial);
        banknoteMesh.name = 'Banknote';
        scene.add(banknoteMesh);
      }

      banknoteMesh.position.set(...NOTE_BASE_POS);
      banknoteMesh.rotation.set(0, 0, 0);
      banknoteZoom = 1;
      banknoteMesh.scale.setScalar(banknoteZoom);
      flipAnim = null;
      tiltAnim = null;
    }

    function setZoom(nextZoom) {
      if (!banknoteMesh) return banknoteZoom;
      banknoteZoom = THREE.MathUtils.clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      banknoteMesh.scale.setScalar(banknoteZoom);
      return banknoteZoom;
    }

    function changeZoom(delta) {
      return setZoom(banknoteZoom + delta);
    }

    function rotateNote(dx, dy) {
      if (!banknoteMesh || flipAnim) return;
      tiltAnim = null;
      banknoteMesh.rotation.y += dx;
      banknoteMesh.rotation.x = THREE.MathUtils.clamp(banknoteMesh.rotation.x + dy, -1.25, 1.25);
    }

    function flipNote() {
      if (!banknoteMesh || flipAnim) return false;
      tiltAnim = null;
      const from = banknoteMesh.quaternion.clone();
      const halfTurn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
      flipAnim = { start: performance.now(), from, to: from.clone().multiply(halfTurn) };
      return true;
    }

    function tiltTest() {
      if (!banknoteMesh || flipAnim) return false;
      tiltAnim = {
        start: performance.now(),
        baseY: banknoteMesh.rotation.y,
        baseX: banknoteMesh.rotation.x,
        duration: 1500
      };
      return true;
    }

    function resetView() {
      if (banknoteMesh) {
        banknoteMesh.rotation.set(0, 0, 0);
        setZoom(1);
        flipAnim = null;
        tiltAnim = null;
      }
      if (!renderer.xr.isPresenting) {
        uvTorchMesh.position.set(...DESKTOP_TORCH_POS);
        uvTorchMesh.rotation.set(0, 0.14, 0);
      }
    }

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      const narrower = Math.max(1, 0.86 / camera.aspect);
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(54) / 2) * narrower));
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function updateFrame() {
      if (flipAnim && banknoteMesh) {
        const progress = Math.min(1, (performance.now() - flipAnim.start) / 360);
        const eased = progress * progress * (3 - 2 * progress);
        banknoteMesh.quaternion.slerpQuaternions(flipAnim.from, flipAnim.to, eased);
        if (progress >= 1) flipAnim = null;
      } else if (tiltAnim && banknoteMesh) {
        const elapsed = performance.now() - tiltAnim.start;
        const p = Math.min(1, elapsed / tiltAnim.duration);
        const swing = Math.sin(p * Math.PI * 2);
        const env = Math.sin(p * Math.PI);
        banknoteMesh.rotation.y = tiltAnim.baseY + swing * 0.68 * env;
        banknoteMesh.rotation.x = THREE.MathUtils.clamp(tiltAnim.baseX + Math.sin(p * Math.PI * 3) * 0.24 * env, -1.2, 1.2);
        if (p >= 1) {
          banknoteMesh.rotation.y = tiltAnim.baseY;
          banknoteMesh.rotation.x = tiltAnim.baseX;
          tiltAnim = null;
        }
      }

      if (banknoteMesh) {
        banknoteMesh.getWorldQuaternion(_worldQuat);
        _noteNormal.set(0, 0, 1).applyQuaternion(_worldQuat).normalize();
        const activeCam = renderer.xr.isPresenting ? renderer.xr.getCamera(camera) : camera;
        activeCam.getWorldPosition(_camWorldPos);
        banknoteMesh.getWorldPosition(_worldPos);
        _toCam.subVectors(_camWorldPos, _worldPos).normalize();
        const absDot = Math.min(1, Math.abs(_noteNormal.dot(_toCam)));
        currentTiltDeg = Math.round(THREE.MathUtils.radToDeg(Math.acos(absDot)));
      }

      if (banknoteMaterial && uvTorchMesh) {
        spotLight.getWorldPosition(_worldPos);
        banknoteMaterial.uniforms.uLightPos.value.copy(_worldPos);

        uvTorchMesh.getWorldQuaternion(_worldQuat);
        _worldDir.set(0, 0, -1).applyQuaternion(_worldQuat).normalize();
        banknoteMaterial.uniforms.uLightDir.value.copy(_worldDir);
      }
    }

    applyUVState();
    resize();

    return {
      scene,
      camera,
      renderer,
      uvTorchMesh,
      torchBeamCone,
      DESKTOP_TORCH_POS,
      MIN_ZOOM,
      MAX_ZOOM,
      ZOOM_STEP,
      get banknoteMesh() { return banknoteMesh; },
      get isUVOn() { return isUVOn; },
      get zoom() { return banknoteZoom; },
      get tiltDeg() { return currentTiltDeg; },
      preloadTextures,
      buildBanknote,
      setUV,
      toggleUV,
      setZoom,
      changeZoom,
      rotateNote,
      flipNote,
      tiltTest,
      resetView,
      resize,
      updateFrame
    };
  }

  root.FakeCashStage = { createStage };
})(globalThis);
