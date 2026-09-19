# Japan 3D World

A cozy, walkable take on Shibuya Crossing built with Next.js (`src/` layout) and React Three Fiber. Everything is procedural geometry and canvas textures, so there are no external 3D assets to download.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Controls
- WASD / arrow keys: walk (relative to the camera)
- Shift: hold to switch between walk and run (or use the Walk / Run toggle)
- Space: jump
- Drag: look around
- Mouse wheel or the +/− buttons: zoom
- On touch screens: on-screen joystick and jump button

### What's in the scene
- Chibi player character with walk, run and jump animations and a follow camera that avoids buildings
- Scramble crossing with a working signal cycle: cars stop on red, pedestrians cross on the all-way walk phase
- Wandering NPCs, cars and a bus that stop for you
- 12 coins to find for the neighborhood quest, plus a live minimap

### Project layout
- `src/app` — page, HUD and styles
- `src/components/World.tsx` — the 3D scene, characters, vehicles and camera
- `src/components/Hud.tsx` — minimap, touch joystick and icons
- `src/components/worldData.ts` — shared layout and the small runtime store
