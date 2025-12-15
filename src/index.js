import dotenv from 'dotenv';
import connectDB from "./DB/index.js";
import { app } from "./app.js";  // Yeh maan ke chal rahe hain ki tumhara express app app.js mein hai

// dotenv ko configure kar rahe hain taaki .env file se environment variables load ho jayein
dotenv.config({
    path: './.env'  // yeh path .env file ka hai, agar alag location pe hai to change karna padega
});

// MongoDB se connection banane ki koshish kar rahe hain
connectDB()
.then(() => {
    // Agar DB successfully connect ho gaya to Express server start karenge
    app.listen(process.env.PORT || 8000, () => {
        // Server successfully chal raha hai toh ye message print hoga console me
        console.log(`Server is running at port: ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    // Agar DB connection fail ho jaata hai to error message print karenge
    // Aur process ko crash hone se bachane ke liye console mein log karenge
    console.log("MongoDB connection failed !!!!", err);
    process.exit(1); // Process ko exit kar dete hain failure status ke saath
});


/* 

// Alternative approach jo tumne comment mein diya tha:

import express from "express";
const app = express();

(async () => {
    try {
        // MongoDB connect kar rahe hain, environment variable se URI aur DB_NAME use karte hue
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

        // Agar server me koi error aata hai, toh usko catch karne ke liye event listener
        app.on("error", (error) => {
            console.log("App error:", error);
            throw error;
        });

        // Server ko listen karwana port pe
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        // Agar try block mein koi error aaye to catch mein aayega
        console.log("ERROR:", error);
        throw error;  // throw karne se process crash ho sakta hai, isliye use carefully
    }
})();

*/

// Is tarah se tum DB connect hone ke baad hi server start kar rahe ho,
// jo ki best practice hai production applications ke liye.

