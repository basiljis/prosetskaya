import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
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
    r.addColorStop(0, "rgba(255,236,205,0.55)"); r.addColorStop(0.5, "rgba(255,230,195,0.22)"); r.addColorStop(1, "rgba(255,230,195,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  }), []);
}

function Painting({ hung, work, glow, onPick }: { hung: Hung; work: Artwork; glow: THREE.Texture; onPick: () => void }) {
  const tex = useArtTexture(work.image);
  const fw = 0.045, depth = 0.05;
  return <group position={[hung.x + hung.nx * 0.005, EYE, hung.z + hung.nz * 0.005]} rotation={[0, hung.rotY, 0]}>
    <mesh position={[0, 0.25, 0.002]}><planeGeometry args={[hung.w * 2.2 + 1, hung.h * 2 + 1.4]} /><meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
    {/* soft drop shadow on the wall */}
    <mesh position={[0.03, -0.05, 0.003]}><planeGeometry args={[hung.w + 0.2, hung.h + 0.2]} /><meshBasicMaterial color="#000" transparent opacity={0.16} depthWrite={false} /></mesh>
    <mesh position={[0, 0, depth / 2]} castShadow><boxGeometry args={[hung.w + fw * 2, hung.h + fw * 2, depth]} /><meshStandardMaterial color="#2a2420" roughness={0.45} metalness={0.15} /></mesh>
    <mesh position={[0, 0, depth + 0.001]} onClick={(e) => { e.stopPropagation(); onPick(); }} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      <planeGeometry args={[hung.w, hung.h]} />
      {tex ? <meshStandardMaterial key="art" map={tex} roughness={0.62} envMapIntensity={0.4} /> : <meshStandardMaterial key="blank" color="#d8d3cb" />}
    </mesh>
    <mesh position={[hung.w / 2 + 0.25, -hung.h / 2 + 0.06, 0.004]}><planeGeometry args={[0.16, 0.08]} /><meshStandardMaterial color="#f7f5f1" roughness={0.9} /></mesh>
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
      // polished concrete with soft mottling — the usual museum floor
      g.fillStyle = "#b9b4ac"; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 900; i++) { const r = 8 + Math.random() * 60, v = 165 + Math.random() * 40; const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(${v},${v - 4},${v - 10},.10)`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.save(); g.translate(Math.random() * 1024, Math.random() * 1024); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore(); }
      g.strokeStyle = "rgba(60,55,50,.25)"; g.lineWidth = 2; for (let k = 0; k <= 1024; k += 512) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 1024); g.moveTo(0, k); g.lineTo(1024, k); g.stroke(); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 4, len / 4); return t;
  }, [W, len]);
  const plaster = useMemo(() => {
    const t = canvasTex(256, 256, (g) => { g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 110 + Math.random() * 36; g.fillStyle = `rgba(${v},${v},${v},.35)`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } }, false);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
  }, []);
  // Skylight grid: diffuse ceiling panels, as in white-cube halls.
  const panels = useMemo(() => { const out: [number, number][] = []; const nx = Math.max(2, Math.round(W / 2.6)), nz = Math.max(3, Math.round(len / 2.6)); for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) out.push([-W / 2 + (i + 0.5) * (W / nx), FRONT - (j + 0.5) * (len / nz)]); return { out, sx: W / nx - 0.35, sz: len / Math.max(3, Math.round(len / 2.6)) - 0.35 }; }, [W, len]);
  const wallMat = <meshStandardMaterial color="#f5f2ed" roughness={0.92} bumpMap={plaster} bumpScale={0.5} />;
  const door = 1.8;
  return <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{ position: [0, EYE, 0.6], fov: 55 }} onCreated={({ gl }) => { gl.domElement.parentElement?.setAttribute("data-scene-ready", ""); }} aria-label={lang === "ru" ? "Виртуальный выставочный зал" : "Virtual exhibition hall"}>
    <color attach="background" args={["#ece9e4"]} />
    <ambientLight intensity={0.85} color="#fffaf3" />
    <hemisphereLight args={["#ffffff", "#d9d3ca", 0.7]} />
    <directionalLight position={[2, CEIL, 0]} intensity={0.45} color="#fff6ea" />
    <Environment resolution={128}>
      <Lightformer form="rect" intensity={2} position={[0, 6, midZ]} rotation-x={Math.PI / 2} scale={[W, len, 1]} />
      <Lightformer form="rect" intensity={0.5} color="#fff1dd" position={[0, 2, 6]} scale={[W, 3, 1]} />
    </Environment>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]} receiveShadow><planeGeometry args={[W, len]} /><meshStandardMaterial map={floor} roughness={0.28} metalness={0.05} envMapIntensity={1.1} /></mesh>
    <ContactShadows position={[0, 0.002, midZ]} scale={[W, len]} opacity={0.3} blur={2.5} far={2} resolution={512} frames={1} />
    {/* ceiling + skylight panels with deep frames */}
    <mesh rotation-x={Math.PI / 2} position={[0, CEIL, midZ]}><planeGeometry args={[W, len]} /><meshBasicMaterial color="#e6e2dc" /></mesh>
    {panels.out.map(([x, z]) => <mesh key={`${x}:${z}`} rotation-x={Math.PI / 2} position={[x, CEIL - 0.01, z]}><planeGeometry args={[panels.sx, panels.sz]} /><meshBasicMaterial color="#fffdf9" toneMapped={false} /></mesh>)}
    {/* walls: left, right, back, and entrance with an opening */}
    <mesh position={[-W / 2, CEIL / 2, midZ]} rotation-y={Math.PI / 2} receiveShadow><planeGeometry args={[len, CEIL]} />{wallMat}</mesh>
    <mesh position={[W / 2, CEIL / 2, midZ]} rotation-y={-Math.PI / 2} receiveShadow><planeGeometry args={[len, CEIL]} />{wallMat}</mesh>
    <mesh position={[0, CEIL / 2, -D]}><planeGeometry args={[W, CEIL]} />{wallMat}</mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * (W + door) / 4, CEIL / 2, FRONT]} rotation-y={Math.PI}><planeGeometry args={[(W - door) / 2, CEIL]} />{wallMat}</mesh>)}
    <mesh position={[0, (CEIL + 2.6) / 2, FRONT]} rotation-y={Math.PI}><planeGeometry args={[door, CEIL - 2.6]} />{wallMat}</mesh>
    {/* skirting */}
    {[-1, 1].map((s) => <mesh key={`k${s}`} position={[s * (W / 2 - 0.01), 0.05, midZ]}><boxGeometry args={[0.02, 0.1, len]} /><meshStandardMaterial color="#dcd7cf" /></mesh>)}
    <mesh position={[0, 0.05, -D + 0.01]}><boxGeometry args={[W, 0.1, 0.02]} /><meshStandardMaterial color="#dcd7cf" /></mesh>
    {/* two benches facing the walls */}
    {[-1.2, 1.2].map((zOff) => <group key={zOff} position={[0, 0, -D / 2 + zOff]}>
      <mesh position={[0, 0.44, 0]} castShadow><boxGeometry args={[1.8, 0.07, 0.5]} /><meshStandardMaterial color="#5b3f2a" roughness={0.45} /></mesh>
      {[-0.75, 0.75].map((x) => <mesh key={x} position={[x, 0.21, 0]}><boxGeometry args={[0.05, 0.42, 0.44]} /><meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.5} /></mesh>)}
    </group>)}
    {hungs.map((h, i) => <Painting key={h.id} hung={h} work={works[i]!} glow={glow} onPick={() => onIndex(i)} />)}
    <Rig target={target} />
  </Canvas>;
}
