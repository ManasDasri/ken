import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A white gallery. Scrolling walks the camera along one wall: first a sculpture, then each
// work in its own pool of light. The page's scroll is the only clock for the walk.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const WALL = new THREE.Color('#d9d5ce');
const scene = new THREE.Scene();
scene.background = WALL;
scene.fog = new THREE.Fog(WALL, 12, 30);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

// ---- loading: the count on the curtain follows the textures ----
const manager = new THREE.LoadingManager();
const count = document.getElementById('loader-n');
let shown = 0, target = 0;
manager.onProgress = (_, done, total) => (target = Math.round((done / total) * 100));
const counting = setInterval(() => {
  shown += Math.max(1, Math.ceil((target - shown) * 0.2));
  shown = Math.min(shown, target);
  count.textContent = shown;
  if (shown >= 100) {
    clearInterval(counting);
    document.body.classList.add('loaded');
    intro = 0;
  }
}, 30);

// ---- the room ----
const WALL_Z = -6;
const room = new THREE.Group();
scene.add(room);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(240, 16), new THREE.MeshStandardMaterial({ color: WALL, roughness: 0.95 }));
wall.position.set(80, 6, WALL_Z);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 40), new THREE.MeshStandardMaterial({ color: '#9d978d', roughness: 0.32, metalness: 0.08 }));
floor.rotation.x = -Math.PI / 2;
floor.position.set(80, 0, 10);
// a thin shadow gap where the wall meets the floor, as galleries have
const gap = new THREE.Mesh(new THREE.PlaneGeometry(240, 0.05), new THREE.MeshBasicMaterial({ color: '#6f6a62' }));
gap.position.set(80, 0.025, WALL_Z + 0.01);
room.add(wall, floor, gap);
scene.add(new THREE.HemisphereLight('#ffffff', '#8a8378', 0.55));
const sun = new THREE.DirectionalLight('#fff6ea', 0.55);
sun.position.set(-4, 10, 6);
scene.add(sun);

// soft pools of light, painted once
const poolTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 110, 4, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,248,232,0.95)');
  grad.addColorStop(0.45, 'rgba(255,246,226,0.35)');
  grad.addColorStop(1, 'rgba(255,246,226,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
})();
const pool = (w, h) =>
  new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 }));

// ---- the sculpture: a polished pebble on a plinth ----
const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.15, 1.1), new THREE.MeshStandardMaterial({ color: '#f4f2ee', roughness: 0.9 }));
plinth.position.set(1.6, 0.575, -3.3);
const pebbleGeo = new THREE.IcosahedronGeometry(0.55, 48);
{
  // lumpy, like a river stone: a few smooth waves pushed through the sphere, once
  const p = pebbleGeo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const d = 1 + 0.12 * Math.sin(n.x * 3.1 + 1.3) * Math.cos(n.y * 2.7) + 0.08 * Math.sin(n.z * 4.3 + n.x * 2.1) + 0.05 * Math.cos(n.y * 6.0 + 0.4);
    v.copy(n).multiplyScalar(0.55 * d);
    v.y *= 0.82;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  pebbleGeo.computeVertexNormals();
}
const pebble = new THREE.Mesh(
  pebbleGeo,
  new THREE.MeshPhysicalMaterial({ color: '#d8d6d2', metalness: 1, roughness: 0.12, iridescence: 0.55, iridescenceIOR: 1.5, clearcoat: 1, clearcoatRoughness: 0.08 })
);
pebble.position.set(1.6, 1.62, -3.3);
const sculpturePool = pool(5, 6);
sculpturePool.position.set(1.6, 2.6, WALL_Z + 0.02);
scene.add(plinth, pebble, sculpturePool);

// ---- the works ----
const labels = [...document.querySelectorAll('.label')];
const loader = new THREE.TextureLoader(manager);
const SPACING = 7.5, FIRST = 9, ART_W = 3.2, ART_H = 2;
const frameMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.55, metalness: 0.1 });
const matMat = new THREE.MeshStandardMaterial({ color: '#fbfaf8', roughness: 0.95 });
const works = labels.map((el, i) => {
  const x = FIRST + i * SPACING;
  const g = new THREE.Group();
  g.position.set(x, 1.85, WALL_Z + 0.06);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(ART_W + 0.62, ART_H + 0.62, 0.08), frameMat);
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(ART_W + 0.5, ART_H + 0.5), matMat);
  mat.position.z = 0.041;
  const tex = loader.load(el.dataset.img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const art = new THREE.Mesh(new THREE.PlaneGeometry(ART_W, ART_H), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  art.position.z = 0.043;
  g.add(frame, mat, art);
  const light = pool(7, 6);
  light.position.set(x, 2.5, WALL_Z + 0.02);
  scene.add(g, light);
  return { x, g, light };
});
manager.onLoad = () => (target = 100);

