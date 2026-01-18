import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/*
=====================================================
USER MODEL OVERVIEW
-----------------------------------------------------
WHAT:
- User ka profile, authentication aur tokens handle karta hai
- MongoDB me User collection ka structure define karta hai
- User related saari information ka main source hai

WHY:
- Authentication logic ek jagah centralize rehta hai
- Security better hoti hai aur code maintainable rehta hai
- Future changes karna easy ho jaata hai

WHEN:
- Signup, login aur profile access ke time use hota hai
- Har protected API ke liye required hota hai
- Backend services me baar-baar reference hota hai
=====================================================
*/

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: { 
      type: String,
      required: true
    },
    coverImage: {
      type: String
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

/*
=====================================================
PASSWORD HASHING MIDDLEWARE
-----------------------------------------------------
WHAT:
- Database me save hone se pehle password ko hash karta hai
- bcrypt ka use karke password secure banata hai
- Plain text password kabhi store nahi hota

WHY:
- Agar database leak ho jaaye to password safe rahe
- Developer se hashing bhool jaane ka risk khatam hota hai
- Industry standard security follow hoti hai

WHEN:
- Signup ke time run hota hai
- Jab bhi password update hota hai
- Normal profile update me skip ho jaata hai
=====================================================
*/
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return 
  this.password = await bcrypt.hash(this.password, 10); 
});

/*
=====================================================
PASSWORD VALIDATION METHOD
-----------------------------------------------------
WHAT:
- User ke input password ko stored hashed password se compare karta hai
- Login ke time password correct hai ya nahi check karta hai
- True ya false return karta hai

WHY:
- Secure login verification ke liye zaroori hai
- Plain password comparison avoid karta hai
- Unauthorized access ko block karta hai

WHEN:
- Login API ke andar call hota hai
- Token generate karne se pehle use hota hai
- Authentication flow ka main part hai
=====================================================
*/
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/*
=====================================================
ACCESS TOKEN GENERATOR
-----------------------------------------------------
WHAT:
- Short-lived JWT access token generate karta hai
- Token ke andar user ki basic identity hoti hai
- Secret key se token sign hota hai

WHY:
- Protected APIs ko secure banane ke liye
- Server ko stateless rakhne ke liye
- Unauthorized requests ko roakne ke liye

WHEN:
- Login ke baad generate hota hai
- Refresh token se dobara generate hota hai
- Har protected request ke saath bheja jaata hai
=====================================================
*/
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

/*
=====================================================
REFRESH TOKEN GENERATOR
-----------------------------------------------------
WHAT:
- Long-lived refresh token generate karta hai
- Sirf user ID store karta hai
- Access token ko renew karne ke kaam aata hai

WHY:
- Baar-baar login karne ki zarurat nahi padti
- User experience smooth rehta hai
- Access token compromise hone par risk kam hota hai

WHEN:
- Login ke time generate hota hai
- Database me securely store hota hai
- Jab access token expire ho jaata hai tab use hota hai
=====================================================
*/
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

/*
=====================================================
MODEL EXPORT
-----------------------------------------------------
WHAT:
- User schema se User model create karta hai
- MongoDB collection ke saath connect karta hai
- CRUD operations allow karta hai

WHY:
- Pure backend me reuse karne ke liye
- Code ko clean aur modular rakhne ke liye
- Architecture ko scalable banane ke liye

WHEN:
- Controllers aur services me import hota hai
- Login, signup aur profile APIs me use hota hai
- Jab bhi user data access karna ho
=====================================================
*/
export const User = mongoose.model("User", userSchema);
