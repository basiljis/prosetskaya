import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Artwork, Lang } from "@/lib/artworks";
import { EYE, WALL_X, hang, type Hung } from "@/lib/exhibition-layout";

const CAM_DIST = 2.6;

function useArtTexture(url: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    const l = new THREE.TextureLoader(); l.setCrossOrigin("anonymous");
    l.load(url, (t) => { if (!alive) return; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; setTex(t); }, undefined, () => undefined);
    return () => { alive = false; };
  }, [url]);
  return tex;
}

function Painting({ hung, work, onPick }: { hung: Hung; work: Artwork; onPick: () => void }) {
  const tex = useArtTexture(work.image);
  const x = hung.side * (WALL_X - 0.04);
  const rot = hung.side === -1 ? Math.PI / 2 : -Math.PI / 2;
  return <group position={[x, EYE, hung.z]} rotation={[0, rot, 0]}>
    <mesh position={[0, 0, -0.025]} castShadow><boxGeometry args={[hung.w + 0.08, hung.h + 0.08, 0.04]} /><meshStandardMaterial color="#1c1a18" roughness={0.6} /></mesh>
    <mesh position={[0, 0, 0.006]} onClick={(e) => { e.stopPropagation(); onPick(); }} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      <planeGeometry args={[hung.w, hung.h]} />
      {tex ? <meshStandardMaterial key="art" map={tex} roughness={0.8} /> : <meshStandardMaterial key="blank" color="#d8d3cb" />}
    </mesh>
    <spotLight position={[0, 1.6, 1.4]} angle={0.5} penumbra={0.7} intensity={6} distance={4} />
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
  const minZ = Math.min(-6, ...hungs.map((h) => h.z - h.w)) - 3;
  const target = useMemo(() => {
    const h = hungs[index];
    const v = new THREE.Vector3(0, EYE, 2) as THREE.Vector3 & { look?: THREE.Vector3 };
    v.look = new THREE.Vector3(0, EYE, -4);
    if (h) { v.set(h.side * (WALL_X - CAM_DIST - Math.max(0, h.w - 1) * 0.6), EYE, h.z); v.look = new THREE.Vector3(h.side * WALL_X, EYE, h.z); }
    return v;
  }, [hungs, index]);
  const floor = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!;
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#8a6e52" : "#7d6248"; g.fillRect(0, i * 32, 256, 32); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, i * 32, 256, 1); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, Math.abs(minZ) / 2); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [minZ]);
  const len = Math.abs(minZ) + 6, mid = (minZ + 4) / 2;
  return <Canvas shadows camera={{ position: [0, EYE, 4], fov: 55 }} onCreated={({ gl }) => { gl.domElement.parentElement?.setAttribute("data-scene-ready", ""); }} aria-label={lang === "ru" ? "Виртуальный выставочный зал" : "Virtual exhibition hall"}>
    <color attach="background" args={["#e9e5df"]} />
    <fog attach="fog" args={["#e9e5df", 8, 28]} />
    <ambientLight intensity={1.1} />
    <hemisphereLight args={["#ffffff", "#8a6e52", 0.6]} />
    <directionalLight position={[2, 6, 3]} intensity={0.6} />
    <Environment resolution={64}><Lightformer intensity={1.4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[6, 40, 1]} /></Environment>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, mid]} receiveShadow><planeGeometry args={[WALL_X * 2, len]} /><meshStandardMaterial map={floor} roughness={0.45} /></mesh>
    <mesh rotation-x={Math.PI / 2} position={[0, 3.6, mid]}><planeGeometry args={[WALL_X * 2, len]} /><meshBasicMaterial color="#efece7" /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * WALL_X, 1.8, mid]} rotation-y={-s * Math.PI / 2}><planeGeometry args={[len, 3.6]} /><meshStandardMaterial color="#f2efea" roughness={0.95} /></mesh>)}
    <mesh position={[0, 1.8, minZ + 2]}><planeGeometry args={[WALL_X * 2, 3.6]} /><meshStandardMaterial color="#ece8e1" /></mesh>
    {hungs.map((h, i) => <Painting key={h.id} hung={h} work={works[i]!} onPick={() => onIndex(i)} />)}
    <Rig target={target} />
  </Canvas>;
}
