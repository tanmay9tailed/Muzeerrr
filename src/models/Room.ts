import { Schema, Document, model, models, Types } from "mongoose";

// Define Song Interface for Embedded Array
interface ISong {
  addedBy: string;
  videoUrl: string;
  createdAt: Date;
}

// Define Room Interface
interface IRoom extends Document {
  name: string;
  joiningId: string;
  createdAt: Date;
  public: boolean;
  userId: Types.ObjectId;
  songs: ISong[]; // Embedded array of songs
}

// Room Schema
const RoomSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Room name is required."],
  },
  joiningId: {
    type: String,
    required: [true, "Joining ID is required."],
    unique: true, // Ensure joiningId is unique
  },
  public: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required."],
  },
  songs: [
    {
      addedBy: {
        type: String,
        required: [true, "Added by name is required."],
      },
      videoId: {
        type: String,
        required: [true, "Video Id is required."],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Room = models.Room || model<IRoom>("Room", RoomSchema);

export default Room;
