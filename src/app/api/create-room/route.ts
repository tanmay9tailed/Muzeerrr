import connectToDB from "@/lib/db";
import Room from "@/models/Room";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { name, userId, isPublic } = await req.json();

    if (!name || !userId) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }
    const joiningId = uuidv4();
    const newRoom = await Room.create({
      name,
      userId,
      joiningId,
      public: isPublic
    });

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            roomId: newRoom._id,
          },
        },
        { new: true, useFindAndModify: false }
      );
  
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: "User not found." },
          { status: 404 }
        );
      }

    return NextResponse.json({ success: true, data: newRoom }, { status: 201 });
  } catch (error) {
    console.log("Error creating room ", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
