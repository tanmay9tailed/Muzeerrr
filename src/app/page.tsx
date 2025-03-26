import React from "react";
import { Music4, Users, Share2, Play, Plus, Headphones, Volume2 } from "lucide-react";
import SignInButton from "@/components/signin";

function App() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 relative">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="inline-block">
                <div className="flex items-center gap-2 bg-red-600/10 rounded-full px-4 py-2 border border-red-600/20">
                  <Headphones className="text-red-600 w-5 h-5" />
                  <span className="text-sm">Experience Music Together</span>
                </div>
              </div>
              <h2 className="text-7xl font-bold leading-tight">
                Create Your Perfect
                <span className="block text-red-600 neon-text neon-text-pulse">Music Room</span>
                Experience
              </h2>
            </div>
            <p className="text-xl text-gray-300">
              Share music, collaborate with friends, and create unforgettable moments together. Add your favorite
              YouTube tracks and let the music flow.
            </p>
            <SignInButton
              label="Create Your Room"
              variant="withIcon"
              icon={<Play size={24} />} 
            />
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent blur-3xl -rotate-12 scale-95 translate-x-4 translate-y-4"></div>
            <div className="card-gradient rounded-2xl p-8 border border-red-600/30 animate-float backdrop-blur-xl relative">
              <div className="absolute top-4 right-4">
                <div className="animate-pulse">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">Chill Vibes Room</h3>
                  <Share2 className="text-red-600" />
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Users size={20} />
                  <span>12 listeners</span>
                  <div className="flex items-center gap-1 ml-4">
                    <Volume2 size={16} className="text-red-600" />
                    <div className="space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`inline-block w-1 h-${3 + i} bg-red-600 rounded-full animate-pulse`}
                          style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-black/50 p-4 rounded-lg flex items-center justify-between backdrop-blur-sm border border-white/5">
                    <span>🎵 Currently Playing: Lofi Beats</span>
                    <Music4 className="text-red-600" />
                  </div>
                  <button className="w-full py-3 rounded-lg border border-red-600/50 hover:bg-red-600/20 transition-colors flex items-center justify-center gap-2 group">
                    <Plus size={20} className="transform group-hover:rotate-180 transition-transform" />
                    Add Track
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Music4,
              title: "Add Any Track",
              description: "Simply paste YouTube links to add your favorite music to the queue.",
            },
            {
              icon: Users,
              title: "Collaborate",
              description: "Invite friends to join your room and contribute to the playlist.",
            },
            {
              icon: Share2,
              title: "Share Instantly",
              description: "Share your room with anyone, anywhere with a single click.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="card-gradient rounded-xl p-6 border border-red-600/30 feature-card backdrop-blur-xl"
            >
              <feature.icon className="text-red-600 w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
