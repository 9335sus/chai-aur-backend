import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//jwt kya hota hai
//access token kya hota hai
//refresh token kya hota hai
//access token or refresh token me kya fark hai
//access token or refresh token kab generate hote hai
//access token or refresh token ko kaha store karte hai
//access token or refresh token ko client or server me kaise bhejte hai
//access token or refresh token ko secure kaise karte hai
//access token or refresh token ko kab expire karte hai
//token based authentication kya hota hai
//stateless authentication kya hota hai
//token rotation kya hota hai
//secure cookies kya hoti hai
//httpOnly cookies kya hoti hai
//secure storage kya hota hai
//===============================
// TOKEN GENERATION FUNCTION
//===============================
// WHAT:
// - Access aur Refresh token generate karta hai
// - User ID ko token me embed karta hai
// - Refresh token ko database me securely store karta hai
//  WHY:
// - Stateless authentication implement karne ke liye
//  - User sessions ko manage karne ke liye
// - Token compromise hone par risk kam karne ke liye
//  WHEN:
// - Login ke baad token generate hota hai
// - Refresh token se access token renew karte waqt
// - Har protected request ke saath access token bheja jaata hai
//==============================
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

/// ===============================
// REFRESH ACCESS TOKEN CONTROLLER
// ===============================

/*
WHAT:
1️⃣ Expired access token ke case me naya access token generate karta hai
2️⃣ Refresh token ko validate karta hai
3️⃣ User ke session ko continue rakhta hai
4️⃣ Secure token rotation implement karta hai

WHY:
1️⃣ User ko baar-baar login karne se bachane ke liye
2️⃣ Access token short-lived hone ki wajah se
3️⃣ Security improve karne ke liye (token rotation)
4️⃣ Better UX maintain karne ke liye

WHEN:
1️⃣ Jab access token expire ho jata hai
2️⃣ Protected API 401 error return kare
3️⃣ Frontend silently token refresh kare
4️⃣ Long-running sessions ke case me
*/
const refreshAccessToken = asyncHandler(async (req, res) => {

  // 1️⃣ Refresh token cookie ya request body se nikaal rahe hain
  /*
  WHY:
  1️⃣ Cookie zyada secure hoti hai (httpOnly)
  2️⃣ XSS attack se protection milta hai
  3️⃣ Body fallback support ke liye
  4️⃣ Mobile / API clients ke liye useful
  */
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    // 2️⃣ Refresh token verify
    /*
    WHY:
    1️⃣ Token ka signature verify karna
    2️⃣ Token expire hua ya nahi check karna
    3️⃣ Fake / tampered token reject karna
    4️⃣ jwt.decode se zyada secure method
    */
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 3️⃣ User DB se fetch
    /*
    WHY:
    1️⃣ Token ke andar wali user ID valid hai ya nahi
    2️⃣ Deleted / blocked user ko reject karna
    3️⃣ DB-stored refresh token match karna
    4️⃣ Session integrity maintain karna
    */
    const user = await User.findById(decodedToken._id);

    // 4️⃣ Refresh token DB match check
    /*
    WHY:
    1️⃣ Token theft detect karne ke liye
    2️⃣ Old token reuse prevent karne ke liye
    3️⃣ Logout ke baad token invalidate ho
    4️⃣ Strong security layer add karne ke liye
    */
    if (!user || user.refreshToken !== incommingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // 5️⃣ New access & refresh token generate
    /*
    WHY:
    1️⃣ Access token short-lived hota hai
    2️⃣ Refresh token rotation implement hoti hai
    3️⃣ Compromised token ka reuse prevent hota hai
    4️⃣ Secure authentication flow maintain hota hai
    */
    const { accessToken, refreshToken } =
      await genrateAccessAndRefreshToken(user._id);

    // 6️⃣ Cookie options
    /*
    WHY:
    1️⃣ httpOnly → JS access block
    2️⃣ secure → HTTPS only
    3️⃣ Token leakage prevent
    4️⃣ Production-grade security
    */
    const options = {
      httpOnly: true,
      secure: true,
    };

    // 7️⃣ Response send
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
    // 8️⃣ Invalid / expired refresh token
    throw new ApiError(401, "Invalid refresh token");
  }
});


