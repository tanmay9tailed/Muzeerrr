import connectToDB from "@/lib/db";
import Room from "@/models/Room";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        await connectToDB();
        const rooms = await Room.find({public: true}).populate("userId");
        return NextResponse.json({
            success: true,
            data: rooms
        })
    } catch (error) {
        console.error("Error fetching rooms: ", error)
        return NextResponse.json({
            success: false,
            error: error
        })
    }
}