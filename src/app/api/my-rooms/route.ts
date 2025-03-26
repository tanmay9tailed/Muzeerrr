import connectToDB from "@/lib/db";
import Room from "@/models/Room";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 }
      );
    }

    // Fetch rooms created by the user
    const rooms = await Room.find({ userId });

    return NextResponse.json({ success: true, data: rooms }, { status: 200 });
  } catch (error) {
    console.error("Error getting rooms: ", error);
    return NextResponse.json(
      { success: false, error: error || "Error fetching rooms." },
      { status: 500 }
    );
  }
}
