import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const getAllVideo = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { query, userId } = req.params;
  const filter = { isPublished: true };
  if (userId) {
    filter.owner = userId;
  }

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  const videos = await Video.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const totalVideos = await Video.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(true, "Videos fetched successfully", null, {
      videos,
      page,
      limit,
      totalVideos,
      totalPages: Math.ceil(totalVideos / limit),
    })
  );
});

const publishVideo = asyncHandler(async (req, res) => {
  //     console.log("COOKIES:", req.cookies);
  // console.log("AUTH HEADER:", req.headers.authorization);

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Title and Description are required");
  }

  const videoFile = req.files["videoFile"]?.[0];
  const thumbnail = req.files["thumbnail"]?.[0];
  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video file and Thumbnail are required");
  }
  const videoUpload = await uplodeOnCloudinary(videoFile.path);
  const thumbnailUpload = await uplodeOnCloudinary(thumbnail.path);
  const newVideo = await Video.create({
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    title,
    description,
    duration: videoUpload.duration,
    owner: req.user._id,
  });
  res
    .status(201)
    .json(new ApiResponse(true, "Video published successfully", newVideo));
});

const getvideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const videoFind = await Video.findById(videoId);
  if (!videoFind) {
    throw new ApiError(404, "Video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(true, "Video fetched successfully", videoFind));
});
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }
  const updatevideo = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user._id,
    },
    {
      $set: req.body,
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .json(new ApiResponse(true, "Video updated successfully", updatevideo));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }
  const deletevideo = await Video.findOneAndDelete(
    {
      _id: videoId,
      owner: req.user._id,
    }
  );
if(!deletevideo){
    throw new ApiError(404, "Video not found or not authorized");
}
  console.log("Video deleted:", deletevideo._id);
  res.status(200).json(new ApiResponse(true, "Video deleted successfully",deletevideo));
});
const togglePublishStatus=asyncHandler(async(req,res)=>{
   const {videoId}=req.params;
   if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400,"Invalid videoId");
   }
   if(!req.user?._id){
    throw new ApiError(401,"Unauthorized");
   }
    const video=await Video.findOne({
        _id:videoId,
        owner:req.user._id
    })
    console.log("video",video)
    if(!video){
        throw new ApiError(404,"Video not found or not authorized");
    }
    video.isPublished=!video.isPublished;
    await video.save();
    res.status(200).json(new ApiResponse(true,`Video ${video.isPublished?"published":"unpublished"} successfully`,video));



});
export { getAllVideo, publishVideo, getvideoById, updateVideo, deleteVideo,togglePublishStatus};
