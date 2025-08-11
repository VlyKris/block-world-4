import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Blocks, Gamepad2, Globe, Users } from "lucide-react";
import { Link } from "react-router";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-green-400 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Blocks className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">MineCraft Clone</span>
          </div>
          <AuthButton
            trigger={
              <Button size="lg" className="bg-white text-green-600 hover:bg-white/90">
                Play Now
              </Button>
            }
            dashboardTrigger={
              <Button size="lg" className="bg-white text-green-600 hover:bg-white/90">
                <Link to="/dashboard">Enter Game</Link>
              </Button>
            }
          />
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Build Your
            <br />
            <span className="text-yellow-300">Block World</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Create, explore, and survive in an infinite voxel universe. 
            Build anything you can imagine with unlimited blocks and endless possibilities.
          </p>
          <AuthButton
            trigger={
              <Button size="lg" className="bg-yellow-400 text-green-800 hover:bg-yellow-300 text-xl px-8 py-6">
                <Gamepad2 className="w-6 h-6 mr-2" />
                Start Building
              </Button>
            }
            dashboardTrigger={
              <Button size="lg" className="bg-yellow-400 text-green-800 hover:bg-yellow-300 text-xl px-8 py-6">
                <Link to="/dashboard" className="flex items-center">
                  <Gamepad2 className="w-6 h-6 mr-2" />
                  Continue Playing
                </Link>
              </Button>
            }
          />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <Blocks className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">Infinite Building</h3>
              <p className="text-white/80">
                Place and break blocks to create anything from simple houses to massive castles.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">Procedural Worlds</h3>
              <p className="text-white/80">
                Explore endless terrain with mountains, forests, and unique landscapes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">Share & Explore</h3>
              <p className="text-white/80">
                Create public worlds and explore amazing creations from other players.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
            <CardContent className="p-8">
              <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Pixelated landscape mockup */}
                <div className="absolute inset-0 opacity-30">
                  <div className="grid grid-cols-16 grid-rows-9 h-full w-full">
                    {Array.from({ length: 144 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          Math.random() > 0.7
                            ? "bg-green-600"
                            : Math.random() > 0.5
                            ? "bg-green-500"
                            : "bg-blue-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 text-center text-white">
                  <Blocks className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Your Adventure Awaits</h3>
                  <p className="text-white/80">
                    Start building your dream world today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Floating blocks animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 bg-white/10 rounded-sm"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              rotate: 0,
            }}
            animate={{
              y: -50,
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              left: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>
    </div>
  );
}