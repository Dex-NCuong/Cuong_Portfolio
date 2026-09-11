/**
 * ==========================================================================
 * DAO NHAT CUONG - TECHNICAL ARTIST & UE5 DEVELOPER PORTFOLIO JAVASCRIPT
 * Features:
 *  1. Interactive Niagara GPU Particle Field (Three.js)
 *  2. Real-time Weather Shader Simulator (Three.js Custom Procedural PBR Shader)
 *  3. Procedural Web Audio API Sound Effects (Zero External Audio Files)
 *  4. 3D Card Perspective Tilt with Dynamic Lighting
 *  5. Complete Bilingual Engine (Vietnamese & English)
 *  6. Video Modal & Interactive HUD Elements
 * ==========================================================================
 */

// Global State
const state = {
  lang: localStorage.getItem('nc_lang') || 'vi',
  sfxEnabled: localStorage.getItem('nc_sfx') !== 'false',
  audioCtx: null,
  shaderParams: {
    wetness: 0.45,
    snow: 0.30,
    freeze: 0.20
  }
};

/* ==========================================================================
   1. PROCEDURAL WEB AUDIO SFX (Sci-Fi / Game Engine UI Audio)
   ========================================================================== */
function initAudio() {
  if (!state.audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      state.audioCtx = new AudioContext();
    }
  }
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }
}

function playSound(type) {
  if (!state.sfxEnabled) return;
  initAudio();
  if (!state.audioCtx) return;

  const ctx = state.audioCtx;
  const now = ctx.currentTime;

  try {
    if (type === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.04);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'preset') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

/* ==========================================================================
   2. NIAGARA GPU PARTICLE BACKGROUND (THREE.JS)
   ========================================================================== */
function initNiagaraParticles() {
  const canvas = document.getElementById('niagara-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle geometry
  const particleCount = 650;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  // Palette: Cyan, Violet, Emerald
  const palette = [
    new THREE.Color(0x00f5ff),
    new THREE.Color(0xa855f7),
    new THREE.Color(0x00ff9d),
    new THREE.Color(0x38bdf8)
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    scales[i] = Math.random() * 2.5 + 1.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Circular point texture
  const pointCanvas = document.createElement('canvas');
  pointCanvas.width = 64;
  pointCanvas.height = 64;
  const pctx = pointCanvas.getContext('2d');
  const gradient = pctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  pctx.fillStyle = gradient;
  pctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(pointCanvas);

  const material = new THREE.PointsMaterial({
    size: 1.8,
    vertexColors: true,
    map: texture,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Mouse parallax interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.025;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.025;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    particles.rotation.y += 0.0015;
    particles.rotation.x += 0.0008;

    camera.position.x = targetX * 0.6;
    camera.position.y = -targetY * 0.6;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
}

/* ==========================================================================
   3. REALTIME WEATHER SHADER LAB (THREE.JS CUSTOM SHADER MATERIAL)
   Simulates Dao Nhat Cuong's TA_Test MPC Weather Shader!
   ========================================================================== */
let shaderUniforms = null;
let shaderMesh = null;

function initShaderLab() {
  const canvas = document.getElementById('shader-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 440;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x223344, 1.2);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x00f5ff, 2.5);
  keyLight.position.set(3, 4, 3);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xa855f7, 2.0);
  rimLight.position.set(-3, -2, -2);
  scene.add(rimLight);

  // Custom Weather Shader
  shaderUniforms = {
    uTime: { value: 0 },
    uWetness: { value: state.shaderParams.wetness },
    uSnow: { value: state.shaderParams.snow },
    uFreeze: { value: state.shaderParams.freeze }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uWetness;
    uniform float uSnow;
    uniform float uFreeze;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;

    // Simple pseudo-random & noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), f.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y);
    }

    void main() {
      // Base Rock Albedo
      vec3 rockColor = vec3(0.12, 0.14, 0.18);
      float rockNoise = noise(vUv * 16.0);
      rockColor += vec3(rockNoise * 0.06);

      // Light direction & simple NdotL
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.6));
      float NdotL = max(dot(vNormal, lightDir), 0.0);

      // 1. Wetness effect (darkens albedo, sharpens specular reflections)
      vec3 wetRock = rockColor * (1.0 - uWetness * 0.45);
      vec3 viewDir = normalize(-vPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      float specPower = mix(16.0, 128.0, uWetness);
      float specStrength = mix(0.15, 1.2, uWetness);
      float spec = pow(max(dot(vNormal, halfDir), 0.0), specPower) * specStrength;

      // 2. Snow Accumulation (upward-facing world normal)
      float upFactor = max(dot(vWorldNormal, vec3(0.0, 1.0, 0.0)), 0.0);
      float snowNoise = noise(vUv * 24.0 + vec2(uTime * 0.02));
      float snowMask = smoothstep(1.0 - uSnow * 1.2, 1.0 - uSnow * 0.4, upFactor + (snowNoise - 0.5) * 0.4);
      snowMask = clamp(snowMask, 0.0, 1.0);
      vec3 snowColor = vec3(0.92, 0.96, 1.0);

      // 3. Freezing / Frost Crystals
      float frostPattern = noise(vUv * 40.0) * noise(vUv * 12.0);
      float frostMask = smoothstep(0.3, 0.7, frostPattern * uFreeze * 2.0);
      vec3 frostColor = vec3(0.4, 0.85, 1.0); // Cyan-ice tint

      // Material Blending (MPC emulation)
      vec3 finalColor = mix(wetRock, frostColor, frostMask * uFreeze * 0.7);
      finalColor = mix(finalColor, snowColor, snowMask);

      // Add lighting & specular
      finalColor = finalColor * (0.3 + NdotL * 0.8) + vec3(spec * (1.0 - snowMask * 0.7));

      // Rim glow for tech art effect
      float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
      rim = pow(rim, 3.0);
      vec3 rimColor = mix(vec3(0.0, 0.9, 1.0), vec3(0.7, 0.3, 1.0), uFreeze);
      finalColor += rimColor * rim * 0.5;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const customMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: shaderUniforms
  });

  // Geometry: high detail Icosahedron / Distorted Sphere for rock boulder look
  const geometry = new THREE.IcosahedronGeometry(1.5, 32);
  
  // Subtle organic deformation for rock boulder feel
  const posAttr = geometry.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const dist = Math.sin(x * 3.0) * Math.cos(y * 3.0) * Math.sin(z * 3.0) * 0.08;
    posAttr.setXYZ(i, x + x * dist, y + y * dist, z + z * dist);
  }
  geometry.computeVertexNormals();

  shaderMesh = new THREE.Mesh(geometry, customMaterial);
  scene.add(shaderMesh);

  // Drag interaction to rotate mesh
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !shaderMesh) return;
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;

    shaderMesh.rotation.y += deltaX * 0.008;
    shaderMesh.rotation.x += deltaY * 0.008;

    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  // Touch controls for mobile
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || !shaderMesh || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePos.x;
    const deltaY = e.touches[0].clientY - prevMousePos.y;

    shaderMesh.rotation.y += deltaX * 0.008;
    shaderMesh.rotation.x += deltaY * 0.008;

    prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('touchend', () => { isDragging = false; });

  // Handle Resize for Shader Canvas
  function resizeShaderCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resizeShaderCanvas);

  // FPS Counter simulation
  const fpsEl = document.getElementById('shader-fps');
  let frameCount = 0;
  let lastTime = performance.now();

  const clock = new THREE.Clock();
  function renderShader() {
    requestAnimationFrame(renderShader);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (shaderUniforms) {
      shaderUniforms.uTime.value = elapsedTime;
    }

    if (!isDragging && shaderMesh) {
      shaderMesh.rotation.y += 0.004;
    }

    renderer.render(scene, camera);

    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
      if (fpsEl) fpsEl.textContent = `${currentFps} FPS`;
      frameCount = 0;
      lastTime = now;
    }
  }
  renderShader();
}

