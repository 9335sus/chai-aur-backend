import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
//import jwt from "jsonwebtoken";

const createComment = asyncHandler(async (req, res) => {
  /*
    ===================== WHAT =====================
    Request body se comment ka text extract karna
    ================================================

    ===================== WHY =====================
    - Ye actual user input hota hai jo DB me save hoga
    - Clean separation rakhta hai request data ka

    ===================== WHEN =====================
    - Jab user frontend se comment submit karta hai
  */
  const { content } = req.body;

  /*
    ===================== WHAT =====================
    Route parameters se videoId extract karna
    ================================================

    ===================== WHY =====================
    - Har comment kisi specific video se related hota hai
    - Relational mapping ke liye videoId mandatory hai

    ===================== WHEN =====================
    - Jab comment kisi video ke against create hota hai
  */
  const { videoId } = req.params;

  /*
    ===================== WHAT =====================
    Development-time logging
    ================================================

    ===================== WHY =====================
    - Debugging me help karta hai
    - Confirm karta hai correct user aur video aa rahe hain

    ===================== WHEN =====================
    - Development / testing phase me
  */
  console.log(
    "Creating comment for videoId:",
    videoId,
    "by user:",
    req.user._id
  );

  /*
    ===================== WHAT =====================
    Validation: comment content present hai ya nahi
    ================================================

    ===================== WHY =====================
    - Empty comment ka koi meaning nahi hota
    - Database me junk data jane se rokta hai
    - Server-side validation client bypass se bachata hai

    ===================== WHEN =====================
    - Jab frontend empty request bheje
    - Jab client validation fail ho jaye
  */
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  /*
    ===================== WHAT =====================
    videoId ka ObjectId validation
    ================================================

    ===================== WHY =====================
    - MongoDB sirf valid ObjectId pe kaam karta hai
    - Invalid ID pe DB error aa sakta hai
    - Unnecessary database calls se bachata hai

    ===================== WHEN =====================
    - Jab user URL manually change kare
    - Jab malicious request aaye
  */
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  /*
    ===================== WHAT =====================
    Comment ko database me create karna
    ================================================

    ===================== WHY =====================
    - content → actual comment text
    - video → kis video pe comment hai
    - owner → kaun sa user comment ka owner hai
    - Owner store karna future authorization ke liye zaroori hai

    ===================== WHEN =====================
    - Jab authenticated user valid data ke saath comment kare
  */
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  /*
    ===================== WHAT =====================
    Success response with created comment
    ================================================

    ===================== WHY =====================
    - Frontend ko turant newly created comment chahiye hota hai
    - Consistent API response structure follow hota hai

    ===================== WHEN =====================
    - Jab comment successfully DB me save ho jaye
  */
  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  /* ===================== WHAT =====================
     Updated comment content extract karna
     ================================================ */
  const { content } = req.body;

  /* ===================== WHAT =====================
     Route se commentId extract karna
     ================================================ */
  const { commentId } = req.params;

  /*
    ===================== WHY =====================
    Debug purpose ke liye commentId log karna
    ==============================================
  */
  console.log("Updating comment:", commentId);

  /*
    ===================== WHAT =====================
    Validation: updated content empty na ho
    ================================================

    ===================== WHY =====================
    - User blank content se comment update na kar de
    - Database consistency maintain rahe

    ===================== WHEN =====================
    - Jab client empty request bheje
  */
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  /*
    ===================== WHAT =====================
    commentId ObjectId validation
    ================================================

    ===================== WHY =====================
    - MongoDB query errors se bachne ke liye
    - Invalid ID pe DB query waste na ho

    ===================== WHEN =====================
    - Jab URL manually change kiya jaye
    - Jab malicious request aaye
  */
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  /*
    ===================== WHAT =====================
    Comment update operation with ownership check
    ================================================

    ===================== WHY =====================
    - Security: user sirf apna comment update kar sake
    - Data integrity aur authorization ensure karta hai

    ===================== WHEN =====================
    - Jab authenticated user apna comment edit kare
  */
  const comment = await Comment.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(commentId),
      owner: req.user._id, // 🔐 Authorization check
    },
    { content },
    { new: true } // Updated document return kare
  );

  /*
    ===================== WHAT =====================
    Updated comment exist karta hai ya nahi check
    ================================================

    ===================== WHY =====================
    - Comment delete ho chuka ho sakta hai
    - Ya user kisi aur ka comment edit kar raha ho

    ===================== WHEN =====================
    - Invalid authorization
    - Comment already removed
  */
  if (!comment) {
    throw new ApiError(404, "Comment not found or not authorized");
  }

  /*
    ===================== WHAT =====================
    Success response with updated comment
    ================================================

    ===================== WHY =====================
    - Frontend ko real-time updated data chahiye
    - REST API best practice follow hoti hai
  */
  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  console.log("Deleting comment:", commentId);
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }
  // const commentOnly = await Comment.findById(commentId);
  // console.log("COMMENT FROM DB:", commentOnly);

  // console.log("REQUEST USER:", req.user._id);
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id, // 🔐 Authorization check
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or not authorized");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

const getAllComments = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }
  const comments = await Comment.find({ video: commentId });
  console.log("COMMENTS FETCHED:", comments);

  res
    .status(200)
    .json(
      new ApiResponse(200, comments.content, "Comments fetched successfully")
    );
});

export { createComment, updateComment, deleteComment, getAllComments };
