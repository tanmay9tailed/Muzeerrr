import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const joiningId = searchParams.get("joiningId");

    if (!joiningId) {
      return NextResponse.json(
        { success: false, message: "Joining ID is required." },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ joiningId }).populate(
      "userId",
      "name email"
    );

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          roomDetails: {
            name: room.name,
            joiningId: room.joiningId,
            public: room.public,
            createdAt: room.createdAt,
            user: room.userId, 
            songs: room.songs,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching room details:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
