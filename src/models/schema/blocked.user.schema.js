// models/blockedUser.model.js
import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema(
  {
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["PARTIAL", "FULL", "CUSTOM"], // Adjust according to your Block_Type enum
      default: "PARTIAL",
    },
    duration: {
      type: Number, // Duration in minutes or hours (depending on your use case)
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["USER_BLOCKED", "ADMIN_BLOCKED"], // Match your Block_Status enum
      default: "USER_BLOCKED",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Unique index on blockedBy + blockedTo
blockedUserSchema.index({ blockedBy: 1, blockedTo: 1 }, { unique: true });

const BlockedUserModel = mongoose.model("BlockedUser", blockedUserSchema);

export default BlockedUserModel ;
