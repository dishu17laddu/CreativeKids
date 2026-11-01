import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    artist: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      default: "Drawing",
      trim: true
    },

    image: {
      type: String,
      default: ""
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Artwork", artworkSchema);