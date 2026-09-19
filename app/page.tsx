"use client";
import dynamic from "next/dynamic";
const World=dynamic(()=>import("@/components/World"),{ssr:false});
export default function Home(){return <main><World/><div className="hud"><strong>Real Osaka 3D</strong><span>Drag: look · wheel/pinch: zoom · right-drag: tilt</span></div></main>;}
