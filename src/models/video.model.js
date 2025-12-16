import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/*
=====================================================
VIDEO MODEL OVERVIEW
-----------------------------------------------------
WHAT:
- Video related saari information store karta hai
- MongoDB me Video collection ka structure define karta hai
- Video file, metadata aur ownership manage karta hai

WHY:
- Video data ko organized aur scalable banane ke liye
- Pagination, search aur listing easy ho jaati hai
- User–Video relation maintain karne ke liye

WHEN:
- Video upload, fetch aur listing ke time use hota hai
- Home feed, channel page aur search me kaam aata hai
- Har video related API me required hota hai
=====================================================
*/

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    isPubliced: {
      type: Boolean,
      default: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

/*
=====================================================
AGGREGATE PAGINATION PLUGIN
-----------------------------------------------------
WHAT:
- Aggregation queries me pagination add karta hai
- Page, limit, totalDocs jaisi info deta hai
- Large video lists ko efficiently handle karta hai

WHY:
- Performance better hoti hai
- Infinite scroll / paginated feeds banana easy hota hai
- Production-level video listing ke liye zaroori hai

WHEN:
- Video feed, search results, channel videos me use hota hai
- Jab aggregate pipeline ke saath pagination chahiye
- Large dataset handle karna ho tab kaam aata hai
=====================================================
*/
videoSchema.plugin(mongooseAggregatePaginate);

/*
=====================================================
MODEL EXPORT
-----------------------------------------------------
WHAT:
- videoSchema se Video model create karta hai
- MongoDB ke "videos" collection se connect karta hai
- CRUD operations allow karta hai

WHY:
- Controllers aur services me reuse ke liye
- Video related logic ko centralized rakhne ke liye
- Clean aur scalable backend architecture ke liye

WHEN:
- Video upload API me use hota hai
- Video fetch / update / delete ke time
- Home feed aur channel pages me
=====================================================
*/
<<<<<<< HEAD
export const Video = mongoose.model("Video", videoSchema);
=======
export const Video = mongoose.model("Video", videoSchema);
>>>>>>> 4a0b50c1087358d7c724fb3f602e6a3657d9fa8f
