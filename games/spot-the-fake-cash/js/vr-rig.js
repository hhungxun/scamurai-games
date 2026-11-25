/* WebXR VR module for Station 1 — Optimized for Meta Quest 3:
 * - Quest 3 pancake optics: high-DPI 2048x960 HUD & 1400x1040 Note Guide, 1.25x framebuffer scale, low foveation
 * - Calibrated right-hand UV torch grip pose (VR Test 9) + Left-Grip 6DoF hand-held banknote inspection
 * - Full Touch Plus controller bindings: Sticks (rotate/zoom), Stick click (reset), Triggers, Grips, A/B/X/Y + TruTouch haptics
 * - Ergonomic desk-lip angled control console (never occludes banknote or UV sweep) + Seated/Standing/Tall height toggle
 * - Smart laser rays that dim over the banknote and light up with a glowing ring reticle on UI hover
 * - Bilingual EN/中文 switcher & toggleable side Ringgit Security Checklist right inside VR */
(function (root) {
  'use strict';

  // Calibrated grip pose from VR Test 9
  const TORCH_GRIP_POS = [0, -0.075, -0.10];
  const TORCH_GRIP_ROT = [-0.8, -0.10, -0.20];

  // Comfortable left-hand banknote inspection offset (Quest 3 Touch Plus)
  const NOTE_GRIP_POS = [0.02, 0.04, -0.13];
  const NOTE_GRIP_ROT = [-0.38, 0.14, 0.0];

  const HEIGHT_PRESETS = [
    { key: 'std',  y: 0.00,  en: 'STD',  zh: '标准' },
    { key: 'seat', y: -0.14, en: 'SEAT', zh: '坐姿' },
    { key: 'tall', y: 0.10,  en: 'TALL', zh: '高姿' }
  ];

  const DENOM_COLORS = {
    RM5:   { bg: '#16422b', border: '#4ade80', text: '#86efac' },
    RM10:  { bg: '#4e191a', border: '#f87171', text: '#fca5a5' },
    RM20:  { bg: '#4f2c10', border: '#fbbf24', text: '#fde68a' },
    RM50:  { bg: '#123d46', border: '#38bdf8', text: '#bae6fd' },
    RM100: { bg: '#321f4c', border: '#c084fc', text: '#e9d5ff' }
  };

  function roundRectPath(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function createVR(stage, callbacks) {
    const { scene, renderer, uvTorchMesh, DESKTOP_TORCH_POS, NOTE_BASE_POS } = stage;
    const isZh = () => !!(root.ScamuraiI18n?.isZh() || root.__FAKECASH_IS_ZH__?.());
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 4);

    const tempMatrix = new THREE.Matrix4();
    const rayOrigin = new THREE.Vector3();
    const rayDir = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    raycaster.far = 3.5;

    let xrControllers = [];
    let torchIsHeld = false;
    let noteIsHeld = false;
    let previewMode = false;
    let guideOpen = false;
    let heightIndex = 0;
    let panelMode = 'prestart';
    let lastHudSignature = '';
    let lastHudData = null;
    let lastLiveTick = 0;

    let activeRightController = null;
    let activeRightGrip = null;
    let activeLeftController = null;
    let activeLeftGrip = null;
    let activeLeftInputSource = null;
    let activeRightInputSource = null;

    // Edge-trigger button memory for Quest 3 Touch Plus face/stick buttons
    const prevButtons = { left: [], right: [] };

    // Root group for all spatial VR UI (supports seated/standing/tall height offset)
    const vrUIRoot = new THREE.Group();
    vrUIRoot.name = 'Quest3 VR UI Root';
    vrUIRoot.visible = false;
    scene.add(vrUIRoot);

    // ===== 1. High-DPI Upper Forensic HUD (2048x960) =====
    const vrHUDCanvas = document.createElement('canvas');
    vrHUDCanvas.width = 2048;
    vrHUDCanvas.height = 960;
    const vrHUDContext = vrHUDCanvas.getContext('2d');
    const vrHUDTexture = new THREE.CanvasTexture(vrHUDCanvas);
    vrHUDTexture.encoding = THREE.sRGBEncoding;
    vrHUDTexture.anisotropy = maxAniso;
    vrHUDTexture.minFilter = THREE.LinearFilter;

    const vrHUDPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.94, 0.44),
      new THREE.MeshBasicMaterial({ map: vrHUDTexture, transparent: true, side: THREE.DoubleSide })
    );
    vrHUDPanel.name = 'VR HUD Panel';
    vrHUDPanel.position.set(0, 1.54, -0.95);
    vrHUDPanel.rotation.x = 0.14;
    vrHUDPanel.renderOrder = 5;
    vrUIRoot.add(vrHUDPanel);

    // ===== 2. Toggleable Side Ringgit Security Checklist Panel (1400x1040) =====
    const guideCanvas = document.createElement('canvas');
    guideCanvas.width = 1400;
    guideCanvas.height = 1040;
    const guideCtx = guideCanvas.getContext('2d');
    const guideTex = new THREE.CanvasTexture(guideCanvas);
    guideTex.encoding = THREE.sRGBEncoding;
    guideTex.anisotropy = maxAniso;
    guideTex.minFilter = THREE.LinearFilter;

    const vrGuidePanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.43),
      new THREE.MeshBasicMaterial({ map: guideTex, transparent: true, side: THREE.DoubleSide })
    );
    vrGuidePanel.name = 'VR Note Guide Panel';
    vrGuidePanel.position.set(-0.73, 1.33, -0.62);
    vrGuidePanel.rotation.set(0.06, 0.46, 0);
    vrGuidePanel.renderOrder = 6;
    vrGuidePanel.visible = false;
    vrUIRoot.add(vrGuidePanel);

    // ===== 3. Ergonomic Desk-Lip Angled Control Deck =====
    const vrActionPanel = new THREE.Group();
    vrActionPanel.name = 'VR Control Deck';
    // Mounted neatly above the front desk lip BELOW the banknote (zero desk-mat clipping, never blocks UV sweeping!)
    vrActionPanel.position.set(0, 0.966, -0.21);
    vrActionPanel.rotation.x = -0.54;
    vrUIRoot.add(vrActionPanel);

    // Sleek dark anodized console chassis
    const consoleBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.195, 0.014),
      new THREE.MeshStandardMaterial({ color: 0x16181d, metalness: 0.55, roughness: 0.42 })
    );
    consoleBase.position.set(0, 0.008, -0.011);
    vrActionPanel.add(consoleBase);

    const consoleAccent = new THREE.Mesh(
      new THREE.BoxGeometry(0.87, 0.005, 0.006),
      new THREE.MeshBasicMaterial({ color: 0xedcf61 })
    );
    consoleAccent.position.set(0, 0.105, -0.003);
    vrActionPanel.add(consoleAccent);

    // Subtle divider separating Inspection Tools (left) from Verdicts (right)
    const wingDivider = new THREE.Mesh(
      new THREE.BoxGeometry(0.004, 0.115, 0.004),
      new THREE.MeshBasicMaterial({ color: 0x4b515c })
    );
    wingDivider.position.set(0.035, -0.022, -0.002);
    vrActionPanel.add(wingDivider);

    // Utility strip (always visible at top of console)
    const utilDefs = [
      { action: 'guide',  en: 'NOTE GUIDE', subEn: 'Y',    zh: '防伪指南', subZh: 'Y',    x: -0.28, y: 0.064, w: 0.24, h: 0.052, color: '#222631', border: '#64748b', activeColor: '#4a3a14', activeBorder: '#edcf61' },
      { action: 'lang',   en: '中文 / EN',  subEn: 'LANG', zh: 'EN / 中文', subZh: '语言', x: 0.00,  y: 0.064, w: 0.22, h: 0.052, color: '#222631', border: '#64748b' },
      { action: 'height', en: 'HEIGHT: STD', subEn: 'FIT', zh: '高度：标准', subZh: '适配', x: 0.28,  y: 0.064, w: 0.24, h: 0.052, color: '#222631', border: '#64748b' }
    ];

    // Main Playing Deck: Left Tools Wing + Right Verdict Wing (generous spacing for Quest 3 rays)
    const playDefs = [
      { action: 'uv',     en: 'UV ON',  subEn: 'A · 365nm', zh: '紫外开', subZh: 'A · 365nm', x: -0.34, y: -0.024, w: 0.155, h: 0.096, color: '#4c1d95', border: '#c4b5fd', offColor: '#23262e', offBorder: '#6b7280' },
      { action: 'tilt',   en: 'TILT',   subEn: 'X · HOLO',  zh: '倾斜',   subZh: 'X · 全息',  x: -0.17, y: -0.024, w: 0.145, h: 0.096, color: '#3b2c12', border: '#edcf61' },
      { action: 'flip',   en: 'FLIP',   subEn: '180°',      zh: '翻面',   subZh: '180°',      x: -0.02, y: -0.024, w: 0.13,  h: 0.096, color: '#1e293b', border: '#93c5fd' },
      { action: 'pass',   en: 'PASS',   subEn: 'GENUINE',   zh: '真钞',   subZh: 'PASS',      x: 0.145, y: -0.024, w: 0.185, h: 0.102, color: '#166534', border: '#4ade80' },
      { action: 'reject', en: 'REJECT', subEn: 'FAKE',      zh: '假钞',   subZh: 'REJECT',    x: 0.345, y: -0.024, w: 0.185, h: 0.102, color: '#991b1b', border: '#f87171' }
    ];

    // Feedback mode: prominent NEXT button on right wing while keeping tools accessible
    const nextDef = {
      action: 'next', en: 'NEXT NOTE →', subEn: 'PRESS B', zh: '下一张 →', subZh: '按 B 键',
      x: 0.245, y: -0.024, w: 0.36, h: 0.102, color: '#b48a18', border: '#fde68a', textColor: '#121316'
    };

    // Pre-start mode: Start Inspection + Exit VR
    const startDef = {
      action: 'start', en: 'START INSPECTION', subEn: '10 NOTES · 2 MIN', zh: '开始鉴钞挑战', subZh: '10 张 · 2 分钟',
      x: -0.11, y: -0.024, w: 0.44, h: 0.102, color: '#d4af37', border: '#fef08a', textColor: '#121316'
    };
    const exitPreDef = {
      action: 'exit-vr', en: 'EXIT VR', subEn: 'DESKTOP', zh: '退出 VR', subZh: '返回桌面',
      x: 0.27, y: -0.024, w: 0.24, h: 0.102, color: '#24252b', border: '#94a3b8'
    };

    // Finished mode: Exit VR & View Full Review
    const exitFinishDef = {
      action: 'exit-vr', en: 'EXIT VR · FULL REPORT', subEn: 'VIEW BANKNOTE REVIEW', zh: '退出 VR · 查看完整复盘', subZh: '查看逐张解析',
      x: 0, y: -0.024, w: 0.56, h: 0.102, color: '#d4af37', border: '#fef08a', textColor: '#121316'
    };

    function drawButtonCanvas(mesh) {
      const { def, canvas, hovered } = mesh.userData;
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      const compact = def.h < 0.07;
      const r = compact ? 26 : 36;
      const zh = isZh();

      let fill = def.color;
      let stroke = def.border;
      let label = zh ? def.zh : def.en;
      let sub = zh ? def.subZh : def.subEn;
      let textColor = def.textColor || '#ffffff';

      if (def.action === 'uv') {
        const on = stage.isUVOn;
        fill = on ? def.color : def.offColor;
        stroke = on ? def.border : def.offBorder;
        label = on ? (zh ? '紫外开' : 'UV ON') : (zh ? '紫外关' : 'UV OFF');
      } else if (def.action === 'guide' && guideOpen) {
        fill = def.activeColor;
        stroke = def.activeBorder;
      } else if (def.action === 'height') {
        const preset = HEIGHT_PRESETS[heightIndex];
        label = zh ? `高度：${preset.zh}` : `HEIGHT: ${preset.en}`;
      }

      ctx.clearRect(0, 0, w, h);

      // Hover glow halo
      if (hovered) {
        ctx.save();
        roundRectPath(ctx, 8, 8, w - 16, h - 16, r);
        ctx.shadowColor = stroke;
        ctx.shadowBlur = 24;
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();
      }

      // Button body
      roundRectPath(ctx, 12, 12, w - 24, h - 24, r);
      const grad = ctx.createLinearGradient(0, 12, 0, h - 12);
      grad.addColorStop(0, fill);
      grad.addColorStop(1, '#14161b');
      ctx.fillStyle = def.textColor ? fill : grad;
      ctx.fill();

      // Subtle inner highlight
      ctx.strokeStyle = hovered ? '#ffffff' : stroke;
      ctx.lineWidth = hovered ? 14 : 10;
      ctx.stroke();

      // Text (auto-clamped to maxWidth so EN/ZH labels never clip horizontally on any wide or narrow button!)
      const maxTextW = w - 68;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      if (compact) {
        ctx.font = '700 50px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillText(label, w / 2, h * 0.52, maxTextW);
      } else {
        ctx.font = '800 72px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillText(label, w / 2, h * 0.40, maxTextW);
        ctx.fillStyle = def.textColor ? 'rgba(18,19,22,0.78)' : 'rgba(255,255,255,0.84)';
        ctx.font = '700 34px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillText(sub, w / 2, h * 0.76, maxTextW);
      }
      mesh.userData.texture.needsUpdate = true;
    }

    function createButtonMesh(def) {
      const canvas = document.createElement('canvas');
      const compact = def.h < 0.07;
      canvas.height = compact ? 160 : 260;
      canvas.width = Math.max(512, Math.round(canvas.height * (def.w / def.h)));
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = maxAniso;
      texture.minFilter = THREE.LinearFilter;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(def.w, def.h),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
      );
      mesh.position.set(def.x, def.y, 0.004);
      mesh.userData = { def, canvas, texture, action: def.action, hovered: false, baseZ: 0.004 };
      drawButtonCanvas(mesh);
      vrActionPanel.add(mesh);
      return mesh;
    }

    const utilButtons = utilDefs.map(createButtonMesh);
    const playButtons = playDefs.map(createButtonMesh);
    const nextButton = createButtonMesh(nextDef);
    const startButton = createButtonMesh(startDef);
    const exitPreButton = createButtonMesh(exitPreDef);
    const exitFinishButton = createButtonMesh(exitFinishDef);
    const allButtons = [...utilButtons, ...playButtons, nextButton, startButton, exitPreButton, exitFinishButton];

    function drawGuideCanvas() {
      const ctx = guideCtx;
      const w = guideCanvas.width, h = guideCanvas.height;
      const zh = isZh();

      ctx.clearRect(0, 0, w, h);
      roundRectPath(ctx, 18, 18, w - 36, h - 36, 36);
      ctx.fillStyle = 'rgba(16, 18, 24, 0.96)';
      ctx.fill();
      ctx.strokeStyle = '#edcf61';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#edcf61';
      ctx.fillRect(54, 18, w - 108, 10);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '800 44px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#edcf61';
      ctx.fillText(zh ? '马币防伪速查 (RM5–RM100)' : 'RINGGIT SECURITY CHECKLIST', 64, 92);

      const items = zh ? [
        { tag: '倾斜 · 全息变色', col: '#fde68a', bg: '#423310', text: '左手握把直接拿起倾斜，或按 X 键测试。真钞全息条与菱形标呈现彩虹金属变色，假钞死板无光。' },
        { tag: '紫外 · 365nm 扫描', col: '#ddd6fe', bg: '#311a5c', text: '右手紫外灯扫过正反面：检查发光纤维、面额是否与钞票一致（谨防 RM10→RM20 漂白改印）与背面 5 段安全线。' },
        { tag: '日照 · 徽章与编号', col: '#bae6fd', bg: '#103446', text: '正面：大红花 + BANK NEGARA MALAYSIA（非 MALAYA）+ RM5 透明视窗。背面：横竖编号一致、鼠鹿徽章完整、RM20 双海龟、RM50 分子图。' },
        { tag: '各面额背面图案', col: '#86efac', bg: '#143c26', text: 'RM5 绿（犀鸟·塑料钞）· RM10 红（大王花）· RM20 橙（海龟）· RM50 青（油棕与分子图）· RM100 紫（神山）。' }
      ] : [
        { tag: 'TILT · HOLOGRAM', col: '#fde68a', bg: '#423310', text: 'Hold Left Grip to tilt in-hand, or press X. Genuine notes flash gold ↔ green ↔ violet on the strip & patch. Fakes stay dull and flat.' },
        { tag: 'UV · 365nm TORCH', col: '#ddd6fe', bg: '#311a5c', text: 'Sweep both sides with your right hand: check glowing fibres, matching UV denomination (watch for bleached RM10→RM20!), and back 5-block thread.' },
        { tag: 'DAY · PRINT & SERIALS', col: '#bae6fd', bg: '#103446', text: 'Front: Hibiscus + BANK NEGARA MALAYSIA (not MALAYA) + RM5 clear window. Back: horizontal & vertical serials MUST match, Kijang shield intact, RM20 has 2 turtles, RM50 has molecules.' },
        { tag: 'DENOMINATIONS', col: '#86efac', bg: '#143c26', text: 'RM5 Green (Hornbill · Polymer) · RM10 Red (Rafflesia) · RM20 Orange (2 Turtles) · RM50 Cyan (Palm & Molecules) · RM100 Purple (Mt. Kinabalu).' }
      ];

      let y = 162;
      for (const item of items) {
        roundRectPath(ctx, 64, y, w - 128, 192, 20);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.09)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '800 28px Lexend, "Microsoft YaHei", Arial, sans-serif';
        const tw = ctx.measureText(item.tag).width + 32;
        roundRectPath(ctx, 88, y + 18, tw, 42, 10);
        ctx.fillStyle = item.bg;
        ctx.fill();
        ctx.fillStyle = item.col;
        ctx.fillText(item.tag, 104, y + 40);

        ctx.font = '500 31px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#e7e2d9';
        drawWrappedText(ctx, item.text, 88, y + 92, w - 176, 40, 3);
        y += 208;
      }

      guideTex.needsUpdate = true;
    }

    function refreshButtonLabels() {
      for (const mesh of allButtons) drawButtonCanvas(mesh);
      drawGuideCanvas();
      lastHudSignature = '';
      if (lastHudData) updateHUD(lastHudData);
    }

    function pulseHaptic(inputSource, intensity = 0.45, durationMs = 35) {
      try {
        const actuator = inputSource?.gamepad?.hapticActuators?.[0];
        if (actuator && typeof actuator.pulse === 'function') {
          actuator.pulse(intensity, durationMs);
        }
      } catch {}
    }

    function pulseVerdictFeedback(correct) {
      const targets = [activeRightInputSource, activeLeftInputSource].filter(Boolean);
      if (correct) {
        targets.forEach(s => pulseHaptic(s, 0.55, 35));
        setTimeout(() => targets.forEach(s => pulseHaptic(s, 0.7, 45)), 80);
      } else {
        targets.forEach(s => pulseHaptic(s, 0.85, 110));
      }
    }

    function attachTorchToRightHand() {
      if (!activeRightGrip) return;
      activeRightGrip.add(uvTorchMesh);
      uvTorchMesh.position.set(...TORCH_GRIP_POS);
      uvTorchMesh.rotation.set(...TORCH_GRIP_ROT);
      torchIsHeld = true;
    }

    function dropTorchToWorld() {
      if (!uvTorchMesh || !scene) return;
      scene.attach(uvTorchMesh);
      torchIsHeld = false;
    }

    function grabNoteWithLeftHand() {
      if (!renderer.xr.isPresenting || !activeLeftGrip || !stage.banknoteMesh || noteIsHeld) return;
      activeLeftGrip.add(stage.banknoteMesh);
      stage.banknoteMesh.position.set(...NOTE_GRIP_POS);
      stage.banknoteMesh.rotation.set(...NOTE_GRIP_ROT);
      noteIsHeld = true;
      stage.setNoteHeld(true);
      pulseHaptic(activeLeftInputSource, 0.3, 24);
    }

    function releaseNoteToDesk() {
      if (!noteIsHeld || !stage.banknoteMesh) return;
      scene.attach(stage.banknoteMesh);
      stage.banknoteMesh.position.set(NOTE_BASE_POS[0], NOTE_BASE_POS[1] + HEIGHT_PRESETS[heightIndex].y * 0.5, NOTE_BASE_POS[2]);
      noteIsHeld = false;
      stage.setNoteHeld(false);
      pulseHaptic(activeLeftInputSource, 0.2, 18);
    }

    function toggleTorchHold() {
      if (!renderer.xr.isPresenting || !activeRightGrip) return;
      if (torchIsHeld) {
        dropTorchToWorld();
        callbacks.onStatus?.(
          isZh() ? '已放下紫外手电筒，按右手握把键可重新拿起。' : 'Torch dropped. Squeeze right grip to pick it up.'
        );
      } else {
        attachTorchToRightHand();
        callbacks.onStatus?.(
          isZh() ? '已拿起紫外手电筒：按 A 或扳机开关紫外灯。' : 'Torch held. Press A or Right trigger for UV.'
        );
      }
      pulseHaptic(activeRightInputSource, 0.35, 30);
    }

    function applyHeightPreset() {
      const preset = HEIGHT_PRESETS[heightIndex];
      vrUIRoot.position.y = preset.y;
      if (!noteIsHeld && stage.banknoteMesh && (renderer.xr.isPresenting || previewMode)) {
        stage.banknoteMesh.position.y = Math.max(0.95, NOTE_BASE_POS[1] + preset.y * 0.5);
      }
      refreshButtonLabels();
    }

    function toggleGuide() {
      guideOpen = !guideOpen;
      vrGuidePanel.visible = guideOpen && (renderer.xr.isPresenting || previewMode);
      refreshButtonLabels();
    }

    function createControllerRay(controller) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1.8)
      ]);
      const material = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.22 });
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      controller.add(line);

      // Crisp ring reticle instead of a bulky sphere
      const reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.0045, 0.0085, 24),
        new THREE.MeshBasicMaterial({ color: 0xedcf61, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
      );
      reticle.renderOrder = 10;
      reticle.visible = false;
      scene.add(reticle);

      controller.userData.rayLine = line;
      controller.userData.hitDot = reticle;
      controller.userData.lastHovered = null;
    }

    function getActiveButtons() {
      if (!vrUIRoot.visible || !vrActionPanel.visible) return [];
      return allButtons.filter(b => b.visible);
    }

    function intersectController(controller) {
      const targets = getActiveButtons();
      if (!controller || !targets.length) return null;
      controller.updateMatrixWorld(true);
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      rayOrigin.setFromMatrixPosition(controller.matrixWorld);
      rayDir.set(0, 0, -1).applyMatrix4(tempMatrix).normalize();
      raycaster.set(rayOrigin, rayDir);
      const hits = raycaster.intersectObjects(targets, false);
      return hits.length ? hits[0] : null;
    }

    function triggerAction(action, src) {
      pulseHaptic(src, 0.6, 38);
      switch (action) {
        case 'pass': callbacks.onVerdict?.(true); break;
        case 'reject': callbacks.onVerdict?.(false); break;
        case 'flip': callbacks.onFlip?.(); break;
        case 'tilt': callbacks.onTilt?.(); break;
        case 'uv':
          callbacks.onToggleUV?.();
          refreshButtonLabels();
          break;
        case 'next': callbacks.onNext?.(); break;
        case 'start': callbacks.onStart?.(); break;
        case 'guide': toggleGuide(); break;
        case 'lang':
          callbacks.onToggleLang?.();
          refreshButtonLabels();
          break;
        case 'height':
          heightIndex = (heightIndex + 1) % HEIGHT_PRESETS.length;
          applyHeightPreset();
          break;
        case 'exit-vr': exitVR(); break;
      }
    }

    function handleControllerSelect(controller) {
      if (!renderer.xr.isPresenting) return;
      const hit = intersectController(controller);
      const src = controller.userData.inputSource;

      if (hit) {
        triggerAction(hit.object.userData.action, src);
        return;
      }

      if (controller === activeRightController) {
        pulseHaptic(src, 0.35, 26);
        callbacks.onToggleUV?.();
        refreshButtonLabels();
      } else if (controller === activeLeftController) {
        pulseHaptic(src, 0.35, 26);
        callbacks.onFlip?.();
      }
    }

    function reconcileControllers(session) {
      const sources = Array.from(session?.inputSources || []);
      activeRightController = null;
      activeRightGrip = null;
      activeLeftController = null;
      activeLeftGrip = null;
      activeLeftInputSource = null;
      activeRightInputSource = null;

      for (const ctrl of xrControllers) {
        const src = ctrl.userData.inputSource;
        if (!src) continue;
        if (src.handedness === 'right' && !activeRightController) {
          activeRightController = ctrl;
          activeRightGrip = ctrl.userData.grip;
          activeRightInputSource = src;
        } else if (src.handedness === 'left' && !activeLeftController) {
          activeLeftController = ctrl;
          activeLeftGrip = ctrl.userData.grip;
          activeLeftInputSource = src;
        }
      }

      if (!activeRightController || !activeLeftController) {
        sources.forEach((src, i) => {
          const ctrl = xrControllers[i];
          if (!ctrl) return;
          if (src.handedness === 'right' && !activeRightController) {
            activeRightController = ctrl;
            activeRightGrip = ctrl.userData.grip;
            activeRightInputSource = src;
          } else if (src.handedness === 'left' && !activeLeftController) {
            activeLeftController = ctrl;
            activeLeftGrip = ctrl.userData.grip;
            activeLeftInputSource = src;
          }
        });
      }

      if (!activeRightController) {
        const fallbackCtrl = xrControllers.find(c => c !== activeLeftController && c.userData.inputSource) || xrControllers[0];
        if (fallbackCtrl) {
          activeRightController = fallbackCtrl;
          activeRightGrip = fallbackCtrl.userData.grip;
          activeRightInputSource = fallbackCtrl.userData.inputSource || sources[0] || null;
        }
      }
      if (!activeLeftInputSource) {
        activeLeftInputSource = sources.find(s => s !== activeRightInputSource) || null;
      }

      if (torchIsHeld && uvTorchMesh.parent !== activeRightGrip) dropTorchToWorld();
      if (activeRightGrip && !torchIsHeld) attachTorchToRightHand();
      if (noteIsHeld && stage.banknoteMesh?.parent !== activeLeftGrip) releaseNoteToDesk();
      callbacks.onControllersChanged?.();
    }

    xrControllers = [0, 1].map(index => {
      const controller = renderer.xr.getController(index);
      const grip = renderer.xr.getControllerGrip(index);
      controller.userData.grip = grip;
      createControllerRay(controller);

      controller.addEventListener('connected', event => {
        controller.userData.inputSource = event.data;
        reconcileControllers(renderer.xr.getSession());
      });
      controller.addEventListener('disconnected', () => {
        controller.userData.inputSource = null;
        if (controller.userData.hitDot) controller.userData.hitDot.visible = false;
        reconcileControllers(renderer.xr.getSession());
      });
      controller.addEventListener('selectstart', () => handleControllerSelect(controller));
      controller.addEventListener('squeezestart', () => {
        if (!renderer.xr.isPresenting) return;
        if (controller === activeRightController) toggleTorchHold();
        else if (controller === activeLeftController) grabNoteWithLeftHand();
      });
      controller.addEventListener('squeezeend', () => {
        if (!renderer.xr.isPresenting) return;
        if (controller === activeLeftController) releaseNoteToDesk();
      });

      scene.add(controller);
      scene.add(grip);
      return controller;
    });

    renderer.xr.addEventListener('sessionstart', () => {
      try { renderer.xr.setFoveation?.(0.2); } catch {}
      const session = renderer.xr.getSession();
      vrUIRoot.visible = true;
      vrGuidePanel.visible = guideOpen;
      applyHeightPreset();
      if (session) {
        reconcileControllers(session);
        session.addEventListener('inputsourceschange', () => reconcileControllers(session));
      }
      refreshButtonLabels();
      callbacks.onSessionStart?.();
    });

    renderer.xr.addEventListener('sessionend', () => {
      if (noteIsHeld) releaseNoteToDesk();
      if (uvTorchMesh && torchIsHeld) dropTorchToWorld();
      activeRightController = null;
      activeRightGrip = null;
      activeLeftController = null;
      activeLeftGrip = null;
      activeLeftInputSource = null;
      activeRightInputSource = null;
      xrControllers.forEach(c => {
        c.userData.inputSource = null;
        c.userData.lastHovered = null;
        if (c.userData.rayLine) c.userData.rayLine.visible = false;
        if (c.userData.hitDot) c.userData.hitDot.visible = false;
      });
      vrUIRoot.visible = previewMode;
      vrGuidePanel.visible = previewMode && guideOpen;
      uvTorchMesh.position.set(...DESKTOP_TORCH_POS);
      uvTorchMesh.rotation.set(0, 0.14, 0);
      callbacks.onSessionEnd?.();
    });

    function readStickAxes(inputSource) {
      const axes = inputSource?.gamepad?.axes;
      if (!axes || !axes.length) return [0, 0];
      if (axes.length >= 4) {
        const pairA = [Number(axes[0]) || 0, Number(axes[1]) || 0];
        const pairB = [Number(axes[2]) || 0, Number(axes[3]) || 0];
        const magB = Math.abs(pairB[0]) + Math.abs(pairB[1]);
        return magB > 0.08 ? pairB : pairA;
      }
      if (axes.length >= 2) return [Number(axes[0]) || 0, Number(axes[1]) || 0];
      return [0, 0];
    }

    function pollFaceButtons(hand, inputSource) {
      const btns = inputSource?.gamepad?.buttons;
      if (!btns || !btns.length) return;
      const prev = prevButtons[hand];
      const justPressed = i => {
        const down = !!(btns[i]?.pressed);
        const was = !!prev[i];
        prev[i] = down;
        return down && !was;
      };
      // Touch Plus xr-standard mapping: 3=stick click, 4=A(right)/X(left), 5=B(right)/Y(left)
      if (hand === 'right') {
        if (justPressed(4)) { // A button -> Toggle UV torch
          pulseHaptic(inputSource, 0.35, 25);
          callbacks.onToggleUV?.();
          refreshButtonLabels();
        }
        if (justPressed(5)) { // B button -> Next note during feedback, else toggle Guide
          pulseHaptic(inputSource, 0.4, 28);
          if (panelMode === 'feedback') callbacks.onNext?.();
          else toggleGuide();
        }
        if (justPressed(3)) { // Right stick click -> Reset zoom/view
          pulseHaptic(inputSource, 0.3, 25);
          callbacks.onReset?.();
        }
      } else {
        if (justPressed(4)) { // X button -> Tilt Hologram test
          pulseHaptic(inputSource, 0.35, 25);
          callbacks.onTilt?.();
        }
        if (justPressed(5)) { // Y button -> Toggle VR Note Guide
          pulseHaptic(inputSource, 0.35, 25);
          toggleGuide();
        }
        if (justPressed(3)) { // Left stick click -> Reset view
          pulseHaptic(inputSource, 0.3, 25);
          callbacks.onReset?.();
        }
      }
    }

    function updatePanelMode(mode) {
      panelMode = mode;
      const show = renderer.xr.isPresenting || previewMode;
      vrUIRoot.visible = show;
      vrActionPanel.visible = show;
      if (!show) return;

      const isPre = mode === 'prestart';
      const isPlay = mode === 'playing';
      const isFb = mode === 'feedback';
      const isFin = mode === 'finished';

      utilButtons.forEach(b => { b.visible = true; });
      playButtons.forEach(b => {
        if (isPlay) b.visible = true;
        else if (isFb) b.visible = ['uv', 'tilt', 'flip'].includes(b.userData.action);
        else b.visible = false;
      });
      wingDivider.visible = isPlay || isFb;
      nextButton.visible = isFb;
      startButton.visible = isPre;
      exitPreButton.visible = isPre;
      exitFinishButton.visible = isFin;
      vrGuidePanel.visible = guideOpen && show;
    }

    function drawWrappedText(ctx, text, x, startY, maxWidth, lineHeight, maxLines) {
      const str = String(text || '');
      const isCJK = /[\u4e00-\u9fff]/.test(str);
      const tokens = isCJK ? [...str] : str.split(' ');
      const sep = isCJK ? '' : ' ';
      let line = '';
      let y = startY;
      let count = 0;
      for (const token of tokens) {
        const test = line ? line + sep + token : token;
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, x, y);
          count++;
          if (count >= maxLines) return;
          line = token;
          y += lineHeight;
        } else {
          line = test;
        }
      }
      if (line && count < maxLines) ctx.fillText(line, x, y);
    }

    function updateHUD(data) {
      lastHudData = data;
      const {
        timeText = '02:00', timeRemaining = 120, durationSec = 120,
        score = 0, streak = 0, noteNumber = 1, noteCount = 10,
        denomination = 'RM50', feedback = null, finished = false,
        started = false, endReason = null, review = [],
        participantLabel = ''
      } = data;

      const uvOn = stage.isUVOn;
      const zoomPct = Math.round(stage.zoom * 100);
      const tiltBucket = Math.round((stage.tiltDeg || 0) / 3) * 3;
      const backFace = stage.isBackFacing;
      const zh = isZh();

      const pipSig = review.map(it => it.choice === undefined ? '.' : it.correct ? '1' : '0').join('');
      const sig = [
        zh, timeText, score, streak, noteNumber, denomination,
        feedback ? `${feedback.correct}:${feedback.reason}` : '',
        finished, started, endReason, uvOn, zoomPct, tiltBucket, backFace, noteIsHeld, pipSig, participantLabel
      ].join('|');
      if (sig === lastHudSignature) return;
      lastHudSignature = sig;

      const ctx = vrHUDContext;
      const w = vrHUDCanvas.width, h = vrHUDCanvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // Main frosted dark slate glass bezel
      const pad = 22, pw = w - pad * 2, ph = h - pad * 2;
      roundRectPath(ctx, pad, pad, pw, ph, 44);
      const bgGrad = ctx.createLinearGradient(0, pad, 0, h - pad);
      bgGrad.addColorStop(0, 'rgba(18, 20, 26, 0.96)');
      bgGrad.addColorStop(1, 'rgba(12, 13, 18, 0.96)');
      ctx.fillStyle = bgGrad;
      ctx.fill();
      ctx.strokeStyle = feedback ? (feedback.correct ? '#4ade80' : '#f87171') : finished ? '#edcf61' : '#3d424e';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Top status accent bar
      const accentColor = feedback
        ? (feedback.correct ? '#22c55e' : '#ef4444')
        : finished ? '#edcf61' : '#e52521';
      ctx.fillStyle = accentColor;
      ctx.fillRect(pad + 44, pad, pw - 88, 12);

      // ===== Row 1: Header + Denomination Pill + Progress Pips =====
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '800 44px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#f3efe5';
      const titleText = zh ? '01 / 真假钞票大考验 · QUEST 3 VR' : '01 / SPOT THE FAKE CASH · QUEST 3 VR';
      ctx.fillText(titleText, 76, 98);

      if (participantLabel) {
        ctx.textAlign = 'right';
        ctx.font = '600 32px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#a8a39b';
        ctx.fillText(participantLabel, w - 76, 98);
      }

      // Denomination badge
      const dc = DENOM_COLORS[denomination] || DENOM_COLORS.RM50;
      const denomText = denomination === 'RM5' ? (zh ? 'RM5 · 塑料钞' : 'RM5 · POLYMER') : denomination;
      ctx.textAlign = 'left';
      ctx.font = '800 36px Lexend, "Microsoft YaHei", Arial, sans-serif';
      const dWidth = Math.max(180, ctx.measureText(denomText).width + 52);
      roundRectPath(ctx, 76, 152, dWidth, 62, 14);
      ctx.fillStyle = dc.bg;
      ctx.fill();
      ctx.strokeStyle = dc.border;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = dc.text;
      ctx.fillText(denomText, 102, 184);

      // Note counter
      const noteText = zh ? `第 ${noteNumber} / ${noteCount} 张` : `NOTE ${noteNumber} / ${noteCount}`;
      ctx.font = '800 36px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#e7e2d9';
      const noteX = 76 + dWidth + 28;
      ctx.fillText(noteText, noteX, 184);

      // 10 visual progress pips aligned to right
      const pipW = 36, pipH = 26, pipGap = 12;
      const totalPipW = noteCount * pipW + (noteCount - 1) * pipGap;
      const pipStartX = w - 76 - totalPipW;
      for (let i = 0; i < noteCount; i++) {
        const item = review[i];
        const px = pipStartX + i * (pipW + pipGap);
        const py = 171;
        roundRectPath(ctx, px, py, pipW, pipH, 6);
        if (item && item.choice !== undefined) {
          ctx.fillStyle = item.correct ? '#22a055' : '#e52521';
          ctx.strokeStyle = item.correct ? '#86efac' : '#fca5a5';
        } else if (started && !finished && i === noteNumber - 1 && !feedback) {
          ctx.fillStyle = '#edcf61';
          ctx.strokeStyle = '#fef08a';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.10)';
          ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        }
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // ===== Row 2: 3 Telemetry Cards (TIME, SCORE, STREAK) =====
      const cardY = 244, cardH = 166, gap = 24;
      const cardW = (w - 152 - gap * 2) / 3;

      // Time Card
      const tx = 76;
      roundRectPath(ctx, tx, cardY, cardW, cardH, 22);
      ctx.fillStyle = timeRemaining <= 15 && started && !finished ? 'rgba(153, 27, 27, 0.34)' : 'rgba(255,255,255,0.045)';
      ctx.fill();
      ctx.strokeStyle = timeRemaining <= 15 && started && !finished ? '#f87171' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '700 28px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#a6a39d';
      ctx.fillText(zh ? '剩余时间' : 'TIME REMAINING', tx + 30, cardY + 38);
      ctx.font = '800 72px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = timeRemaining <= 15 && started && !finished ? '#ff7b72' : '#edcf61';
      ctx.fillText(timeText, tx + 30, cardY + 104);

      // Smooth time bar at bottom of Time card
      const pctTime = Math.max(0, Math.min(1, timeRemaining / Math.max(1, durationSec)));
      roundRectPath(ctx, tx + 30, cardY + 144, cardW - 60, 10, 5);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      if (pctTime > 0) {
        roundRectPath(ctx, tx + 30, cardY + 144, Math.max(12, (cardW - 60) * pctTime), 10, 5);
        ctx.fillStyle = timeRemaining <= 15 ? '#f87171' : '#edcf61';
        ctx.fill();
      }

      // Score Card
      const sx = tx + cardW + gap;
      roundRectPath(ctx, sx, cardY, cardW, cardH, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = '700 28px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#a6a39d';
      ctx.fillText(zh ? '当前得分' : 'SCORE', sx + 30, cardY + 38);
      ctx.font = '800 72px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#f3efe5';
      ctx.fillText(`${score}`, sx + 30, cardY + 104);
      const sw = ctx.measureText(`${score}`).width;
      ctx.font = '700 38px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#8b8780';
      ctx.fillText(' / 100', sx + 34 + sw, cardY + 114);

      // Streak Card
      const rx = sx + cardW + gap;
      roundRectPath(ctx, rx, cardY, cardW, cardH, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = '700 28px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#a6a39d';
      ctx.fillText(zh ? '连对次数' : 'STREAK', rx + 30, cardY + 38);
      ctx.font = '800 72px Lexend, "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = streak >= 3 ? '#6ee7b7' : '#f3efe5';
      ctx.fillText(String(streak), rx + 30, cardY + 104);

      // ===== Row 3: Live Inspection Telemetry Pills =====
      const telY = 438;
      const pills = [
        {
          label: uvOn ? (zh ? '紫外 365nm：开' : 'UV 365nm: ON') : (zh ? '紫外 365nm：关' : 'UV 365nm: OFF'),
          bg: uvOn ? 'rgba(139, 92, 246, 0.30)' : 'rgba(255,255,255,0.06)',
          border: uvOn ? '#c4b5fd' : '#4b5563',
          color: uvOn ? '#f5d0fe' : '#9ca3af'
        },
        {
          label: (zh ? '倾斜角：' : 'TILT: ') + `${tiltBucket}°`,
          bg: tiltBucket >= 22 ? 'rgba(237, 207, 97, 0.22)' : 'rgba(255,255,255,0.06)',
          border: tiltBucket >= 22 ? '#edcf61' : '#4b5563',
          color: tiltBucket >= 22 ? '#fde68a' : '#d1d5db'
        },
        {
          label: (zh ? '缩放：' : 'ZOOM: ') + `${zoomPct}%`,
          bg: 'rgba(255,255,255,0.06)',
          border: '#4b5563',
          color: '#d1d5db'
        },
        {
          label: backFace ? (zh ? '当前面：背面' : 'SIDE: BACK') : (zh ? '当前面：正面' : 'SIDE: FRONT'),
          bg: 'rgba(56, 189, 248, 0.16)',
          border: '#38bdf8',
          color: '#bae6fd'
        }
      ];
      if (noteIsHeld) {
        pills.push({
          label: zh ? '左手持钞中' : 'HAND-HELD',
          bg: 'rgba(34, 160, 85, 0.26)',
          border: '#4ade80',
          color: '#86efac'
        });
      }

      let px = 76;
      ctx.font = '700 30px Lexend, "Microsoft YaHei", Arial, sans-serif';
      for (const p of pills) {
        const wPill = ctx.measureText(p.label).width + 44;
        roundRectPath(ctx, px, telY, wPill, 56, 14);
        ctx.fillStyle = p.bg;
        ctx.fill();
        ctx.strokeStyle = p.border;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = p.color;
        ctx.fillText(p.label, px + 22, telY + 29);
        px += wPill + 16;
      }

      // ===== Row 4: Dynamic Context Panel (Prestart / Playing / Feedback / Finished) =====
      const boxY = 524, boxH = 374;
      roundRectPath(ctx, 76, boxY, w - 152, boxH, 24);
      if (feedback) {
        ctx.fillStyle = feedback.correct ? 'rgba(22, 101, 52, 0.34)' : 'rgba(153, 27, 27, 0.34)';
        ctx.fill();
        ctx.strokeStyle = feedback.correct ? '#4ade80' : '#f87171';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.font = '800 54px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = feedback.correct ? '#6ee7b7' : '#fca5a5';
        const fbHead = feedback.correct
          ? (zh ? '✓ 判断正确  +10 分' : '✓ CORRECT  +10 PTS')
          : (zh ? '✗ 判断错误  +0 分' : '✗ WRONG  +0 PTS');
        ctx.fillText(fbHead, 114, boxY + 66);

        ctx.font = '500 36px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#f3efe5';
        const reason = zh ? (feedback.reasonZh || feedback.reason) : feedback.reason;
        drawWrappedText(ctx, reason, 114, boxY + 144, w - 228, 50, 3);

        ctx.font = '700 30px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#fde68a';
        ctx.fillText(
          zh ? '按右手 B 键或点击下方“下一张 →”继续' : 'Press Right B or point at NEXT NOTE → below to continue',
          114, boxY + 324
        );
      } else if (finished) {
        ctx.fillStyle = 'rgba(237, 207, 97, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#edcf61';
        ctx.lineWidth = 5;
        ctx.stroke();

        const answered = review.filter(it => it.choice !== undefined).length;
        const correct = review.filter(it => it.correct).length;
        const acc = answered ? Math.round(correct * 100 / answered) : 0;

        ctx.font = '800 54px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#edcf61';
        const doneHead = endReason === 'time'
          ? (zh ? '时间到！本轮鉴钞结束' : 'TIME IS UP · INSPECTION COMPLETE')
          : (zh ? '鉴钞完成！' : 'INSPECTION COMPLETE!');
        ctx.fillText(doneHead, 114, boxY + 66);

        ctx.font = '700 38px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#f3efe5';
        const statLine = zh
          ? `最终得分：${score} / 100   ·   正确：${correct} / ${answered}   ·   准确率：${acc}%`
          : `FINAL SCORE: ${score} / 100   ·   CORRECT: ${correct} / ${answered}   ·   ACCURACY: ${acc}%`;
        ctx.fillText(statLine, 114, boxY + 144);

        // Mini note badges row (fills full box width evenly across 5 columns x 2 rows)
        const bgap = 16;
        const bw = (w - 228 - bgap * 4) / 5;
        const bh = 54;
        for (let i = 0; i < Math.min(10, review.length); i++) {
          const it = review[i];
          const col = i % 5, row = Math.floor(i / 5);
          const bx = 114 + col * (bw + bgap), by = boxY + 186 + row * (bh + 14);
          roundRectPath(ctx, bx, by, bw, bh, 12);
          ctx.fillStyle = it.choice === undefined ? 'rgba(255,255,255,0.08)' : it.correct ? 'rgba(34,160,85,0.3)' : 'rgba(229,37,33,0.32)';
          ctx.fill();
          ctx.strokeStyle = it.choice === undefined ? '#6b7280' : it.correct ? '#4ade80' : '#f87171';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.font = '700 28px Lexend, "Microsoft YaHei", Arial, sans-serif';
          ctx.fillStyle = '#f3efe5';
          const icon = it.choice === undefined ? '—' : it.correct ? '✓' : '✗';
          ctx.fillText(`#${i + 1} ${it.note?.denomination || ''}  ${icon}`, bx + 20, by + 29, bw - 32);
        }

        ctx.font = '700 30px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#fde68a';
        ctx.fillText(
          zh ? '点击下方“退出 VR · 查看完整复盘”查看每张钞票的详细防伪解析。' : 'Point at EXIT VR below to view the full forensic breakdown.',
          114, boxY + 344
        );
      } else if (!started) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(237, 207, 97, 0.45)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = '800 46px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#edcf61';
        ctx.fillText(zh ? '欢迎进入 Quest 3 钞票鉴伪实验室' : 'READY IN META QUEST 3 CURRENCY LAB', 114, boxY + 66);

        ctx.font = '500 34px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#e7e2d9';
        drawWrappedText(
          ctx,
          zh
            ? '右手已握住 365nm 紫外手电。按住左手握把可直接抓起钞票倾斜查全息，或用左摇杆旋转、右摇杆缩放。准备就绪后，指向下方“开始鉴钞挑战”。'
            : 'Your right hand holds the 365nm UV torch. Squeeze Left Grip to hold and tilt notes directly in 3D, or use Left Stick to rotate & Right Stick to zoom. Point at START INSPECTION below.',
          114, boxY + 148, w - 228, 52, 4
        );
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.035)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '700 30px Lexend, "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#edcf61';
        ctx.fillText(zh ? 'META QUEST 3 手柄快捷操作' : 'META QUEST 3 TOUCH PLUS CONTROLS', 114, boxY + 52);

        const controls = zh ? [
          ['左手摇杆', '旋转钞票'],
          ['左手握把', '抓起钞票倾斜'],
          ['左手扳机', '翻面 180°'],
          ['左手 X / Y', '全息测试 / 指南'],
          ['右手摇杆', '放大 / 缩小'],
          ['右手 A / 扳机', '紫外灯 / 点按钮'],
          ['右手握把', '放下 / 拿起手电'],
          ['摇杆按压', '重置视角']
        ] : [
          ['L-STICK', 'Rotate note'],
          ['L-GRIP', 'Hold note in hand'],
          ['L-TRIGGER', 'Flip 180°'],
          ['X / Y', 'Tilt test / Guide'],
          ['R-STICK', 'Zoom in / out'],
          ['A / R-TRIG', 'UV torch / Click'],
          ['R-GRIP', 'Hold / drop torch'],
          ['STICK CLICK', 'Reset view']
        ];

        const colW = (w - 228) / 2;
        controls.forEach(([keyLabel, desc], idx) => {
          const col = idx < 4 ? 0 : 1;
          const row = idx % 4;
          const cx = 114 + col * colW;
          const cy = boxY + 114 + row * 66;

          ctx.font = '800 26px Lexend, "Microsoft YaHei", Arial, sans-serif';
          const kw = Math.max(170, ctx.measureText(keyLabel).width + 32);
          roundRectPath(ctx, cx, cy - 22, kw, 44, 10);
          ctx.fillStyle = 'rgba(237, 207, 97, 0.16)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(237, 207, 97, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#fde68a';
          ctx.fillText(keyLabel, cx + 16, cy + 1);
          ctx.font = '500 30px Lexend, "Microsoft YaHei", Arial, sans-serif';
          ctx.fillStyle = '#e7e2d9';
          ctx.fillText(desc, cx + kw + 18, cy + 1);
        });
      }

      ctx.restore();
      vrHUDTexture.needsUpdate = true;
    }

    function updateFrame() {
      if (!renderer.xr.isPresenting) return;

      pollFaceButtons('right', activeRightInputSource);
      pollFaceButtons('left', activeLeftInputSource);

      // Right thumbstick -> zoom
      if (stage.banknoteMesh && activeRightInputSource) {
        const [, zoomAxisY] = readStickAxes(activeRightInputSource);
        if (Math.abs(zoomAxisY) > 0.16) {
          stage.setZoom(stage.zoom + (-zoomAxisY * 0.024));
        }
      }

      // Left thumbstick -> rotate note (when not holding in left hand)
      if (stage.banknoteMesh && activeLeftInputSource && !noteIsHeld) {
        const [xAxis, yAxis] = readStickAxes(activeLeftInputSource);
        const deadzone = 0.14;
        const speed = 0.044;
        if (Math.abs(xAxis) > deadzone || Math.abs(yAxis) > deadzone) {
          stage.rotateNote(
            Math.abs(xAxis) > deadzone ? xAxis * speed : 0,
            Math.abs(yAxis) > deadzone ? yAxis * speed : 0
          );
        }
      }

      // Refresh live telemetry (tilt/zoom/side) cleanly ~10Hz
      const now = performance.now();
      if (lastHudData && now - lastLiveTick > 100) {
        lastLiveTick = now;
        updateHUD(lastHudData);
      }

      const prevHoverMap = new Map(allButtons.map(b => [b, b.userData.hovered]));
      for (const b of allButtons) b.userData.hovered = false;

      for (const controller of xrControllers) {
        const line = controller.userData.rayLine;
        const dot = controller.userData.hitDot;
        const connected = !!controller.userData.inputSource;
        if (line) line.visible = connected;
        const hit = connected ? intersectController(controller) : null;
        if (hit) {
          hit.object.userData.hovered = true;
          if (controller.userData.lastHovered !== hit.object) {
            controller.userData.lastHovered = hit.object;
            pulseHaptic(controller.userData.inputSource, 0.18, 12);
          }
          if (dot) {
            dot.position.copy(hit.point);
            dot.quaternion.copy(vrActionPanel.quaternion);
            dot.translateZ(0.002);
            dot.visible = true;
          }
          if (line) {
            line.material.color.setHex(0xedcf61);
            line.material.opacity = 0.92;
          }
        } else {
          controller.userData.lastHovered = null;
          if (dot) dot.visible = false;
          if (line) {
            line.material.color.setHex(0x93c5fd);
            line.material.opacity = 0.18;
          }
        }
      }

      for (const b of allButtons) {
        const hovered = b.userData.hovered;
        if (hovered !== prevHoverMap.get(b)) drawButtonCanvas(b);
        const targetScale = hovered ? 1.07 : 1.0;
        const nextScale = b.scale.x + (targetScale - b.scale.x) * 0.25;
        b.scale.set(nextScale, nextScale, 1);
        const targetZ = hovered ? b.userData.baseZ + 0.012 : b.userData.baseZ;
        b.position.z += (targetZ - b.position.z) * 0.25;
      }
    }

    async function checkSupport() {
      if (!navigator.xr) return { supported: false, reason: 'no-webxr' };
      try {
        const ok = await navigator.xr.isSessionSupported('immersive-vr');
        return { supported: ok, reason: ok ? 'ready' : 'unsupported' };
      } catch {
        return { supported: false, reason: 'error' };
      }
    }

    async function enterVR() {
      const check = await checkSupport();
      if (!check.supported) {
        const msg = check.reason === 'no-webxr'
          ? (isZh() ? '当前浏览器不支持 WebXR，请在 Meta Quest 3 浏览器（HTTPS / localhost）中打开。' : 'WebXR is unavailable in this browser. Open in Meta Quest 3 Browser over HTTPS or localhost.')
          : (isZh() ? '未检测到沉浸式 VR 头显，你仍可在桌面或手机模式下完整体验。' : 'No immersive VR headset detected. You can play the full challenge on desktop or phone.');
        callbacks.onStatus?.(msg);
        return false;
      }
      // Quest 3 pancake optics: bump framebuffer resolution safely before requesting session
      try { renderer.xr.setFramebufferScaleFactor?.(1.25); } catch {}
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
      });
      await renderer.xr.setSession(session);
      return true;
    }

    async function exitVR() {
      const session = renderer.xr.getSession();
      if (session) await session.end();
    }

    // Allows automated visual QA & screenshots of the exact Quest 3 VR cockpit in desktop Chromium
    function setPreviewMode(enabled, { showGuide = false, mode = 'playing' } = {}) {
      previewMode = !!enabled;
      guideOpen = !!showGuide;
      vrUIRoot.visible = previewMode;
      vrGuidePanel.visible = previewMode && guideOpen;
      if (previewMode) {
        updatePanelMode(mode);
        refreshButtonLabels();
      }
    }

    drawGuideCanvas();

    return {
      updateHUD,
      updatePanelMode,
      refreshButtonLabels,
      pulseVerdictFeedback,
      updateFrame,
      checkSupport,
      enterVR,
      exitVR,
      setPreviewMode,
      get isPresenting() { return renderer.xr.isPresenting; }
    };
  }

  root.FakeCashVR = { createVR };
})(globalThis);
