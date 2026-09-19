"use client";
import dynamic from "next/dynamic";
const World=dynamic(()=>import("@/components/World"),{ssr:false});
export default function Home(){
 return <main><World/><div className="hud"><strong>Japan 3D World</strong><span>WASD / arrows: move camera · drag: look · wheel/pinch: zoom</span></div></main>;
}
