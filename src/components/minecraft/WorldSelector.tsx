import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Globe, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WorldSelectorProps {
  onWorldSelect: (worldId: string) => void;
}

export function WorldSelector({ onWorldSelect }: WorldSelectorProps) {
  const myWorlds = useQuery(api.worlds.getMyWorlds);
  const publicWorlds = useQuery(api.worlds.getPublicWorlds);
  const createWorld = useMutation(api.worlds.createWorld);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldDescription, setNewWorldDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorld = async () => {
    if (!newWorldName.trim()) {
      toast.error("Please enter a world name");
      return;
    }

    setIsCreating(true);
    try {
      const worldId = await createWorld({
        name: newWorldName.trim(),
        description: newWorldDescription.trim() || undefined,
        isPublic,
      });
      
      toast.success("World created successfully!");
      setIsCreateDialogOpen(false);
      setNewWorldName("");
      setNewWorldDescription("");
      setIsPublic(false);
      onWorldSelect(worldId);
    } catch (error) {
      toast.error("Failed to create world");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-green-400 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Minecraft Clone
          </h1>
          <p className="text-xl text-white/90">
            Build, explore, and create in your own voxel world
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Worlds */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  My Worlds
                </CardTitle>
                <CardDescription>
                  Your personal worlds and creations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New World
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New World</DialogTitle>
                      <DialogDescription>
                        Set up your new Minecraft world
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="worldName">World Name</Label>
                        <Input
                          id="worldName"
                          value={newWorldName}
                          onChange={(e) => setNewWorldName(e.target.value)}
                          placeholder="My Awesome World"
                        />
                      </div>
                      <div>
                        <Label htmlFor="worldDescription">Description (Optional)</Label>
                        <Textarea
                          id="worldDescription"
                          value={newWorldDescription}
                          onChange={(e) => setNewWorldDescription(e.target.value)}
                          placeholder="Describe your world..."
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPublic"
                          checked={isPublic}
                          onCheckedChange={setIsPublic}
                        />
                        <Label htmlFor="isPublic">Make world public</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateWorld} disabled={isCreating}>
                        {isCreating ? "Creating..." : "Create World"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {myWorlds?.map((world) => (
                  <motion.div
                    key={world._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => onWorldSelect(world._id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{world.name}</h3>
                            {world.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {world.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Seed: {world.seed}
                            </p>
                          </div>
                          {world.isPublic && (
                            <Users className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {myWorlds?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No worlds yet. Create your first world!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Public Worlds */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Public Worlds
                </CardTitle>
                <CardDescription>
                  Explore worlds created by other players
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {publicWorlds?.map((world) => (
                  <motion.div
                    key={world._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => onWorldSelect(world._id)}
                    >
                      <CardContent className="p-4">
                        <div>
                          <h3 className="font-semibold">{world.name}</h3>
                          {world.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {world.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Seed: {world.seed}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {publicWorlds?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No public worlds available
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
