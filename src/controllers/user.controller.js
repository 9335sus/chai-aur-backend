import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshToken = async (userId) => {
  try {
     const user=await User.findById(userId);
     const accessToken=user.generateAccessToken();
     const refreshToken=user.generateRefreshToken();
    
     user.refreshToken=refreshToken;
     await user.save({validateBeforeSave:false});

      return {accessToken,refreshToken};
    }catch (error) {
    throw new ApiError("Token generation failed", 500);
}
};

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
   console.log("fullname:->", fullName);
  console.log("email:->", email);
   console.log("username:->", userName);
  console.log("password:->", password);
  

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
  console.log(req.files);

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

// ============================
// LOGIN USER CONTROLLER
// ============================

// WHAT:
// - User ko login karne ka kaam karta hai
// - Username/email aur password verify karta hai
// - Access & Refresh token generate karta hai
// - Tokens ko secure cookies me set karta hai
//
// WHY:
// - Authentication ke bina protected routes access nahi hone chahiye
// - Password direct compare karna unsafe hota hai
// - Token-based login scalable aur secure hota hai
//
// WHEN:
// - Jab user login form submit karta hai
// - Jab frontend /login API hit karta hai
// - Jab existing user app me enter kare

 const loginUser = asyncHandler(async (req, res) => {

  // WHAT: Request body se data nikal rahe hain
  // WHY: Login ke liye credentials chahiye
  // WHEN: Jab client login request bhejta hai
  const { email, username, password } = req.body;

  // WHAT: Username ya Email mandatory check
  // WHY: Dono missing hue to user identify nahi ho paayega
  // WHEN: Request validation ke time
  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  // WHAT: Database me user search kar rahe hain
  // WHY: Verify karna hai ki user exist karta hai ya nahi
  // WHEN: Login attempt ke time
  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  // WHAT: User exist nahi karta to error
  // WHY: Invalid login attempt ko block karna
  // WHEN: DB query ke baad
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // WHAT: Password verify kar rahe hain
  // WHY: Security ke liye hashed password compare hota hai
  // WHEN: User milne ke baad
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  // WHAT: Password galat hai to access deny
  // WHY: Unauthorized user ko login se rokna
  // WHEN: Password mismatch hone par
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // WHAT: Access & Refresh token generate kar rahe hain
  // WHY: Session management aur authentication ke liye
  // WHEN: Login successfully verify hone ke baad
  const { accessToken, refreshToken } =
    await genrateAccessAndRefreshToken(user._id);

  // WHAT: User ka safe data nikal rahe hain
  // WHY: Password aur refreshToken client ko nahi dena
  // WHEN: Response bhejne se pehle
  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

  // WHAT: Cookie options define kar rahe hain
  // WHY: httpOnly & secure cookies attacks se protect karti hain
  // WHEN: Token cookies set karte waqt
  const options = {
    httpOnly: true,
    secure: true
  };

  // WHAT: Cookies set karke response bhej rahe hain
  // WHY: Client ko authenticated session dena
  // WHEN: Login successful hone par
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    );
});


// ============================
// LOGOUT USER CONTROLLER
// ============================

// WHAT:
// - User ko logout karta hai
// - Refresh token database se remove karta hai
// - Cookies clear karta hai
//
// WHY:
// - Security ke liye tokens invalidate karna zaruri hai
// - Logout ke baad session active nahi rehna chahiye
//
// WHEN:
// - Jab user logout button click karta hai
// - Jab frontend /logout API call karta hai

const logoutUser = asyncHandler(async (req, res) => {

  // WHAT: User ke refreshToken ko DB se remove kar rahe hain
  // WHY: Future token misuse se bachav ke liye
  // WHEN: Logout request aane par
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined }
    },
    {
      new: true,
      runValidators: true
    }
  );

  // WHAT: Cookie options define
  // WHY: Same options use karna clearCookie ke liye zaruri hota hai
  // WHEN: Cookies remove karte waqt
  const options = {
    httpOnly: true,
    secure: true
  };

  // WHAT: Cookies clear karke response bhej rahe hain
  // WHY: Client-side session completely end karna
  // WHEN: Logout successful hone par
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        null,
        "User logged out successfully"
      )
    );
});

// ===============================
// REFRESH ACCESS TOKEN CONTROLLER
// ===============================
const refreshAccessToken = asyncHandler(async (req, res) => {

  // 1️⃣ Refresh token nikaal rahe hain (cookie ya body se)
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    // 2️⃣ Refresh token verify
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 3️⃣ User find
    const user = await User.findById(decodedToken._id);

    if (!user || user.refreshToken !== incommingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // 4️⃣ New tokens generate
    const { accessToken, refreshToken } =
      await genrateAccessAndRefreshToken(user._id);

    // 5️⃣ Cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // 6️⃣ Response send (✅ return is NOW VALID)
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );

  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});


// ===============================
// EXPORTS
// ===============================
export {
  resisterUser,
  loginUser,
  logoutUser,
  refreshAccessToken
};
