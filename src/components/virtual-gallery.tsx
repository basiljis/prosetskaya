import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Artwork, Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import { CEIL, EYE, layoutRoom, type Hung } from "@/lib/exhibition-layout";

const CAM_DIST = 2.8;

function useArtTexture(url: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    const l = new THREE.TextureLoader(); l.setCrossOrigin("anonymous");
    l.load(url, (t) => { if (!alive) return; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; setTex(t); }, undefined, () => undefined);
    return () => { alive = false; };
  }, [url]);
  return tex;
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/** Soft warm pool of light that a ceiling spot would cast on the wall — baked, so no per-painting lights. */
/** Wall wash of a ceiling track spot: a cone from above with a soft scalloped top edge and a hotspot over the work — baked, so no per-painting lights. */
function useGlow() {
  return useMemo(() => canvasTex(256, 512, (g) => {
    const img = g.createImageData(256, 512), px = img.data;
    for (let y = 0; y < 512; y++) for (let x = 0; x < 256; x++) {
      const dx = (x - 128) / 128, dy = (y + 90) / 512;
      const ang = Math.abs(dx) / (0.12 + dy * 0.7);
      const edge = Math.min(1, Math.max(0, (1 - ang) / 0.35)); const cone = edge * edge * (3 - 2 * edge);
      const hot = Math.exp(-((dx * dx) / 0.28 + ((y - 300) / 512) ** 2 / 0.05));
      const top = Math.min(1, y / 50), bottom = Math.pow(Math.min(1, (512 - y) / 300), 1.5), side = Math.max(0, 1 - dx * dx);
      const v = (cone * 0.26 + hot * 0.34) * top * bottom * side;
      const i = (y * 256 + x) * 4; px[i] = 255; px[i + 1] = 248; px[i + 2] = 236; px[i + 3] = Math.round(Math.min(1, v) * 255);
    }
    g.putImageData(img, 0, 0);
  }), []);
}

