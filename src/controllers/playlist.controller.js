import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  {Playlist}  from "../models/playlist.model.js"; 
 
// Controller functions for playlist operations will go here
/*
=====================================================
WHAT:
- Ye function ek naya async middleware return karta hai
- Express automatically ise req, res, next deta hai
=====================================================
*/
const createPlaylist = asyncHandler(async (req, res) => {
    if(!req.user?._id){
        throw new ApiError(401,"Unauthorized");
    }
 const {name,description}=req.body;
 if(!name|| !description){
    throw new ApiError(400,"Name and Description are required");
 }
 const  newPlaylist=new Playlist({
    name,
    description,
    owner:req.user._id
 });

 await newPlaylist.save();

 return res.status(201).json(
    new ApiResponse(201,newPlaylist, "Playlist created successfully")
 );
});

const getUserPlaylists=asyncHandler(async(req,res)=>{
    if(!req.user?._id){
        throw new ApiError(401,"Unauthorized");
    }
   const playlists=await Playlist.find({owner:req.user._id});
    return res.status(200).json(
        new ApiResponse(200,playlists,"User playlists fetched successfully")
    )
})
const playlistById=asyncHandler(async(req,res)=>{
    const{videoId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid videoId");
    }
    const playlist=await Playlist.findById(videoId);
    res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully"))
});
const addVideoToPlaylist=asyncHandler(async(req,res)=>{
     const {playlistId,videoId}=req.body;
     if(!mongoose.Types.ObjectId.isValid(videoId)||!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid playlistId and videoId");
     }
  
    const playlist=await Playlist.findById(playlistId);
     
    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();
    res.status(200).json(new ApiResponse(200,playlist,"Video added to playlist successfully"))

     
});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  // ✅ ObjectId validation
  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  // ✅ Playlist exist check
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // ✅ Video exist check inside playlist
  

  // ✅ Remove video from playlist
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId }
    },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedPlaylist,
      "Video removed from playlist successfully"
    )
  );
});
const deletePlaylist=asyncHandler(async(req,res)=>{
    const{playlistId}=req.body;
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid playlistId");
    }
    const deletedPlaylist=await Playlist.findByIdAndDelete(playlistId);
    if(!deletedPlaylist){
        throw new ApiError(404,"Playlist not found");
    }
    res.status(200).json(new ApiResponse(200,deletedPlaylist,"Playlist deleted successfully"))
});
const updatePlaylist=asyncHandler(async(req,res)=>{
  const {playlistId}=req.params;
  const {name,description}=req.body;

  if(!mongoose.Types.ObjectId.isValid(playlistId)){
    throw new ApiError(400,"Invalid playlistId");
  }
  const findPlaylidt=await Playlist.findById(playlistId);
  if(!findPlaylidt){
    throw new ApiError(404,"Playlist not found");
  }
  const updateplaylist=await Playlist.findByIdAndUpdate(playlistId,{
    $set:{name,description}
  },
    {
      new:true,
    }
);
  res.status(200).json(new ApiResponse(200,updateplaylist,"Playlist updated successfully"));
  });
export { createPlaylist,
  getUserPlaylists
  ,playlistById ,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
 updatePlaylist
};