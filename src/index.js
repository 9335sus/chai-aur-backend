import dotenv from "dotenv";
import connectDB from "./DB/index.js";
import { app } from "./app.js";

/*
=====================================================
ENVIRONMENT VARIABLES CONFIGURATION
=====================================================

WHAT:
- dotenv package `.env` file ko read karta hai
- Uske andar likhe variables ko `process.env` me load karta hai

WHY:
- Sensitive cheezein (DB URL, PORT, JWT secrets) code me likhna unsafe hota hai
- Same code ko multiple environments (local, staging, production) me use kar sakte hain
- Security + flexibility dono milti hai

WHEN:
- Application start hote hi sabse pehle
- Kisi bhi file me `process.env` use hone se pehle

INTERVIEW:
- Environment variables help us manage configuration securely without hardcoding values.
=====================================================
*/
dotenv.config({
  path: "./.env",
});

/*
=====================================================
DATABASE CONNECTION & SERVER BOOTSTRAP FLOW
=====================================================

WHAT:
- `connectDB()` MongoDB se connection establish karta hai
- Ye function Promise return karta hai

WHY:
- Database ke bina backend ka core kaam possible nahi hota
- Agar DB down ho aur server chal gaya → runtime crashes honge
- Isliye pehle DB, phir server (safe & professional approach)

WHEN:
- Backend application ke entry point pe
- First execution logic of server

HOW:
- `.then()` tab chalta hai jab DB successfully connect ho jaye
- `.catch()` tab chalta hai jab DB connection fail ho jaata hai
=====================================================
*/
connectDB()
  .then(() => {

    /*
    =====================================================
    EXPRESS SERVER START
    =====================================================

    WHAT:
    - Express app ko ek specific PORT pe listen karwa rahe hain
    - Client requests isi port pe aayengi

    WHY:
    - PORT environment variable cloud deployment me required hota hai
    - Fallback (8000) local development ke liye helpful hota hai
    - Flexible & scalable setup banta hai

    WHEN:
    - Sirf DB successful hone ke baad
    - Production-grade applications me recommended flow

    INTERVIEW:
    - Server starts only after DB connection to ensure application stability.
    =====================================================
    */
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Server is running at port: https://localhost:${process.env.PORT || 8000}`
      );
    });
  })
  .catch((err) => {

    /*
    =====================================================
    DATABASE CONNECTION ERROR HANDLING
    =====================================================

    WHAT:
    - MongoDB connection fail hone par ye block execute hota hai
    - Error details console me print hoti hain

    WHY:
    - Clear error logging debugging ke liye important hoti hai
    - `process.exit(1)` se app ko intentionally stop kar dete hain
    - Broken state me server chalne se bachata hai

    WHEN:
    - Wrong DB URI
    - MongoDB server down
    - Network issue
    - Invalid credentials

    INTERVIEW:
    - Proper error handling prevents unstable application states.
    =====================================================
    */
    console.log("MongoDB connection failed !!!!", err);
    process.exit(1);
  });

/*
=====================================================
OVERALL APPLICATION FLOW (EASY TO REMEMBER)
=====================================================

1️⃣ Load environment variables
2️⃣ Connect to MongoDB
3️⃣ Start Express server
4️⃣ If DB fails → crash app safely

WHY THIS DESIGN:
- Clean architecture
- Easy debugging
- Production-ready
- Interview friendly

ONE-LINER:
"My backend follows a DB-first startup approach to ensure reliability."
=====================================================
*/