/* ==========================================================================
   4. SHADER CONTROLS & PRESET FUNCTIONS
   ========================================================================== */
function setupShaderControls() {
  const sliderWetness = document.getElementById('slider-wetness');
  const sliderSnow = document.getElementById('slider-snow');
  const sliderFreeze = document.getElementById('slider-freeze');

  const valWetness = document.getElementById('val-wetness');
  const valSnow = document.getElementById('val-snow');
  const valFreeze = document.getElementById('val-freeze');

  if (sliderWetness) {
    sliderWetness.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.shaderParams.wetness = val;
      if (valWetness) valWetness.textContent = val.toFixed(2);
      if (shaderUniforms) shaderUniforms.uWetness.value = val;
    });
  }

  if (sliderSnow) {
    sliderSnow.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.shaderParams.snow = val;
      if (valSnow) valSnow.textContent = val.toFixed(2);
      if (shaderUniforms) shaderUniforms.uSnow.value = val;
    });
  }

  if (sliderFreeze) {
    sliderFreeze.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.shaderParams.freeze = val;
      if (valFreeze) valFreeze.textContent = val.toFixed(2);
      if (shaderUniforms) shaderUniforms.uFreeze.value = val;
    });
  }
}

window.applyWeatherPreset = function(presetName) {
  playSound('preset');
  let target = { wet: 0, snow: 0, freeze: 0 };

  if (presetName === 'rain') {
    target = { wet: 0.95, snow: 0.0, freeze: 0.1 };
    showToast(state.lang === 'vi' ? 'Đã kích hoạt kịch bản: Mưa Lớn (Heavy Rain)' : 'Preset applied: Heavy Rain');
  } else if (presetName === 'snow') {
    target = { wet: 0.2, snow: 0.9, freeze: 0.45 };
    showToast(state.lang === 'vi' ? 'Đã kích hoạt kịch bản: Bão Tuyết (Blizzard)' : 'Preset applied: Blizzard Snow');
  } else if (presetName === 'frost') {
    target = { wet: 0.1, snow: 0.35, freeze: 0.95 };
    showToast(state.lang === 'vi' ? 'Đã kích hoạt kịch bản: Đóng Băng Cực Độ (Deep Freeze)' : 'Preset applied: Deep Freeze');
  } else if (presetName === 'clear') {
    target = { wet: 0.0, snow: 0.0, freeze: 0.0 };
    showToast(state.lang === 'vi' ? 'Đã kích hoạt kịch bản: Nắng Ráo (Clear Sky)' : 'Preset applied: Clear Sky');
  }

  // Smooth transition
  animateShaderParam('wetness', target.wet, 'slider-wetness', 'val-wetness');
  animateShaderParam('snow', target.snow, 'slider-snow', 'val-snow');
  animateShaderParam('freeze', target.freeze, 'slider-freeze', 'val-freeze');
};

