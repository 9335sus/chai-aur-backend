import mongoose from "mongoose"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler} from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  console.log("REQ.USER 👉", req.user);

  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const userId = req.user._id;

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  console.log("EXISTING SUB 👉", existingSubscription);

  // 🔴 UNSUBSCRIBE
  if (existingSubscription !== null) {
    await Subscription.deleteOne({ _id: existingSubscription._id });

    return res.status(200).json(
      new ApiResponse(
        200,
        { subscribed: false },
        "Unsubscribed successfully"
      )
    );
  }

  // 🟢 SUBSCRIBE
  const created = await Subscription.create({
    channel: channelId,
    subscriber: userId,
  });

  console.log("CREATED SUB 👉", created);

  return res.status(201).json(
    new ApiResponse(
      201,
      { subscribed: true },
      "Subscribed successfully"
    )
  );
});
const getUserChannelsSubscriptions = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized");
  }

  const channelId = req.user._id;

 const subscriptions = await Subscription
  .find({ channelId: channelId })
  .populate("channel");   // ✅ exact schema field


  return res.status(200).json(
    new ApiResponse(  
      200,
      subscriptions,
      "Subscriptions fetched successfully"
    )
  );
});
const getSubscribedChannels = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized");
  }
  const {subscriberId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }
  const channelSubscriptions = await Subscription.find({subscriber:subscriberId}).populate("subscriber");
  res.status(200).json(new ApiResponse(200, channelSubscriptions, "Subscribed channels fetched successfully"));
});
export {toggleSubscription, getUserChannelsSubscriptions,getSubscribedChannels};