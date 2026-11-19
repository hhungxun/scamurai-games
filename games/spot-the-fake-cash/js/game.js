(() => {
  'use strict';

  let scene, camera, renderer;
  let banknoteMesh, uvTorchMesh, spotLight, torchBeamCone, banknoteMaterial;
  const $ = id => document.getElementById(id);
  const { BANKNOTE_SETS, DURATION_MS, NOTE_COUNT, Round } = FakeCashCore;
  const booth = window.parent !== window ? window.parent.ScamuraiBooth : null;
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  const FEEDBACK_MS = 1700;
  const MIN_BANKNOTE_ZOOM = 1;
  const MAX_BANKNOTE_ZOOM = 2.6;
  const ZOOM_STEP = 0.15;
  const DESKTOP_TORCH_POSITION = [0.25, 1.18, -0.18];
  const noteTextures = new Map();
  const fallbackTextures = new Map();
  let textureLoader;
  let round = null;
  let gameTimerInterval;
  let feedback = null;
  let initialized = false;
  let isUVOn = true;
  let vrHUDCanvas, vrHUDTexture, vrHUDContext, vrHUDPanel;
  let banknoteZoom = 1;
  let flip = null;

  function setStatus(message) {
    $('status').textContent = message;
    $('vr-status').textContent = message;
    $('vr-status').hidden = !message;
  }

  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const secs = safe % 60;
    return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function updateGameDisplays() {
    const timeRemaining = Math.ceil((round?.remainingMs() ?? DURATION_MS) / 1000);
    const timeText = formatTime(timeRemaining);
    const score = round?.score ?? 0;
    const streak = round?.streak ?? 0;
    const noteNumber = Math.min(NOTE_COUNT, (round?.index ?? 0) + (feedback ? 0 : 1));
    const noteText = 'Note ' + noteNumber + ' / ' + NOTE_COUNT;
    $('time-display').textContent = timeText;
    $('time-display').classList.toggle('warning', timeRemaining <= 15);
    $('score-display').textContent = 'Score ' + score + ' / 100';
    $('streak-display').textContent = 'Streak ' + streak;
    $('note-display').textContent = noteText;
    setVerdictAvailability();
    if (vrHUDContext && vrHUDTexture) {
      const ctx = vrHUDContext;
      const w = vrHUDCanvas.width, h = vrHUDCanvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      const x = 20, y = 20, pw = w - 40, ph = h - 40, r = 42;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + pw - r, y);
      ctx.quadraticCurveTo(x + pw, y, x + pw, y + r);
      ctx.lineTo(x + pw - 18, y + ph - r);
      ctx.quadraticCurveTo(x + pw - 18, y + ph, x + pw - r - 18, y + ph);
      ctx.lineTo(x + r + 18, y + ph);
      ctx.quadraticCurveTo(x + 18, y + ph, x + 18, y + ph - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = '#242221';
      ctx.fill();
      ctx.strokeStyle = '#e52521';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.fillStyle = '#f3efe5';
      ctx.fillText('01 / SPOT THE FAKE CASH', 78, 94);
      ctx.font = 'bold 43px Arial, sans-serif';
      ctx.fillStyle = timeRemaining <= 15 ? '#ff8e88' : '#edcf61';
      ctx.fillText('TIME  ' + timeText, 78, 184);
      ctx.fillText('SCORE  ' + score + ' / 100', 390, 184);
      ctx.fillStyle = '#f3efe5';
      ctx.fillText(noteText + '     ·     Streak ' + streak, 78, 267);
      if (feedback) {
        ctx.fillStyle = feedback.correct ? '#edcf61' : '#ff8e88';
        ctx.fillText(feedback.correct ? 'Correct  +10' : 'Wrong  +0', 78, 363);
        ctx.font = '30px Arial, sans-serif';
        const words = feedback.reason.split(' ');
        let line = '';
        let y = 420;
        for (const word of words) {
          if (ctx.measureText(line + word).width > 744) {
            ctx.fillText(line, 78, y);
            line = '';
            y += 40;
          }
          line += word + ' ';
        }
        ctx.fillText(line, 78, y);
      } else if (round?.status === 'finished') {
        ctx.fillText(round.endReason === 'time' ? 'Time is up' : 'Round complete', 78, 363);
        ctx.font = '30px Arial, sans-serif';
        ctx.fillText('Exit VR to review your verdicts.', 78, 420);
      }
      ctx.restore();
      vrHUDTexture.needsUpdate = true;
    }
  }

  function setVerdictAvailability() {
    const enabled = round?.status === 'playing' && !feedback;
    $('pass-btn').disabled = !enabled;
    $('reject-btn').disabled = !enabled;
    setVRActionPanelVisible(enabled && renderer.xr.isPresenting);
  }

  function saveProgress() {
    try {
      booth?.update(window, round.snapshot());
    } catch (error) {
      setStatus('Progress could not be saved on this laptop: ' + error.message);
    }
  }

  function endGame() {
    clearInterval(gameTimerInterval);
    gameTimerInterval = null;
    updateGameDisplays();
    try {
      booth?.finish(window, round.snapshot(), round.score);
    } catch (error) {
      setStatus('Could not send the score to the booth: ' + error.message);
    }
    if (!feedback) showResults();
  }

  function showResults() {
    const answered = round.index;
    const accuracy = answered ? Math.round(round.correct * 100 / answered) : 0;
    $('result-title').textContent = round.endReason === 'time' ? 'Time is up' : 'Round complete';
    $('result-score').textContent = round.score + ' / 100';
    $('result-accuracy').textContent = accuracy + '% accuracy · ' + round.correct + ' correct out of ' +
      answered + ' judged · ' + (NOTE_COUNT - answered) + ' unjudged';
    $('review-list').replaceChildren(...round.review().map(({ note, choice, correct }) => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      const verdict = note.isReal ? 'genuine' : 'fake';
      const answer = choice === undefined ? 'Unjudged' : (correct ? 'Correct' : 'Wrong') +
        ' · You chose ' + (choice ? 'PASS' : 'REJECT');
      title.textContent = answer + ' · ' + note.name + ' was ' + verdict;
      item.append(title, note.reason);
      return item;
    }));
    $('action-bar').hidden = true;
    $('result-overlay').hidden = false;
    $('result-title').focus();
  }

  function showRound() {
    $('start-overlay').hidden = true;
    if (round.status === 'finished') {
      updateGameDisplays();
      showResults();
      return;
    }
    if (round.expire()) {
      endGame();
      return;
    }

    buildBanknote(round.note);
    $('action-bar').hidden = false;
    setStatus('Drag the note or torch · Scroll or pinch to zoom');
    updateGameDisplays();
    renderer.domElement.focus();
    gameTimerInterval = setInterval(() => {
      if (round.expire()) endGame();
      else updateGameDisplays();
    }, 200);
  }

  function startGame() {
    if (!initialized || round) return;
    if (!booth && !demo) {
      setStatus('Open the station page to choose a participant.');
      return;
    }
    round = new Round();
    saveProgress();
    showRound();
  }

  function showFatalError(error) {
    console.error(error);
    const panel = $('error-panel');
    panel.hidden = false;
    panel.textContent = 'The 3D scene could not start. Check that the browser has WebGL enabled.\n' +
      (error.message || error);
  }

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

    const ink = uvMode ? '#9e86ed' : '#337379';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 984, 472);
    ctx.strokeRect(32, 32, 960, 448);
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.ellipse(778, 248, 182, 90, i * Math.PI / 24, 0, 2 * Math.PI);
      ctx.stroke();
    }

    ctx.fillStyle = uvMode ? '#f6b7fc' : '#164a56';
    ctx.font = 'bold 108px sans-serif';
    ctx.fillText('50', 68, 180);
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(label, 72, 280);
    ctx.font = '26px sans-serif';
    ctx.fillText('PLACEHOLDER TEXTURE', 72, 405);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  async function preloadNoteTextures() {
    const names = new Set(BANKNOTE_SETS.flatMap(note => [note.frontDay, note.frontUV, note.backDay, note.backUV]));
    await Promise.all([...names].map(async name => {
      let url;
      try {
        const response = await fetch('./assets/notes/' + encodeURIComponent(name));
        if (!response.ok) return;
        url = URL.createObjectURL(await response.blob());
        const texture = await textureLoader.loadAsync(url);
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        noteTextures.set(name, texture);
      } catch {
        // Unavailable or unreadable files use a labeled placeholder.
      } finally {
        if (url) URL.revokeObjectURL(url);
      }
    }));
    if (noteTextures.size < names.size) {
      $('asset-status').textContent = 'RM50 images missing or unreadable (' + (names.size - noteTextures.size) +
        ' / ' + names.size + '). Placeholders demonstrate the controls. Some clues may be unavailable.';
      $('asset-status').hidden = false;
    }
  }

  function noteTexture(name, label, uvMode) {
    if (noteTextures.has(name)) return noteTextures.get(name);
    if (!fallbackTextures.has(label)) {
      fallbackTextures.set(label, makeFallbackTexture(label, uvMode));
    }
    return fallbackTextures.get(label);
  }

  function buildBanknote(set) {
    const frontDayTex = noteTexture(set.frontDay, 'RM50 front', false);
    const frontUVTex  = noteTexture(set.frontUV, 'RM50 front / UV', true);
    const backDayTex  = noteTexture(set.backDay, 'RM50 back', false);
    const backUVTex   = noteTexture(set.backUV, 'RM50 back / UV', true);

    banknoteMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tFrontDay: { value: frontDayTex },
        tFrontUV:  { value: frontUVTex },
        tBackDay:  { value: backDayTex },
        tBackUV:   { value: backUVTex },
        uLightPos: { value: new THREE.Vector3(0, 1.2, 0) },
        uLightDir: { value: new THREE.Vector3(0, 0, -1) },
        uIsUVOn: { value: isUVOn ? 1.0 : 0.0 },
        uSpotAngle: { value: Math.cos(Math.PI / 6) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
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
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          bool isFront = gl_FrontFacing;
          // Mirror horizontal UVs so the back texture reads correctly from behind.
          vec2 backUv = vec2(1.0 - vUv.x, vUv.y);
          vec4 dayTex = isFront ? texture2D(tFrontDay, vUv) : texture2D(tBackDay, backUv);
          vec4 uvTex  = isFront ? texture2D(tFrontUV, vUv)   : texture2D(tBackUV, backUv);

          vec3 lightToPos = normalize(vWorldPosition - uLightPos);
          float cosAngle = dot(lightToPos, normalize(uLightDir));
          float spotFactor = 0.0;
          if (cosAngle > uSpotAngle && uIsUVOn > 0.5) {
            spotFactor = smoothstep(uSpotAngle, min(1.0, uSpotAngle + 0.12), cosAngle);
          }

          gl_FragColor = vec4(mix(dayTex.rgb, uvTex.rgb, spotFactor), dayTex.a);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }
      `,
      side: THREE.DoubleSide
    });

    if (banknoteMesh) {
      banknoteMesh.material.dispose();
      banknoteMesh.geometry.dispose();
      scene.remove(banknoteMesh);
    }
    banknoteMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), banknoteMaterial);
    banknoteMesh.position.set(0, 1.12, -0.48);
    banknoteMesh.rotation.set(0, 0, 0);
    banknoteZoom = 1;
    banknoteMesh.scale.setScalar(banknoteZoom);
    scene.add(banknoteMesh);
    flip = null;
  }

  function setBanknoteZoom(nextZoom) {
    if (!banknoteMesh) return;
    banknoteZoom = THREE.MathUtils.clamp(nextZoom, MIN_BANKNOTE_ZOOM, MAX_BANKNOTE_ZOOM);
    banknoteMesh.scale.setScalar(banknoteZoom);
  }

  function changeBanknoteZoom(amount) {
    setBanknoteZoom(banknoteZoom + amount);
  }

  function buildUVTorch() {
    uvTorchMesh = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.18, 20),
      new THREE.MeshStandardMaterial({ color: 0x343a40, metalness: 0.75, roughness: 0.28 })
    );
    body.rotation.x = Math.PI / 2;
    uvTorchMesh.add(body);

    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.025, 0.035, 20),
      new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.8, roughness: 0.25 })
    );
    head.rotation.x = Math.PI / 2;
    head.position.z = -0.095;
    uvTorchMesh.add(head);

    spotLight = new THREE.SpotLight(0x9d4edd, 5, 2.5, Math.PI / 6, 0.35, 1);
    spotLight.position.set(0, 0, -0.11);
    spotLight.target.position.set(0, 0, -1);
    uvTorchMesh.add(spotLight);
    uvTorchMesh.add(spotLight.target);

    torchBeamCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.65, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })
    );

    torchBeamCone.rotation.x = Math.PI / 2;
    torchBeamCone.position.z = -0.43;
    uvTorchMesh.add(torchBeamCone);

    uvTorchMesh.position.set(...DESKTOP_TORCH_POSITION);
    scene.add(uvTorchMesh);
    applyUVState();
  }

  let xrControllers = [];
  let torchIsHeld = false;
  let activeRightGrip = null;
  let activeRightController = null;
  let activeLeftInputSource = null;
  let activeRightInputSource = null;

  let vrActionButtons = [];
  const controllerRaycasters = new Map();
  const tempMatrix = new THREE.Matrix4();

  function createVRHUD() {
    vrHUDCanvas = document.createElement('canvas');
    vrHUDCanvas.width = 900;
    vrHUDCanvas.height = 560;
    vrHUDContext = vrHUDCanvas.getContext('2d');
    vrHUDTexture = new THREE.CanvasTexture(vrHUDCanvas);
    vrHUDTexture.encoding = THREE.sRGBEncoding;
    const material = new THREE.MeshBasicMaterial({
      map: vrHUDTexture, transparent: true, side: THREE.DoubleSide
    });
    // Keep the HUD anchored behind the banknote in world space.
    vrHUDPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.51), material);
    vrHUDPanel.name = 'Banknote inspection HUD';
    vrHUDPanel.position.set(0, 1.55, -1.02);
    vrHUDPanel.renderOrder = 10;
    scene.add(vrHUDPanel);
    vrHUDPanel.visible = true;
    updateGameDisplays();
  }

  function attachTorchToRightHand() {
    if (!activeRightGrip) return;
    activeRightGrip.add(uvTorchMesh);

    uvTorchMesh.position.set(0, -0.075, -0.18);
    uvTorchMesh.rotation.set(0, 0, 0);
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
      setStatus('Torch dropped. Squeeze the right grip to pick it up.');
    } else {
      attachTorchToRightHand();
      setStatus('Torch held. Pull the trigger to toggle UV or squeeze to drop it.');
    }
  }

  function makeVRButtonTexture(label, background, border) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.strokeStyle = border;
    ctx.lineWidth = 14;
    const radius = 34;
    ctx.beginPath();
    ctx.moveTo(radius, 8);
    ctx.lineTo(512 - radius, 8);
    ctx.quadraticCurveTo(504, 8, 504, 8 + radius);
    ctx.lineTo(504, 220 - radius);
    ctx.quadraticCurveTo(504, 212, 512 - radius, 212);
    ctx.lineTo(radius, 212);
    ctx.quadraticCurveTo(8, 212, 8, 220 - radius);
    ctx.lineTo(8, 8 + radius);
    ctx.quadraticCurveTo(8, 8, radius, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 76px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 256, 112);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function createVRActionButtons() {
    const panel = new THREE.Group();
    panel.name = 'VR verdict buttons';

    panel.position.set(0, 0.99, -0.30);

    const buttonDefs = [
      { label: 'PASS', choice: true, x: -0.145, color: '#238636', border: '#56d364' },
      { label: 'REJECT', choice: false, x: 0.145, color: '#b62324', border: '#ff7b72' }
    ];

    vrActionButtons = buttonDefs.map(def => {
      const material = new THREE.MeshBasicMaterial({
        map: makeVRButtonTexture(def.label, def.color, def.border),
        transparent: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.105), material);
      mesh.position.set(def.x, 0, 0);
      mesh.userData.isVRActionButton = true;
      mesh.userData.choice = def.choice;
      mesh.userData.baseScale = mesh.scale.clone();
      panel.add(mesh);
      return mesh;
    });

    panel.visible = false;
    scene.add(panel);
    return panel;
  }

  let vrActionPanel = null;

  function setVRActionPanelVisible(visible) {
    if (vrActionPanel) vrActionPanel.visible = visible;
  }

  function createControllerRay(controller) {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -2.5)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x8bd5ff, transparent: true, opacity: 0.85 })
    );
    line.name = 'VR controller ray';
    line.visible = false;
    controller.add(line);
    controller.userData.rayLine = line;
    controllerRaycasters.set(controller, new THREE.Raycaster());
  }

  function getControllerButtonHit(controller) {
    if (!controller || !vrActionPanel?.visible) return null;
    const raycaster = controllerRaycasters.get(controller);
    if (!raycaster) return null;

    controller.updateMatrixWorld(true);
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    const origin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
    const direction = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix).normalize();
    raycaster.set(origin, direction);
    raycaster.far = 3.0;

    const hits = raycaster.intersectObjects(vrActionButtons, false);
    return hits.length ? hits[0].object : null;
  }

  function handleControllerSelect(controller) {
    if (!renderer.xr.isPresenting) return;
    const hitButton = getControllerButtonHit(controller);

    if (hitButton) {
      evaluateChoice(hitButton.userData.choice);
      return;
    }

    if (controller === activeRightController) {
      toggleUVLight();
    } else {
      setStatus('Aim at PASS or REJECT, then pull the trigger.');
    }
  }

  function assignControllers(session) {
    const sources = Array.from(session.inputSources || []);

    activeRightController = null;
    activeRightGrip = null;
    activeLeftInputSource = null;
    activeRightInputSource = null;

    sources.forEach((source, i) => {
      if (source.handedness === 'right') {
        activeRightController = xrControllers[i] || null;
        activeRightGrip = activeRightController ? activeRightController.userData.grip : null;
        activeRightInputSource = source;
      } else if (source.handedness === 'left') {
        activeLeftInputSource = source;
      }
    });

    if (!activeRightController) {
      const index = sources.findIndex(source => source.handedness === 'none');
      activeRightController = xrControllers[index] || null;
      activeRightGrip = activeRightController?.userData.grip ?? null;
      activeRightInputSource = sources[index] ?? null;
    }
    if (!activeLeftInputSource) activeLeftInputSource = sources.find(source => source !== activeRightInputSource) || null;

    if (torchIsHeld && uvTorchMesh.parent !== activeRightGrip) dropTorchToWorld();
    if (activeRightGrip && !torchIsHeld) attachTorchToRightHand();
    setVerdictAvailability();
    setStatus('Left stick rotates · Right stick zooms · Right trigger toggles UV');
  }

  function setupXRControllers() {
    xrControllers = [0, 1].map(index => {
      const inputController = renderer.xr.getController(index);
      const grip = renderer.xr.getControllerGrip(index);
      inputController.userData.grip = grip;
      createControllerRay(inputController);

      inputController.addEventListener('selectstart', () => {
        if (renderer.xr.isPresenting) handleControllerSelect(inputController);
      });

      inputController.addEventListener('squeezestart', () => {
        if (renderer.xr.isPresenting && inputController === activeRightController) {
          toggleTorchHold();
        }
      });

      scene.add(inputController);
      scene.add(grip);
      return inputController;
    });

    renderer.xr.addEventListener('sessionstart', () => {
      const session = renderer.xr.getSession();
      if (session) {
        assignControllers(session);
        if (vrHUDPanel) vrHUDPanel.visible = true;
        session.addEventListener('inputsourceschange', () => assignControllers(session));
      }
    });

    renderer.xr.addEventListener('sessionend', () => {
      if (uvTorchMesh && torchIsHeld) dropTorchToWorld();
      activeRightGrip = null;
      activeRightController = null;
      activeLeftInputSource = null;
      activeRightInputSource = null;
      xrControllers.forEach(c => {
        if (c.userData.rayLine) c.userData.rayLine.visible = false;
      });
      setVRActionPanelVisible(false);
      if (vrHUDPanel) vrHUDPanel.visible = true;
      uvTorchMesh.position.set(...DESKTOP_TORCH_POSITION);
      uvTorchMesh.rotation.set(0, 0, 0);
      setStatus('Drag the note or torch · Scroll or pinch to zoom');
    });
  }

  function applyUVState() {
    if (spotLight) spotLight.visible = isUVOn;
    if (torchBeamCone) torchBeamCone.visible = isUVOn;
    if (banknoteMaterial) banknoteMaterial.uniforms.uIsUVOn.value = isUVOn ? 1.0 : 0.0;
    $('uv-label').textContent = isUVOn ? 'UV on' : 'UV off';
    $('uv-btn').setAttribute('aria-pressed', String(isUVOn));
  }

  function toggleUVLight() {
    isUVOn = !isUVOn;
    applyUVState();
  }

  function flipNote() {
    if (!banknoteMesh || flip) return;
    const from = banknoteMesh.quaternion.clone();
    const halfTurn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    flip = { start: performance.now(), from, to: from.clone().multiply(halfTurn) };
  }

  function rotateNote(dx, dy) {
    if (!banknoteMesh || flip) return;
    banknoteMesh.rotation.y += dx;
    banknoteMesh.rotation.x += dy;
  }

  function setupDesktopInteraction() {
    const dom = renderer.domElement;
    const pointers = new Map();
    const ray = new THREE.Raycaster();
    let dragTarget = null;

    function pinchDistance() {
      const [first, second] = pointers.values();
      return Math.hypot(first.x - second.x, first.y - second.y);
    }

    dom.addEventListener('wheel', event => {
      if (renderer.xr.isPresenting) return;
      event.preventDefault();
      changeBanknoteZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    }, { passive: false });

    dom.addEventListener('pointerdown', event => {
      if (renderer.xr.isPresenting || event.button !== 0) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      dom.setPointerCapture(event.pointerId);
      if (pointers.size !== 1) {
        dragTarget = null;
        return;
      }
      const bounds = dom.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      const y = 1 - (event.clientY - bounds.top) / bounds.height * 2;
      ray.setFromCamera({ x, y }, camera);
      const hitsNote = ray.intersectObject(banknoteMesh).length > 0;
      const hitsTorch = ray.intersectObject(uvTorchMesh, true).some(hit => hit.object !== torchBeamCone);
      dragTarget = hitsTorch || (!hitsNote && x >= 0) ? 'torch' : 'note';
    });

    dom.addEventListener('pointermove', event => {
      const previous = pointers.get(event.pointerId);
      if (!previous || renderer.xr.isPresenting) return;
      const before = pointers.size === 2 ? pinchDistance() : 0;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2 && before > 0) {
        setBanknoteZoom(banknoteZoom * pinchDistance() / before);
        return;
      }
      if (pointers.size !== 1) return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      if (dragTarget === 'note') {
        rotateNote(dx * 0.008, dy * 0.008);
      } else if (dragTarget === 'torch') {
        const scale = 0.0015 * 600 / dom.clientHeight;
        uvTorchMesh.position.x = THREE.MathUtils.clamp(uvTorchMesh.position.x + dx * scale, -0.60, 0.60);
        uvTorchMesh.position.y = THREE.MathUtils.clamp(uvTorchMesh.position.y - dy * scale, 0.89, 1.50);
      }
    });

    const stopDrag = event => {
      if (!pointers.delete(event.pointerId)) return;
      dragTarget = null;
    };
    dom.addEventListener('pointerup', stopDrag);
    dom.addEventListener('pointercancel', stopDrag);
    dom.addEventListener('lostpointercapture', stopDrag);
    window.addEventListener('blur', () => { pointers.clear(); dragTarget = null; });
    window.addEventListener('keydown', handleKey);
  }

  function handleKey(event) {
    if (!round || round.status !== 'playing' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
    switch (event.code) {
      case 'Space': if (!event.repeat) toggleUVLight(); break;
      case 'KeyF': if (!event.repeat) flipNote(); break;
      case 'KeyP':
      case 'ArrowLeft': if (!event.repeat) evaluateChoice(true); break;
      case 'KeyR':
      case 'ArrowRight': if (!event.repeat) evaluateChoice(false); break;
      case 'Equal':
      case 'NumpadAdd': changeBanknoteZoom(ZOOM_STEP); break;
      case 'Minus':
      case 'NumpadSubtract': changeBanknoteZoom(-ZOOM_STEP); break;
      case 'Digit0':
      case 'Numpad0': setBanknoteZoom(1); break;
      case 'ArrowUp':
      case 'KeyW': rotateNote(0, -0.14); break;
      case 'ArrowDown':
      case 'KeyS': rotateNote(0, 0.14); break;
      case 'KeyA': rotateNote(-0.14, 0); break;
      case 'KeyD': rotateNote(0.14, 0); break;
    }
  }

  async function enterVR() {
    if (!booth && !demo) {
      setStatus('Open the station page to choose a participant.');
      return;
    }
    if (!navigator.xr) {
      setStatus('WebXR requires a supported browser and localhost or HTTPS.');
      return;
    }
    $('enter-vr-btn').disabled = true;
    $('start-game-btn').disabled = true;
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!supported) {
        setStatus('This device does not support immersive VR.');
        return;
      }
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      });
      await renderer.xr.setSession(session);
      if (!round) startGame();
      setStatus('Aim and trigger to judge · Right grip picks up or drops the torch');
    } catch (error) {
      setStatus('Could not enter VR: ' + (error.message || error));
    } finally {
      $('enter-vr-btn').disabled = false;
      $('start-game-btn').disabled = false;
    }
  }

  function evaluateChoice(userChoice) {
    if (!round || feedback || round.status !== 'playing') return;
    feedback = round.answer(userChoice);
    if (!feedback) {
      endGame();
      return;
    }

    const card = $('feedback');
    $('feedback-title').textContent = feedback.correct ? 'Correct · +10' : 'Wrong · +0';
    $('feedback-reason').textContent = feedback.reason;
    card.dataset.correct = String(feedback.correct);
    card.hidden = false;
    updateGameDisplays();

    if (round.status === 'finished') endGame();
    else saveProgress();

    setTimeout(() => {
      feedback = null;
      card.hidden = true;
      if (round.status === 'finished') {
        updateGameDisplays();
        showResults();
      } else if (round.expire()) {
        endGame();
      } else {
        buildBanknote(round.note);
        updateGameDisplays();
      }
    }, FEEDBACK_MS);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    const narrower = Math.max(1, 0.85 / camera.aspect);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(Math.PI / 6) * narrower));
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function readStickAxes(inputSource) {
    if (!inputSource || !inputSource.gamepad || !inputSource.gamepad.axes) return [0, 0];
    const axes = inputSource.gamepad.axes;


    let x = 0, y = 0;
    if (axes.length >= 4) {
      // Prefer thumbstick axes, then fall back to the touchpad.
      const pairA = [Number(axes[0]) || 0, Number(axes[1]) || 0];
      const pairB = [Number(axes[2]) || 0, Number(axes[3]) || 0];
      const magB = Math.abs(pairB[0]) + Math.abs(pairB[1]);
      [x, y] = magB > 0.08 ? pairB : pairA;
    } else if (axes.length >= 2) {
      x = Number(axes[0]) || 0;
      y = Number(axes[1]) || 0;
    }
    return [x, y];
  }

  function animate() {
    if (flip) {
      const progress = Math.min(1, (performance.now() - flip.start) / 380);
      banknoteMesh.quaternion.slerpQuaternions(flip.from, flip.to, progress * progress * (3 - 2 * progress));
      if (progress >= 1) flip = null;
    }
    if (renderer.xr.isPresenting) {
      if (banknoteMesh && activeRightInputSource) {
        const [, zoomAxisY] = readStickAxes(activeRightInputSource);
        if (Math.abs(zoomAxisY) > 0.18) {
          setBanknoteZoom(banknoteZoom + (-zoomAxisY * 0.025));
        }
      }

      if (banknoteMesh && activeLeftInputSource) {
        const [xAxis, yAxis] = readStickAxes(activeLeftInputSource);
        const deadzone = 0.14;
        const rotationSpeed = 0.045;
        if (Math.abs(xAxis) > deadzone || Math.abs(yAxis) > deadzone) {
          rotateNote(
            Math.abs(xAxis) > deadzone ? xAxis * rotationSpeed : 0,
            Math.abs(yAxis) > deadzone ? yAxis * rotationSpeed : 0
          );
        }
      }

      xrControllers.forEach(controller => {
        if (controller.userData.rayLine) controller.userData.rayLine.visible = true;
      });
    }

    if (banknoteMaterial && uvTorchMesh) {
      const worldPos = new THREE.Vector3();
      spotLight.getWorldPosition(worldPos);
      banknoteMaterial.uniforms.uLightPos.value.copy(worldPos);

      const worldDir = new THREE.Vector3(0, 0, -1).applyQuaternion(
        uvTorchMesh.getWorldQuaternion(new THREE.Quaternion())
      );
      banknoteMaterial.uniforms.uLightDir.value.copy(worldDir).normalize();
    }

    renderer.render(scene, camera);
  }

  async function init() {
    try {
      if (!window.THREE) throw new Error('The local Three.js library could not load.');
      textureLoader = new THREE.TextureLoader();

      const container = $('canvas-container');
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x171616);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 1.42, 0.85);
      camera.lookAt(0, 1.12, -0.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.xr.enabled = true;
      container.appendChild(renderer.domElement);
      renderer.domElement.tabIndex = -1;
      renderer.domElement.setAttribute('aria-label', '3D banknote inspection area');
      onWindowResize();

      scene.add(new THREE.HemisphereLight(0xffffff, 0x303040, 1.0));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(2, 4, 2);
      scene.add(dirLight);

      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.05, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x252b35, roughness: 0.65 })
      );
      desk.position.set(0, 0.88, -0.55);
      scene.add(desk);

      buildUVTorch();
      await preloadNoteTextures();
      buildBanknote(BANKNOTE_SETS[0]);
      vrActionPanel = createVRActionButtons();
      createVRHUD();
      setupXRControllers();
      setupDesktopInteraction();

      $('flip-btn').addEventListener('click', flipNote);
      $('again-btn').textContent = demo ? 'Play again' : 'Next participant';
      $('again-btn').addEventListener('click', () => {
        if (demo && booth) booth.restartDemo(window);
        else if (booth) booth.next(window);
        else location.reload();
      });
      $('uv-btn').addEventListener('click', toggleUVLight);
      $('pass-btn').addEventListener('click', () => evaluateChoice(true));
      $('reject-btn').addEventListener('click', () => evaluateChoice(false));
      $('zoom-in-btn').addEventListener('click', () => changeBanknoteZoom(ZOOM_STEP));
      $('zoom-out-btn').addEventListener('click', () => changeBanknoteZoom(-ZOOM_STEP));
      $('zoom-reset-btn').addEventListener('click', () => setBanknoteZoom(1));
      $('enter-vr-btn').addEventListener('click', enterVR);
      $('start-game-btn').addEventListener('click', startGame);
      updateGameDisplays();
      window.addEventListener('resize', onWindowResize);

      renderer.setAnimationLoop(animate);
      initialized = true;
      const snapshot = booth?.snapshot(window);
      if (snapshot?.version === 1 && snapshot.status === 'finished') {
        $('start-overlay').hidden = true;
        $('result-title').textContent = 'Round complete';
        $('result-accuracy').textContent = 'This round used an earlier version. The booth header shows its saved result.';
        $('review-list').previousElementSibling.hidden = true;
        $('review-list').hidden = true;
        $('result-overlay').hidden = false;
      } else if (snapshot?.version === 2) {
        round = Round.restore(snapshot);
        showRound();
      } else {
        $('start-game-btn').disabled = false;
        $('enter-vr-btn').disabled = false;
      }
    } catch (error) {
      showFatalError(error);
    }
  }

  window.addEventListener('load', init);
})();