// ===============================
// CHANGE PASSWORD CONTROLLER
// ===============================

/*
WHAT:
1️⃣ Logged-in user ka password change karta hai
2️⃣ Old password verify karta hai
3️⃣ New password securely save karta hai
4️⃣ Account security improve karta hai

WHY:
1️⃣ Account compromise hone par password change
2️⃣ User ko security control dene ke liye
3️⃣ Best security practice follow karne ke liye
4️⃣ Unauthorized access prevent karne ke liye

WHEN:
1️⃣ User password change request kare
2️⃣ Password leak ka doubt ho
3️⃣ Regular security update ke liye
4️⃣ Profile management ke time
*/
const changePassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword } = req.body;

  // User verifyJWT middleware se aata hai
  const user = await User.findById(req.user?._id);

  // Old password check
  /*
  WHY:
  1️⃣ Confirm karna ki request genuine hai
  2️⃣ Random password change prevent karna
  3️⃣ Account hijacking se protection
  4️⃣ Secure password update flow
  */
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  // New password set
  user.password = newPassword;

  /*
  WHY validateBeforeSave false:
  1️⃣ Sirf password update ho raha hai
  2️⃣ Baaki fields unchanged hain
  3️⃣ Performance better hoti hai
  4️⃣ Unnecessary validation avoid hoti hai
  */
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, null, "Password changed successfully")
  );
});


// ===============================
// GET CURRENT USER PROFILE
// ===============================

/*
WHAT:
1️⃣ Logged-in user ka profile data return karta hai
2️⃣ req.user se data fetch karta hai
3️⃣ Secure user info provide karta hai
4️⃣ Dashboard / profile ke liye data deta hai

WHY:
1️⃣ User ko apna data dikhane ke liye
2️⃣ Profile page render karne ke liye
3️⃣ Repeated DB calls avoid karne ke liye
4️⃣ verifyJWT middleware ka use justify karta hai

WHEN:
1️⃣ User dashboard load ho
2️⃣ Profile page open ho
3️⃣ Account settings page open ho
4️⃣ Authenticated user data chahiye ho
*/
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, req.user, "User profile fetched successfully")
  );
});


// ===============================
// UPDATE ACCOUNT DETAILS
// ===============================

/*
WHAT:
1️⃣ User ka fullname update karta hai
2️⃣ User ka email update karta hai
3️⃣ Profile information modify karta hai
4️⃣ Updated data return karta hai

WHY:
1️⃣ User profile editing ke liye
2️⃣ Incorrect details fix karne ke liye
3️⃣ Personal information update ke liye
4️⃣ Better account management ke liye

WHEN:
1️⃣ User profile edit kare
2️⃣ Email change ho
3️⃣ Name correction ho
4️⃣ Account settings update ho
*/
const updateAccountDetails = asyncHandler(async (req, res) => {

  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and email are required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullname, email }
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(200, updatedUser, "User profile updated successfully")
  );
});


// ===============================
// UPDATE USER AVATAR
// ===============================

/*
WHAT:
1️⃣ User ka avatar image update karta hai
2️⃣ Local file ko cloud pe upload karta hai
3️⃣ Avatar URL DB me save karta hai
4️⃣ Updated user return karta hai

WHY:
1️⃣ Profile personalization ke liye
2️⃣ Better user identity ke liye
3️⃣ Cloud storage use karne ke liye
4️⃣ Local server load kam karne ke liye

WHEN:
1️⃣ User avatar upload kare
2️⃣ Profile image change kare
3️⃣ Account setup ke time
4️⃣ Re-branding ke case me
*/
const updateUserAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatarCloudinaryResponse =
    await uplodeOnCloudinary(avatarLocalPath);

  if (!avatarCloudinaryResponse?.url) {
    throw new ApiError(500, "Image upload failed");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatarCloudinaryResponse.url }
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(200, updatedUser, "User avatar updated successfully")
  );
});


