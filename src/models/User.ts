import { Schema, Document, model, models, Types } from "mongoose";

interface IUser extends Document {
  email: string;
  roomId: Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
  },
  roomId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room", 
    },
  ],
});

const User = models.User || model<IUser>("User", UserSchema);

export default User;