function animateShaderParam(paramKey, targetVal, sliderId, valId) {
  const slider = document.getElementById(sliderId);
  const label = document.getElementById(valId);
  const startVal = state.shaderParams[paramKey];
  const startTime = performance.now();
  const duration = 600; // ms for silky smooth transition

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    // Smooth easeInOutCubic: t < .5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
    const ease = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const current = startVal + (targetVal - startVal) * ease;

    state.shaderParams[paramKey] = current;
    if (slider) slider.value = current;
    if (label) label.textContent = current.toFixed(2);
    if (shaderUniforms) {
      if (paramKey === 'wetness') shaderUniforms.uWetness.value = current;
      if (paramKey === 'snow') shaderUniforms.uSnow.value = current;
      if (paramKey === 'freeze') shaderUniforms.uFreeze.value = current;
    }

    if (progress < 1.0) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

window.openShaderLabDemo = function() {
  playSound('whoosh');
  const target = document.getElementById('shader-lab');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

/* ==========================================================================
   5. 3D CARD PERSPECTIVE TILT (WITH SPECULAR LIGHTING)
   ========================================================================== */
function initCardTilt() {
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

      // Specular highlight gradient
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      card.style.backgroundImage = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0, 245, 255, 0.08) 0%, transparent 65%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.backgroundImage = '';
    });
  });
}

/* ==========================================================================
   6. BILINGUAL TRANSLATION SYSTEM (VI <-> EN)
   ========================================================================== */
