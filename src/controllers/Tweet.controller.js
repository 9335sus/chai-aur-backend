import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import mongoose from "mongoose";
import {Tweet} from "../models/tweet.model.js";

const createTweet=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    const {content}=req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid userId");
    }
    const  tweetCreated=await Tweet.create({
        content,
        owner:userId
    }
    )
    res.status(201).json(new ApiResponse(201,"Tweet created successfully",tweetCreated));
    
})
const getUserTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweetId");
}
  const tweet=await Tweet.findById(tweetId).populate("owner");
  if(!tweet){
    throw new ApiError(404,"Tweet not found");
  }
  res.status(200).json(new ApiResponse(200,"Tweet fetched successfully",tweet));
})
const updateTweet =asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    const {content}=req.body;
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweetId");
    }
 const updateTweet=await Tweet.findByIdAndUpdate(tweetId,{$set:{
    content
    }},{new:true});
    if(!updateTweet){
        throw new ApiError(404,"Tweet not found");
    }
    res.status(200).json(new ApiResponse(200,"Tweet updated successfully",updateTweet));

});
const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
    throw new ApiError(400,"Invalid tweetId");}
    const deletetweet=await Tweet.findByIdAndDelete(tweetId);
    if(!deletetweet){
        throw new ApiError(404,"Tweet not found");
    }
    res.status(200).json(new ApiResponse(200,"Tweet deleted successfully",deletetweet));
});
export {createTweet,getUserTweet,updateTweet,deleteTweet};