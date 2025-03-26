"use client";
import { Music2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  joiningId: string;
  public: boolean;
  participants?: number;
}

interface RoomsListProps {
  rooms: Room[];
  error: string | null;
  onRetry: () => void;
  onRoomClick: (joiningId: string) => void;
  type: "public" | "private";
}

export default function RoomsList({ rooms, error, onRetry, onRoomClick, type }: RoomsListProps) {
  // ✅ Handle Error State
  if (error) {
    return (
      <div
        className="col-span-full flex flex-col items-center justify-center p-8 bg-white/5 rounded-lg border border-red-600/30 backdrop-blur-lg"
        role="alert"
        aria-live="assertive"
      >
        <Music2 className="w-16 h-16 text-red-600/50 mb-4" />
        <p className="text-xl text-gray-400">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 rounded-full bg-red-600/20 hover:bg-red-600/30 transition-all text-red-400"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ✅ Handle Empty State (No Rooms)
  if (rooms.length === 0) {
    return (
      <div
        className="col-span-full flex flex-col items-center justify-center p-8 bg-white/5 rounded-lg border border-red-600/30 backdrop-blur-lg"
        role="status"
        aria-live="polite"
      >
        <Music2 className="w-16 h-16 text-red-600/50 mb-4" />
        <p className="text-xl text-gray-400">
          {type === "private" ? "You haven't created any rooms yet" : "No public rooms available"}
        </p>
        <p className="text-gray-500 mt-2">
          {type === "private" ? "Create your first room!" : "Be the first to create one!"}
        </p>
      </div>
    );
  }

  // ✅ Render Room Cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {rooms.map((room) => (
        <div
          key={room.joiningId}
          className="bg-white/5 p-6 rounded-lg border border-red-600/30 backdrop-blur-lg hover:scale-105 transition-transform hover:shadow-red-600/40 cursor-pointer group"
          onClick={() => onRoomClick(room.joiningId)}
          role="button"
          tabIndex={0}
          aria-label={`Join ${room.name}`}
        >
          {/* Room Name */}
          <h3
            className="text-2xl font-bold mb-2 text-red-500 group-hover:text-red-400 transition-colors"
          >
            {room.name}
          </h3>
          {/* Room Type Indicator */}
          <p className="text-gray-400 mb-4">
            {room.public ? "🌐 Public Room" : "🔒 Private Room"}
          </p>
          {/* Join Button */}
          <button
            className="w-full px-4 py-2 rounded-full bg-red-600/20 hover:bg-red-600 transition-all text-red-400 hover:text-white"
          >
            Join Now
          </button>
        </div>
      ))}
    </div>
  );
}
