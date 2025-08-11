import { MinecraftGame } from "@/components/minecraft/MinecraftGame";
import { WorldSelector } from "@/components/minecraft/WorldSelector";
import { Id } from "@/convex/_generated/dataModel";
import { Protected } from "@/lib/protected-page";
import { useState } from "react";

export default function Dashboard() {
  const [selectedWorldId, setSelectedWorldId] = useState<Id<"worlds"> | null>(null);

  const handleWorldSelect = (worldId: string) => {
    setSelectedWorldId(worldId as Id<"worlds">);
  };

  const handleBackToWorlds = () => {
    setSelectedWorldId(null);
  };

  return (
    <Protected>
      {selectedWorldId ? (
        <MinecraftGame worldId={selectedWorldId} />
      ) : (
        <WorldSelector onWorldSelect={handleWorldSelect} />
      )}
    </Protected>
  );
}