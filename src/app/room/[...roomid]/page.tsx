"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Music2, Users, Globe, Lock, Loader2, Copy, ChevronRight, Zap, Trash2, DollarSign } from "lucide-react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import YouTube from "react-youtube";

const ParticlesBg = dynamic(() => import("react-tsparticles"), {
  ssr: false,
});

interface RoomDetails {
  name: string;
  joiningId: string;
  public: boolean;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  songs: {
    addedBy: string;
    videoId: string;
    createdAt: Date;
  }[];
}

interface Song {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  addedBy: string;
  videoUrl: string;
  createdAt: Date;
}

export default function Room() {
  const router = useRouter();
  const session = useSession();

  const joiningId = usePathname().split("/room/")[1];
  const [availableRoom, setAvailableRoom] = useState<boolean>(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInstantPlayModalOpen, setIsInstantPlayModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newSongUrl, setNewSongUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const userName = session.data?.user?.name;

  const fetchRoomDetails = async () => {
    try {
      const { data } = await axios.get(`/api/get-room-details?joiningId=${joiningId}`);
      if (data.success) {
        setRoomDetails(data.data.roomDetails);
        setIsCreator(session?.data?.user?.id === data.data.roomDetails?.user?._id);
        setAvailableRoom(true);
      } else {
        setAvailableRoom(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setAvailableRoom(false);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  useEffect(() => {
    if (session.status === "authenticated" && session.data?.user?.id) {
      fetchRoomDetails();
    }
    setIsLoading(false);
  }, [session, session.status, joiningId]);

  useEffect(() => {
    if (roomDetails && roomDetails.songs?.length > 0) {
      setSongs();
    }
  }, [roomDetails]);

  const handleDeleteRoom = async () => {
    try {
      const response = await axios.post(`/api/delete-room`, {
        joiningId,
      });

      if (response.data.success) {
        toast.success("Room deleted successfully!");
        router.push("/dashboard");
      } else {
        toast.error(response.data.message || "Failed to delete the room.");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("An error occurred while deleting the room.");
    }
    setIsDeleteModalOpen(false);
  };

  const extractVideoId = (url: string) => {
    let videoId = null;

    // Match standard YouTube URL
    const standardMatch = url.match(/[?&]v=([^#&?]{11})/);
    if (standardMatch) {
      videoId = standardMatch[1];
    }

    // Match shortened YouTube URL
    const shortMatch = url.match(/youtu\.be\/([^#&?]{11})/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    // Handle search query URL
    if (url.includes("search_query")) {
      videoId = "dQw4w9WgXcQ";
    }

    return videoId;
  };

  const handleBackdropClick = (e: React.MouseEvent, setModalState: (state: boolean) => void) => {
    if (e.target === e.currentTarget) {
      setModalState(false);
    }
  };

  const setSongs = () => {
    if (!roomDetails || !roomDetails.songs || roomDetails.songs.length === 0) {
      console.warn("No songs found in room.");
      return;
    }

    const convertedSongs: Song[] = roomDetails.songs
      .map((song) => {
        const videoId = song.videoId;
        if (!videoId) {
          console.warn(`Invalid YouTube URL: ${videoId}`);
          return null;
        }

        return {
          id: videoId,
          title: `New Song - ${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
          duration: "3:00", // You can replace it with the actual duration if available
          addedBy: song.addedBy,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          createdAt: song.createdAt,
        };
      })
      .filter((song) => song !== null);

    const sortedSongs = convertedSongs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setPlaylist([...sortedSongs]);
  };

  useEffect(() => {
    fetchRoomDetails();
    setSongs();

    // Set interval to fetch room details every 2 minutes (120,000 ms)
    const intervalId = setInterval(() => {
      console.log("Polling for new room data...");
      fetchRoomDetails();
    }, 120000);
    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [joiningId]);

  const handleAddSong = () => {
    const videoId = extractVideoId(newSongUrl);
    if (!videoId) {
      setError("Invalid YouTube URL. Please provide a valid link.");
      return;
    }

    const newSong: Song = {
      id: videoId,
      title: `New Song - ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
      duration: "3:00",
      addedBy: "You",
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      createdAt: new Date(),
    };

    setPlaylist([...playlist, newSong]);
    setNewSongUrl("");
    setIsAddModalOpen(false);
    addSong(videoId);
  };

  const handleNextSong = () => {
    if (playlist.length === 0) {
      setCurrentSong(null);
      return;
    }
    const nextSong = playlist.shift() || null;
    setCurrentSong(nextSong);
    setPlaylist([...playlist]);
  };

  const handleInstantPlay = () => {
    const videoId = extractVideoId(newSongUrl);
    if (!videoId) {
      setError("Invalid YouTube URL.");
      return;
    }

    const newSong: Song = {
      id: videoId,
      title: `Instant Play - ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
      duration: "3:00",
      addedBy: "Instant Play",
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };

    setCurrentSong(newSong);
    setIsInstantPlayModalOpen(false);
  };

  const handleVideoEnded = async (videoId: string, addedBy: string) => {
    try {
      const response = await axios.post("/api/remove-url", {
        videoId,
        addedBy,
        joiningId,
      });

      if (response.status === 200) {
        console.log("Video removed successfully:", response.data.message);
      } else {
        console.warn("Video removal failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error removing video:", error);
    }
    handleNextSong();
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const addSong = async (videoId: string) => {
    try {
      const addedBy = userName;
      const response = await axios.post("/api/add-url", {
        joiningId,
        videoId,
        addedBy,
      });

      if (response.data.success) {
        alert("Song added successfully!");
      } else {
        alert(response.data.message || "Failed to add song.");
      }
    } catch (error) {
      console.error("Error adding song:", error);
      alert("Error adding song. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!availableRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="bg-zinc-800 text-white px-8 py-6 rounded-lg shadow-lg text-center w-96">
          <h2 className="text-2xl font-bold mb-4 text-red-500">❌ Room Not Found</h2>
          <p className="text-gray-300 mb-6">
            The room you are looking for is not available. Please check the joining ID and try again.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            🔙 Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden flex flex-col">
      <ParticlesBg
        options={{
          particles: {
            number: { value: 50 },
            size: { value: 3 },
            move: { speed: 1 },
            links: { enable: true, opacity: 0.3, color: "#FF3B3F" },
            color: { value: "#FF3B3F" },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
            },
          },
        }}
      />

      <main className="flex-1 p-6 flex items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-900/60 rounded-xl border border-red-600/20 p-6 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-red-900/10 to-transparent"></div>

            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden bg-black mb-6">
                {currentSong ? (
                  <YouTube
                    videoId={(extractVideoId(currentSong?.videoUrl || "") as string) || ""}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                    onEnd={() => handleVideoEnded(currentSong.id, currentSong.addedBy)} // ✅ Correctly passed as a function reference
                    className="w-full h-full"
                  />
                ) : (
                  // <iframe
                  //   width="100%"
                  //   height="100%"
                  //   src={`https://www.youtube.com/embed/${extractVideoId(currentSong.videoUrl || "")}`}
                  //   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  //   allowFullScreen
                  // ></iframe>
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <img
                      src="https://img.icons8.com/ios-filled/100/ffffff/music-record.png"
                      alt="No Song"
                      className="w-24 h-24 mb-4"
                    />
                    <p className="text-lg">No song to play. Add a song to get started!</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{currentSong?.title}</h3>
                  <p className="text-gray-400">Added by {currentSong?.addedBy}</p>
                </div>
                {isCreator && (
                  <button
                    onClick={handleNextSong}
                    className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 transition-all text-red-400 hover:text-white border border-red-600/30 flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-xl border border-red-600/20 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Music2 className="w-6 h-6 text-red-500" />
              Playlist
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {playlist.map((song) => (
                <div
                  key={song.id}
                  className={`p-4 rounded-lg transition-all cursor-pointer ${
                    currentSong?.id === song.id
                      ? "bg-red-600/20 border border-red-600/30"
                      : "bg-zinc-800/50 hover:bg-zinc-700/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img src={song.thumbnail} alt={song.title} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium">{song.title}</h4>
                      <p className="text-sm text-gray-400">Added by {song.addedBy}</p>
                    </div>
                    <span className="text-sm text-gray-400">{song.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-black/40 backdrop-blur-xl border-t border-red-600/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              {roomDetails?.name}
            </h1>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Created by {roomDetails?.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {roomDetails?.public ? (
                  <>
                    <Globe className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">Public Room</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500">Private Room</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 transition-all text-red-400 hover:text-white border border-red-600/30"
            >
              Add Song
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
            >
              Invite Friends
            </button>
            <button
              onClick={() => !isCreator && setIsInstantPlayModalOpen(true)}
              disabled={isCreator}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 border ${
                isCreator
                  ? "bg-green-600/20 text-green-400 border-green-600/30"
                  : "bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white border-yellow-600/30"
              }`}
            >
              {isCreator ? (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Your balance : 0 sol</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Instant Play (0.25 SOL)</span>
                </>
              )}
            </button>

            {isCreator && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 transition-all text-red-400 hover:text-red-300 border border-red-900/30"
                title="Delete Room"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => handleBackdropClick(e, setIsAddModalOpen)}
        >
          <div className="bg-zinc-900/90 p-8 rounded-2xl w-[425px] max-w-full mx-4 border border-red-600/20 shadow-2xl shadow-red-600/10">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Add Song</h2>
            <p className="text-gray-400 mb-6">Enter a YouTube video URL to add to the playlist.</p>
            <input
              type="text"
              placeholder="YouTube URL"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              className="w-full p-3 mb-4 bg-zinc-800/50 border border-red-600/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600/50"
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSong}
                className="px-6 py-3 rounded-lg bg-red-600/20 hover:bg-red-600 transition-all text-red-400 hover:text-white border border-red-600/30"
              >
                Add Song
              </button>
            </div>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => handleBackdropClick(e, setIsInviteModalOpen)}
        >
          <div className="bg-zinc-900/90 p-8 rounded-2xl w-[425px] max-w-full mx-4 border border-red-600/20 shadow-2xl shadow-red-600/10">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Invite Friends</h2>
            <p className="text-gray-400 mb-6">Share this link with your friends to invite them to the room.</p>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="w-full p-3 bg-zinc-800/50 border border-red-600/20 rounded-lg text-white"
              />
              <button onClick={copyRoomLink} className="p-3 rounded-lg bg-red-600/20 hover:bg-red-600 transition-all">
                <Copy className="w-5 h-5" />
              </button>
            </div>
            {copied && <p className="text-green-500 text-center mb-4">Link copied to clipboard!</p>}
            <div className="flex justify-end">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isInstantPlayModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => handleBackdropClick(e, setIsInstantPlayModalOpen)}
        >
          <div className="bg-zinc-900/90 p-8 rounded-2xl w-[425px] max-w-full mx-4 border border-yellow-600/20 shadow-2xl shadow-yellow-600/10">
            <h2 className="text-3xl font-bold mb-2 text-yellow-500">Instant Play</h2>
            <p className="text-gray-400 mb-6">Pay 0.25 SOL to play your song immediately.</p>
            <input
              type="text"
              placeholder="YouTube URL"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              className="w-full p-3 mb-4 bg-zinc-800/50 border border-yellow-600/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600/50"
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsInstantPlayModalOpen(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleInstantPlay}
                className="px-6 py-3 rounded-lg bg-yellow-600/20 hover:bg-yellow-600 transition-all text-yellow-400 hover:text-white border border-yellow-600/30 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Pay & Play
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => handleBackdropClick(e, setIsDeleteModalOpen)}
        >
          <div className="bg-zinc-900/90 p-8 rounded-2xl w-[425px] max-w-full mx-4 border border-red-900/20 shadow-2xl shadow-red-900/10">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Delete Room</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this room? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-6 py-3 rounded-lg bg-red-900/20 hover:bg-red-900 transition-all text-red-400 hover:text-white border border-red-900/30 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[150px]"></div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 59, 63, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 59, 63, 0.7);
        }
      `}</style>
    </div>
  );
}
