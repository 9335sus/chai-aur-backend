import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
 
dotenv.config("./.env");


/*
=====================================================
CLOUDINARY CONFIGURATION
=====================================================

WHAT:
- Cloudinary ek cloud-based media storage service hai
- Images, videos, audio files ko cloud me store karta hai

WHY:
- Local server storage limited hota hai
- Cloudinary automatic optimization, CDN & scalability deta hai
- Media handling production-ready ho jaata hai

WHEN:
- App start hote hi configuration set hoti hai
- Upload se pehle credentials load hone chahiye

INTERVIEW:
- Cloudinary is used to offload media storage from the backend server.
=====================================================
*/
 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 

/*
=====================================================
UPLOAD FILE TO CLOUDINARY
=====================================================

WHAT:
- Local file ko Cloudinary pe upload karta hai
- Image, video, audio sab handle kar sakta hai

WHY:
- Upload ke baad local file ko permanently rakhna zaroori nahi
- Cloud URL frontend ke liye use hota hai

WHEN:
- Multer ke through file upload hone ke baad
- Controller logic ke andar call hota hai

INTERVIEW:
- This utility abstracts Cloudinary upload logic for reuse.
=====================================================
*/
const uplodeOnCloudinary = async (localFilePath) => {
  try {

    /*
    ---------------------------------------------
    WHAT:
    - File path validate kar rahe hain

    WHY:
    - Undefined / null path se crash avoid karne ke liye

    WHEN:
    - Function call ke start me
    ---------------------------------------------
    */
    if (!localFilePath) return null;

    /*
    ---------------------------------------------
    WHAT:
    - Cloudinary uploader call ho raha hai
    - resource_type "auto" rakha hai

    WHY:
    - Cloudinary automatically file type detect kare
    - Image, video dono same function se handle ho jaaye

    WHEN:
    - File successfully local disk pe aa chuki ho
    ---------------------------------------------
    */
    const responce = await cloudinary.uploader.upload(localFilePath, {
       resource_type: "auto",
    });

    /*
    ---------------------------------------------
    WHAT:
    - Successful upload log

    WHY:
    - Debugging aur verification ke liye
    ---------------------------------------------
    */
    console.log("File is uploaded on Cloudinary:", responce.url);

    /*
    ---------------------------------------------
    WHAT:
    - Cloudinary ka response return kar rahe hain

    WHY:
    - Controller ko URL, public_id, etc. chahiye hota hai
    ---------------------------------------------
    */
   if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return responce;

  } catch (error) {

    console.log("Cloudinary error:", error.message);
    /*
    ---------------------------------------------
    WHAT:
    - Error aane par local file delete kar rahe hain

    WHY:
    - Disk space waste hone se bachane ke liye
    - Temporary files clean rakhne ke liye

    WHEN:
    - Upload fail ho jaaye
    ---------------------------------------------
    */
   if (fs.existsSync(localFilePath)) {
  fs.unlinkSync(localFilePath);
}
    return null;
  }
};

/*
=====================================================
DIRECT CLOUDINARY UPLOAD (TEST / DEMO)
=====================================================

WHAT:
- URL se directly Cloudinary pe upload kar raha hai

WHY:
- Testing ya experimentation ke liye
- Local file ke bina upload possible hai

WHEN:
- Development / learning phase
- Production me normally remove kar dete hain
=====================================================
*/
 
/*
=====================================================
EXPORT
=====================================================

WHAT:
- upload utility ko export kar rahe hain

WHY:
- Controllers me reuse karne ke liye

WHEN:
- File upload ke baad Cloudinary call karte time
=====================================================
*/
export { uplodeOnCloudinary };
