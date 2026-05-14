"use client";

import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, PerspectiveCamera, Center } from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import { AlertCircle, FileCode } from "lucide-react";

function Model({ url }: { url: string }) {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (extension !== 'stl') {
    return null;
  }

  // useLoader will suspend while loading
  const geom = useLoader(STLLoader, url);
  
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

export function CADViewer({ url }: { url: string }) {
  const extension = url?.split('.').pop()?.toLowerCase();
  const isSupported = extension === 'stl';

  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-2xl overflow-hidden relative border border-slate-800">
      {isSupported ? (
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
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <FileCode className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-200 font-medium mb-1">Preview Not Available</h3>
          <p className="text-slate-400 text-sm max-w-[240px]">
            3D preview is currently only supported for .STL files. 
            Analysis for .{extension?.toUpperCase()} is still available below.
          </p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
        {isSupported ? "3D Preview Mode" : "Analysis Only Mode"}
      </div>
    </div>
  );
}