const i18n = {
  vi: {
    nav_about: 'Giới Thiệu',
    nav_projects: 'Dự Án',
    nav_lab: 'Shader Lab (MPC)',
    nav_skills: 'Kỹ Năng',
    nav_experience: 'Kinh Nghiệm',
    nav_contact: 'Liên Hệ',
    hero_tagline: 'HỆ THỐNG UNREAL ENGINE 5 & PIPELINE TECH ART',
    hero_greeting: 'Xin chào, tôi là',
    hero_desc: 'Kỹ sư phần mềm định hướng <strong>Technical Artist / Game Developer</strong>. Chuyên sâu về quy trình phát triển game 3D từ A-Z trên <strong>Unreal Engine 5</strong>: lập trình hệ thống chiến thuật Blueprint/C++, tối ưu hóa tài nguyên (Lumen, Nanite), kiến trúc Shader động, Niagara VFX và Procedural Content Generation (PCG).',
    btn_explore: 'Khám Phá Dự Án',
    btn_shader_lab: 'Mô Phỏng Shader Lab',
    btn_contact: 'Liên Hệ Trực Tiếp',
    stat_sparx: 'Virtuos Studio Intern',
    stat_gpa: 'HUTECH Software Eng.',
    stat_opt: 'Zero Recompile Shaders',
    stat_eng: 'Chứng Chỉ B1 Vstep',
    holo_engine_status: 'PIPELINE AUTOMATION • LIVE VIEWPORT',
    scroll_down: 'CUỘN XUỐNG KHÁM PHÁ',
    section_about_badge: 'PROFILE & TẦM NHÌN',
    section_about_title: 'Cầu Nối Giữa Nghệ Thuật & Kỹ Thuật',
    section_about_subtitle: 'Tối ưu hóa hiệu năng đỉnh cao không đánh đổi chất lượng đồ họa thế hệ mới',
    avatar_status: 'SẴN SÀNG CHO CƠ HỘI MỚI',
    about_tag_chip: 'TECHNICAL ARTIST & UE5 DEVELOPER',
    about_heading: 'Chào bạn, tôi là Đào Nhật Cường',
    about_p1: 'Là sinh viên năm cuối chuyên ngành Kỹ thuật Phần mềm tại <strong>Đại học HUTECH</strong> với mục tiêu trở thành một <strong>Technical Artist / Game Developer</strong> chuyên nghiệp. Tôi đam mê kết hợp tư duy logic lập trình chặt chẽ với cảm quan mỹ thuật thị giác 3D.',
    about_p2: 'Với kinh nghiệm thực chiến từ khóa thực tập chuyên sâu tại <strong>Sparx* - a Virtuos Studio</strong> và các dự án cá nhân kỹ thuật cao, tôi đã làm chủ các công nghệ mới nhất của <strong>Unreal Engine 5</strong> (Lumen, Nanite, PCG, Control Rig, Shaders, Niagara VFX). Tôi tin rằng một Technical Artist giỏi chính là chìa khóa giúp studio hiện thực hóa những thế giới game kỳ vĩ với tốc độ khung hình 60+ FPS mượt mà.',
    hl1_title: 'Tối Ưu Hóa & Profiling',
    hl1_desc: 'Thành thạo công cụ profiling UE5, hạn chế draw calls, tối ưu Nanite & memory budget.',
    hl2_title: 'Quy Trình Chuẩn Studio AAA',
    hl2_desc: 'Kinh nghiệm làm việc với Perforce (P4V), Git, CI/CD pipeline và Editor Utility Wizard.',
    hl3_title: 'Shader Động & VFX Thông Minh',
    hl3_desc: 'Tận dụng Material Parameter Collections (MPC) để thay đổi thời tiết không cần biên dịch lại shader.',
    btn_hire_me: 'Hợp Tác Tuyển Dụng',
    pillar1_title: 'Pipeline Tool & C++',
    pillar1_desc: 'Xây dựng C++ Plugin tích hợp Editor Utility Wizard 5 bước, tự động hóa quy trình khởi tạo Enemy Blueprint thông qua CDO reflection, giúp Game Designer tiết kiệm 70% thời gian thiết lập.',
    pillar2_title: 'Dynamic Shaders & Tech Art',
    pillar2_desc: 'Phát triển hệ thống vật liệu thời tiết thời gian thực (độ ẩm ướt, tích tụ tuyết, đóng băng) điều khiển hoàn toàn bằng Material Parameter Collections (MPC) với 0% shader recompilation.',
    pillar3_title: 'Zero-Tick Gameplay Logic',
    pillar3_desc: 'Kiến trúc Ability System hướng sự kiện bằng ActorComponents độc lập. Quản lý toàn bộ thông qua Data Assets & Gameplay Tags, tích hợp mượt mà với Niagara VFX không tiêu tốn chu kỳ Tick.',
    pillar4_title: 'Procedural & Animation',
    pillar4_desc: 'Áp dụng Procedural Content Generation (PCG) để tạo sinh và phân bố môi trường tự nhiên, kết hợp Anim BP, Blend Spaces, MetaHuman, Control Rig và Mutable.',
    section_proj_badge: 'CÁC DỰ ÁN TIÊU BIỂU',
    section_proj_title: 'Công Nghệ & Kỹ Thuật Đã Triển Khai',
    section_proj_subtitle: 'Khám phá các giải pháp kỹ thuật, hệ thống shader và quy trình tự động hóa thực chiến',
    btn_try_live: 'Thử Nghiệm Tương Tác Ngay',
    p1_summary: 'Bộ công cụ và framework kỹ thuật toàn diện giải quyết 3 bài toán lớn trong game pipeline: tự động hóa công cụ thiết kế qua C++ plugin, hệ thống vật liệu thời tiết chuyển đổi động tức thời, và hệ thống kỹ năng gameplay hướng sự kiện tối ưu hiệu năng không sử dụng Tick.',
    p1_feat1_title: 'Pipeline Tool Development (C++ & EUW)',
    p1_feat1_desc: 'Phát triển C++ plugin tích hợp Editor Utility Wizard 5 bước. Tự động hóa toàn bộ quy trình tạo Enemy Blueprint thông qua CDO reflection, rút ngắn thời gian làm việc của team Designer.',
    p1_feat2_title: 'Dynamic Weather & Shader Tech',
    p1_feat2_desc: 'Thiết kế hệ thống master material thời tiết thời gian thực (độ ướt mặt nước, tuyết tích tụ theo độ dốc, đóng băng bề mặt) điều khiển thông qua Material Parameter Collections (MPC) với 0 shader recompilation.',
    p1_feat3_title: 'Modular Gameplay Programming (Zero-Tick)',
    p1_feat3_desc: 'Xây dựng Ability System hướng sự kiện sử dụng ActorComponents độc lập. Quản lý toàn bộ logic bằng Data Assets và Gameplay Tags, đồng bộ hoàn hảo với Niagara VFX.',
    btn_github_repo: 'Xem GitHub TA_Test',
    btn_inspect_shaders: 'Mở Shader Sandbox',
    p2_summary: 'Khóa đào tạo chuyên sâu và thực chiến quy trình phát triển game AAA trên Unreal Engine 5 tại Sparx* - a Virtuos Studio, kết thúc bằng dự án Game Jam 1 tuần với chủ đề "In Turn" & "Underdog".',
    p2_feat1_title: 'Level Design, Lighting & Sequencer',
    p2_feat1_desc: 'Thực hành chiếu sáng động với Lumen, tạo vật liệu phức hợp, dựng cinematic cutscenes với Sequencer và quản lý asset chuẩn studio qua Perforce (P4V).',
    p2_feat2_title: 'Character Tech, MetaHuman & Mutable',
    p2_feat2_desc: 'Làm việc chuyên sâu với Mixamo, MetaHuman, Control Rig tùy biến khung xương chuyển động và plugin Mutable cho hệ thống nhân vật linh hoạt.',
    p2_feat3_title: 'Game Jam Champion: Gameplay Logic, PCG & Sequencer',
    p2_feat3_desc: 'Đảm nhiệm toàn bộ Blueprint Gameplay Logic, Animation Blend Spaces, kiến trúc môi trường Procedural Content Generation (PCG) và dựng Sequencer hoàn chỉnh trong 7 ngày.',
    btn_watch_video: 'Xem Video Workshop Trên YouTube',
    section_lab_badge: 'INTERACTIVE TECH ART SANDBOX',
    section_lab_title: 'Mô Phỏng Trực Tiếp: Weather Shader (MPC)',
    section_lab_subtitle: 'Trải nghiệm thời gian thực hệ thống vật liệu thời tiết trong TA_Test. Kéo các thanh trượt bên dưới để chiêm ngưỡng vật liệu 3D phản ứng ngay lập tức mà không cần biên dịch shader!',
    hint_rotate_mesh: 'Kéo chuột để xoay khối 3D',
    lab_panel_title: 'Material Parameter Collection',
    lab_panel_desc: 'Hệ thống này ánh xạ trực tiếp cơ chế MPC trong Unreal Engine 5. Thay đổi giá trị scalar tức thì trên toàn bộ đối tượng mà không kích hoạt shader recompilation.',
    presets_label: 'Kịch Bản Nhanh (Weather Presets):',
    preset_rain: 'Mưa Rào (Heavy Rain)',
    preset_snow: 'Bão Tuyết (Blizzard)',
    preset_frost: 'Đóng Băng (Deep Freeze)',
    preset_clear: 'Nắng Ấm (Clear Sky)',
    section_skills_badge: 'NĂNG LỰC CHUYÊN MÔN',
    section_skills_title: 'Hệ Sinh Thái Kỹ Năng Kỹ Thuật',
    section_skills_subtitle: 'Sự kết hợp cân bằng giữa lập trình hệ thống, shader đồ họa và tối ưu hóa engine',
    filter_all: 'Tất Cả',
    cat_prog: 'Lập Trình & Kiến Trúc Phần Mềm',
    cat_gameplay: 'Gameplay & Animation Systems',
    cat_tools: 'Công Cụ Engine & Pipeline',
    cat_qa: 'QA, Profiling & Làm Việc Nhóm',
    section_exp_badge: 'HÀNH TRÌNH PHÁT TRIỂN',
    section_exp_title: 'Kinh Nghiệm & Học Vấn',
    section_exp_subtitle: 'Cột mốc thực tập tại studio quốc tế, đào tạo học thuật và các chứng chỉ kỹ năng',
    exp_t1: 'Thiết kế plugin C++ tích hợp Editor Utility Wizard 5 bước; tự động hóa hoàn toàn quy trình sinh Enemy Blueprint thông qua CDO reflection.',
    exp_t2: 'Xây dựng hệ thống vật liệu thời tiết thời gian thực (độ ẩm ướt, tích tụ tuyết dốc, đóng băng bề mặt) điều khiển bởi Material Parameter Collections (MPC), đảm bảo 0% shader recompile.',
    exp_t3: 'Lập trình Ability System dạng module hướng sự kiện không sử dụng Tick thông qua ActorComponents, Data Assets, Gameplay Tags và Niagara VFX.',
    exp_s1: 'Hoàn thành khóa huấn luyện chuyên sâu và thực hành trực tiếp quy trình phát triển game chuẩn studio trên Unreal Engine 5.',
    exp_s2: 'Phát triển cơ chế gameplay bằng Blueprint Visual Scripting; tích lũy kinh nghiệm thực tế về Level Design, Chiếu sáng Lumen, Tạo vật liệu và Dựng cảnh Sequencer.',
    exp_s3: 'Ứng dụng Mixamo, MetaHuman, Control Rig tùy biến khung xương và Mutable trong quy trình sáng tạo và diễn hoạt nhân vật 3D.',
    exp_s4: 'Ứng dụng Procedural Content Generation (PCG) để tạo sinh tự động và tối ưu hóa môi trường thế giới mở rộng lớn.',
    exp_s5: 'Làm quen và áp dụng triệt để quy trình quản lý dự án qua Perforce (P4V) theo chuẩn pipeline sản xuất game quốc tế.',
    exp_s6: 'Tham gia chung kết Game Jam: làm việc nhóm phát triển tựa game trong 1 tuần với chủ đề "In Turn" và "Underdog", phụ trách Blueprint Gameplay Logic, Animation Blend Spaces, PCG và Sequencer.',
    edu_degree: 'Cử Nhân Kỹ Thuật Phần Mềm',
    edu_b1: 'Nền tảng vững chắc về Cấu trúc dữ liệu & Giải thuật, Lập trình hướng đối tượng (OOP), Kiến trúc phần mềm và Kiểm thử chất lượng (QA).',
    edu_b2: 'Định hướng nghiên cứu và phát triển chuyên sâu đồ họa máy tính, Game Engine và tối ưu hóa hệ thống thời gian thực.',
    cert_desc: 'Khả năng đọc hiểu tài liệu kỹ thuật tiếng Anh chuyên ngành (Unreal Engine documentation, C++ standard libraries, HLSL shader guides) và giao tiếp hiệu quả trong môi trường làm việc studio đa quốc gia.',
    section_contact_badge: 'KẾT NỐI TRỰC TIẾP',
    section_contact_title: 'Khởi Động Dự Án Mới Cùng Tôi',
    section_contact_subtitle: 'Tôi luôn sẵn sàng cho các cơ hội Technical Artist, Game Developer toàn thời gian hoặc dự án tự do',
    contact_heading: 'Thông Tin Liên Lạc',
    contact_lead: 'Bạn đang tìm kiếm một Technical Artist hiểu sâu cả lập trình logic và mỹ thuật shader trên UE5? Hãy liên hệ ngay với tôi qua các kênh dưới đây:',
    form_title: 'Gửi Tin Nhắn Nhanh',
    form_name: 'Tên hoặc Studio của bạn:',
    form_email: 'Email liên hệ lại:',
    form_role: 'Cơ hội công việc / Dự án:',
    form_msg: 'Nội dung tin nhắn:',
    btn_send_mail: 'Gửi Tin Nhắn (Mở Email Client)'
  },
  en: {
    nav_about: 'About',
    nav_projects: 'Projects',
    nav_lab: 'Shader Lab (MPC)',
    nav_skills: 'Skills',
    nav_experience: 'Experience',
    nav_contact: 'Contact',
    hero_tagline: 'UNREAL ENGINE 5 SYSTEMS & TECH ART PIPELINE',
    hero_greeting: 'Hello, my name is',
    hero_desc: 'Senior Software Engineering student aspiring to be a <strong>Technical Artist / Game Developer</strong>. Experienced in end-to-end 3D game development on <strong>Unreal Engine 5</strong>: programming tactical Blueprint/C++ systems, optimizing assets (Lumen, Nanite), dynamic shaders, Niagara VFX, and Procedural Content Generation (PCG).',
    btn_explore: 'Explore Projects',
    btn_shader_lab: 'Interactive Shader Lab',
    btn_contact: 'Get In Touch',
    stat_sparx: 'Virtuos Studio Intern',
    stat_gpa: 'HUTECH Software Eng.',
    stat_opt: 'Zero Recompile Shaders',
    stat_eng: 'B1 Vstep English Cert',
    holo_engine_status: 'PIPELINE AUTOMATION • LIVE VIEWPORT',
    scroll_down: 'SCROLL DOWN TO EXPLORE',
    section_about_badge: 'PROFILE & VISION',
    section_about_title: 'Bridging Art & Engineering',
    section_about_subtitle: 'Delivering top-tier real-time graphics performance without compromising visual fidelity',
    avatar_status: 'OPEN FOR WORK // 2026',
    about_tag_chip: 'TECHNICAL ARTIST & UE5 DEVELOPER',
    about_heading: "Hi, I'm Dao Nhat Cuong",
    about_p1: "A senior Software Engineering student at <strong>HUTECH University</strong> aspiring to become a professional <strong>Technical Artist / Game Developer</strong>. I am passionate about uniting robust software engineering principles with high-fidelity 3D visual artistry.",
    about_p2: "With hands-on experience from an intensive internship at <strong>Sparx* - a Virtuos Studio</strong> and advanced technical projects, I have mastered the latest <strong>Unreal Engine 5</strong> technologies (Lumen, Nanite, PCG, Control Rig, Shaders, Niagara VFX). I believe a great Technical Artist is the catalyst that empowers studios to bring breathtaking worlds to life at smooth 60+ FPS.",
    hl1_title: 'Optimization & Profiling',
    hl1_desc: 'Proficient in UE5 profiling tools, minimizing draw calls, Nanite clusters & GPU memory budgeting.',
    hl2_title: 'AAA Studio Workflows',
    hl2_desc: 'Practical experience with Perforce (P4V), Git, CI/CD pipelines, and Editor Utility Wizards.',
    hl3_title: 'Dynamic Shaders & Smart VFX',
    hl3_desc: 'Leveraging Material Parameter Collections (MPC) for real-time weather transitions without shader recompiles.',
    btn_hire_me: 'Recruit / Collaborate',
    pillar1_title: 'Pipeline Tools & C++',
    pillar1_desc: 'Built a C++ plugin integrating a 5-step Editor Utility Wizard, automating Enemy Blueprint creation via CDO reflection, reducing designer setup overhead by 70%.',
    pillar2_title: 'Dynamic Shaders & Tech Art',
    pillar2_desc: 'Engineered a real-time weather material system (wetness, snow accumulation, freezing) driven by Material Parameter Collections (MPC) with zero shader recompilation.',
    pillar3_title: 'Zero-Tick Gameplay Logic',
    pillar3_desc: 'Architected an event-driven ability system using decoupled ActorComponents, managed via Data Assets and Gameplay Tags with seamless Niagara VFX integration.',
    pillar4_title: 'Procedural & Animation',
    pillar4_desc: 'Implemented Procedural Content Generation (PCG) for natural biome distribution, combined with Anim BP, Blend Spaces, MetaHuman, Control Rig, and Mutable.',
    section_proj_badge: 'FEATURED PROJECTS',
    section_proj_title: 'Proven Engineering & Visual Systems',
    section_proj_subtitle: 'Explore real-world technical solutions, dynamic shader architectures, and automation pipelines',
    btn_try_live: 'Try Live Interactive Demo',
    p1_summary: 'A comprehensive technical framework solving 3 critical challenges in modern game production: designer workflow automation via C++ EUW, real-time dynamic weather materials with zero recompilation, and a high-performance zero-tick event-driven gameplay ability system.',
    p1_feat1_title: 'Pipeline Tool Development (C++ & EUW)',
    p1_feat1_desc: 'Developed a C++ plugin integrating a 5-step Editor Utility Wizard. Automated the entire Enemy Blueprint creation process via CDO reflection, significantly accelerating the design workflow.',
    p1_feat2_title: 'Dynamic Weather & Shader Tech',
    p1_feat2_desc: 'Designed a real-time weather material system (wetness, snow accumulation, freezing) driven by Material Parameter Collections (MPC), optimizing performance with zero shader recompilation.',
    p1_feat3_title: 'Modular Gameplay Programming (Zero-Tick)',
    p1_feat3_desc: 'Built an event-driven ability system using ActorComponents. Managed logic entirely through Data Assets and Gameplay Tags, seamlessly integrated with Niagara VFX.',
    btn_github_repo: 'View TA_Test on GitHub',
    btn_inspect_shaders: 'Open Shader Sandbox',
    p2_summary: 'Intensive game development training in an AAA studio pipeline using Unreal Engine 5 at Sparx* - a Virtuos Studio, culminated in a 1-week Game Jam under the themes "In Turn" and "Underdog".',
    p2_feat1_title: 'Level Design, Lighting & Sequencer',
    p2_feat1_desc: 'Hands-on practice in dynamic Lumen lighting, complex material creation, cinematic Sequencer cutscenes, and studio-grade asset versioning via Perforce (P4V).',
    p2_feat2_title: 'Character Tech, MetaHuman & Mutable',
    p2_feat2_desc: 'Deep-dive into Mixamo, MetaHuman, custom Control Rig skeletal deformation, and the Mutable plugin for highly scalable character customization.',
    p2_feat3_title: 'Game Jam Champion: Gameplay Logic, PCG & Sequencer',
    p2_feat3_desc: 'Led Blueprint gameplay mechanics, Animation Blend Spaces, Procedural Content Generation (PCG) environment graphs, and cinematic Sequencer integration within 7 days.',
    btn_watch_video: 'Watch Workshop Video on YouTube',
    section_lab_badge: 'INTERACTIVE TECH ART SANDBOX',
    section_lab_title: 'Live Real-Time Weather Shader (MPC)',
    section_lab_subtitle: 'Interact live with the weather material system from TA_Test. Drag the sliders below to witness immediate 3D PBR surface reactions without any shader recompilation!',
    hint_rotate_mesh: 'Drag to rotate 3D mesh',
    lab_panel_title: 'Material Parameter Collection',
    lab_panel_desc: 'Directly mirrors the MPC workflow in Unreal Engine 5. Adjust scalar parameters globally across meshes with zero shader pipeline disruption.',
    presets_label: 'Weather Presets:',
    preset_rain: 'Heavy Rain',
    preset_snow: 'Blizzard Snow',
    preset_frost: 'Deep Freeze',
    preset_clear: 'Clear Sky',
    section_skills_badge: 'CORE COMPETENCIES',
    section_skills_title: 'Technical Skill Ecosystem',
    section_skills_subtitle: 'A balanced synergy of systems programming, technical shaders, and engine optimization',
    filter_all: 'All Skills',
    cat_prog: 'Programming & Architecture',
    cat_gameplay: 'Gameplay & Animation Systems',
    cat_tools: 'Engine Tools & Pipelines',
    cat_qa: 'QA, Profiling & Teamwork',
    section_exp_badge: 'CAREER TIMELINE',
    section_exp_title: 'Experience & Education',
    section_exp_subtitle: 'Studio internship milestones, academic degree, and professional certifications',
    exp_t1: 'Engineered a C++ plugin integrating a 5-step Editor Utility Wizard; automated the complete Enemy Blueprint generation pipeline via CDO reflection.',
    exp_t2: 'Designed a real-time weather material system (wetness, slope-aware snow accumulation, frost crystals) driven by Material Parameter Collections (MPC), ensuring 0% shader recompilation.',
    exp_t3: 'Programmed an event-driven, zero-tick modular Ability System using decoupled ActorComponents, Data Assets, Gameplay Tags, and Niagara VFX.',
    exp_s1: 'Completed intensive training and hands-on practice in game development using Unreal Engine 5.',
    exp_s2: 'Developed gameplay mechanics utilizing Blueprint Visual Scripting; gained practical experience in Level Design, Lumen Lighting, Material creation, and Sequencer.',
    exp_s3: 'Worked with Mixamo, MetaHuman, Control Rig, and Mutable for character creation and animation.',
    exp_s4: 'Utilized Procedural Content Generation (PCG) to build and optimize expansive open-world environments.',
    exp_s5: 'Familiarized with project management workflows using Perforce (P4V) and standard AAA game development pipelines.',
    exp_s6: 'Participated in the final Game Jam, collaborating in a team to develop a game within 1 week based on "In Turn" and "Underdog", taking charge of Blueprint Logic, Blend Spaces, PCG, and Sequencer.',
    edu_degree: 'Bachelor of Software Engineering',
    edu_b1: 'Solid grounding in Data Structures & Algorithms, Object-Oriented Programming (OOP), Software Architecture, and Quality Assurance.',
    edu_b2: 'Specialized focus in computer graphics, real-time Game Engine architecture, and performance optimization.',
    cert_desc: 'Demonstrated English proficiency in technical documentation (Unreal Engine documentation, C++ standard libraries, HLSL guides) and team collaboration in international studio environments.',
    section_contact_badge: 'DIRECT CONTACT',
    section_contact_title: 'Initiate A Connection',
    section_contact_subtitle: 'Open for full-time Technical Artist / Game Developer roles, studio collaborations, or freelance projects',
    contact_heading: 'Contact Channels',
    contact_lead: 'Looking for a Technical Artist who seamlessly connects logic, shaders, and engine performance? Get in touch with me directly through these channels:',
    form_title: 'Quick Message',
    form_name: 'Your Name or Studio:',
    form_email: 'Your Return Email:',
    form_role: 'Role / Opportunity:',
    form_msg: 'Message Content:',
    btn_send_mail: 'Send Message (Open Email Client)'
  }
};

function updateLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('nc_lang', lang);

  // Update button active states
  const viBtn = document.getElementById('lang-vi');
  const enBtn = document.getElementById('lang-en');
  if (viBtn && enBtn) {
    if (lang === 'vi') {
      viBtn.classList.add('active');
      enBtn.classList.remove('active');
    } else {
      enBtn.classList.add('active');
      viBtn.classList.remove('active');
    }
  }

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Translate all matching data-i18n elements
  const elements = document.querySelectorAll('[data-i18n]');
  const dict = i18n[lang] || i18n.vi;

  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Re-run Lucide icons in case any were inside translated elements
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setupLanguageSwitcher() {
  const toggleBtn = document.getElementById('lang-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    playSound('click');
    const newLang = state.lang === 'vi' ? 'en' : 'vi';
    updateLanguage(newLang);
    showToast(newLang === 'vi' ? 'Đã chuyển sang Tiếng Việt' : 'Switched to English');
  });

  // Initialize with stored or default language
  updateLanguage(state.lang);
}

/* ==========================================================================
   7. TYPING HERO SCRAMBLE EFFECT
   ========================================================================== */
function initHeroTyping() {
  const typedEl = document.getElementById('typed-text');
  if (!typedEl) return;

  const roles = [
    'Technical Artist',
    'Unreal Engine 5 Developer',
    'Dynamic Weather Shaders (MPC)',
    'Niagara VFX & PCG Specialist',
    'C++ / Blueprint Architecture'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typedEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 40;
    } else {
      typedEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      typingSpeed = 1800; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   8. SKILLS FILTER SYSTEM & SMOOTH SCROLL
   ========================================================================== */
window.filterSkills = function(category) {
  playSound('click');
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => {
    if (t.getAttribute('data-filter') === category) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  const grid = document.getElementById('skills-container');
  if (grid) {
    if (category === 'all') {
      grid.classList.remove('single-column');
    } else {
      grid.classList.add('single-column');
    }
  }

  const cards = document.querySelectorAll('.skill-category-card');

  // Step 1: Smoothly fade out non-matching cards
  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    const shouldShow = (category === 'all' || cat === category);

    if (!shouldShow) {
      card.classList.add('fade-out');
      card.classList.remove('fade-in');
      setTimeout(() => {
        if (card.classList.contains('fade-out')) {
          card.style.display = 'none';
        }
      }, 240);
    }
  });

  // Step 2: Smoothly pop in matching cards and cascade-animate progress bars
  setTimeout(() => {
    let cardDelay = 0;
    cards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const shouldShow = (category === 'all' || cat === category);

      if (shouldShow) {
        card.style.display = 'block';
        card.classList.remove('fade-out');
        card.classList.add('fade-in');

        // Reset and re-animate skill bars with staggered delay
        const bars = card.querySelectorAll('.skill-bar');
        bars.forEach((bar, idx) => {
          const targetWidth = bar.getAttribute('data-target-width') || bar.style.getPropertyValue('--skill-val') || '85%';
          if (!bar.getAttribute('data-target-width')) {
            bar.setAttribute('data-target-width', targetWidth);
          }

          bar.style.transition = 'none';
          bar.style.width = '0%';

          setTimeout(() => {
            bar.style.transition = `width 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 70}ms`;
            bar.style.width = targetWidth;
          }, 50 + cardDelay);
        });

        cardDelay += 80;
      }
    });
  }, 140);
};

