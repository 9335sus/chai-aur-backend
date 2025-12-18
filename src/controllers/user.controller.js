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
- Signup ke time user data validate karke DB me save karta hai
- Images ko Cloudinary pe upload karta hai
- Password aur sensitive info response me nahi bhejta

WHY:
- Modular aur reusable code likhne ke liye
- Validation aur error handling centralized rakhne ke liye
- Cloudinary se scalable image hosting ke liye
- Security reasons se sensitive fields hide karne ke liye

WHEN:
- Jab POST request /api/v1/users/register pe aaye
- Jab naya user register ho raha ho
=====================================================
*/
const resisterUser = asyncHandler(async (req, res) => {
  /*
  -----------------------------------------------------
  WHAT:
  - Client se fullName, email, userName, password receive kar rahe hain
  - Ye basic user info hai registration ke liye

  WHY:
  - User create karne ke liye ye sab data required hota hai
  - Validation me ye check karenge ki koi field empty to nahi

  WHEN:
  - Har registration request ke start me ye data receive hota hai
  -----------------------------------------------------
  */
  const { fullName, email, userName, password } = req.body;
  console.log("email:", email);

  /*
  -----------------------------------------------------
  WHAT:
  - Check kar rahe hain ki sabhi required fields filled hain
  - Agar koi bhi field missing ya blank hai to error throw karenge

  WHY:
  - Incomplete data se user create nahi hona chahiye
  - Data integrity maintain karne ke liye zaroori hai

  WHEN:
  - Har registration request ke time input validate karne ke liye
  -----------------------------------------------------
  */
  if (
    [fullName, email, userName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError("All fields are required", 400);
  }

  /*
  -----------------------------------------------------
  WHAT:
  - Check kar rahe hain ki email ya username pehle se exist to nahi
  - Database me query chalakar existing user dhundh rahe hain

  WHY:
  - Duplicate users allow nahi karna chahiye
  - Unique username aur email app ka rule hai

  WHEN:
  - Registration ke dauran new user create karne se pehle
  -----------------------------------------------------
  */
  const existUser = await User.findOne({
    $or: [{ email }, { username: userName }],
  });

  if (existUser) {
    throw new ApiError(
      "User already exist with this email or username",
      409
    );
  }

  /*
  -----------------------------------------------------
  WHAT:
  - Check kar rahe hain ki avatar aur coverImage dono upload kiye gaye hain
  - Ye files multer middleware se `req.files` me milti hain

  WHY:
  - Profile aur cover images mandatory hain
  - Agar images missing hain to registration fail karni hai

  WHEN:
  - Jab image upload form ke saath user registration aaye
  -----------------------------------------------------
  */
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath || !coverImageLocalPath) {
    throw new ApiError("Avatar and Cover image are required", 400);
  }

  /*
  -----------------------------------------------------
  WHAT:
  - Local disk se images Cloudinary pe upload kar rahe hain
  - `uplodeOnCloudinary` utility async function hai jo upload karta hai

  WHY:
  - Local server space bachane ke liye images cloud pe store karte hain
  - Frontend me images URL se directly access kar sakte hain

  WHEN:
  - Jab multer se files mil jaye, upload karna hota hai
  -----------------------------------------------------
  */
  const avatarCloudinaryResponce = await uplodeOnCloudinary(
    avatarLocalPath
  );
  const coverImageCloudinaryResponce = await uplodeOnCloudinary(
    coverImageLocalPath
  );

  /*
  -----------------------------------------------------
  WHAT:
  - Agar cloud upload fail ho jaye to error throw karenge

  WHY:
  - User ke images bina upload ke registration adhura hai
  - Aise case me proper error message dena zaroori hai

  WHEN:
  - Cloudinary se response fail aaye to
  -----------------------------------------------------
  */
  if (!avatarCloudinaryResponce || !coverImageCloudinaryResponce) {
    throw new ApiError("Image upload failed,try again", 500);
  }

  /*
  -----------------------------------------------------
  WHAT:
  - User object create kar rahe hain database me
  - Images ke URLs Cloudinary response se le rahe hain
  - Username lowercase me convert kar rahe hain for consistency

  WHY:
  - User ko database me save karna registration ka main maksad hai
  - Lowercase username avoid karta hai case sensitive issues

  WHEN:
  - Sare validations pass hone ke baad user create karna hota hai
  -----------------------------------------------------
  */
  const user = await User.create({
    fullName,
    avatar: avatarCloudinaryResponce.url,
    coverImage: coverImageCloudinaryResponce?.url || "",
    email,
    password,
    username: userName.toLowerCase(),
  });

  /*
  -----------------------------------------------------
  WHAT:
  - Naya created user dobara query kar rahe hain
  - Password aur refreshToken fields select nahi kar rahe (hide kar rahe hain)

  WHY:
  - Response me sensitive data nahi bhejna chahiye
  - User ko confirmation dene ke liye latest data chahiye

  WHEN:
  - User create hone ke baad response banate waqt
  -----------------------------------------------------
  */
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  /*
  -----------------------------------------------------
  WHAT:
  - Agar user creation me kuch gadbad ho jaye to error throw karenge

  WHY:
  - Server side validation, fail hone par client ko pata chale
  - Proper error handling app quality badhata hai

  WHEN:
  - User creation ke baad result validate karte waqt
  -----------------------------------------------------
  */
  if (!createdUser) {
    throw new ApiError("User creation failed,try again", 500);
  }

  /*
  -----------------------------------------------------
  WHAT:
  - Final success response bhej rahe hain client ko
  - ApiResponse class ka use karke structured JSON bana rahe hain

  WHY:
  - Standardized API response maintain karna zaroori hai
  - Client ko message, status, aur data easily mile

  WHEN:
  - Sab kuch successful hone ke baad response bhejte waqt
  -----------------------------------------------------
  */
  res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

export { resisterUser };
