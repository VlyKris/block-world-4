import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Canvas } from "@react-three/fiber";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GameControls } from "./GameControls";
import { GameHUD } from "./GameHUD";
import { MinecraftWorld } from "./MinecraftWorld";

interface MinecraftGameProps {
  worldId: Id<"worlds">;
}

export function MinecraftGame({ worldId }: MinecraftGameProps) {
  const world = useQuery(api.worlds.getWorld, { worldId });
  const playerData = useQuery(api.players.getPlayerData, { worldId });
  const updatePosition = useMutation(api.players.updatePlayerPosition);
  const updateBlock = useMutation(api.chunks.updateBlock);
  
  const [selectedBlock, setSelectedBlock] = useState("grass");
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [gameMode, setGameMode] = useState<"creative" | "survival">("creative");
  
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const playerPosition = useRef(new THREE.Vector3(0, 64, 0));
  const playerRotation = useRef(new THREE.Euler(0, 0, 0));

  // Initialize player position from database
  useEffect(() => {
    if (playerData) {
      playerPosition.current.set(
        playerData.position.x,
        playerData.position.y,
        playerData.position.z
      );
      playerRotation.current.set(
        playerData.rotation.x,
        playerData.rotation.y,
        0
      );
    }
  }, [playerData]);

  // Save player position periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerData) {
        updatePosition({
          worldId,
          position: {
            x: playerPosition.current.x,
            y: playerPosition.current.y,
            z: playerPosition.current.z,
          },
          rotation: {
            x: playerRotation.current.x,
            y: playerRotation.current.y,
          },
        });
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [worldId, playerData, updatePosition]);

  const handleBlockPlace = useCallback((x: number, y: number, z: number) => {
    updateBlock({
      worldId,
      x: Math.floor(x),
      y: Math.floor(y),
      z: Math.floor(z),
      blockType: selectedBlock,
    });
  }, [worldId, selectedBlock, updateBlock]);

  const handleBlockBreak = useCallback((x: number, y: number, z: number) => {
    updateBlock({
      worldId,
      x: Math.floor(x),
      y: Math.floor(y),
      z: Math.floor(z),
      blockType: null,
    });
  }, [worldId, updateBlock]);

  if (!world || !playerData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-400 to-green-400">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-2xl font-bold"
        >
          Loading world...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [playerPosition.current.x, playerPosition.current.y + 1.8, playerPosition.current.z],
        }}
        onCreated={({ camera }) => {
          if (cameraRef.current) {
            cameraRef.current = camera as THREE.PerspectiveCamera;
          }
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 50, 50]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <MinecraftWorld
          worldId={worldId}
          playerPosition={playerPosition.current}
          onBlockPlace={handleBlockPlace}
          onBlockBreak={handleBlockBreak}
        />
        
        <GameControls
          cameraRef={cameraRef}
          playerPosition={playerPosition}
          playerRotation={playerRotation}
        />
      </Canvas>

      <GameHUD
        selectedBlock={selectedBlock}
        onBlockSelect={setSelectedBlock}
        inventory={playerData.inventory}
        isInventoryOpen={isInventoryOpen}
        onInventoryToggle={() => setIsInventoryOpen(!isInventoryOpen)}
        gameMode={gameMode}
        onGameModeChange={setGameMode}
        worldName={world.name}
        position={playerPosition.current}
      />
    </div>
  );
}