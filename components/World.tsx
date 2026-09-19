"use client";
import {useEffect,useRef,useState} from "react";

declare global { interface Window { Cesium:any } }

const CESIUM_JS="https://cdn.jsdelivr.net/npm/cesium@1.133.0/Build/Cesium/Cesium.js";
const CESIUM_CSS="https://cdn.jsdelivr.net/npm/cesium@1.133.0/Build/Cesium/Widgets/widgets.css";
const OSAKA_BUILDINGS="https://api.plateauview.mlit.go.jp/datacatalog/3dtiles/27100-bldg-lod1-latest/tileset.json";

export default function World(){
 const host=useRef<HTMLDivElement>(null);
 const [status,setStatus]=useState("Loading real Osaka…");
 useEffect(()=>{
  let viewer:any;
  const load=async()=>{
   if(!document.querySelector('link[data-cesium]')){
    const l=document.createElement("link");l.rel="stylesheet";l.href=CESIUM_CSS;l.dataset.cesium="1";document.head.appendChild(l);
   }
   if(!window.Cesium){
    await new Promise<void>((resolve,reject)=>{
     const s=document.createElement("script");s.src=CESIUM_JS;s.async=true;s.onload=()=>resolve();s.onerror=()=>reject(new Error("Cesium failed to load"));document.head.appendChild(s);
    });
   }
   if(!host.current)return;
   const C=window.Cesium;
   viewer=new C.Viewer(host.current,{
    animation:false,timeline:false,baseLayerPicker:false,geocoder:false,homeButton:false,
    sceneModePicker:false,navigationHelpButton:false,fullscreenButton:false,infoBox:false,
    selectionIndicator:false,shouldAnimate:true,baseLayer:false
   });
   viewer.scene.globe.baseColor=C.Color.fromCssColorString("#d8e5cf");
   viewer.scene.backgroundColor=C.Color.fromCssColorString("#bfe3ff");
   viewer.scene.globe.depthTestAgainstTerrain=true;
   try{
    const tileset=await C.Cesium3DTileset.fromUrl(OSAKA_BUILDINGS);
    viewer.scene.primitives.add(tileset);
    // Dotonbori / Namba, Osaka
    viewer.camera.setView({
     destination:C.Cartesian3.fromDegrees(135.5012,34.6687,190),
     orientation:{heading:C.Math.toRadians(15),pitch:C.Math.toRadians(-32),roll:0}
    });
    setStatus("Dotonbori / Namba · Official PLATEAU 3D buildings");
   }catch(e){console.error(e);setStatus("Could not load PLATEAU buildings");}
  };
  load().catch(e=>{console.error(e);setStatus("Could not start 3D viewer");});
  return()=>viewer?.destroy();
 },[]);
 return <div className="worldWrap"><div ref={host} className="cesiumHost"/><div className="sourceBadge">{status}</div></div>;
}
