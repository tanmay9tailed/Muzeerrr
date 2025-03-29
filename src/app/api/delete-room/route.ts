import Room from "@/models/Room";
import User from "@/models/User";
import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";

export async function POST(req: Request) {
  await connectToDB(); // Ensure DB connection

  try {
    const { joiningId } = await req.json();

    if (!joiningId) {
      return NextResponse.json(
        { success: false, message: "Room ID is required." },
        { status: 400 }
      );
    }

    // Find the room by joiningId
    const room = await Room.findOne({ joiningId });
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found." },
        { status: 404 }
      );
    }

    // Delete the room
    const response = await Room.deleteOne({ joiningId });

    if (response.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Room not found or already deleted." },
        { status: 404 }
      );
    }

    // ✅ Remove the room reference from the user document
    await User.updateOne(
      { _id: room.userId },
      { $pull: { roomId: room._id } } // Corrected to use roomId
    );

    return NextResponse.json(
      { success: true, message: "Room deleted successfully and removed from user." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
