import multer from "multer";

/*
=====================================================
MULTER FILE UPLOAD CONFIGURATION
=====================================================

WHAT:
- Multer ek middleware hai jo file uploads handle karta hai
- Ye multipart/form-data requests ko process karta hai
- Mostly images, videos, documents upload karne me use hota hai

WHY:
- Express by default file uploads handle nahi karta
- Multer server-side file handling ko easy & safe banata hai
- Validation, storage aur naming control milta hai

WHEN:
- Jab frontend se file upload request aati hai
- Profile picture, video, thumbnail, document upload ke time

INTERVIEW:
- Multer is used to handle multipart/form-data in Node.js applications.
=====================================================
*/

/*
=====================================================
STORAGE CONFIGURATION
=====================================================

WHAT:
- diskStorage batata hai file disk me kaise aur kaha store hogi
- destination + filename define kiya jaata hai

WHY:
- Upload location control karne ke liye
- File naming strategy decide karne ke liye

WHEN:
- Har file upload request ke time
=====================================================
*/
const storage = multer.diskStorage({

    /*
    ---------------------------------------------
    DESTINATION
    ---------------------------------------------
    WHAT:
    - File kis folder me save hogi

    WHY:
    - Temporary storage ke liye ek fixed folder rakhna useful hota hai
    - Baad me Cloudinary / S3 pe upload kar sakte hain

    WHEN:
    - File upload hone se pehle
    ---------------------------------------------
    */
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },

    /*
    ---------------------------------------------
    FILENAME
    ---------------------------------------------
    WHAT:
    - Uploaded file ka naam decide karta hai

    WHY:
    - Original filename preserve karna debugging me helpful hota hai
    - Future me custom unique name (UUID / timestamp) laga sakte hain

    WHEN:
    - File disk pe write hone se just pehle
    ---------------------------------------------
    */
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

/*
=====================================================
MULTER INSTANCE
=====================================================

WHAT:
- Multer ka actual middleware instance create ho raha hai

WHY:
- Routes me directly use karne ke liye
- upload.single(), upload.array() jaise methods milte hain

WHEN:
- Route level pe middleware ke roop me use hota hai

EXAMPLE:
- upload.single("avatar")
- upload.fields([{ name: "videoFile" }, { name: "thumbnail" }])

INTERVIEW:
- Multer middleware processes files before controller logic runs.
=====================================================
*/
const upload = multer({ storage: storage });

export { upload };
