import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";

export async function POST(req: NextRequest) {
  try {
    const { videoId, addedBy, joiningId } = await req.json(); // Correctly parse JSON body

    if (!videoId || !addedBy || !joiningId) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const room = await Room.findOne({joiningId});

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found." },
        { status: 404 }
      );
    }

    const newSong = {
      videoId,
      addedBy,
      createdAt: new Date(),
    };

    room.songs.push(newSong);
    await room.save();

    return NextResponse.json(
      { success: true, message: "Song added successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding song:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