/* Smooth Programmatic Scrolling with EaseInOutCubic */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      
      const targetEl = document.querySelector(href);
      if (!targetEl) return;

      e.preventDefault();
      playSound('whoosh');

      const navHeight = 76;
      const targetY = Math.max(0, targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 15);
      const startY = window.pageYOffset;
      const distance = targetY - startY;
      const duration = Math.min(850, Math.max(450, Math.abs(distance) * 0.35));
      let startTime = null;

      function step(now) {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // EaseInOutCubic
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startY + distance * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          try {
            history.pushState(null, null, href);
          } catch (e) {}
        }
      }

      requestAnimationFrame(step);
    });
  });
}

/* ==========================================================================
   9. VIDEO MODAL (SPARX* WORKSHOP)
   ========================================================================== */
window.openVideoModal = function(videoId) {
  playSound('whoosh');
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('youtube-player');
  if (modal && iframe) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
};

window.closeVideoModal = function() {
  playSound('click');
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('youtube-player');
  if (modal && iframe) {
    iframe.src = '';
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

// Close modal on backdrop click or Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVideoModal();
  }
});

const videoModal = document.getElementById('video-modal');
if (videoModal) {
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeVideoModal();
    }
  });
}

/* ==========================================================================
   10. CLIPBOARD & TOAST NOTIFICATION
   ========================================================================== */
