"use client";
import React, { useState, useEffect } from "react";
import { Plus, DoorOpen, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RoomTabs from "@/components/RoomTabs";
import RoomsList from "@/components/RoomsList";

// Dynamically import Particles to prevent SSR issues
const ParticlesBg = dynamic(() => import("react-tsparticles"), {
  ssr: false,
});

interface Room {
  id: string;
  name: string;
  joiningId: string;
  public: boolean;
  participants?: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = useState<Room[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const session = useSession();
  const userId = session.data?.user?.id;

  useEffect(() => {
    if (activeTab === "public") {
      fetchPublicRooms();
    } else {
      fetchMyRooms();
    }
  }, [activeTab, userId]);

  const fetchPublicRooms = async () => {
    try {
      setError(null);
      const response = await axios.get("/api/all-rooms");
      const data = response.data.data;
      console.log("Public Room : ",data)
      setPublicRooms(data);
    } catch (error) {
      console.error(error);
      setError("Unable to fetch public rooms at the moment");
      setPublicRooms([]);
    }
  };

  const fetchMyRooms = async () => {
    if (!userId) return;
    
    try {
      setError(null);
      const response = await axios.post("/api/my-rooms", {
        userId
      });
      const data = response.data.data;
      setPrivateRooms(data);
    } catch (error) {
      console.error(error);
      setError("Unable to fetch your rooms at the moment");
      setPrivateRooms([]);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roomName,
          userId,
          isPublic, 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Room created successfully!");
        setIsCreateModalOpen(false);
        setRoomName("");
        router.push(`/room/${data.data.joiningId}`);
        if (isPublic) {
          fetchPublicRooms();
        } else {
          fetchMyRooms();
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  // Modal backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>, setModalOpen: (open: boolean) => void) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen gradient-bg text-white pt-24 overflow-hidden">
      {/* Floating Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Background Particles */}
      <ParticlesBg
        options={{
          particles: {
            number: { value: 80 },
            size: { value: 3 },
            move: { speed: 1 },
            links: { enable: true, opacity: 0.3, color: "#FF3B3F" },
            color: { value: "#FF3B3F" },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { particles_nb: 4 },
            },
          },
        }}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 text-center relative z-10">
        <h1 className="text-6xl font-bold mb-8 text-red-600 neon-text-pulse">🎧 Create Your Perfect Music Room</h1>
        <p className="text-xl text-gray-300 mb-12">
          Share music, collaborate with friends, and create unforgettable moments together.
        </p>

        {/* Room Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center mb-20">
          <RoomCard
            icon={<Plus className="w-12 h-12 text-red-600 mb-4 mx-auto" />}
            title="Create a Room"
            description="Host a new music room and invite your friends to join."
            buttonText="Create Room"
            onClick={() => setIsCreateModalOpen(true)}
          />

          <RoomCard
            icon={<DoorOpen className="w-12 h-12 text-red-600 mb-4 mx-auto" />}
            title="Join a Room"
            description="Explore available rooms and jump into the vibe."
            buttonText="Join Room"
            onClick={() => setIsJoinModalOpen(true)}
          />
        </div>

        {/* Rooms Section */}
        <section>
          <RoomTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <RoomsList
            rooms={activeTab === "public" ? publicRooms : privateRooms}
            error={error}
            onRetry={activeTab === "public" ? fetchPublicRooms : fetchMyRooms}
            onRoomClick={handleJoinRoom}
            type={activeTab}
          />
        </section>
      </main>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => handleBackdropClick(e, setIsCreateModalOpen)}
        >
          <div className="bg-zinc-900/90 p-8 rounded-2xl w-[425px] max-w-full mx-4 border border-red-600/20 shadow-2xl shadow-red-600/10">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Create a New Room</h2>
            <p className="text-gray-400 mb-6">
              Enter a name for your music room. You&apos;ll get a unique joining ID after creation.
            </p>
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-3 mb-4 bg-zinc-800/50 border border-red-600/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
            />
            {/* Public/Private Option */}
            <div className="flex items-center justify-start gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                <input
                  type="radio"
                  name="roomType"
                  value="public"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                Public Room
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                <input
                  type="radio"
                  name="roomType"
                  value="private"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                Private Room
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all text-gray-300 hover:text-white border border-transparent hover:border-zinc-600/30"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-red-600/20 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-600/20 transition-all text-red-400 hover:text-white flex items-center justify-center min-w-[120px] border border-red-600/30 hover:border-red-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Room"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {isJoinModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => handleBackdropClick(e, setIsJoinModalOpen)}
        >
          <div className="bg-zinc-900/90 p-8 rounded-2xl w-[425px] max-w-full mx-4 border border-red-600/20 shadow-2xl shadow-red-600/10">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Join a Room</h2>
            <p className="text-gray-400 mb-6">Enter the room&apos;s joining ID to connect with others.</p>
            <input
              type="text"
              placeholder="Room joining ID"
              value={joiningId}
              onChange={(e) => setJoiningId(e.target.value)}
              className="w-full p-3 mb-6 bg-zinc-800/50 border border-red-600/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all text-gray-300 hover:text-white border border-transparent hover:border-zinc-600/30"
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinRoom(joiningId)}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-red-600/20 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-600/20 transition-all text-red-400 hover:text-white flex items-center justify-center min-w-[120px] border border-red-600/30 hover:border-red-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neon Glow Effect */}
      <div className="absolute inset-0 bg-red-600/10 blur-3xl opacity-20 pointer-events-none"></div>
    </div>
  );
}

// RoomCard Props Interface
interface RoomCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

// Reusable RoomCard Component
function RoomCard({ icon, title, description, buttonText, onClick }: RoomCardProps) {
  return (
    <div className="bg-white/5 p-8 rounded-lg border border-red-600/30 backdrop-blur-lg transition-all hover:scale-105 hover:shadow-red-600/20 relative group overflow-hidden cursor-pointer">
      {/* Neon Glow Effect */}
      <div className="absolute inset-0 bg-red-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      {icon}
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <button
        onClick={onClick}
        className="px-6 py-3 rounded-full bg-red-600/20 hover:bg-red-600 transition-all relative z-10 text-red-400 hover:text-white border border-red-600/30 hover:border-red-600"
      >
        {buttonText}
      </button>
    </div>
  );
}