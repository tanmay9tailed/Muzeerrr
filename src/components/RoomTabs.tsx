"use client";
import { motion } from "framer-motion";
import { Globe, Lock } from "lucide-react";

interface TabProps {
  activeTab: "public" | "private";
  onTabChange: (tab: "public" | "private") => void;
}

export default function RoomTabs({ activeTab, onTabChange }: TabProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white/5 p-1 rounded-full backdrop-blur-sm border border-red-600/20">
        <div className="relative flex">
          <motion.div
            className="absolute h-full bg-red-600/20 rounded-full"
            initial={false}
            animate={{
              x: activeTab === "public" ? "0%" : "100%",
              width: "50%"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => onTabChange("public")}
            className={`relative px-6 py-2 rounded-full flex items-center gap-2 transition-colors ${
              activeTab === "public" ? "text-white" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Globe className="w-4 h-4" />
            Public Rooms
          </button>
          <button
            onClick={() => onTabChange("private")}
            className={`relative px-6 py-2 rounded-full flex items-center gap-2 transition-colors ${
              activeTab === "private" ? "text-white" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Lock className="w-4 h-4" />
            My Rooms
          </button>
        </div>
      </div>
    </div>
  );
}