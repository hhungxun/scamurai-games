/* WebXR VR module for Station 1:
 * - Calibrated right-hand UV torch grip pose from VR Test 9
 * - Reliable connected/disconnected controller tracking (left/right never swap)
 * - Laser rays with hover scaling & glowing hit dot
 * - Bilingual 3D world-space HUD (VR-only so desktop view stays unobstructed!)
 * - PASS / FLIP / REJECT / EXIT VR buttons + subtle controller haptics */
(function (root) {
  'use strict';

  // Calibrated grip pose from VR Test 9
  const TORCH_GRIP_POS = [0, -0.075, -0.10];
  const TORCH_GRIP_ROT = [-0.8, -0.10, -0.20];

  function createVR(stage, callbacks) {
    const { scene, renderer, uvTorchMesh, DESKTOP_TORCH_POS } = stage;
    const isZh = () => !!(root.ScamuraiI18n?.isZh() || root.__FAKECASH_IS_ZH__?.());

    const tempMatrix = new THREE.Matrix4();
    const rayOrigin = new THREE.Vector3();
    const rayDir = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    raycaster.far = 3.2;

    let xrControllers = [];
    let torchIsHeld = false;
    let activeRightController = null;
    let activeRightGrip = null;
    let activeLeftController = null;
    let activeLeftInputSource = null;
    let activeRightInputSource = null;

    // 3D HUD panel behind/above the banknote — ONLY visible in immersive VR (desktop uses the top navbar!)
    const vrHUDCanvas = document.createElement('canvas');
    vrHUDCanvas.width = 960;
    vrHUDCanvas.height = 560;
    const vrHUDContext = vrHUDCanvas.getContext('2d');
    const vrHUDTexture = new THREE.CanvasTexture(vrHUDCanvas);
    vrHUDTexture.encoding = THREE.sRGBEncoding;

    const vrHUDPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.84, 0.48),
      new THREE.MeshBasicMaterial({ map: vrHUDTexture, transparent: true, side: THREE.DoubleSide })
    );
    vrHUDPanel.name = 'VR HUD Panel';
    vrHUDPanel.position.set(0, 1.66, -1.12);
    vrHUDPanel.rotation.x = 0.08;
    vrHUDPanel.renderOrder = 5;
    vrHUDPanel.visible = false;
    scene.add(vrHUDPanel);

    // 3D VR action buttons panel
    const vrActionPanel = new THREE.Group();
    vrActionPanel.name = 'VR Action Panel';
    vrActionPanel.position.set(0, 0.975, -0.30);
    vrActionPanel.rotation.x = -0.18;
    vrActionPanel.visible = false;
    scene.add(vrActionPanel);

    const buttonDefs = [
      { action: 'pass', en: 'PASS', subEn: 'GENUINE', zh: '真钞', subZh: 'PASS', x: -0.30, w: 0.19, color: '#1b6b3a', border: '#56d364' },
      { action: 'tilt', en: 'TILT', subEn: 'HOLOGRAM', zh: '倾斜', subZh: '查全息', x: -0.10, w: 0.175, color: '#3b2c12', border: '#edcf61' },
      { action: 'flip', en: 'FLIP', subEn: '180°', zh: '翻面', subZh: '180°', x: 0.10, w: 0.175, color: '#26252a', border: '#93c5fd' },
      { action: 'reject', en: 'REJECT', subEn: 'FAKE', zh: '假钞', subZh: 'REJECT', x: 0.30, w: 0.19, color: '#a42220', border: '#ff7b72' }
    ];

    const exitDef = {
      action: 'exit-vr', en: 'EXIT VR', subEn: 'VIEW REVIEW', zh: '退出 VR', subZh: '查看复盘',
      x: 0, w: 0.34, color: '#242221', border: '#edcf61'
    };

    function drawButtonCanvas(canvas, def) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height, r = 34;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(r, 10);
      ctx.lineTo(w - r, 10);
      ctx.quadraticCurveTo(w - 10, 10, w - 10, r);
      ctx.lineTo(w - 10, h - r);
      ctx.quadraticCurveTo(w - 10, h - 10, w - r, h - 10);
      ctx.lineTo(r, h - 10);
      ctx.quadraticCurveTo(10, h - 10, 10, h - r);
      ctx.lineTo(10, r);
      ctx.quadraticCurveTo(10, 10, r, 10);
      ctx.closePath();
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.strokeStyle = def.border;
      ctx.lineWidth = 14;
      ctx.stroke();

      const zh = isZh();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 74px "Microsoft YaHei", Arial, sans-serif';
      ctx.fillText(zh ? def.zh : def.en, w / 2, h * 0.42);
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.font = 'bold 34px "Microsoft YaHei", Arial, sans-serif';
      ctx.fillText(zh ? def.subZh : def.subEn, w / 2, h * 0.77);
    }

    function createButtonMesh(def) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 230;
      drawButtonCanvas(canvas, def);
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(def.w, 0.102),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
      );
      mesh.position.set(def.x, 0, 0);
      mesh.userData = { def, canvas, texture, action: def.action, hovered: false };
      vrActionPanel.add(mesh);
      return mesh;
    }

    const playButtons = buttonDefs.map(createButtonMesh);
    const exitButton = createButtonMesh(exitDef);
    exitButton.visible = false;

    function refreshButtonLabels() {
      for (const mesh of [...playButtons, exitButton]) {
        drawButtonCanvas(mesh.userData.canvas, mesh.userData.def);
        mesh.userData.texture.needsUpdate = true;
      }
    }

    function pulseHaptic(inputSource, intensity = 0.45, durationMs = 35) {
      try {
        const actuator = inputSource?.gamepad?.hapticActuators?.[0];
        if (actuator && typeof actuator.pulse === 'function') {
          actuator.pulse(intensity, durationMs);
        }
      } catch {}
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

    function toggleTorchHold() {
      if (!renderer.xr.isPresenting || !activeRightGrip) return;
      if (torchIsHeld) {
        dropTorchToWorld();
        callbacks.onStatus?.(
          isZh() ? '已放下紫外手电筒，按右手握把键可重新拿起。' : 'Torch dropped. Squeeze the right grip to pick it up.'
        );
      } else {
        attachTorchToRightHand();
        callbacks.onStatus?.(
          isZh() ? '已拿起紫外手电筒：右手扳机开关紫外灯，握把键放下。' : 'Torch held. Right trigger toggles UV · Grip drops it.'
        );
      }
      pulseHaptic(activeRightInputSource, 0.35, 30);
    }

    function createControllerRay(controller) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -2.2)
      ]);
      const material = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.78 });
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      controller.add(line);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.007, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xedcf61 })
      );
      dot.visible = false;
      scene.add(dot);

      controller.userData.rayLine = line;
      controller.userData.hitDot = dot;
    }

    function getActiveButtons() {
      if (!vrActionPanel.visible) return [];
      return [...playButtons, exitButton].filter(b => b.visible);
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

    function handleControllerSelect(controller) {
      if (!renderer.xr.isPresenting) return;
      const hit = intersectController(controller);
      const src = controller.userData.inputSource;

      if (hit) {
        pulseHaptic(src, 0.65, 45);
        const action = hit.object.userData.action;
        if (action === 'pass') callbacks.onVerdict?.(true);
        else if (action === 'reject') callbacks.onVerdict?.(false);
        else if (action === 'flip') callbacks.onFlip?.();
        else if (action === 'tilt') callbacks.onTilt?.();
        else if (action === 'exit-vr') exitVR();
        return;
      }

      if (controller === activeRightController) {
        pulseHaptic(src, 0.35, 28);
        callbacks.onToggleUV?.();
      } else if (controller === activeLeftController) {
        pulseHaptic(src, 0.35, 28);
        callbacks.onFlip?.();
      }
    }

    function reconcileControllers(session) {
      const sources = Array.from(session?.inputSources || []);
      activeRightController = null;
      activeRightGrip = null;
      activeLeftController = null;
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
        if (renderer.xr.isPresenting && controller === activeRightController) toggleTorchHold();
      });

      scene.add(controller);
      scene.add(grip);
      return controller;
    });

    renderer.xr.addEventListener('sessionstart', () => {
      const session = renderer.xr.getSession();
      vrHUDPanel.visible = true;
      if (session) {
        reconcileControllers(session);
        session.addEventListener('inputsourceschange', () => reconcileControllers(session));
      }
      callbacks.onSessionStart?.();
    });

    renderer.xr.addEventListener('sessionend', () => {
      if (uvTorchMesh && torchIsHeld) dropTorchToWorld();
      activeRightController = null;
      activeRightGrip = null;
      activeLeftController = null;
      activeLeftInputSource = null;
      activeRightInputSource = null;
      xrControllers.forEach(c => {
        c.userData.inputSource = null;
        if (c.userData.rayLine) c.userData.rayLine.visible = false;
        if (c.userData.hitDot) c.userData.hitDot.visible = false;
      });
      vrActionPanel.visible = false;
      vrHUDPanel.visible = false;
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

    function updatePanelMode(mode) {
      if (!renderer.xr.isPresenting || mode === 'hidden') {
        vrActionPanel.visible = false;
        return;
      }
      vrActionPanel.visible = true;
      const playing = mode === 'playing';
      playButtons.forEach(b => { b.visible = playing; });
      exitButton.visible = mode === 'finished';
    }

    function drawWrappedText(ctx, text, x, startY, maxWidth, lineHeight, maxLines) {
      const chars = /[\u4e00-\u9fff]/.test(text) ? [...text] : text.split(' ');
      const sep = /[\u4e00-\u9fff]/.test(text) ? '' : ' ';
      let line = '';
      let y = startY;
      let count = 0;
      for (const token of chars) {
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

    function updateHUD({ timeText, timeRemaining, score, streak, noteNumber, noteCount, denomination, feedback, finished, endReason }) {
      const ctx = vrHUDContext;
      const w = vrHUDCanvas.width, h = vrHUDCanvas.height;
      const zh = isZh();

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      const x = 18, y = 18, pw = w - 36, ph = h - 36, r = 34;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + pw - r, y);
      ctx.quadraticCurveTo(x + pw, y, x + pw, y + r);
      ctx.lineTo(x + pw, y + ph - r);
      ctx.quadraticCurveTo(x + pw, y + ph, x + pw - r, y + ph);
      ctx.lineTo(x + r, y + ph);
      ctx.quadraticCurveTo(x, y + ph, x, y + ph - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(20, 21, 25, 0.94)';
      ctx.fill();
      ctx.strokeStyle = '#4f4944';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#e52521';
      ctx.fillRect(x + r, y, pw - r * 2, 10);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 38px "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#f3efe5';
      ctx.fillText(zh ? '01 / 真假钞票大考验 · VR' : '01 / SPOT THE FAKE CASH · VR', 64, 86);

      ctx.font = 'bold 46px "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = timeRemaining <= 15 ? '#ff7b72' : '#edcf61';
      ctx.fillText((zh ? '时间 ' : 'TIME ') + timeText, 64, 174);

      ctx.fillStyle = '#f3efe5';
      ctx.fillText((zh ? '得分 ' : 'SCORE ') + score + ' / 100', 440, 174);

      ctx.font = 'bold 34px "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#c8c2b9';
      const denomTag = denomination ? ` · ${denomination}` : '';
      const noteLine = zh
        ? `第 ${noteNumber} / ${noteCount} 张${denomTag}   ·   连对 ${streak}`
        : `Note ${noteNumber} / ${noteCount}${denomTag}   ·   Streak ${streak}`;
      ctx.fillText(noteLine, 64, 248);

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(64, 294);
      ctx.lineTo(w - 64, 294);
      ctx.stroke();

      if (feedback) {
        ctx.font = 'bold 40px "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = feedback.correct ? '#56d364' : '#ff7b72';
        const title = feedback.correct
          ? (zh ? '判断正确  +10 分' : 'Correct  +10')
          : (zh ? '判断错误  +0 分' : 'Wrong  +0');
        ctx.fillText(title, 64, 348);

        ctx.font = '28px "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#f3efe5';
        const reason = zh ? (feedback.reasonZh || feedback.reason) : feedback.reason;
        drawWrappedText(ctx, reason, 64, 412, w - 128, 38, 3);
      } else if (finished) {
        ctx.font = 'bold 42px "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#edcf61';
        const doneHead = endReason === 'time'
          ? (zh ? '时间到！本轮结束' : 'Time is up!')
          : (zh ? '本轮完成！' : 'Round complete!');
        ctx.fillText(doneHead, 64, 355);

        ctx.font = '30px "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#f3efe5';
        ctx.fillText(
          zh ? '点击下方“退出 VR”即可查看完整复盘与成绩。' : 'Point at EXIT VR below to view your full forensic review.',
          64, 424
        );
      } else {
        ctx.font = '27px "Microsoft YaHei", Arial, sans-serif';
        ctx.fillStyle = '#b9b2a8';
        ctx.fillText(
          zh ? '左手摇杆：旋转钞票  ·  左手扳机：翻面' : 'Left stick: rotate note  ·  Left trigger: flip note',
          64, 356
        );
        ctx.fillText(
          zh ? '右手摇杆：缩放  ·  右手扳机：开关紫外灯 / 确认按钮' : 'Right stick: zoom  ·  Right trigger: UV / click buttons',
          64, 414
        );
        ctx.fillText(
          zh ? '右手握把键：拿起或放下紫外手电筒' : 'Right grip: hold or drop the UV torch',
          64, 472
        );
      }
      ctx.restore();
      vrHUDTexture.needsUpdate = true;
    }

    function updateFrame() {
      if (!renderer.xr.isPresenting) return;

      if (stage.banknoteMesh && activeRightInputSource) {
        const [, zoomAxisY] = readStickAxes(activeRightInputSource);
        if (Math.abs(zoomAxisY) > 0.18) {
          stage.setZoom(stage.zoom + (-zoomAxisY * 0.024));
        }
      }

      if (stage.banknoteMesh && activeLeftInputSource) {
        const [xAxis, yAxis] = readStickAxes(activeLeftInputSource);
        const deadzone = 0.14;
        const speed = 0.045;
        if (Math.abs(xAxis) > deadzone || Math.abs(yAxis) > deadzone) {
          stage.rotateNote(
            Math.abs(xAxis) > deadzone ? xAxis * speed : 0,
            Math.abs(yAxis) > deadzone ? yAxis * speed : 0
          );
        }
      }

      for (const b of [...playButtons, exitButton]) b.userData.hovered = false;

      for (const controller of xrControllers) {
        const line = controller.userData.rayLine;
        const dot = controller.userData.hitDot;
        if (line) line.visible = true;
        const hit = intersectController(controller);
        if (hit) {
          hit.object.userData.hovered = true;
          if (dot) {
            dot.position.copy(hit.point);
            dot.visible = true;
          }
          if (line) line.material.color.setHex(0xedcf61);
        } else {
          if (dot) dot.visible = false;
          if (line) line.material.color.setHex(0x93c5fd);
        }
      }

      for (const b of [...playButtons, exitButton]) {
        const target = b.userData.hovered ? 1.09 : 1.0;
        const next = b.scale.x + (target - b.scale.x) * 0.25;
        b.scale.set(next, next, 1);
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
          ? (isZh() ? '当前浏览器不支持 WebXR，请在支持 VR 的头显或浏览器（HTTPS / localhost）中打开。' : 'WebXR is unavailable in this browser. Open on a VR headset browser over HTTPS or localhost.')
          : (isZh() ? '未检测到沉浸式 VR 设备，你仍可在桌面模式下完整体验。' : 'No immersive VR headset detected. You can play the full challenge in desktop mode.');
        callbacks.onStatus?.(msg);
        return false;
      }
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      });
      await renderer.xr.setSession(session);
      return true;
    }

    async function exitVR() {
      const session = renderer.xr.getSession();
      if (session) await session.end();
    }

    return {
      updateHUD,
      updatePanelMode,
      refreshButtonLabels,
      updateFrame,
      checkSupport,
      enterVR,
      exitVR,
      get isPresenting() { return renderer.xr.isPresenting; }
    };
  }

  root.FakeCashVR = { createVR };
})(globalThis);