// ===============================
// UPDATE USER COVER IMAGE
// ===============================

/*
WHAT:
1️⃣ User ka cover image update karta hai
2️⃣ Cloudinary pe image upload karta hai
3️⃣ DB me image URL save karta hai
4️⃣ Updated profile return karta hai

WHY:
1️⃣ Profile customization ke liye
2️⃣ Better UI / UX ke liye
3️⃣ Cloud storage ka benefit lene ke liye
4️⃣ Media handling ko scalable banane ke liye

WHEN:
1️⃣ User cover image change kare
2️⃣ Profile redesign kare
3️⃣ Account customization kare
4️⃣ Branding update ke case me
*/
const updateUserCoverImage = asyncHandler(async (req, res) => {

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  const coverImage =
    await uplodeOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(500, "Image upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url }
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(200, user, "User cover image updated successfully")
  );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {

  // ===============================
  // INPUT VALIDATION
  // ===============================

  /*
  WHAT:
  1️⃣ URL params se username extract kar rahe hain
  2️⃣ Username ko lowercase me normalize kar rahe hain
  3️⃣ Empty ya undefined username check kar rahe hain
  4️⃣ Invalid request ko early reject kar rahe hain

  WHY:
  1️⃣ DB me unnecessary query avoid karne ke liye
  2️⃣ Case-sensitive mismatch se bachne ke liye
  3️⃣ Clean & predictable input ensure karne ke liye
  4️⃣ API ko misuse hone se bachane ke liye

  WHEN:
  1️⃣ Jab channel profile URL hit hota hai
  2️⃣ Jab frontend kisi user ka channel open kare
  3️⃣ Jab username missing ho
  4️⃣ Jab invalid username bheja jaye
  */
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }


  // ===============================
  // AGGREGATION PIPELINE
  // ===============================
     
    //aggregation kya hota hai: MongoDB me multiple operations ko ek saath chain karne ka tareeka
    // jisse complex data processing aur transformation possible hoti hai
    // hum yahan aggregation use kar rahe hain taaki ek hi query me multiple related data fetch kar sakein
    //example ke liye: user ka basic info, uske subscribers, aur subscription status
    //aur example ke liye: YouTube channel profile page pe dikhane ke liye
    // isse performance bhi improve hoti hai kyunki multiple round-trips DB ke liye nahi karni padti


    //pipeline kya hota hai: ek sequence of stages jisme har stage me data ko process kiya jata hai
    // har stage me data ko filter, transform, ya aggregate kiya ja sakta hai
    // hum yahan 5 stages use kar rahe hain:
    // 1️⃣ Match stage: specific user ko filter karta hai
    // 2️⃣ Lookup stage: subscriptions se join karta hai
    // 3️⃣ Add Fields stage: calculated fields add karta hai
    // 4️⃣ Project stage: required fields select karta hai
    // 5️⃣ Final output stage: processed data return karta hain 
    
      
  /*
  WHAT:
  1️⃣ User collection se channel ka data fetch karta hai
  2️⃣ Subscription collection ke saath join karta hai
  3️⃣ Subscribers & subscribed channels count nikalta hai
  4️⃣ Logged-in user ka subscription status batata hai

  WHY:
  1️⃣ Channel profile page ke liye complete data chahiye
  2️⃣ Multiple queries ko ek hi DB call me handle karne ke liye
  3️⃣ Performance improve karne ke liye
  4️⃣ Real-world YouTube / Instagram logic implement karne ke liye

  WHEN:
  1️⃣ Jab koi user kisi channel ka profile open kare
  2️⃣ Jab channel stats (followers/following) dikhane ho
  3️⃣ Jab "Subscribed / Not Subscribed" button dikhana ho
  4️⃣ Jab public channel data fetch karna ho
  */
  const channel = await User.aggregate([
    // ===============================
    // STAGE 1: MATCH USER
    // ===============================
    //MATCH stage me hum specific user ko uske username ke basis pe filter kar rahe hain
    // WHAT:
    // 1️⃣ Specified username ke saath user document dhundhna
    // 2️⃣ Case-insensitive matching ke liye lowercase use karna
    // 3️⃣ Exact match ensure karna
    // 4️⃣ Next stages ke liye base document prepare karna

    // WHY:
    // 1️⃣ Sirf relevant user data process karne ke liye
    // 2️⃣ Case sensitivity issues avoid karne ke liye
    // 3️⃣ Accurate profile data dikhane ke liye
    // 4️⃣ Aggregation pipeline ko efficient banane ke liye

    // WHEN:
    // 1️⃣ Jab channel profile request aaye
    // 2️⃣ Jab username URL se mile
    // 3️⃣ Jab aggregation start ho
    // 4️⃣ Jab specific user ko target karna ho
    {
      $match: {
        username: username.toLowerCase(),
      },
    },

    // ===============================
    // STAGE 2: LOOKUP SUBSCRIBERS
    // ===============================
    //LOOKUP stage me hum subscriptions collection se join kar rahe hain taaki pata chale ki is user ke kitne subscribers hain
    // WHAT:
    // 1️⃣ Subscriptions collection se data join karna
    // 2️⃣ Local user _id ko foreign channel field se match karna
    // 3️⃣ Subscribers ka array create karna
    // 4️⃣ Next stages ke liye subscriber data prepare karna

    // WHY:
    // 1️⃣ Channel ke followers count nikalne ke liye
    // 2️⃣ Subscription status check karne ke liye
    // 3️⃣ Complete channel profile dikhane ke liye
    // 4️⃣ Aggregation me relational data include karne ke liye

    // WHEN:
    // 1️⃣ Jab channel profile load ho
    // 2️⃣ Jab subscriber info chahiye ho
    // 3️⃣ Jab channel stats calculate karne ho
    // 4️⃣ Jab relational data fetch karna ho
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    // ===============================
    // STAGE 3: LOOKUP SUBSCRIBED CHANNELS
    // ===============================
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    // ===============================
    // STAGE 4: ADD COMPUTED FIELDS
    // ===============================
    //ADD FIELDS stage me hum calculated fields add kar rahe hain jaise subscribers count, subscribed channels count, aur logged-in user ka subscription status
    // WHAT:
    // 1️⃣ Calculated fields add karna
    // 2️⃣ Subscribers count nikalna
    // 3️⃣ Subscribed channels count nikalna
    // 4️⃣ Logged-in user ka subscription status check karna

    // WHY:
    // 1️⃣ Channel profile me important stats dikhane ke liye
    // 2️⃣ User experience improve karne ke liye
    // 3️⃣ Real-time subscription status dikhane ke liye
    // 4️⃣ Aggregation me dynamic data include karne ke liye

    // WHEN:
    // 1️⃣ Jab channel profile render ho
    // 2️⃣ Jab stats display karne ho
    // 3️⃣ Jab subscription button ka state set karna ho
    // 4️⃣ Jab calculated data chahiye ho
    {
      $addFields: {
        // Total subscribers count
        subscribersCount: {
          $size: "$subscribers",
        },

        // Total channels user subscribed to
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },

        // Logged-in user subscribed or not
        isSubscribed: {
          $cond: {
            if: {
              $in: [
                req.user?._id,
                "$subscribers.subscriber",
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },

    // ===============================
    // STAGE 5: PROJECT REQUIRED FIELDS
    // ===============================
    //PROJECT stage me hum sirf required fields hi select kar rahe hain taaki response lightweight ho
    // WHAT:
    // 1️⃣ Sirf necessary fields select karna
    // 2️⃣ Sensitive fields exclude karna
    // 3️⃣ Response size optimize karna
    // 4️⃣ Frontend ke liye clean data structure provide karna

    // WHY:
    // 1️⃣ Bandwidth aur performance improve karne ke liye
    // 2️⃣ Sensitive info accidentally expose na ho
    // 3️⃣ Frontend parsing easy ho
    // 4️⃣ API response consistent banane ke liye

    // WHEN:
    // 1️⃣ Jab final response prepare ho raha ho
    // 2️⃣ Jab data frontend ko bhejna ho
    // 3️⃣ Jab lightweight response chahiye ho
    // 4️⃣ Jab unnecessary data avoid karna ho
    {
      $project: {
        fullname: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);


  // ===============================
  // CHANNEL EXISTENCE CHECK
  // ===============================

  /*
  WHAT:
  1️⃣ Aggregation result empty hai ya nahi check karte hain
  2️⃣ Invalid username ke case me error throw karte hain
  3️⃣ Frontend ko clear error message dete hain
  4️⃣ Crash se bachate hain

  WHY:
  1️⃣ Non-existing channel ka profile avoid karne ke liye
  2️⃣ Proper HTTP status code return karne ke liye
  3️⃣ Frontend UX improve karne ke liye
  4️⃣ Debugging easy banane ke liye

  WHEN:
  1️⃣ Jab username DB me exist na kare
  2️⃣ Jab user delete ho chuka ho
  3️⃣ Jab typo ke saath request aaye
  4️⃣ Jab malicious request ho
  */
  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }


  // ===============================
  // SUCCESS RESPONSE
  // ===============================

  /*
  WHAT:
  1️⃣ Aggregated channel data frontend ko bhejte hain
  2️⃣ Sirf first document return karte hain
  3️⃣ Standard ApiResponse format follow karte hain
  4️⃣ Success message ke saath response dete hain

  WHY:
  1️⃣ Aggregation hamesha array return karta hai
  2️⃣ Frontend ko clean object chahiye hota hai
  3️⃣ Consistent API response maintain karne ke liye
  4️⃣ Debug & maintenance easy hota hai

  WHEN:
  1️⃣ Channel successfully mil jaye
  2️⃣ Aggregation complete ho jaye
  3️⃣ No error occur kare
  4️⃣ Profile page render karna ho
  */
  return res.status(200).json(
    new ApiResponse(
      200,
      channel[0],
      "User channel profile fetched successfully"
    )
  );
});

/*
=====================================================
GET WATCH HISTORY CONTROLLER
-----------------------------------------------------
WHAT:
1. Ye controller logged-in user ki watch history fetch karta hai
2. MongoDB aggregation pipeline ka use karke data retrieve karta hai
3. User ke watchHistory array se related videos nikalta hai
4. Har video ke saath owner (uploader) ki basic details laata hai
5. Final response me watch history videos client ko return karta hai

WHY:
1. User ko apni previously watched videos dikhane ke liye
2. Complex relational data ko efficiently fetch karne ke liye aggregation use hota hai
3. Multiple collections (users, videos) ko join karna zaruri hota hai
4. Performance improve karne ke liye sirf required fields project ki jaati hain
5. Frontend ko clean aur structured data provide karne ke liye

WHEN:
1. Jab user "Watch History" section open karta hai
2. Jab frontend `/watch-history` API call karta hai
3. Jab user logged-in hota hai (JWT verified)
4. Jab dashboard ya profile page load hota hai
5. Jab user apni activity history dekhna chahta hai
=====================================================
*/

const getWatchHistory = asyncHandler(async (req, res) => {    
  const suer = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistoryVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          },
          {
            $unwind: "$owner"
          }
        ]
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      suer[0].watchHistoryVideos,
      "User watch history fetched successfully"
    )
  );
});

// ===============================
// EXPORTS
// ===============================
export {
  resisterUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUserProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
