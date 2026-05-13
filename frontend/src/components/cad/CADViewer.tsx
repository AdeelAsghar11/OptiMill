"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useSTLLoader, PerspectiveCamera, Center } from "@react-three/drei";

function Model({ url }: { url: string }) {
  const geom = useSTLLoader(url);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

export function CADViewer({ url }: { url: string }) {
  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-2xl overflow-hidden relative border border-slate-800">
      <Canvas shadows>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Center>
              <Model url={url} />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
        3D Preview Mode
      </div>
    </div>
  );
}
