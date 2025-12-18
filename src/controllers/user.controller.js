import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/*
=====================================================
REGISTER USER CONTROLLER
-----------------------------------------------------
WHAT:
- Naya user register karne ke liye API ka controller hai
- Client se data receive karke response bhejta hai
- Filhal sirf ek test message bhej raha hai

WHY:
- User registration ke liye alag controller function banana best practice hai
- Async errors ko centralized handle karne ke liye asyncHandler use kiya hai
- Modular code likhne se maintain karna aasan hota hai

WHEN:
- Jab frontend ya Postman se POST request /api/v1/users/register pe aaye
- Signup ke time user data process karne ke liye future me logic add karenge
- Currently basic test message bhej raha hai, jise aage extend kar sakte hain
=====================================================
*/
const resisterUser = asyncHandler(async (req, res) => {
  // Response me status 200 aur message bhej rahe hain
  //get user details from frontent 
  //validation-not empty
  //check if user already  exist :username ,emails
  //check for Images,check for avatar
  //upload them to cloudinary ,avatar
  //create user object-create entry in DB
  //remove password and refresh token field from responce
  //check for user creation
  //return res

  const { fullName, email, userName, password } = req.body;
  console.log("email:", email);

  if (
    [fullName, email, userName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError("All fields are required", 400);
  }

  const existUser = await User.findOne({
    $or: [{ email }, { username: userName }],
  });

  if (existUser) {
    throw new ApiError(
      "User already exist with this email or username",
      409
    );
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath || !coverImageLocalPath) {
    throw new ApiError("Avatar and Cover image are required", 400);
  }

  const avatarCloudinaryResponce = await uplodeOnCloudinary(
    avatarLocalPath
  );
  const coverImageCloudinaryResponce = await uplodeOnCloudinary(
    coverImageLocalPath
  );

  if (!avatarCloudinaryResponce || !coverImageCloudinaryResponce) {
    throw new ApiError("Image upload failed,try again", 500);
  }

  const user = await User.create({
    fullName,
    avatar: avatarCloudinaryResponce.url,
    coverImage: coverImageCloudinaryResponce?.url || "",
    email,
    password,
    username: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("User creation failed,try again", 500);
  }

  res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

export { resisterUser };