let toastTimeout = null;
window.showToast = function(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
};

window.copyToClipboard = function(text, successMsg) {
  playSound('click');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
};

function fallbackCopy(text, msg) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast(msg);
}

/* ==========================================================================
   11. CONTACT FORM HANDLER
   ========================================================================== */
window.handleContactSubmit = function(event) {
  event.preventDefault();
  playSound('click');

  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const role = document.getElementById('contact-role').value;
  const msg = document.getElementById('contact-msg').value;

  const subject = encodeURIComponent(`[Portfolio Opportunity] ${role} - From ${name}`);
  const body = encodeURIComponent(`Hi Dao Nhat Cuong,\n\nMy name: ${name}\nStudio / Contact: ${email}\nRole: ${role}\n\nMessage:\n${msg}\n\nBest regards,\n${name}`);

  window.location.href = `mailto:daonhatcuong2004@gmail.com?subject=${subject}&body=${body}`;

  showToast(state.lang === 'vi' ? 'Đang mở trình gửi email của bạn...' : 'Opening email client...');
};

/* ==========================================================================
   12. CUSTOM CURSOR & HOVER MAGNET
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Ring follows with smooth damping
  function updateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Hover states for interactive items
  const interactives = document.querySelectorAll('a, button, input, textarea, .contact-item, .video-thumbnail-container');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      playSound('hover');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
    });
  });
}

/* ==========================================================================
   13. SCROLL SPY & REVEAL ANIMATIONS
   ========================================================================== */
