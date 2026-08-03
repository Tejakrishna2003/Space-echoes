# 🌌 COSMOS 3D // Hyper-Realistic NASA 3D Universe & Planetary Navigator

> **Space Echoes (`react-echoes`)** — A state-of-the-art interactive 3D WebGL universe explorer built with **React**, **Three.js**, **Tailwind CSS**, and the **Web Audio API**. Featuring zero-asset procedural 4K NASA texture generation, interactive 3D Earth internal core cutaways, orbital trajectory mechanics, deep-space cosmic entities, and synthesized ambient space audio.

---

## 🌟 Key Features

### 🎨 1. Procedural 4K NASA Texture Engine
- **Zero Heavy Image Assets**: All textures are generated on-the-fly via HTML5 Canvas algorithms.
- **The Sun**: Volumetric coronal plasma flares & thermal sunspot clusters.
- **Mercury**: Basalt base (`#8c7a6b`) with dense impact crater basins & Caloris Basin.
- **Earth**: Specular ocean reflection, 4K topographic relief bump map, city night lights, wisp weather clouds, and a Rayleigh atmospheric scattering shader.
- **Jupiter**: Fluid sine-wave gas turbulence `y + Math.sin(x * 0.025) * 14` + Great Red Spot storm.
- **Saturn**: North pole hexagonal storm easter egg & transparent ice ring divisions.
- **Uranus & Neptune**: Methane haze noise streak bands.
- **Supermassive Black Hole**: Relativistic plasma accretion disk with sine-alpha falloff (`#fff` → `#ffaa00` → `#ff0055` → `#6600cc`).

---

### 🌋 2. 3D Interactive Earth Internal Geological Cutaway
- **270° Concentric Wedge Slices** (`SphereGeometry` sweep angle `0` to `1.5 * Math.PI`):
  1. **Inner Core**: Solid sphere, glowing white-hot emissive (`#ffffff`).
  2. **Outer Core**: Molten iron-nickel shell (`#ff6600`).
  3. **Mantle**: Magma red-brown rock shell (`#8b2500`).
  4. **Crust**: NASA 4K topographic surface shell.
- **Live Geological Telemetry**: Press **`C`** on keyboard or click **`3D CUTAWAY [C]`** on the HUD footer to crack open the Earth in 3D and inspect internal layers (Crust 0–70km, Mantle 2,900km, Outer Core 2,200km, Inner Core 1,220km).

---

### 🚀 3. Universe Scale-Up & 16 Celestial Entities
- **16 Celestial Objects**: The Sun, Solar System overview mode, Mercury, Venus, Earth, Luna, Mars (Phobos/Deimos), Jupiter (Io/Europa/Ganymede/Callisto), Saturn, Uranus, Neptune (Triton), Kuiper Belt, Oort Cloud, Milky Way Galaxy, Andromeda Galaxy (M31), Stellar Nebula (M42), and Supermassive Black Hole.
- **Astronomical Precision**: Planetary orbit lines around the Sun, axial tilts (`tilt: 23.44°`), collision-free orbital radii, and 20,000 skydome stars.
- **Cinematic Controls**: Smooth vector camera lerping, drag-distance click protection (>6px drag cancels accidental scene jumps), and spherical orbit controls.

---

### 🎵 4. Synthesized Procedural Audio Engine
- **100% Web Audio API**: No external MP3 audio files needed.
- Generates procedural ambient space drones using 2 primary oscillators (`sine` & `triangle`), sub-bass tones, lowpass filters, and a 0.35s delay echo loop.
- **Custom Soundscapes**: Unique audio frequency profiles mapped for all 16 celestial objects.
- **Visualizer**: Real-time 2D canvas frequency bar visualizer embedded in the top header.

---

### 💻 5. Glassmorphic UI & Navigation
- **Header HUD**: Full top navigation bar with mobile hamburger drawer and direct celestial selectors.
- **Scanner Panel**: Orbital time speed slider (`0x` to `5x`) with dynamic pulsing frequency.
- **Codex Modal**: Comprehensive telemetry log presenting diameter, surface temp, gravity, day length, moons, composition, continents, oceans, and internal layers.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| **`C`** | Toggle 3D Earth Internal Geological Cutaway mode |
| **`M`** | Mute / Unmute ambient space audio |
| **`Z`** | Toggle Zen Mode (hides all HUD elements for cinematic view) |
| **`1 – 9`** | Direct warp to planet index (Sun, Solar System, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune) |
| **`0`** | Direct warp to Milky Way Galaxy |
| **`Esc`** | Close Codex Telemetry Modal |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **3D Graphics Engine**: Three.js (WebGL, Post-Processing Bloom, Custom Shaders)
- **Styling**: Tailwind CSS + Glassmorphism (`backdrop-blur-md`, `bg-white/5`)
- **Audio Engine**: Web Audio API (Synthesized Oscillators & Biquad Filters)
- **Icons**: Google Material Symbols Outlined

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 18+ installed

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tejakrishna2003/Space-echoes.git
   cd Space-echoes
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173/` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License
MIT License © 2026 Tejakrishna2003