function wrapAll(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = []; let line = "";
  for (const word of text.split(/\s+/)) { const t = line ? `${line} ${word}` : word; if (g.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t; }
  if (line) out.push(line); return out;
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = []; let line = "";
  for (const word of text.split(/\s+/)) { const t = line ? `${line} ${word}` : word; if (g.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t; }
  if (line) out.push(line); return out.slice(0, 3);
}

/** Museum wall label: title (with a red dot when sold), year, medium, size — printed on a matte card. */
function useLabel(work: Artwork, lang: Lang) {
  return useMemo(() => canvasTex(640, 400, (g) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 640, 400);
    const sold = work.sourceAvailability === "sold";
    let x = 44, y = 62;
    g.fillStyle = "#1c1a18"; g.font = "500 30px 'Helvetica Neue', Arial, sans-serif";
    g.fillText(lang === "ru" ? "Юлия Просецкая" : "Yulia Prosetskaya", x, y); y += 52;
    g.font = "italic 600 38px 'Helvetica Neue', Arial, sans-serif";
    const lines = wrap(g, work[lang], sold ? 520 : 552).slice(0, 2);
    lines.forEach((l, i) => {
      if (i === 0 && sold) { g.fillStyle = "#c8102e"; g.beginPath(); g.arc(x + 11, y - 13, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = "#1c1a18"; g.fillText(l, x + 36, y); }
      else g.fillText(l, x, y);
      y += 48;
    });
    g.font = "400 30px 'Helvetica Neue', Arial, sans-serif"; g.fillStyle = "#4a4641"; y += 8;
    for (const t of [work.year, lang === "ru" ? work.mediumRu : work.mediumEn, work.size].filter(Boolean)) { for (const l of wrap(g, t, 552).slice(0, 2)) { g.fillText(l, x, y); y += 40; } }
    if (sold) { g.fillStyle = "#c8102e"; g.font = "500 24px 'Helvetica Neue', Arial, sans-serif"; g.fillText(lang === "ru" ? "ПРОДАНО" : "SOLD", x, 372); }
  }), [work, lang]);
}

function Painting({ hung, work, lang, glow, onPick }: { hung: Hung; work: Artwork; lang: Lang; glow: THREE.Texture; onPick: () => void }) {
  const tex = useArtTexture(work.image);
  const label = useLabel(work, lang);
  const depth = 0.04, fw = 0.018;
  const ly = Math.max(-hung.h / 2 + 0.08, -0.2);
  return <group position={[hung.x + hung.nx * 0.005, EYE, hung.z + hung.nz * 0.005]} rotation={[0, hung.rotY, 0]}>
    {/* baked spotlight pool from the track light above */}
    <mesh position={[0, (CEIL - EYE) - (CEIL - EYE + hung.h / 2 + 0.7) / 2, 0.002]}><planeGeometry args={[hung.w * 1.5 + 1.6, (CEIL - EYE + hung.h / 2 + 0.7)]} /><meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
    {/* soft contact shadow below the canvas */}
    <mesh position={[0.02, -0.07, 0.003]}><planeGeometry args={[hung.w + 0.14, hung.h + 0.14]} /><meshBasicMaterial color="#2a241e" transparent opacity={0.06} depthWrite={false} /></mesh>
    {/* slim black shadow-gap frame, gallery style */}
    <mesh position={[0, 0, depth / 2]} castShadow><boxGeometry args={[hung.w + fw * 2, hung.h + fw * 2, depth]} /><meshStandardMaterial color="#1b1a19" roughness={0.6} /></mesh>
    <mesh position={[0, 0, depth + 0.001]} onClick={(e) => { e.stopPropagation(); onPick(); }} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      <planeGeometry args={[hung.w, hung.h]} />
      {tex ? <meshStandardMaterial key="art" map={tex} roughness={0.7} envMapIntensity={0.3} /> : <meshStandardMaterial key="blank" color="#d8d3cb" />}
    </mesh>
    {/* wall label */}
    <mesh position={[hung.w / 2 + 0.32, ly, 0.006]} onClick={(e) => { e.stopPropagation(); onPick(); }}><boxGeometry args={[0.32, 0.2, 0.006]} /><meshStandardMaterial map={label} emissiveMap={label} emissive="#ffffff" emissiveIntensity={0.45} roughness={0.95} /></mesh>
  </group>;
}

/** Camera: glides to the selected work; dragging switches to free walking (horizontal = turn, vertical = step forward/back). */
function Rig({ target, bounds, resetKey }: { target: THREE.Vector3 & { look?: THREE.Vector3 }; bounds: { x: number; zMin: number; zMax: number }; resetKey: number }) {
  const { camera, gl } = useThree();
  const look = useRef(new THREE.Vector3(0, EYE, -5));
  const free = useRef(false);
  const yaw = useRef(0);
  const pos = useRef(new THREE.Vector3());
  useEffect(() => { free.current = false; }, [target, resetKey]);
  useEffect(() => {
    const el = gl.domElement; let down: { x: number; y: number } | null = null; let moved = false;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; moved = false; };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!free.current) { const d = new THREE.Vector3(); camera.getWorldDirection(d); yaw.current = Math.atan2(d.x, d.z); pos.current.copy(camera.position); free.current = true; }
      moved = true; down = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * 0.005;
      const step = dy * 0.008; // drag down = walk forward
      pos.current.x += Math.sin(yaw.current) * step; pos.current.z += Math.cos(yaw.current) * step;
      pos.current.x = Math.max(-bounds.x, Math.min(bounds.x, pos.current.x));
      pos.current.z = Math.max(bounds.zMin, Math.min(bounds.zMax, pos.current.z));
      el.style.cursor = "grabbing";
    };
    const onUp = (e: PointerEvent) => { if (moved) e.stopPropagation(); down = null; el.style.cursor = "grab"; };
    // Swallow the click that ends a drag so it doesn't select a painting.
    const onClick = (e: MouseEvent) => { if (moved) { e.stopPropagation(); moved = false; } };
    const onWalk = (e: Event) => {
      const { x, z } = (e as CustomEvent<{ x: number; z: number }>).detail;
      if (!free.current) { const d = new THREE.Vector3(); camera.getWorldDirection(d); yaw.current = Math.atan2(d.x, d.z); }
      free.current = true;
      pos.current.set(Math.max(-bounds.x, Math.min(bounds.x, x)), EYE, Math.max(bounds.zMin, Math.min(bounds.zMax, z)));
    };
    window.addEventListener("gallery-walk", onWalk);
    const walk = (step: number) => {
      if (!free.current) { const d = new THREE.Vector3(); camera.getWorldDirection(d); yaw.current = Math.atan2(d.x, d.z); pos.current.copy(camera.position); free.current = true; }
      pos.current.x = Math.max(-bounds.x, Math.min(bounds.x, pos.current.x + Math.sin(yaw.current) * step));
      pos.current.z = Math.max(bounds.zMin, Math.min(bounds.zMax, pos.current.z + Math.cos(yaw.current) * step));
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); walk(-Math.max(-1, Math.min(1, e.deltaY / 100)) * 0.35); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowUp") { e.preventDefault(); walk(0.4); } if (e.key === "ArrowDown") { e.preventDefault(); walk(-0.4); } };
    el.addEventListener("wheel", onWheel, { passive: false }); window.addEventListener("keydown", onKey);
    el.style.cursor = "grab"; el.style.touchAction = "none";
    el.addEventListener("pointerdown", onDown); window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); el.addEventListener("click", onClick, true);
    return () => { el.removeEventListener("pointerdown", onDown); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); el.removeEventListener("click", onClick, true); window.removeEventListener("gallery-walk", onWalk); el.removeEventListener("wheel", onWheel); window.removeEventListener("keydown", onKey); };
  }, [camera, gl, bounds]);
  useFrame((_, d) => {
    const dt = Math.min(d, 0.05);
    if (free.current) {
      const k = 1 - Math.exp(-3 * dt);
      camera.position.lerp(new THREE.Vector3(pos.current.x, EYE, pos.current.z), k);
      look.current.lerp(new THREE.Vector3(camera.position.x + Math.sin(yaw.current), EYE, camera.position.z + Math.cos(yaw.current)), k);
    } else {
      const k = 1 - Math.exp(-2.4 * dt);
      camera.position.lerp(target, k);
      look.current.lerp(target.look!, k);
    }
    camera.lookAt(look.current);
  });
  return null;
}