function initScrollObserver() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));

  // Navbar scroll background change
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   14. MOBILE MENU & SFX TOGGLE
   ========================================================================== */
function setupMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    playSound('click');
    menu.classList.toggle('open');
  });

  // Close when clicking nav link
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  });
}

function setupSfxToggle() {
  const btn = document.getElementById('sfx-toggle');
  const icon = document.getElementById('sfx-icon');
  if (!btn) return;

  function updateIcon() {
    if (state.sfxEnabled) {
      btn.classList.add('active');
      if (icon) icon.setAttribute('data-lucide', 'volume-2');
    } else {
      btn.classList.remove('active');
      if (icon) icon.setAttribute('data-lucide', 'volume-x');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  updateIcon();

  btn.addEventListener('click', () => {
    state.sfxEnabled = !state.sfxEnabled;
    localStorage.setItem('nc_sfx', state.sfxEnabled);
    updateIcon();
    if (state.sfxEnabled) {
      playSound('click');
      showToast(state.lang === 'vi' ? 'Đã bật hiệu ứng âm thanh UI' : 'Audio SFX Enabled');
    } else {
      showToast(state.lang === 'vi' ? 'Đã tắt hiệu ứng âm thanh UI' : 'Audio SFX Muted');
    }
  });
}

/* ==========================================================================
   INITIALIZATION ON DOM READY
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // System Setup
  setupLanguageSwitcher();
  setupSfxToggle();
  setupMobileMenu();
  initHeroTyping();
  initCustomCursor();
  initCardTilt();
  initScrollObserver();
  initSmoothScroll();

  // 3D Canvas Systems
  initNiagaraParticles();
  initShaderLab();
  setupShaderControls();

  console.log("%c[SYSTEM]%c Dao Nhat Cuong - Unreal Engine 5 Tech Art Portfolio loaded.", "color: #00f5ff; font-weight: bold;", "color: #94a3b8;");
});
