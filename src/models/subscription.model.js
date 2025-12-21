import mongoose, { Schema } from "mongoose";


// ===============================
// SUBSCRIPTION SCHEMA
// ===============================

/*
WHAT:
1️⃣ Ye schema ek user ke dusre user ko subscribe karne ko represent karta hai
2️⃣ Subscriber aur Channel ke beech relation define karta hai
3️⃣ One-way relationship store karta hai (who follows whom)
4️⃣ User subscription system ka core data structure hai

WHY:
1️⃣ YouTube / Instagram jaise follow system banane ke liye
2️⃣ Subscriber count calculate karne ke liye
3️⃣ Channel ke followers track karne ke liye
4️⃣ Recommendation & feed system ke liye base provide karta hai

WHEN:
1️⃣ Jab koi user kisi channel ko subscribe kare
2️⃣ Jab user unsubscribe kare (record delete hota hai)
3️⃣ Jab channel ke subscribers fetch karne ho
4️⃣ Jab user ke subscribed channels dikhane ho
*/
const subscriptionSchema = new Schema(
  {
    // ===============================
    // SUBSCRIBER FIELD
    // ===============================

    /*
    WHAT:
    1️⃣ Ye wo user hai jo subscribe kar raha hai
    2️⃣ Subscriber ka ObjectId store hota hai
    3️⃣ User collection se reference banata hai
    4️⃣ Relationship ka starting point hai

    WHY:
    1️⃣ Pata chal sake kaun subscribe kar raha hai
    2️⃣ User ke subscribed channels nikalne ke liye
    3️⃣ Duplicate subscription prevent karne ke liye
    4️⃣ Personal feed generate karne ke liye
    */
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // CHANNEL FIELD
    // ===============================

    /*
    WHAT:
    1️⃣ Ye wo user hai jisko subscribe kiya ja raha hai
    2️⃣ Channel owner ka ObjectId store karta hai
    3️⃣ User model ke saath relation banata hai
    4️⃣ Subscription ka destination hota hai

    WHY:
    1️⃣ Channel ke subscribers count karne ke liye
    2️⃣ Channel profile pe followers dikhane ke liye
    3️⃣ Content recommendation ke liye
    4️⃣ Creator analytics ke liye
    */
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  // ===============================
  // SCHEMA OPTIONS
  // ===============================

  /*
  WHAT:
  1️⃣ timestamps enable karta hai
  2️⃣ createdAt aur updatedAt auto add hote hain
  3️⃣ MongoDB document lifecycle track hota hai
  4️⃣ Time-based queries possible hoti hain

  WHY:
  1️⃣ Kab subscription hua ye jaanne ke liye
  2️⃣ Recent subscribers dikhane ke liye
  3️⃣ Analytics & growth tracking ke liye
  4️⃣ Sorting & filtering easy ho jaati hai
  */
  {
    timestamps: true,
  }
);


// ===============================
// SUBSCRIPTION MODEL EXPORT
// ===============================

/*
WHAT:
1️⃣ Subscription naam ka mongoose model create hota hai
2️⃣ subscriptionSchema ko MongoDB collection se jodta hai
3️⃣ CRUD operations enable karta hai
4️⃣ App me reuse ke liye available karta hai

WHY:
1️⃣ Controllers me direct DB access ke liye
2️⃣ Subscription create / delete / find karne ke liye
3️⃣ Clean architecture follow karne ke liye
4️⃣ Code modular aur maintainable banane ke liye
*/
export const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);
