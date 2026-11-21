import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Artwork, Lang } from "@/lib/artworks";
import { EYE, WALL_X, hang, type Hung } from "@/lib/exhibition-layout";

const CAM_DIST = 2.6, CEIL = 3.8;

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
  const x = hung.side * (WALL_X - 0.005);
  const rot = hung.side === -1 ? Math.PI / 2 : -Math.PI / 2;
  const fw = 0.045, depth = 0.05;
  return <group position={[x, EYE, hung.z]} rotation={[0, rot, 0]}>
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
  const hungs = useMemo(() => hang(works), [works]);
  const glow = useGlow();
  const minZ = Math.min(-6, ...hungs.map((h) => h.z - h.w)) - 3;
  const target = useMemo(() => {
    const h = hungs[index];
    const v = new THREE.Vector3(0, EYE, 2) as THREE.Vector3 & { look?: THREE.Vector3 };
    v.look = new THREE.Vector3(0, EYE, -4);
    if (h) { v.set(h.side * (WALL_X - CAM_DIST - Math.max(0, h.w - 1) * 0.6), EYE, h.z); v.look = new THREE.Vector3(h.side * WALL_X, EYE, h.z); }
    return v;
  }, [hungs, index]);
  const len = Math.abs(minZ) + 6, mid = (minZ + 4) / 2;
  // Light oak planks with grain, staggered joints.
  const floor = useMemo(() => {
    const t = canvasTex(1024, 1024, (g) => {
      const rows = 8, ph = 1024 / rows;
      for (let r = 0; r < rows; r++) {
        let x = -((r * 397) % 600);
        while (x < 1024) {
          const w = 520 + ((r * 7 + x) % 5) * 60, tone = 168 + ((r * 13 + x * 3) % 22);
          g.fillStyle = `rgb(${tone},${tone - 30},${tone - 70})`; g.fillRect(x, r * ph, w, ph);
          for (let i = 0; i < 26; i++) { const y = r * ph + Math.random() * ph; g.strokeStyle = `rgba(90,60,30,${0.04 + Math.random() * 0.07})`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + w / 3, y + (Math.random() - 0.5) * 8, x + (2 * w) / 3, y + (Math.random() - 0.5) * 8, x + w, y); g.stroke(); }
          g.fillStyle = "rgba(40,25,10,.35)"; g.fillRect(x, r * ph, 2, ph); x += w;
        }
        g.fillStyle = "rgba(40,25,10,.3)"; g.fillRect(0, r * ph, 1024, 2);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.6, len / 4); t.rotation = Math.PI / 2; return t;
  }, [len]);
  const plaster = useMemo(() => {
    const t = canvasTex(256, 256, (g) => { g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 110 + Math.random() * 36; g.fillStyle = `rgba(${v},${v},${v},.35)`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } }, false);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(len / 2, 2); return t;
  }, [len]);
  const lightRows = useMemo(() => { const out: number[] = []; for (let z = 2; z > minZ + 2; z -= 3) out.push(z); return out; }, [minZ]);
  const wall = "#f4f1ec";
  return <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} camera={{ position: [0, EYE, 4], fov: 50 }} onCreated={({ gl }) => { gl.domElement.parentElement?.setAttribute("data-scene-ready", ""); }} aria-label={lang === "ru" ? "Виртуальный выставочный зал" : "Virtual exhibition hall"}>
    <color attach="background" args={["#ebe7e1"]} />
    <fog attach="fog" args={["#ebe7e1", 12, 34]} />
    <ambientLight intensity={0.9} color="#fff8ee" />
    <hemisphereLight args={["#fffaf2", "#e8dccb", 0.8]} />
    <directionalLight position={[1.5, CEIL - 0.2, 1]} intensity={0.5} color="#fff4e6" />
    <Environment resolution={128}>
      <Lightformer form="rect" intensity={2.2} position={[0, 5, mid]} rotation-x={Math.PI / 2} scale={[1.4, len, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#ffe9cc" position={[-5, 2, mid]} rotation-y={Math.PI / 2} scale={[len, 3, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#ffe9cc" position={[5, 2, mid]} rotation-y={-Math.PI / 2} scale={[len, 3, 1]} />
    </Environment>
    {/* floor */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, mid]} receiveShadow><planeGeometry args={[WALL_X * 2, len]} /><meshStandardMaterial map={floor} roughness={0.38} metalness={0} envMapIntensity={0.9} /></mesh>
    <ContactShadows position={[0, 0.002, mid]} scale={[WALL_X * 2, len]} opacity={0.35} blur={2.5} far={2} resolution={512} frames={1} />
    {/* ceiling with recessed light strip */}
    <mesh rotation-x={Math.PI / 2} position={[0, CEIL, mid]}><planeGeometry args={[WALL_X * 2, len]} /><meshBasicMaterial color="#e9e5df" /></mesh>
    <mesh rotation-x={Math.PI / 2} position={[0, CEIL - 0.01, mid]}><planeGeometry args={[0.9, len - 2]} /><meshBasicMaterial color="#fffdf8" toneMapped={false} /></mesh>
    {/* track spots */}
    {lightRows.flatMap((z) => [-1, 1].map((s) => <group key={`${z}${s}`} position={[s * (WALL_X - 1.1), CEIL - 0.06, z]}>
      <mesh><boxGeometry args={[0.04, 0.03, 0.04]} /><meshStandardMaterial color="#1b1b1b" /></mesh>
      <mesh position={[s * 0.05, -0.1, 0]} rotation-z={s * 0.6}><cylinderGeometry args={[0.045, 0.055, 0.16, 16]} /><meshStandardMaterial color="#1b1b1b" roughness={0.4} metalness={0.6} /></mesh>
    </group>))}
    {[-1, 1].map((s) => <mesh key={`t${s}`} position={[s * (WALL_X - 1.1), CEIL - 0.03, mid]}><boxGeometry args={[0.03, 0.02, len - 2]} /><meshStandardMaterial color="#1b1b1b" /></mesh>)}
    {/* walls + skirting */}
    {[-1, 1].map((s) => <group key={s}>
      <mesh position={[s * WALL_X, CEIL / 2, mid]} rotation-y={-s * Math.PI / 2} receiveShadow><planeGeometry args={[len, CEIL]} /><meshStandardMaterial color={wall} roughness={0.92} bumpMap={plaster} bumpScale={0.6} /></mesh>
      <mesh position={[s * (WALL_X - 0.01), 0.05, mid]}><boxGeometry args={[0.02, 0.1, len]} /><meshStandardMaterial color="#e6e1d9" roughness={0.6} /></mesh>
    </group>)}
    <mesh position={[0, CEIL / 2, minZ + 2]}><planeGeometry args={[WALL_X * 2, CEIL]} /><meshStandardMaterial color="#efebe4" roughness={0.92} bumpMap={plaster} bumpScale={0.6} /></mesh>
    {/* bench */}
    <group position={[0, 0, mid]}>
      <mesh position={[0, 0.44, 0]} castShadow><boxGeometry args={[0.5, 0.06, 1.8]} /><meshStandardMaterial color="#6b4a30" roughness={0.5} /></mesh>
      {[-0.75, 0.75].map((z) => <mesh key={z} position={[0, 0.21, z]}><boxGeometry args={[0.44, 0.42, 0.05]} /><meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} /></mesh>)}
    </group>
    {hungs.map((h, i) => <Painting key={h.id} hung={h} work={works[i]!} glow={glow} onPick={() => onIndex(i)} />)}
    <Rig target={target} />
  </Canvas>;
}
