"use client";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import {useEffect,useRef} from "react";
import * as THREE from "three";

const shops=[
 {x:-8,z:-9,w:7,h:7,d:6,c:"#f3a7b5",sign:"SHOP"},
 {x:0,z:-9,w:7,h:10,d:6,c:"#d8c7f1",sign:"ゲーム"},
 {x:8,z:-9,w:7,h:8,d:6,c:"#a8d8c8",sign:"CAFE"},
 {x:-8,z:9,w:7,h:9,d:6,c:"#f4d58d",sign:"BOOKS"},
 {x:0,z:9,w:7,h:7,d:6,c:"#9fc5e8",sign:"24H"},
 {x:8,z:9,w:7,h:11,d:6,c:"#f7b267",sign:"RAMEN"}
];

function Building({x,z,w,h,d,c}:{x:number,z:number,w:number,h:number,d:number,c:string}){
 const front=z<0?z+d/2+.02:z-d/2-.02;
 return <group>
  <mesh position={[x,h/2,z]} castShadow receiveShadow><boxGeometry args={[w,h,d]}/><meshStandardMaterial color={c}/></mesh>
  {[1.8,4,6.2,8.4].filter(y=>y<h-1).flatMap((y,ri)=>[-2,0,2].map((dx,i)=>
   <mesh key={ri+"-"+i} position={[x+dx,y,front]} rotation={[0,z<0?0:Math.PI,0]}>
    <planeGeometry args={[1.15,.9]}/><meshStandardMaterial color="#dff3ff" roughness={.25}/>
   </mesh>))}
  <mesh position={[x,h*.42,front+(z<0?.03:-.03)]} rotation={[0,z<0?0:Math.PI,0]}>
   <planeGeometry args={[w*.72,1.15]}/><meshStandardMaterial color="#fff4df"/>
  </mesh>
 </group>
}

function Tree({x,z}:{x:number,z:number}){
 return <group position={[x,0,z]}>
  <mesh position={[0,1,0]} castShadow><cylinderGeometry args={[.18,.25,2,8]}/><meshStandardMaterial color="#7d5a42"/></mesh>
  <mesh position={[0,2.5,0]} castShadow><dodecahedronGeometry args={[1.25,0]}/><meshStandardMaterial color="#69a96b"/></mesh>
 </group>
}

function CameraMover(){
 const keys=useRef<Record<string,boolean>>({});
 const {camera}=useThree();
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>keys.current[e.key.toLowerCase()]=true;
  const up=(e:KeyboardEvent)=>keys.current[e.key.toLowerCase()]=false;
  addEventListener("keydown",down);addEventListener("keyup",up);
  return()=>{removeEventListener("keydown",down);removeEventListener("keyup",up)};
 },[]);
 useFrame((_,dt)=>{
  const k=keys.current,speed=8*dt;
  const f=new THREE.Vector3(); camera.getWorldDirection(f); f.y=0; f.normalize();
  const r=new THREE.Vector3().crossVectors(f,camera.up).normalize();
  if(k.w||k.arrowup) camera.position.addScaledVector(f,speed);
  if(k.s||k.arrowdown) camera.position.addScaledVector(f,-speed);
  if(k.a||k.arrowleft) camera.position.addScaledVector(r,-speed);
  if(k.d||k.arrowright) camera.position.addScaledVector(r,speed);
 });
 return null;
}

function Street(){
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[60,60]}/><meshStandardMaterial color="#d9d5c8"/></mesh>
  <mesh position={[0,.025,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[60,10]}/><meshStandardMaterial color="#5e6268"/></mesh>
  {[-20,-12,-4,4,12,20].map(z=><mesh key={z} position={[0,.055,z/5]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[3,.12]}/><meshBasicMaterial color="white"/></mesh>)}
  {[-5,5].flatMap(x=>Array.from({length:9},(_,i)=><mesh key={x+"-"+i} position={[x,.06,-4+i]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.42,.7]}/><meshBasicMaterial color="white"/></mesh>))}
  {shops.map((b,i)=><Building key={i} {...b}/>)}
  {[-12,-4,4,12].flatMap((x,i)=>[<Tree key={"a"+i} x={x} z={-5.8}/>,<Tree key={"b"+i} x={x} z={5.8}/>])}
  {[-13,-5,3,11].map((x,i)=><group key={i} position={[x,0,-5.1]}>
    <mesh position={[0,1.6,0]}><cylinderGeometry args={[.07,.07,3.2,8]}/><meshStandardMaterial color="#333"/></mesh>
    <mesh position={[0,3.1,0]}><boxGeometry args={[.75,.32,.28]}/><meshStandardMaterial color="#333"/></mesh>
   </group>)}
 </group>
}

export default function World(){
 return <Canvas shadows camera={{position:[14,10,18],fov:55}} dpr={[1,1.7]}>
  <color attach="background" args={["#bfe3ff"]}/>
  <fog attach="fog" args={["#bfe3ff",35,75]}/>
  <ambientLight intensity={1.2}/>
  <directionalLight position={[12,20,8]} intensity={2.2} castShadow shadow-mapSize={[1024,1024]}/>
  <Street/><CameraMover/>
  <OrbitControls target={[0,2,0]} enableDamping minDistance={4} maxDistance={35} maxPolarAngle={Math.PI/2.05}/>
 </Canvas>
}