// ---- the walk ----
// stop 0 is the sculpture; stop i is work i. The camera lingers at each stop: the easing's
// slope is zero at whole numbers.
const stops = [0, ...works.map((w) => w.x)];
const linger = (t) => t - Math.sin(2 * Math.PI * t) / (2 * Math.PI);
const walkX = (p) => {
  const k = Math.min(Math.floor(p), stops.length - 2);
  return THREE.MathUtils.lerp(stops[k], stops[k + 1], linger(p - k));
};

const walk = document.querySelector('.walk');
const countN = document.getElementById('count-n');
let p = 0, smooth = 0, intro = reduce ? 0 : 1, mx = 0, my = 0, sx = 0, sy = 0, camZ = 7;

function progress() {
  const r = walk.getBoundingClientRect();
  const span = walk.offsetHeight - innerHeight;
  return THREE.MathUtils.clamp(-r.top / span, 0, 1) * (stops.length - 1);
}
let offX = 0, offY = 0;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // stand far enough back that a framed work fits the width, on phones too
  const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  const dist = Math.max(7.6, ((ART_W + 0.62) * 1.2) / (2 * half));
  camZ = WALL_Z + dist;
  // wide screens: the work sits left of centre, the label on the right; tall ones: work up top
  offX = camera.aspect > 1 ? dist * half * 0.3 : 0;
  offY = camera.aspect < 1 ? -dist * 0.09 : 0;
  // on a tall screen the walk starts square in front of the sculpture
  stops[0] = camera.aspect < 1 ? pebble.position.x : 0;
  camera.updateProjectionMatrix();
}
resize();
addEventListener('resize', resize);
addEventListener('pointermove', (e) => {
  mx = (e.clientX / innerWidth) * 2 - 1;
  my = (e.clientY / innerHeight) * 2 - 1;
});

let active = -1;
function updateLabels(q) {
  const i = Math.round(q);
  const near = Math.abs(q - i) < 0.32;
  const next = near && i > 0 ? i - 1 : -1;
  if (next !== active) {
    labels.forEach((el, k) => el.classList.toggle('on', k === next));
    active = next;
  }
  document.body.classList.toggle('walking', q > 0.35);
  countN.textContent = String(Math.max(1, Math.min(labels.length, Math.round(q)))).padStart(2, '0');
}

// only draw while the room is on screen
let visible = true;
new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(walk);

const look = new THREE.Vector3();
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  p = progress();
  updateLabels(p);
  if (!visible || document.hidden) return;

  const k = reduce ? 1 : 1 - Math.pow(0.0015, dt);
  smooth += (p - smooth) * k;
  sx += (mx - sx) * k * 0.6;
  sy += (my - sy) * k * 0.6;
  intro = Math.max(0, intro - dt * 0.45);

  const x = walkX(smooth);
  const e = intro * intro * (3 - 2 * intro);
  camera.position.set(x + offX + sx * 0.5 - e * 1.5, 1.75 + offY - sy * 0.18 + e * 0.4, camZ + e * 4);
  look.set(x + offX + sx * 0.25, 1.75 + offY - sy * 0.08, WALL_Z);
  camera.lookAt(look);

  if (!reduce) {
    pebble.rotation.y += dt * 0.25;
    pebble.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.15 + sy * 0.2;
    pebble.rotation.z = sx * 0.2;
  }
  // the work in front of you leans out of the wall a touch toward the light
  for (const w of works) {
    const d = Math.abs(w.x - x) / SPACING;
    const lit = Math.max(0, 1 - d * 1.6);
    w.light.material.opacity = 0.12 + 0.38 * lit;
    w.g.position.z = WALL_Z + 0.06 + lit * 0.05;
  }
  renderer.render(scene, camera);
}
frame();
