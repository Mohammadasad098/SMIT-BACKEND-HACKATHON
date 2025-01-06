import mongoose from "mongoose";

const Schema = mongoose.Schema;

const dataSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    enrolledUsers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
  }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Data", dataSchema);