import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";  // Database ka naam import kar rahe hain, jise alag file me define kiya hai

/**
 * connectDB ek asynchronous function hai jo MongoDB database se connection establish karta hai.
 * Ye mongoose ki connect method ka use karta hai jisme hum MongoDB URI aur database name dete hain.
 */
const connectDB = async () => {
    try {
        // Mongoose ka connect method call kar rahe hain, jisme connection string me
        // environment variable MONGODB_URI aur DB_NAME dono use ho rahe hain.
        // Ye promise return karta hai jiska await karte hain.
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        // Agar connection successful ho jata hai to connected host ka naam console pe print karenge
        console.log(`\n mongo db connected !! DB HOST ${connectionInstance.connection.host}`);
    } catch (error) {
        // Agar connection establish karne me koi error aata hai to usko catch karenge
        console.log("Mongo db connection error", error);

        // Aur process ko exit kar denge (1 means error ke sath) taaki app bina DB ke na chale
        process.exit(1);
    }
}

// Ye connectDB function ko default export kar rahe hain taaki dusri files me import kar ke use kar saken
export default connectDB;
