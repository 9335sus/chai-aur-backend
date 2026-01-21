import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { like } from "../models/like.model.js";

/*=====================================================
STATIC FILES MIDDLEWARE
-----------------------------------------------------
WHAT:
- Static files (images, CSS, JS) ko serve karta hai
- Public directory se files ko directly serve karta hain    
WHY:
- Client-side assets ko efficiently serve karne ke liye
- Repeated processing se bachne ke liye 
WHEN:
- Jab client static file request karta hai
- Response directly Express se serve hota hai
=====================================================*/
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const existingLike = await like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
   
  if (existingLike) {
    console.log("EXISTING LIKE:", existingLike);
    await like.findByIdAndDelete(existingLike._id);
    return res.status(201).json(new ApiResponse(200, "Video Unliked successfully",  false ));
  }
  await like.create({
    video: videoId,
    likedBy: req.user._id,
  });
  return res.status(201).json(new ApiResponse(201,"Video Liked successfully", true ));
});
const toggleCommentLike=asyncHandler(async(req,res)=>{
  const {commentId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(commentId)){
    throw new ApiError(400,"Invalid commentId");
  }
  const existingComment=await like.findOne({
    comment:commentId,
    likedBy:req.user._id,
  })
  if(existingComment){
    console.log("EXISTING LIKE:", existingComment);
    await like.findByIdAndDelete(existingComment._id);
    return res.status(201).json(new ApiResponse(201,"Comment Unliked successfully",false));
};
await like.create({
  comment:commentId,
  likedBy:req.user._id,
   

});
res.status(201).json(new ApiResponse(201,"Comment Liked successfully",true));
});
const toggleTweetLike=asyncHandler(async(req,res)=>{
  const {tweetId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(tweetId)){
    throw new ApiError(400,"Invalid tweetId");
  }
  const existingTweet=await like.findOne({
    tweet:tweetId,
    likedBy:req.user._id,
  })
  if(existingTweet){
    console.log("EXISTING LIKE:", existingTweet);
    await like.findByIdAndDelete(existingTweet._id);
    return res.status(201).json(new ApiResponse(201,"Tweet  unsuccessfully",false));
};
await like.create({
  tweet:tweetId,
  likedBy:req.user._id,
   

});
res.status(201).json(new ApiResponse(201,"Tweet  successfully",true));
});
const getLikedVideo=asyncHandler(async(req,res)=>{
  const userId=req.user._id;
  const likedVideos=await like.find({likedBy:userId}).populate("video");
  res.status(200).json(new ApiResponse(200,"Liked videos fetched successfully",likedVideos));
})
export { toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideo };