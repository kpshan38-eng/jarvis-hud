import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, Environment, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { SuitTheme } from "./SuitSelector";
import { X, Zap, Shield, Activity, Cpu, Target, Battery } from "lucide-react";

interface HolographicSuitPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  suit: SuitTheme;
}

// Iron Man helmet-inspired geometry
const SuitModel = ({ suit, hovered }: { suit: SuitTheme; hovered: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const primaryColor = useMemo(() => {
    const [h, s, l] = suit.colors.primary.split(" ").map(v => parseFloat(v));
    return new THREE.Color().setHSL(h / 360, s / 100, l / 100);
  }, [suit.colors.primary]);

  const glowColor = useMemo(() => {
    const [r, g, b] = suit.colors.glow.split(" ").map(v => parseInt(v));
    return new THREE.Color(r / 255, g / 255, b / 255);
  }, [suit.colors.glow]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main helmet body */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <dodecahedronGeometry args={[1.2, 1]} />
          <MeshTransmissionMaterial
            color={primaryColor}
            thickness={0.5}
            roughness={0.1}
            transmission={0.9}
            ior={1.5}
            chromaticAberration={0.03}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            attenuationDistance={0.5}
            attenuationColor={glowColor}
          />
        </mesh>

        {/* Arc reactor core */}
        <mesh ref={glowRef} position={[0, -0.3, 0.8]}>
          <torusGeometry args={[0.15, 0.05, 16, 32]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>

        {/* Inner core glow */}
        <mesh position={[0, -0.3, 0.8]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="white"
            emissive={glowColor}
            emissiveIntensity={5}
            toneMapped={false}
          />
        </mesh>

        {/* Eye slots */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={i} position={[x, 0.2, 0.9]}>
            <boxGeometry args={[0.25, 0.08, 0.1]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={hovered ? 4 : 2}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Wireframe overlay */}
        <mesh>
          <dodecahedronGeometry args={[1.25, 1]} />
          <meshBasicMaterial
            color={primaryColor}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Holographic rings */}
        {[1.6, 2, 2.4].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.5]}>
            <ringGeometry args={[radius - 0.02, radius, 64]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.15 - i * 0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </Float>

      {/* Orbiting particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.8 + Math.random() * 0.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 1.5,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* 3D Text label */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.2}
        color={primaryColor}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Orbitron-Bold.woff"
      >
        {suit.name.toUpperCase()}
      </Text>
    </group>
  );
};

const suitSpecs: Record<string, { power: number; armor: number; speed: number; weapons: number; stealth: number }> = {
  "mark-iii": { power: 70, armor: 75, speed: 65, weapons: 60, stealth: 30 },
  "mark-vi": { power: 80, armor: 80, speed: 70, weapons: 70, stealth: 35 },
  "mark-xlii": { power: 85, armor: 70, speed: 90, weapons: 75, stealth: 40 },
  "mark-xlv": { power: 88, armor: 85, speed: 80, weapons: 80, stealth: 45 },
  "mark-l": { power: 95, armor: 90, speed: 92, weapons: 95, stealth: 60 },
  "mark-lxxxv": { power: 100, armor: 95, speed: 95, weapons: 100, stealth: 70 },
  "hulkbuster": { power: 100, armor: 100, speed: 30, weapons: 90, stealth: 5 },
  "iron-spider": { power: 75, armor: 80, speed: 95, weapons: 70, stealth: 75 },
  "rescue": { power: 70, armor: 85, speed: 75, weapons: 40, stealth: 50 },
  "stealth": { power: 60, armor: 65, speed: 80, weapons: 55, stealth: 100 },
  "war-machine": { power: 90, armor: 95, speed: 60, weapons: 100, stealth: 15 },
};

const StatBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Zap; color: string }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xs font-mono" style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const HolographicSuitPreview = ({ isOpen, onClose, suit }: HolographicSuitPreviewProps) => {
  const specs = suitSpecs[suit.id] || suitSpecs["mark-iii"];
  const glowRgb = suit.colors.glow;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col lg:flex-row">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-card/50 border border-border rounded hover:bg-card transition-colors"
        >
          <X className="w-5 h-5 text-primary" />
        </button>

        {/* 3D Canvas */}
        <div className="flex-1 h-[50vh] lg:h-full relative">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.2} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight 
                position={[-5, -5, 5]} 
                intensity={0.5} 
                color={`rgb(${glowRgb})`} 
              />
              <SuitModel suit={suit} hovered={false} />
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                minDistance={3}
                maxDistance={8}
                autoRotate
                autoRotateSpeed={0.5}
              />
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* Scan lines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)"
              }}
            />
          </div>

          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute top-4 right-16 w-12 h-12 border-t-2 border-r-2 border-primary/50" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/50" />

          {/* Instructions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-muted-foreground">
              Drag to rotate • Scroll to zoom
            </p>
          </div>
        </div>

        {/* Specifications panel */}
        <div className="lg:w-80 p-6 bg-card/50 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: `rgb(${glowRgb})` }}
                />
                <span className="text-xs text-primary/60 uppercase tracking-wider">
                  Active Suit
                </span>
              </div>
              <h2 className="font-orbitron text-2xl text-primary jarvis-glow">
                {suit.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Mark {suit.mark}
              </p>
            </div>

            {/* Description */}
            <div className="jarvis-panel p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {suit.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="font-orbitron text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Combat Specifications
              </h3>
              
              <div className="space-y-3">
                <StatBar 
                  label="Power Output" 
                  value={specs.power} 
                  icon={Zap} 
                  color={`rgb(${glowRgb})`}
                />
                <StatBar 
                  label="Armor Rating" 
                  value={specs.armor} 
                  icon={Shield} 
                  color="#22c55e"
                />
                <StatBar 
                  label="Speed" 
                  value={specs.speed} 
                  icon={Activity} 
                  color="#3b82f6"
                />
                <StatBar 
                  label="Weapons" 
                  value={specs.weapons} 
                  icon={Target} 
                  color="#ef4444"
                />
                <StatBar 
                  label="Stealth" 
                  value={specs.stealth} 
                  icon={Battery} 
                  color="#8b5cf6"
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-orbitron text-xs text-primary uppercase tracking-wider">
                Key Features
              </h3>
              <ul className="space-y-2">
                {getFeatures(suit.id).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <div 
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: `rgb(${glowRgb})` }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Arc Reactor Type */}
            <div className="jarvis-panel p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Arc Reactor Type</span>
                <span className="text-xs font-mono text-primary uppercase">
                  {suit.arcReactorStyle}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getFeatures(suitId: string): string[] {
  const features: Record<string, string[]> = {
    "mark-iii": ["Repulsor technology", "Flight stabilizers", "HUD targeting system", "Gold-titanium alloy"],
    "mark-vi": ["Triangular arc reactor", "Improved power efficiency", "Enhanced repulsors", "Laser system"],
    "mark-xlii": ["Autonomous prehensile technology", "Mental command interface", "Modular assembly", "Emergency deployment"],
    "mark-xlv": ["Hexagonal reactor core", "Sentry mode", "Enhanced sensors", "Vibranium components"],
    "mark-l": ["Nanotech construction", "Shape-shifting weapons", "Self-repair capability", "Energy absorption"],
    "mark-lxxxv": ["Ultimate nanotech", "Infinity Stone housing", "Maximum power output", "Quantum tunneling"],
    "hulkbuster": ["Veronica satellite link", "Modular armor plating", "Hydraulic strength enhancement", "Backup systems"],
    "iron-spider": ["Waldoes (spider legs)", "Instant kill mode", "Parachute deployment", "Enhanced mobility"],
    "rescue": ["Defense-focused design", "Rescue systems", "Medical scanners", "Shield generators"],
    "stealth": ["Radar absorption", "Thermal masking", "Silent flight", "Low-signature operation"],
    "war-machine": ["Heavy ordnance", "Shoulder-mounted cannons", "Missile systems", "Reinforced plating"],
  };
  return features[suitId] || features["mark-iii"];
}

export default HolographicSuitPreview;
