"use client";
import{Canvas,useFrame,useThree}from"@react-three/fiber";
import{OrbitControls,Text}from"@react-three/drei";
import{useEffect,useRef}from"react";
import*as THREE from"three";

const B=[[-12,-10,8,11,"#f4c7c3"],[-4,-10,7,15,"#c7d9f4"],[4,-10,7,13,"#f6d28f"],[12,-10,8,17,"#d8c6ed"],[-12,10,8,13,"#c9e3c1"],[-4,10,7,17,"#f2b5c4"],[4,10,7,12,"#b9d9ed"],[12,10,8,15,"#f4c995"]]as const;
const signs=["カフェ","ゲーム","本","ファッション","ラーメン","くすり","コンビニ","カラオケ"];

function Building({b,i}:{b:typeof B[number],i:number}){let[x,z,w,h,c]=b;let front=z<0?z+3.01:z-3.01;return <group>
 <mesh position={[x,h/2,z]} castShadow receiveShadow><boxGeometry args={[w,h,6]}/><meshStandardMaterial color={c} roughness={.8}/></mesh>
 {Array.from({length:Math.floor(h/2.7)},(_,r)=>[-2,0,2].map((dx,k)=><mesh key={r+"-"+k} position={[x+dx,2.2+r*2.4,front]} rotation={[0,z<0?0:Math.PI,0]}><planeGeometry args={[1.25,1.25]}/><meshStandardMaterial color="#d9f1ff" metalness={.05} roughness={.25}/></mesh>))}
 <mesh position={[x,2.5,front+(z<0?.06:-.06)]} rotation={[0,z<0?0:Math.PI,0]}><boxGeometry args={[w*.78,1.25,.12]}/><meshStandardMaterial color={["#ed5c78","#397ad6","#f2b632","#36a876"][i%4]}/></mesh>
 <Text position={[x,2.5,front+(z<0?.14:-.14)]} rotation={[0,z<0?0:Math.PI,0]} fontSize={.48} color="white" anchorX="center" anchorY="middle">{signs[i]}</Text>
 <mesh position={[x,1,front+(z<0?.1:-.1)]}><boxGeometry args={[2.1,2,.15]}/><meshStandardMaterial color="#f7f2df"/></mesh>
 </group>}
function Tree({x,z}:{x:number,z:number}){return <group position={[x,0,z]}><mesh position={[0,1.1,0]} castShadow><cylinderGeometry args={[.18,.25,2.2,8]}/><meshStandardMaterial color="#79563b"/></mesh><mesh position={[0,2.8,0]} castShadow><icosahedronGeometry args={[1.35,1]}/><meshStandardMaterial color="#65a95e"/></mesh></group>}
function Light({x,z}:{x:number,z:number}){return <group position={[x,0,z]}><mesh position={[0,1.8,0]}><cylinderGeometry args={[.08,.1,3.6,8]}/><meshStandardMaterial color="#26333a"/></mesh><mesh position={[0,3.55,0]}><boxGeometry args={[.65,.38,.3]}/><meshStandardMaterial color="#ffe7a6" emissive="#ffc85a" emissiveIntensity={.5}/></mesh></group>}
function Person({x,z,c="#eaa07d"}:{x:number,z:number,c?:string}){return <group position={[x,0,z]}><mesh position={[0,.45,0]} castShadow><capsuleGeometry args={[.28,.45,5,8]}/><meshStandardMaterial color={c}/></mesh><mesh position={[0,1.18,0]} castShadow><sphereGeometry args={[.38,16,12]}/><meshStandardMaterial color="#ffd3b5"/></mesh><mesh position={[0,1.35,-.05]}><sphereGeometry args={[.39,16,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#5b382d"/></mesh></group>}
function Player(){return <group position={[0,0,2.5]}><Person x={0} z={0} c="#f1eee5"/><mesh position={[0,.75,.28]}><boxGeometry args={[.55,.7,.22]}/><meshStandardMaterial color="#43576b"/></mesh></group>}
function CameraKeys(){const k=useRef<Record<string,boolean>>({});const{camera}=useThree();useEffect(()=>{let d=(e:KeyboardEvent)=>k.current[e.key.toLowerCase()]=true,u=(e:KeyboardEvent)=>k.current[e.key.toLowerCase()]=false;addEventListener("keydown",d);addEventListener("keyup",u);return()=>{removeEventListener("keydown",d);removeEventListener("keyup",u)}},[]);useFrame((_,dt)=>{let f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();let r=new THREE.Vector3().crossVectors(f,camera.up).normalize(),s=7*dt;if(k.current.w||k.current.arrowup)camera.position.addScaledVector(f,s);if(k.current.s||k.current.arrowdown)camera.position.addScaledVector(f,-s);if(k.current.a||k.current.arrowleft)camera.position.addScaledVector(r,-s);if(k.current.d||k.current.arrowright)camera.position.addScaledVector(r,s)});return null}
function Scene(){return <><color attach="background" args={["#8fd0ff"]}/><fog attach="fog" args={["#b9ddf2",35,65]}/><ambientLight intensity={1.8}/><directionalLight castShadow position={[8,18,10]} intensity={2.2} shadow-mapSize={[1024,1024]}/>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[55,45]}/><meshStandardMaterial color="#eee9dc"/></mesh>
 <mesh position={[0,.025,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[55,11]}/><meshStandardMaterial color="#596681"/></mesh>
 {Array.from({length:10},(_,i)=><mesh key={"lane"+i} position={[-22+i*5,.06,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.7,.11]}/><meshBasicMaterial color="white"/></mesh>)}
 {Array.from({length:12},(_,i)=><mesh key={"cross"+i} position={[-4.4+i*.8,.065,3.5]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.48,6]}/><meshBasicMaterial color="white"/></mesh>)}
 {B.map((b,i)=><Building key={i} b={b} i={i}/>)}
 {[-15,-9,-3,3,9,15].flatMap((x,i)=>[<Tree key={"t"+i} x={x} z={-5.8}/>,<Tree key={"u"+i} x={x} z={5.8}/>])}
 {[-16,-8,8,16].flatMap((x,i)=>[<Light key={"l"+i} x={x} z={-5.3}/>,<Light key={"m"+i} x={x} z={5.3}/>])}
 <Player/>{[-14,-7,6,10,15].map((x,i)=><Person key={i} x={x} z={i%2?5.2:-5.2} c={["#e89b79","#6fa987","#e8cf72"][i%3]}/>)}
 <CameraKeys/><OrbitControls target={[0,2,0]} enableDamping minDistance={5} maxDistance={28} maxPolarAngle={Math.PI/2.05}/>
 </>}
export default function World(){return <Canvas shadows camera={{position:[8,6,13],fov:58}} dpr={[1,1.5]}><Scene/></Canvas>}
