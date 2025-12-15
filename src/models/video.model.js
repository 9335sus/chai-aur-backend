import mongoose from "mongoose";
import  mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new mongoose.Schema(
    {
        videoFile:{
            type:String,
            required:true
        },
          thumbnail:{
            type:String,
            required:true
        },
          title:{
            type:String,
            required:true
        },
          description:{
            type:String,
            required:true
        },
          duration:{
            type:Number,
            required:true
        },
          views:{
            type:Number,
            efault:0
        },
          isPubliced:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Tupes.ObjectId,
            ref:"user"
        }
    },
    {timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const video=mongoose.model("video",videoSchema)