export function VirtualGallery({ works, lang, index, onIndex, distance = 1, resetKey = 0, hallName = "" }: { works: readonly Artwork[]; lang: Lang; index: number; onIndex: (i: number) => void; distance?: number; resetKey?: number; hallName?: string }) {
  const room = useMemo(() => layoutRoom(works), [works]);
  const { width: W, depth: D, hung: hungs } = room;
  const FRONT = 1.6; // entrance wall behind the starting viewpoint
  const len = D + FRONT, midZ = (FRONT - D) / 2;
  const glow = useGlow();
  const ring = useRef<THREE.Mesh>(null);
  // Museum-style introductory wall text: artist name and a short statement, painted on the entrance wall.
  const intro = useMemo(() => canvasTex(1024, 1100, (g) => {
    const c = copy[lang]; g.textBaseline = "alphabetic";
    g.fillStyle = "#24272a"; g.font = "300 104px 'Helvetica Neue', Arial, sans-serif";
    g.fillText(c.firstName, 0, 120); g.fillText(c.lastName, 0, 240);
    g.fillStyle = "#e8742a"; g.fillRect(0, 290, 120, 8);
    let y = 380; g.fillStyle = "#2b2e31"; g.font = "italic 300 40px 'Helvetica Neue', Arial, sans-serif";
    for (const l of wrap(g, c.artistNote, 960)) { g.fillText(l, 0, y); y += 54; }
    y += 30; g.font = "300 32px 'Helvetica Neue', Arial, sans-serif"; g.fillStyle = "#3a3e42";
    for (const para of [c.bio, c.bioSecond]) { for (const l of wrapAll(g, para, 960)) { g.fillText(l, 0, y); y += 46; } y += 26; }
  }), [lang]);
  const title = useMemo(() => canvasTex(1024, 260, (g) => { g.fillStyle = "#2b2e31"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "300 96px 'Helvetica Neue', Arial, sans-serif"; g.fillText(lang === "ru" ? "Юлия Просецкая" : "Yulia Prosetskaya", 512, 80); if (hallName) { g.fillStyle = "#e8742a"; g.fillRect(482, 150, 60, 5); g.fillStyle = "#3a3e42"; g.font = "400 46px 'Helvetica Neue', Arial, sans-serif"; g.fillText(`${lang === "ru" ? "Зал" : "Hall"} · ${hallName}`.toUpperCase().split("").join(String.fromCharCode(8202)), 512, 210); } }), [lang, hallName]);
  // Open-cell black ceiling grid with a darker void above, as in the reference museum.
  const grid = useMemo(() => { const t = canvasTex(256, 256, (g) => { g.fillStyle = "#0d0d0e"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#262628"; g.lineWidth = 5; for (let k = 0; k <= 256; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 256); g.moveTo(0, k); g.lineTo(256, k); g.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 2, len / 2); return t; }, [W, len]);
  // Cove (закарнизная) light: a soft wash along the top of every wall.
  const cove = useMemo(() => canvasTex(4, 128, (g) => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(255,250,240,.28)"); gr.addColorStop(1, "rgba(255,250,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); }), []);
  const bounds = useMemo(() => ({ x: W / 2 - 1.2, zMin: -D + 1.2, zMax: FRONT - 0.4 }), [W, D]);
  const target = useMemo(() => {
    const h = hungs[index];
    const v = new THREE.Vector3(0, EYE, 0.6) as THREE.Vector3 & { look?: THREE.Vector3 };
    v.look = new THREE.Vector3(0, EYE - 0.1, -D);
    if (h) { const d = Math.min((CAM_DIST + Math.max(0, h.w - 1) * 0.7) * distance, (h.wall === "back" ? D : W) - 0.6); v.set(h.x + h.nx * d, EYE, h.z + h.nz * d); v.look = new THREE.Vector3(h.x, EYE, h.z); }
    return v;
  }, [hungs, index, D, W, distance]);
  const floor = useMemo(() => {
    const t = canvasTex(1024, 1024, (g) => {
      // charcoal needle-felt carpet, as in the Museum of Russian Impressionism halls: dense fine fibre noise, no shine
      g.fillStyle = "#2c2b2a"; g.fillRect(0, 0, 1024, 1024);
      const img = g.getImageData(0, 0, 1024, 1024), px = img.data;
      for (let i = 0; i < px.length; i += 4) { const n = (Math.random() - 0.5) * 22; px[i] = px[i]! + n; px[i + 1] = px[i + 1]! + n; px[i + 2] = px[i + 2]! + n * 0.9; }
      g.putImageData(img, 0, 0);
      for (let i = 0; i < 40; i++) { const r = 120 + Math.random() * 200; const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(${Math.random() < 0.5 ? "0,0,0" : "90,88,84"},.05)`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.save(); g.translate(Math.random() * 1024, Math.random() * 1024); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore(); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 2, len / 2); return t;
  }, [W, len]);
  const plaster = useMemo(() => {
    const t = canvasTex(256, 256, (g) => { g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 110 + Math.random() * 36; g.fillStyle = `rgba(${v},${v},${v},.35)`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } }, false);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
  }, []);
  // Baked ambient occlusion where walls meet floor and ceiling — the cue that stops a room looking "CG".
  const ao = useMemo(() => canvasTex(4, 128, (g) => { const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, "rgba(40,30,20,.38)"); gr.addColorStop(0.35, "rgba(40,30,20,.12)"); gr.addColorStop(1, "rgba(40,30,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); }), []);
  const aoStrips: { p: [number, number, number]; r: [number, number, number]; w: number }[] = [
    { p: [-W / 2 + 0.003, 0, midZ], r: [0, Math.PI / 2, 0], w: len }, { p: [W / 2 - 0.003, 0, midZ], r: [0, -Math.PI / 2, 0], w: len },
    { p: [0, 0, -D + 0.003], r: [0, 0, 0], w: W }, { p: [0, 0, FRONT - 0.003], r: [0, Math.PI, 0], w: W },
  ];
  const wallMat = <meshStandardMaterial color="#c3cad1" roughness={0.97} bumpMap={plaster} bumpScale={0.12} />;
  const door = 1.8;
  return <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.25 }} camera={{ position: [0, EYE, 0.6], fov: 46 }} onCreated={({ gl }) => { gl.domElement.parentElement?.setAttribute("data-scene-ready", ""); }} aria-label={lang === "ru" ? "Виртуальный выставочный зал" : "Virtual exhibition hall"}>
    <color attach="background" args={["#1c1c1e"]} />
    <ambientLight intensity={0.28} color="#fffaf3" />
    <hemisphereLight args={["#f4f6f8", "#4a4744", 0.55]} />
    <directionalLight position={[2, CEIL, 0]} intensity={0.45} color="#fff6ea" />
    <Environment resolution={128}>
      <Lightformer form="rect" intensity={2} position={[0, 6, midZ]} rotation-x={Math.PI / 2} scale={[W, len, 1]} />
      <Lightformer form="rect" intensity={0.5} color="#fff1dd" position={[0, 2, 6]} scale={[W, 3, 1]} />
    </Environment>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]} receiveShadow onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("gallery-walk", { detail: { x: e.point.x, z: e.point.z } })); }} onPointerMove={(e) => { const r = ring.current; if (r) { r.visible = true; r.position.set(e.point.x, 0.01, e.point.z); } }} onPointerOut={() => { if (ring.current) ring.current.visible = false; }}><planeGeometry args={[W, len]} /><meshStandardMaterial map={floor} roughness={1} color="#9a9894" envMapIntensity={0.2} /></mesh>
    <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}><ringGeometry args={[0.22, 0.27, 40]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.7} depthWrite={false} toneMapped={false} /></mesh>
    <ContactShadows position={[0, 0.002, midZ]} scale={[W, len]} opacity={0.3} blur={2.5} far={2} resolution={512} frames={1} />
    {/* ceiling + skylight panels with deep frames */}
    <mesh rotation-x={Math.PI / 2} position={[0, CEIL, midZ]}><planeGeometry args={[W, len]} /><meshBasicMaterial map={grid} color="#ffffff" /></mesh>
    {(() => { const n = Math.max(2, Math.round(W / 2.4)); return Array.from({ length: n }, (_, i) => -W / 2 + (i + 0.5) * (W / n)); })().filter(() => false).map((x: number) => <mesh key={`led${x}`} rotation-x={Math.PI / 2} position={[x, CEIL - 0.005, midZ]}><planeGeometry args={[0.08, len - 1.2]} /><meshBasicMaterial color="#2a2a2c" /></mesh>)}
    {/* walls: left, right, back, and entrance with an opening */}
    <mesh position={[-W / 2, CEIL / 2, midZ]} rotation-y={Math.PI / 2} receiveShadow><planeGeometry args={[len, CEIL]} />{wallMat}</mesh>
    <mesh position={[W / 2, CEIL / 2, midZ]} rotation-y={-Math.PI / 2} receiveShadow><planeGeometry args={[len, CEIL]} />{wallMat}</mesh>
    <mesh position={[0, CEIL / 2, -D]}><planeGeometry args={[W, CEIL]} />{wallMat}</mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * (W + door) / 4, CEIL / 2, FRONT]} rotation-y={Math.PI}><planeGeometry args={[(W - door) / 2, CEIL]} />{wallMat}</mesh>)}
    <mesh position={[0, (CEIL + 2.6) / 2, FRONT]} rotation-y={Math.PI}><planeGeometry args={[door, CEIL - 2.6]} />{wallMat}</mesh>
    {/* entrance: painted wooden panelled double doors, open inward, with casing and brass handles */}
    {(() => {
      const leaf = door / 2, H = 2.6, t = 0.045;
      const paint = <meshStandardMaterial color="#efece6" roughness={0.55} />;
      const Leaf = ({ side }: { side: 1 | -1 }) => <group position={[side * door / 2, 0, FRONT - 0.02]} rotation-y={side * 1.15}>
        <group position={[-side * leaf / 2, 0, 0]}>
          <mesh position={[0, H / 2, 0]} castShadow><boxGeometry args={[leaf, H, t]} />{paint}</mesh>
          {[[0.45, 0.62], [1.32, 0.62], [2.1, 0.62]].map(([y]) => [y, y === 1.32 ? 0.95 : y === 0.45 ? 0.6 : 0.6] as const).map(([y, h]) => [-1, 1].map((f) => <group key={`${y}${f}`} position={[0, y!, f * (t / 2 + 0.004)]} rotation-y={f < 0 ? Math.PI : 0}>
            <mesh><boxGeometry args={[leaf - 0.16, h, 0.008]} /><meshStandardMaterial color="#e6e2da" roughness={0.6} /></mesh>
            <mesh position={[0, 0, 0.006]}><boxGeometry args={[leaf - 0.22, h - 0.06, 0.004]} />{paint}</mesh>
          </group>))}
          {[-1, 1].map((f) => <group key={`h${f}`} position={[-side * (leaf / 2 - 0.08), 1.02, f * (t / 2 + 0.02)]}>
            <mesh><boxGeometry args={[0.035, 0.2, 0.012]} /><meshStandardMaterial color="#b8913f" metalness={0.9} roughness={0.3} /></mesh>
            <mesh position={[side * 0.04, 0.04, f * 0.02]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.009, 0.009, 0.1, 10]} /><meshStandardMaterial color="#c49c48" metalness={0.9} roughness={0.25} /></mesh>
          </group>)}
        </group>
      </group>;
      return <group>
        <Leaf side={1} /><Leaf side={-1} />
        {/* casing */}
        {[-1, 1].map((sd) => <mesh key={`c${sd}`} position={[sd * (door / 2 + 0.045), H / 2, FRONT - 0.015]}><boxGeometry args={[0.09, H + 0.09, 0.03]} />{paint}</mesh>)}
        <mesh position={[0, H + 0.045, FRONT - 0.015]}><boxGeometry args={[door + 0.18, 0.09, 0.03]} />{paint}</mesh>
        {/* doorway click → next hall */}
        <mesh position={[0, H / 2, FRONT + 0.05]} onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new Event("gallery-next-hall")); }} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}><planeGeometry args={[door, H]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} /></mesh>
        {/* glimpse of the next room through the doorway */}
        <mesh position={[0, H / 2, FRONT + 2.5]} rotation-y={Math.PI}><planeGeometry args={[door + 2, H + 1]} /><meshStandardMaterial color="#e9e7e2" side={THREE.DoubleSide} /></mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, FRONT + 1.25]}><planeGeometry args={[door + 2, 2.5]} /><meshStandardMaterial color="#8a5a34" roughness={0.5} /></mesh>
      </group>;
    })()}
    <mesh position={[0, CEIL - 0.68, -D + 0.01]}><planeGeometry args={[3.2, 0.8125]} /><meshBasicMaterial map={title} transparent depthWrite={false} /></mesh>
    <mesh position={[-(W + door) / 4, 1.75, FRONT - 0.01]} rotation-y={Math.PI}><planeGeometry args={[Math.min(2.2, (W - door) / 2 - 0.5), Math.min(2.2, (W - door) / 2 - 0.5) * 1100 / 1024]} /><meshBasicMaterial map={intro} transparent depthWrite={false} /></mesh>
    {/* skirting */}
    {[-1, 1].map((s) => <mesh key={`k${s}`} position={[s * (W / 2 - 0.01), 0.0125, midZ]}><boxGeometry args={[0.02, 0.025, len]} /><meshBasicMaterial color="#3a3836" /></mesh>)}
    <mesh position={[0, 0.0125, -D + 0.01]}><boxGeometry args={[W, 0.025, 0.02]} /><meshBasicMaterial color="#3a3836" /></mesh>
    {aoStrips.map((a, i) => <group key={`ao${i}`} position={a.p} rotation={a.r}>
      <mesh position={[0, 0.35, 0]}><planeGeometry args={[a.w, 0.7]} /><meshBasicMaterial map={ao} transparent depthWrite={false} /></mesh>
      <mesh position={[0, CEIL - 0.45, 0.002]}><planeGeometry args={[a.w, 0.9]} /><meshBasicMaterial map={cove} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
      <mesh position={[0, CEIL - 0.25, 0]} rotation-z={Math.PI}><planeGeometry args={[a.w, 0.5]} /><meshBasicMaterial map={ao} transparent opacity={0.6} depthWrite={false} /></mesh>
    </group>)}
    {/* track-light spots aimed at each work */}
    {hungs.map((h) => <group key={`spot${h.id}`} position={[h.x + h.nx * 1.3, CEIL - 0.12, h.z + h.nz * 1.3]} rotation={[0, h.rotY, 0]}>
      <mesh rotation-x={-0.6}><cylinderGeometry args={[0.045, 0.06, 0.2, 12]} /><meshStandardMaterial color="#151515" roughness={0.4} metalness={0.2} /></mesh>
      <mesh rotation-x={-0.6} position={[0, -0.085, 0.055]}><circleGeometry args={[0.04, 16]} /><meshBasicMaterial color="#fffaf0" toneMapped={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[0.04, 0.08, 0.04]} /><meshStandardMaterial color="#151515" /></mesh>
    </group>)}
    {[-1, 1].map((s) => <mesh key={`rail${s}`} position={[s * (W / 2 - 1.3), CEIL - 0.02, midZ]}><boxGeometry args={[0.035, 0.035, len - 0.6]} /><meshStandardMaterial color="#111" /></mesh>)}
    <mesh position={[0, CEIL - 0.02, -D + 1.3]}><boxGeometry args={[W - 2.6, 0.035, 0.035]} /><meshStandardMaterial color="#111" /></mesh>

    {hungs.map((h, i) => <Painting key={h.id} hung={h} work={works[i]!} lang={lang} glow={glow} onPick={() => onIndex(i)} />)}
    <Rig target={target} bounds={bounds} resetKey={resetKey} />
  </Canvas>;
}
