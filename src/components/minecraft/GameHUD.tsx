import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Backpack, Gamepad2, Home, Settings } from "lucide-react";
import * as THREE from "three";

interface GameHUDProps {
  selectedBlock: string;
  onBlockSelect: (block: string) => void;
  inventory: Array<{ type: string; count: number; slot: number }>;
  isInventoryOpen: boolean;
  onInventoryToggle: () => void;
  gameMode: "creative" | "survival";
  onGameModeChange: (mode: "creative" | "survival") => void;
  worldName: string;
  position: THREE.Vector3;
}

const BLOCK_TYPES = [
  { type: "grass", name: "Grass", color: "#4CAF50" },
  { type: "dirt", name: "Dirt", color: "#8D6E63" },
  { type: "stone", name: "Stone", color: "#757575" },
  { type: "wood", name: "Wood", color: "#795548" },
  { type: "leaves", name: "Leaves", color: "#2E7D32" },
  { type: "sand", name: "Sand", color: "#FFC107" },
];

export function GameHUD({
  selectedBlock,
  onBlockSelect,
  inventory,
  isInventoryOpen,
  onInventoryToggle,
  gameMode,
  onGameModeChange,
  worldName,
  position,
}: GameHUDProps) {
  return (
    <>
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-4 h-4 border-2 border-white opacity-80">
          <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto"
        >
          <Card className="p-3 bg-black/70 text-white border-white/20">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5" />
              <div>
                <div className="font-bold">{worldName}</div>
                <div className="text-xs opacity-80">
                  {Math.floor(position.x)}, {Math.floor(position.y)}, {Math.floor(position.z)}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto"
        >
          <Card className="p-3 bg-black/70 text-white border-white/20">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="text-sm">{gameMode.toUpperCase()}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onGameModeChange(gameMode === "creative" ? "survival" : "creative")}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom HUD - Hotbar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-1"
        >
          {BLOCK_TYPES.slice(0, 9).map((block, index) => (
            <Button
              key={block.type}
              onClick={() => onBlockSelect(block.type)}
              className={`w-12 h-12 p-1 ${
                selectedBlock === block.type
                  ? "bg-white/30 border-2 border-white"
                  : "bg-black/50 border border-white/30"
              }`}
              style={{ backgroundColor: selectedBlock === block.type ? undefined : `${block.color}80` }}
            >
              <div
                className="w-full h-full rounded"
                style={{ backgroundColor: block.color }}
              />
            </Button>
          ))}
          
          <Button
            onClick={onInventoryToggle}
            className="w-12 h-12 ml-2 bg-black/50 border border-white/30 text-white hover:bg-white/20"
          >
            <Backpack className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Inventory Panel */}
      {isInventoryOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-auto"
          onClick={onInventoryToggle}
        >
          <Card
            className="p-6 bg-black/90 text-white border-white/20 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Inventory</h3>
            <div className="grid grid-cols-9 gap-2">
              {BLOCK_TYPES.map((block) => {
                const inventoryItem = inventory.find(item => item.type === block.type);
                return (
                  <Button
                    key={block.type}
                    onClick={() => {
                      onBlockSelect(block.type);
                      onInventoryToggle();
                    }}
                    className="w-12 h-12 p-1 bg-black/50 border border-white/30 hover:bg-white/20 relative"
                  >
                    <div
                      className="w-full h-full rounded"
                      style={{ backgroundColor: block.color }}
                    />
                    {inventoryItem && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {inventoryItem.count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
            <div className="mt-4 text-sm opacity-80">
              <p>Left click: Break block</p>
              <p>Shift + Left click: Place block</p>
              <p>WASD: Move</p>
              <p>Space: Up, Shift: Down</p>
              <p>Mouse: Look around</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Instructions overlay */}
      <div className="absolute bottom-20 left-4 pointer-events-none">
        <Card className="p-3 bg-black/70 text-white border-white/20 text-sm">
          <p>Click to start playing!</p>
          <p className="text-xs opacity-80">ESC to release mouse</p>
        </Card>
      </div>
    </>
  );
}
