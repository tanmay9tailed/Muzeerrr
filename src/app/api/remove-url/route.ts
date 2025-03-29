import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";
interface Song {
  addedBy: string;
  videoId: string;
}
export async function POST(req: NextRequest) {
  try {
    const { videoId, addedBy, joiningId } = await req.json(); 

    if (!videoId || !addedBy || !joiningId) {
      return NextResponse.json({ success: false, message: "Room ID, videoId, and addedBy are required." }, { status: 400 });
    }

    // Find the room by ID
    const room = await Room.findOne({joiningId});

    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found." }, { status: 404 });
    }

    // Filter out the song with the matching videoId and addedBy
    const updatedSongs = room.songs.filter((song: Song) => !(song.videoId === videoId && song.addedBy === addedBy));

    room.songs = updatedSongs;
    await room.save();

    return NextResponse.json({ success: true, message: "Song removed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error removing song:", error);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
