import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface MinecraftWorldProps {
  worldId: Id<"worlds">;
  playerPosition: THREE.Vector3;
  onBlockPlace: (x: number, y: number, z: number) => void;
  onBlockBreak: (x: number, y: number, z: number) => void;
}

const BLOCK_TEXTURES = {
  grass: "#4CAF50",
  dirt: "#8D6E63",
  stone: "#757575",
  wood: "#795548",
  leaves: "#2E7D32",
  sand: "#FFC107",
};

function Block({ position, type, onClick }: {
  position: [number, number, number];
  type: string;
  onClick: (event: any) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = BLOCK_TEXTURES[type as keyof typeof BLOCK_TEXTURES] || "#757575";

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial
        color={hovered ? new THREE.Color(color).multiplyScalar(1.2) : color}
      />
    </mesh>
  );
}

function Chunk({ worldId, chunkX, chunkZ, onBlockPlace, onBlockBreak }: {
  worldId: Id<"worlds">;
  chunkX: number;
  chunkZ: number;
  onBlockPlace: (x: number, y: number, z: number) => void;
  onBlockBreak: (x: number, y: number, z: number) => void;
}) {
  const chunk = useQuery(api.chunks.getChunk, { worldId, chunkX, chunkZ });
  const generateChunk = useMutation(api.chunks.generateChunkMutation);

  // Generate chunk if it doesn't exist
  useEffect(() => {
    if (chunk === null) {
      generateChunk({ worldId, chunkX, chunkZ });
    }
  }, [chunk, worldId, chunkX, chunkZ, generateChunk]);

  const handleBlockClick = useCallback((event: any, block: any) => {
    event.stopPropagation();
    
    const worldX = chunkX * 16 + block.x;
    const worldZ = chunkZ * 16 + block.z;
    
    if (event.shiftKey) {
      // Place block on adjacent face
      const face = event.face;
      const normal = face.normal;
      onBlockPlace(
        worldX + normal.x,
        block.y + normal.y,
        worldZ + normal.z
      );
    } else {
      // Break block
      onBlockBreak(worldX, block.y, worldZ);
    }
  }, [chunkX, chunkZ, onBlockPlace, onBlockBreak]);

  if (!chunk) return null;

  return (
    <group>
      {chunk.blocks.map((block, index) => (
        <Block
          key={index}
          position={[
            chunkX * 16 + block.x,
            block.y,
            chunkZ * 16 + block.z,
          ]}
          type={block.type}
          onClick={(event) => handleBlockClick(event, block)}
        />
      ))}
    </group>
  );
}

export function MinecraftWorld({ worldId, playerPosition, onBlockPlace, onBlockBreak }: MinecraftWorldProps) {
  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set());
  const RENDER_DISTANCE = 3;

  const chunksToLoad = useMemo(() => {
    const chunks: Array<{ x: number; z: number }> = [];
    const playerChunkX = Math.floor(playerPosition.x / 16);
    const playerChunkZ = Math.floor(playerPosition.z / 16);

    for (let x = playerChunkX - RENDER_DISTANCE; x <= playerChunkX + RENDER_DISTANCE; x++) {
      for (let z = playerChunkZ - RENDER_DISTANCE; z <= playerChunkZ + RENDER_DISTANCE; z++) {
        chunks.push({ x, z });
      }
    }

    return chunks;
  }, [playerPosition.x, playerPosition.z]);

  useEffect(() => {
    const newLoadedChunks = new Set<string>();
    chunksToLoad.forEach(chunk => {
      newLoadedChunks.add(`${chunk.x},${chunk.z}`);
    });
    setLoadedChunks(newLoadedChunks);
  }, [chunksToLoad]);

  return (
    <group>
      {/* Sky */}
      <mesh position={[0, 100, 0]}>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Ground plane for reference */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>

      {/* Chunks */}
      {chunksToLoad.map(chunk => (
        <Chunk
          key={`${chunk.x},${chunk.z}`}
          worldId={worldId}
          chunkX={chunk.x}
          chunkZ={chunk.z}
          onBlockPlace={onBlockPlace}
          onBlockBreak={onBlockBreak}
        />
      ))}
    </group>
  );
}