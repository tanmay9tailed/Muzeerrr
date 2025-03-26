import { Schema, Document, model, models, Types } from "mongoose";

// Define Room interface
interface IRoom extends Document {
  name: string;
  joiningId: string;
  createdAt: Date;
  public: boolean;
  userId: Types.ObjectId; // Reference to User
}

// Define Room schema
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
    default: true
  },
  userId: {
    type: Schema.Types.ObjectId, // Reference to User model
    ref: "User", // Refers to User collection
    required: [true, "User ID is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create or retrieve the Room model
const Room = models.Room || model<IRoom>("Room", RoomSchema);

export default Room;
