import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Artwork, Lang } from "@/lib/artworks";
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
function useGlow() {
  return useMemo(() => canvasTex(256, 256, (g) => {
    const r = g.createRadialGradient(128, 110, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(255,248,236,0.32)"); r.addColorStop(0.55, "rgba(255,246,232,0.12)"); r.addColorStop(1, "rgba(255,246,232,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  }), []);
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = []; let line = "";
  for (const word of text.split(/\s+/)) { const t = line ? `${line} ${word}` : word; if (g.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t; }
  if (line) out.push(line); return out.slice(0, 3);
}

/** Museum wall label: title (with a red dot when sold), year, medium, size — printed on a matte card. */
function useLabel(work: Artwork, lang: Lang) {
  return useMemo(() => canvasTex(640, 400, (g) => {
    g.fillStyle = "#fbfaf7"; g.fillRect(0, 0, 640, 400);
    const sold = work.sourceAvailability === "sold";
    let x = 44, y = 70;
    g.fillStyle = "#1c1a18"; g.font = "600 40px 'Helvetica Neue', Arial, sans-serif";
    const lines = wrap(g, work[lang], sold ? 520 : 552);
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
    <mesh position={[0, 0.15, 0.002]}><planeGeometry args={[hung.w * 1.9 + 1.2, hung.h * 1.7 + 1.6]} /><meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
    {/* soft contact shadow below the canvas */}
    <mesh position={[0.02, -0.07, 0.003]}><planeGeometry args={[hung.w + 0.14, hung.h + 0.14]} /><meshBasicMaterial color="#2a241e" transparent opacity={0.13} depthWrite={false} /></mesh>
    {/* slim black shadow-gap frame, gallery style */}
    <mesh position={[0, 0, depth / 2]} castShadow><boxGeometry args={[hung.w + fw * 2, hung.h + fw * 2, depth]} /><meshStandardMaterial color="#1b1a19" roughness={0.6} /></mesh>
    <mesh position={[0, 0, depth + 0.001]} onClick={(e) => { e.stopPropagation(); onPick(); }} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      <planeGeometry args={[hung.w, hung.h]} />
      {tex ? <meshStandardMaterial key="art" map={tex} roughness={0.7} envMapIntensity={0.3} /> : <meshStandardMaterial key="blank" color="#d8d3cb" />}
    </mesh>
    {/* wall label */}
    <mesh position={[hung.w / 2 + 0.32, ly, 0.006]} onClick={(e) => { e.stopPropagation(); onPick(); }}><boxGeometry args={[0.32, 0.2, 0.006]} /><meshStandardMaterial map={label} roughness={0.95} /></mesh>
  </group>;
}

function Rig({ target }: { target: THREE.Vector3 & { look?: THREE.Vector3 } }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, EYE, -5));
  useFrame((_, d) => {
    const k = 1 - Math.exp(-2.4 * Math.min(d, 0.05));
    camera.position.lerp(target, k);
    look.current.lerp(target.look!, k);
    camera.lookAt(look.current);
  });
  return null;
}

export function VirtualGallery({ works, lang, index, onIndex }: { works: readonly Artwork[]; lang: Lang; index: number; onIndex: (i: number) => void }) {
  const room = useMemo(() => layoutRoom(works), [works]);
  const { width: W, depth: D, hung: hungs } = room;
  const FRONT = 1.6; // entrance wall behind the starting viewpoint
  const len = D + FRONT, midZ = (FRONT - D) / 2;
  const glow = useGlow();
  const target = useMemo(() => {
    const h = hungs[index];
    const v = new THREE.Vector3(0, EYE, 0.6) as THREE.Vector3 & { look?: THREE.Vector3 };
    v.look = new THREE.Vector3(0, EYE - 0.1, -D);
    if (h) { const d = CAM_DIST + Math.max(0, h.w - 1) * 0.7; v.set(h.x + h.nx * d, EYE, h.z + h.nz * d); v.look = new THREE.Vector3(h.x, EYE, h.z); }
    return v;
  }, [hungs, index, D]);
  const floor = useMemo(() => {
    const t = canvasTex(1024, 1024, (g) => {
      // polished light-grey concrete with soft trowel mottling and saw-cut joints — the standard white-cube floor
      g.fillStyle = "#a9a6a1"; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 1400; i++) { const r = 10 + Math.random() * 90, v = 150 + Math.random() * 50; const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(${v},${v - 2},${v - 6},.045)`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.save(); g.translate(Math.random() * 1024, Math.random() * 1024); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore(); }
      for (let i = 0; i < 9000; i++) { const v = 120 + Math.random() * 80; g.fillStyle = `rgba(${v},${v},${v},.12)`; g.fillRect(Math.random() * 1024, Math.random() * 1024, 1.5, 1.5); }
      g.strokeStyle = "rgba(55,52,48,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 1); g.lineTo(1024, 1); g.moveTo(1, 0); g.lineTo(1, 1024); g.stroke();
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 4, len / 4); return t;
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
  const wallMat = <meshStandardMaterial color="#f7f7f5" roughness={0.97} bumpMap={plaster} bumpScale={0.12} />;
  const door = 1.8;
  return <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.25 }} camera={{ position: [0, EYE, 0.6], fov: 46 }} onCreated={({ gl }) => { gl.domElement.parentElement?.setAttribute("data-scene-ready", ""); }} aria-label={lang === "ru" ? "Виртуальный выставочный зал" : "Virtual exhibition hall"}>
    <color attach="background" args={["#efefed"]} />
    <ambientLight intensity={0.5} color="#fffaf3" />
    <hemisphereLight args={["#fffaf2", "#bfae98", 0.8]} />
    <directionalLight position={[2, CEIL, 0]} intensity={0.45} color="#fff6ea" />
    <Environment resolution={128}>
      <Lightformer form="rect" intensity={2} position={[0, 6, midZ]} rotation-x={Math.PI / 2} scale={[W, len, 1]} />
      <Lightformer form="rect" intensity={0.5} color="#fff1dd" position={[0, 2, 6]} scale={[W, 3, 1]} />
    </Environment>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]} receiveShadow><planeGeometry args={[W, len]} /><MeshReflectorMaterial map={floor} mirror={0.35} blur={[400, 120]} resolution={512} mixBlur={1} mixStrength={1.4} roughness={0.55} depthScale={0.6} minDepthThreshold={0.4} maxDepthThreshold={1.3} color="#c9c6c1" metalness={0.05} /></mesh>
    <ContactShadows position={[0, 0.002, midZ]} scale={[W, len]} opacity={0.3} blur={2.5} far={2} resolution={512} frames={1} />
    {/* ceiling + skylight panels with deep frames */}
    <mesh rotation-x={Math.PI / 2} position={[0, CEIL, midZ]}><planeGeometry args={[W, len]} /><meshBasicMaterial color="#e8e8e6" /></mesh>
    {(() => { const n = Math.max(2, Math.round(W / 2.4)); return Array.from({ length: n }, (_, i) => -W / 2 + (i + 0.5) * (W / n)); })().map((x: number) => <mesh key={`led${x}`} rotation-x={Math.PI / 2} position={[x, CEIL - 0.005, midZ]}><planeGeometry args={[0.08, len - 1.2]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>)}
    {/* walls: left, right, back, and entrance with an opening */}
    <mesh position={[-W / 2, CEIL / 2, midZ]} rotation-y={Math.PI / 2} receiveShadow><planeGeometry args={[len, CEIL]} />{wallMat}</mesh>
    <mesh position={[W / 2, CEIL / 2, midZ]} rotation-y={-Math.PI / 2} receiveShadow><planeGeometry args={[len, CEIL]} />{wallMat}</mesh>
    <mesh position={[0, CEIL / 2, -D]}><planeGeometry args={[W, CEIL]} />{wallMat}</mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * (W + door) / 4, CEIL / 2, FRONT]} rotation-y={Math.PI}><planeGeometry args={[(W - door) / 2, CEIL]} />{wallMat}</mesh>)}
    <mesh position={[0, (CEIL + 2.6) / 2, FRONT]} rotation-y={Math.PI}><planeGeometry args={[door, CEIL - 2.6]} />{wallMat}</mesh>
    {/* skirting */}
    {[-1, 1].map((s) => <mesh key={`k${s}`} position={[s * (W / 2 - 0.01), 0.0125, midZ]}><boxGeometry args={[0.02, 0.025, len]} /><meshBasicMaterial color="#3a3836" /></mesh>)}
    <mesh position={[0, 0.0125, -D + 0.01]}><boxGeometry args={[W, 0.025, 0.02]} /><meshBasicMaterial color="#3a3836" /></mesh>
    {aoStrips.map((a, i) => <group key={`ao${i}`} position={a.p} rotation={a.r}>
      <mesh position={[0, 0.35, 0]}><planeGeometry args={[a.w, 0.7]} /><meshBasicMaterial map={ao} transparent depthWrite={false} /></mesh>
      <mesh position={[0, CEIL - 0.25, 0]} rotation-z={Math.PI}><planeGeometry args={[a.w, 0.5]} /><meshBasicMaterial map={ao} transparent opacity={0.6} depthWrite={false} /></mesh>
    </group>)}
    {/* track-light spots aimed at each work */}
    {hungs.map((h) => <group key={`spot${h.id}`} position={[h.x + h.nx * 1.3, CEIL - 0.12, h.z + h.nz * 1.3]} rotation={[0, h.rotY, 0]}>
      <mesh rotation-x={-0.6}><cylinderGeometry args={[0.045, 0.06, 0.2, 12]} /><meshStandardMaterial color="#f2f2f0" roughness={0.4} metalness={0.2} /></mesh>
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[0.04, 0.08, 0.04]} /><meshStandardMaterial color="#f2f2f0" /></mesh>
    </group>)}
    {[-1, 1].map((s) => <mesh key={`rail${s}`} position={[s * (W / 2 - 1.3), CEIL - 0.02, midZ]}><boxGeometry args={[0.035, 0.035, len - 0.6]} /><meshStandardMaterial color="#e4e4e2" /></mesh>)}
    <mesh position={[0, CEIL - 0.02, -D + 1.3]}><boxGeometry args={[W - 2.6, 0.035, 0.035]} /><meshStandardMaterial color="#e4e4e2" /></mesh>
    {/* single minimal bench, as in contemporary galleries */}
    <group position={[0, 0, -D / 2 + 0.5]}><mesh position={[0, 0.22, 0]} castShadow><boxGeometry args={[2.2, 0.44, 0.6]} /><meshStandardMaterial color="#f4f4f2" roughness={0.8} /></mesh></group>
    {hungs.map((h, i) => <Painting key={h.id} hung={h} work={works[i]!} lang={lang} glow={glow} onPick={() => onIndex(i)} />)}
    <Rig target={target} />
  </Canvas>;
}
